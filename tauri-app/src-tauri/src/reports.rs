use serde::{Deserialize, Serialize};
use std::env;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ExpenseRecord {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub title: String,
    pub amount: f64,
    pub added_by: String,
}

#[tauri::command]
pub async fn add_expense_backend(expense: ExpenseRecord) -> Result<String, String> {
    // .env file se credentials load karne ke liye
    dotenvy::from_path("../.env").ok();

    let supabase_url = env::var("VITE_SUPABASE_URL")
        .map_err(|_| "VITE_SUPABASE_URL .env file mein nahi mila!".to_string())?;
    let supabase_key = env::var("VITE_SUPABASE_ANON_KEY")
        .map_err(|_| "VITE_SUPABASE_ANON_KEY .env file mein nahi mila!".to_string())?;

    let clean_url = supabase_url.trim_end_matches('/');
    let url = format!("{}/rest/v1/expenses", clean_url);

    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&expense)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        Ok("Expense recorded successfully!".into())
    } else {
        let err_text = res.text().await.unwrap_or_default();
        Err(format!("Failed to save expense: {}", err_text))
    }
}

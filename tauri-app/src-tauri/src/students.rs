use serde::{Deserialize, Serialize};
use std::env;
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Student {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub roll_no: String,
    pub full_name: String,
    pub father_name: String,
    pub category: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub phone: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
}

// Rust function to add student via Supabase REST API
#[tauri::command]
pub async fn register_student_backend(student: Student) -> Result<String, String> {
     let supabase_url = env::var("VITE_SUPABASE_URL")
        .map_err(|_| "VITE_SUPABASE_URL .env file mein nahi mila!".to_string())?;
    let supabase_key = env::var("VITE_SUPABASE_ANON_KEY")
        .map_err(|_| "VITE_SUPABASE_ANON_KEY .env file mein nahi mila!".to_string())?;

    let client = reqwest::Client::new();
    let url = format!("{}/rest/v1/students", supabase_url);


















    let res = client
        .post(&url)
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&student)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        Ok("Student successfully registered via Rust Backend!".into())
    } else {
        let err_text = res.text().await.unwrap_or_default();
        Err(format!("Failed to insert: {}", err_text))
    }
}

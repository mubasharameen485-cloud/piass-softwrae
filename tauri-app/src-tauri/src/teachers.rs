use serde::{Deserialize, Serialize};
use std::env;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Teacher {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    pub teacher_id: String,
    pub full_name: String,
    pub father_name: String,
    pub gender: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub age: Option<i32>,
    pub degree: String,
    pub subject: String,
    pub experience: String,
    pub password: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
}

#[tauri::command]
pub async fn register_teacher_backend(teacher: Teacher) -> Result<String, String> {
   
    dotenvy::from_path("../.env").ok();

    let supabase_url = env::var("VITE_SUPABASE_URL")
        .map_err(|_| "VITE_SUPABASE_URL .env file mein nahi mila!".to_string())?;
    let supabase_key = env::var("VITE_SUPABASE_ANON_KEY")
        .map_err(|_| "VITE_SUPABASE_ANON_KEY .env file mein nahi mila!".to_string())?;

    let clean_url = supabase_url.trim_end_matches('/');
    let url = format!("{}/rest/v1/teachers", clean_url);

    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&teacher)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        Ok("Teacher registered successfully via Rust Backend!".into())
    } else {
        let err_text = res.text().await.unwrap_or_default();
        Err(format!("Failed to register teacher: {}", err_text))
    }
}

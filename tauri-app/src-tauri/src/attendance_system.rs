use serde::{Deserialize, Serialize};
use std::env;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AttendanceItem {
    pub person_id: String,
    pub name: String,
    pub category: String,
    pub attendance_date: String,
    pub status: String,
}

#[tauri::command]
pub async fn save_bulk_attendance_backend(records: Vec<AttendanceItem>) -> Result<String, String> {
    // .env file se credentials load karne ke liye
    dotenvy::from_path("../.env").ok();

    let supabase_url = env::var("VITE_SUPABASE_URL")
        .map_err(|_| "VITE_SUPABASE_URL .env file mein nahi mila!".to_string())?;
    let supabase_key = env::var("VITE_SUPABASE_ANON_KEY")
        .map_err(|_| "VITE_SUPABASE_ANON_KEY .env file mein nahi mila!".to_string())?;

    let clean_url = supabase_url.trim_end_matches('/');
    let url = format!("{}/rest/v1/attendance_records", clean_url);

    let client = reqwest::Client::new();
    let res = client
        .post(&url)
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&records)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        Ok("Attendance saved successfully via Rust backend!".into())
    } else {
        let err_text = res.text().await.unwrap_or_default();
        Err(format!("Failed to save attendance: {}", err_text))
    }
}

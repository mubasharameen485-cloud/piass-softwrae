use serde::{Deserialize, Serialize};
use std::env;
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct TeacherUpdate {
    pub id: String,
    pub full_name: String,
    pub subject: String,
    pub degree: String,
    pub experience: String,
    pub status: String,
}

#[tauri::command]
pub async fn update_teacher_backend(teacher: TeacherUpdate) -> Result<String, String> {
    let supabase_url = "YAHAN_APNI_SUPABASE_URL_DALO";
    let supabase_key = "YAHAN_APNI_SUPABASE_ANON_KEY_DALO";

    let client = reqwest::Client::new();
    let url = format!("{}/rest/v1/teachers?id=eq.{}", supabase_url, teacher.id);

    let res = client
        .patch(&url)
        .header("apikey", supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .json(&teacher)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        Ok("Teacher updated successfully via Rust backend!".into())
    } else {
        Err("Failed to update teacher".into())
    }
}
use serde::{Deserialize, Serialize};
use std::env;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct LoginResponse {
    pub success: bool,
    pub role: String,
    pub full_name: String,
    pub identifier: String,
}

#[tauri::command]
pub async fn login_backend(username: String, pass: String) -> Result<LoginResponse, String> {
    // .env file se credentials load karne ke liye
    dotenvy::from_path("../.env").ok();

    let supabase_url = env::var("VITE_SUPABASE_URL")
        .map_err(|_| "VITE_SUPABASE_URL .env file mein nahi mila!".to_string())?;
    let supabase_key = env::var("VITE_SUPABASE_ANON_KEY")
        .map_err(|_| "VITE_SUPABASE_ANON_KEY .env file mein nahi mila!".to_string())?;

    let clean_url = supabase_url.trim_end_matches('/');
    let client = reqwest::Client::new();

    // 1. Check in app_users (Admin ke liye)
    let url_admin = format!("{}/rest/v1/app_users", clean_url);
    let res = client
        .get(&url_admin)
        .query(&[
            ("username_or_id", format!("eq.{}", username)),
            ("password", format!("eq.{}", pass)),
            ("select", "*".to_string()),
        ])
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let admins: Vec<serde_json::Value> = res.json().await.unwrap_or_default();
    if !admins.is_empty() {
        return Ok(LoginResponse {
            success: true,
            role: admins[0]["role"].as_str().unwrap_or("admin").into(),
            full_name: admins[0]["full_name"].as_str().unwrap_or("Admin").into(),
            identifier: username,
        });
    }

    // 2. Check in teachers table (Teacher ke liye)
    let url_teacher = format!("{}/rest/v1/teachers", clean_url);
    let res_t = client
        .get(&url_teacher)
        .query(&[
            ("teacher_id", format!("eq.{}", username)),
            ("password", format!("eq.{}", pass)),
            ("select", "*".to_string()),
        ])
        .header("apikey", &supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let teachers: Vec<serde_json::Value> = res_t.json().await.unwrap_or_default();
    if !teachers.is_empty() {
        return Ok(LoginResponse {
            success: true,
            role: "teacher".into(),
            full_name: teachers[0]["full_name"].as_str().unwrap_or("Teacher").into(),
            identifier: username,
        });
    }

    Err("Invalid Username/ID or Password!".into())
}

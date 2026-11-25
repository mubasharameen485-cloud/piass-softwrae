use serde::{Deserialize, Serialize};
use std::env;
#[tauri::command]
pub async fn ping_archive() -> Result<String, String> {
    Ok("Archive module active".into())
}
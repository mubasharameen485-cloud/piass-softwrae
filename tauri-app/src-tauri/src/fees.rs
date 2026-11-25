use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct FeeRecord {
    pub id: Option<String>,
    pub roll_no: String,
    pub total_fee: f64,
    pub paid_amount: f64,
    pub remaining_balance: f64,
    pub installment_note: String,
    pub collected_by: String,
}

#[tauri::command]
pub async fn collect_fee_backend(fee: FeeRecord) -> Result<String, String> {
    let supabase_url = "YAHAN_APNI_SUPABASE_URL_DALO";
    let supabase_key = "YAHAN_APNI_SUPABASE_ANON_KEY_DALO";

    let client = reqwest::Client::new();
    let url = format!("{}/rest/v1/fees", supabase_url);

    let res = client
        .post(&url)
        .header("apikey", supabase_key)
        .header("Authorization", format!("Bearer {}", supabase_key))
        .header("Content-Type", "application/json")
        .header("Prefer", "return=representation")
        .json(&fee)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        Ok("Fee collected and saved successfully!".into())
    } else {
        let err_text = res.text().await.unwrap_or_default();
        Err(format!("Failed to save fee: {}", err_text))
    }
}
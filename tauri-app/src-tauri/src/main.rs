// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod students;
mod fees;
mod teachers;
mod teacher_payments;
mod reports;
mod teacher_directory;
mod archive_records;


use fees::collect_fee_backend;
use students::register_student_backend;
use teachers::register_teacher_backend;
use teacher_payments::pay_teacher_salary_backend;
use reports::add_expense_backend;
use teacher_directory::update_teacher_backend;
use archive_records::ping_archive;



fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            register_student_backend,
             collect_fee_backend,
             register_teacher_backend,
              pay_teacher_salary_backend,
              add_expense_backend,
              update_teacher_backend,
            ping_archive
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use std::fs::remove_file;

use tauri::api::path::app_local_data_dir;
use tauri::Manager;

#[tokio::main]
async fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let config = app.config();
            app.get_window("main")
                .unwrap()
                .on_window_event(move |e| match e {
                    tauri::WindowEvent::CloseRequested { .. } => {
                        remove_file(format!(
                            "{}/~remember",
                            app_local_data_dir(&config).unwrap().to_str().unwrap()
                        ))
                        .unwrap();
                    }
                    _ => (),
                });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

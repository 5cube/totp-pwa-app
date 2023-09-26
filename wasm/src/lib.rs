mod utils;

use chrono::Utc;
use totp_lite::{ totp_custom, Sha1 };
use base32::{ decode, Alphabet };

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn get_token(secret: &str, step: u64, digits: u32) -> String {
    utils::set_panic_hook();

    let seconds = Utc::now().timestamp();

    let token = totp_custom::<Sha1>(
        step,
        digits,
        &decode(Alphabet::RFC4648 { padding: false }, secret).unwrap(),
        seconds as u64
    );

    return  token;
}

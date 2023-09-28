# totp-wasm

## Установка

Установка необходимых инструментов [wasm-pack](https://rustwasm.github.io/book/game-of-life/setup.html).

Используется [totp-lite](https://crates.io/crates/totp-lite/2.0.0) вместо более популярного [totp-rs](https://crates.io/crates/totp-rs), т.к. totp-rs используется `std::time`, который не поддерживается `wasm-pack`.


Репозитарий сгенерирован из [шаблона](https://rustwasm.github.io/docs/wasm-pack/tutorials/npm-browser-packages/index.html).

## 🚴 Usage

### 🛠️ Build with `wasm-pack build`

```bash
wasm-pack build --target web
```

### 🔬 Test in Headless Browsers with `wasm-pack test`

```bash
wasm-pack test --headless --firefox
```

## 🔋 Batteries Included

* [`wasm-bindgen`](https://github.com/rustwasm/wasm-bindgen) for communicating
  between WebAssembly and JavaScript.
* [`console_error_panic_hook`](https://github.com/rustwasm/console_error_panic_hook)
  for logging panic messages to the developer console.

## License

Licensed under either of

* MIT license ([LICENSE-MIT](LICENSE-MIT) or http://opensource.org/licenses/MIT)

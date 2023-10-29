# TOTP PWA-приложение

Минималистичное PWA-приложение генерации TOTP кодов для двухфакторной аутентификации(2FA).

## Инструменты и технологии

- [Vite](https://vitejs.dev/)
- [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) все данные хранятся в локальном хранилище браузера
- [WebAssembly](https://webassembly.org/)
- [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)
- [PWA](https://vite-pwa-org.netlify.app/)

## Использование

Сервер разработки

```bash
pnpm dev
```

Сборка

```bash
pnpm build
```

Предпросмотр сборки

```bash
pnpm preview
```

Форматирование

```bash
pnpm format
```

Сборка WebAssembly, см. [wasm](./wasm/README.md) для настройки необходимых инструментов

```bash
pnpm wasm
```

Генерация ассетов для pwa

```bash
pnpm generate-pwa-assets
```

## TODO

- добавить intersect, для добавления логики только для видимых элементов
- добавить компонент для отображения уведомлений
- добавить [uri схема otpauth](https://github.com/google/google-authenticator/wiki/Key-Uri-Format), пример, otpauth://totp/ISSUER:LABEL?issuer=ISSUER&secret=SECRE&algorithm=SHA1&digits=6&period=30
- импорт/экспорт данных
- генерация qr-code

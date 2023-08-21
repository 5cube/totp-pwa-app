# TOTP Authenticator app

Минимальное приложение двухфакторной аутентификации(2FA) на Vite+PWA+IndexedDB.

[uri схема otpauth](https://github.com/google/google-authenticator/wiki/Key-Uri-Format)

Пример
// otpauth://totp/ISSUER:LABEL?issuer=ISSUER&secret=SECRE&algorithm=SHA1&digits=6&period=30

TODO

- indexedDB iterator или idb
- проверка существования ключа при добавлении
- добавить intersect, для добавления логики только для видимых элементов

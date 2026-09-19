# app/store — всё для магазинов (App Store и Google Play)

```
store/
├── android/                 Google Play
│   ├── updates/             готовые сборки vial-release-vN.aab — ЭТО грузить в Play Console (дорожка «v4»)
│   ├── PLAY-ВСТАВИТЬ.txt    тексты карточки Play
│   ├── PLAY-ЗАЯВКА-ОТВЕТЫ.txt
│   └── release-notes.json   «Что нового» для Play (читает app/scripts/play-release.py)
├── ios/                     App Store — тексты для ASC по версиям (ASC-1.0.x-ВСТАВИТЬ.txt)
└── images/                  все картинки для магазинов
    ├── icons/               иконки и превью иконок
    ├── screenshots-appstore/
    ├── screenshots-play/
    └── play-feature/        картинка 1024×500 для Play + исходник фона
```

Сборки `.aab` в git не коммитятся (большие) — лежат только на Mac.
iOS-сборку собирает Xcode Cloud сам на каждый пуш в main, файлов здесь не оставляет.

Не отсюда и не переносить сюда:
- `app/android`, `app/ios` — нативные проекты Capacitor/Xcode Cloud, пути зашиты в инструменты.
- `app/assets/` — мастер иконки приложения (`npm run icons`).
- `app/vial-release.jks`, `app/keystore.properties` — ключ подписи Android, в git не попадает.
- `interpreter/Logo/` — логотип, на него ссылаются страницы сайта и ИП.

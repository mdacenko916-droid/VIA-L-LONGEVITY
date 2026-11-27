# Музыка для сна и гипноза — источники и лицензия

Выбор владельца 2026-11-26 (взамен мелодии, собранной кодом: «как для смерти»). Все треки — **Pixabay Music**,
лицензия Pixabay Content License: можно бесплатно использовать в платном приложении как его часть, указывать автора
не обязательно; **нельзя** продавать или раздавать сами треки отдельно (поэтому файлы лежат в R2 только для
воспроизведения внутри приложения, без кнопки «скачать»). Лицензия: https://pixabay.com/service/license-summary/

Номер — ID трека на Pixabay (страница ищется по нему: pixabay.com/music/…-<ID>/). Оригиналы mp3 —
`/Users/foxmaster/Developer/VIA-L-HYPNOSIS/музыка-оригиналы/` (локально, вне git; перенесены из `скрин/1/` 2026-11-27).

## Ритуал сна (`sleep.js`, `TRACKS`) — R2 `vial-assets/sleep/music/<ID>.m4a` и `…/soft/<ID>.m4a`

| ID | Автор на Pixabay | Файл-оригинал | Длина |
|---|---|---|---|
| 636504 | atlasaudio | atlasaudio-meditative-piano-636504.mp3 | 2:18 |
| 562633 | atlasaudio | atlasaudio-sleep-music-562633.mp3 | 4:25 |
| 614717 | leberch | leberch-dreaming-of-sun-piano-614717.mp3 | 2:20 |
| 627002 | leberch | leberch-piano-627002.mp3 | 2:02 |
| 628075 | leberch | leberch-piano-628075.mp3 | 1:48 |
| 587330 | leberch | leberch-piano-for-sleep-587330 копія.mp3 | 1:52 |
| 626784 | leberch | leberch-sleep-music-626784.mp3 | 4:06 |
| 580201 | marlowemusic | marlowemusic-meditation-sleep-580201.mp3 | 4:47 |
| 577897 | marlowemusic | marlowemusic-sleep-577897.mp3 | 2:44 |
| 578609 | marlowemusic | marlowemusic-sleep-cycle-578609.mp3 | 3:08 |
| 587578 | the_mountain | the_mountain-deep-sleep-deep-sleep-music-587578.mp3 | 2:15 |
| 571041 | verclub_music | verclub_music-sleep-music-571041.mp3 | 8:52 |

## Гипноз «Прохлада» (`hypnosis.js`, `musicOn`) — R2 `vial-assets/hypnosis/music/195425.m4a` и `195425-soft.m4a`

Под голосом играют по очереди 13 треков: этот и все 12 треков ритуала сна (их же файлы `sleep/music/`), каждый вечер с другого (решение владельца 2026-11-26: «они все однотипные»).

| ID | Автор на Pixabay | Файл-оригинал | Длина |
|---|---|---|---|
| 195425 | relaxingtime | ГИПНОЗ_relaxingtime-sleep-music-vol15-195425.mp3 | 22:06 |

## Обработка

ffmpeg: `loudnorm` (линейно, TP −3), плавный вход 2 с и выход 3 с, AAC 96k стерео 44,1 кГц, faststart.
Громкость зашита в файл (на iPhone `audio.volume` не работает): голос записей ≈ −16 LUFS;
ритуал сна — −28 LUFS, «Тише» — −35; под гипнозом — −30, «Тише» — −36.
Ритуал играет треки по очереди, каждый вечер с другого (`день % 12`); нет сети или файла → запасная мелодия `makeMusic`.
Новый трек: оригинал в `VIA-L-HYPNOSIS/музыка-оригиналы/`, перекодировать теми же параметрами, залить в R2, дописать ID в `TRACKS` и сюда.

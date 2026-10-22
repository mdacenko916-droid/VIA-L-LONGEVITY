#!/usr/bin/env python3
"""Озвучка подсказок проигрывателя «Движения» (проба, RU) — Cartesia, голос Skylar, Sonic 3.6, скорость 0.8.

Ключ не хранится в git и не передаётся в чат: положите его в файл ~/.cartesia/key
(или в переменную окружения CARTESIA_API_KEY).

  python3 tools/fitness_voice.py "скрин/Eva тренер видео"          # озвучить недостающие
  python3 tools/fitness_voice.py "скрин/Eva тренер видео" --force  # переозвучить всё

Файлы ложатся в <папка>/voice/<имя>.mp3; проигрыватель берёт их по тем же именам (VOICE в player.html).
"""
import json, os, sys, urllib.parse, urllib.request

MODEL, VOICE_NAME, SPEED, LANG = 'sonic-3.6', 'Skylar', 0.8, 'ru'
API, VERSION = 'https://api.cartesia.ai', '2026-08-14'

# Тексты — тёплые, короткие (до ~8 с), без давления. Русский — канон, переводы потом.
TEXTS = {
    # общие
    'start':   'Начинаем. Сначала — лёгкая разминка.',
    'rest':    'Отдых. Походите, подышите спокойно.',
    'half':    'Половина. Так держать.',
    # счёт: повторы, которые остались (в такт Еве), или последние 10 секунд в упражнениях на время
    'n12': 'Двенадцать', 'n11': 'Одиннадцать',
    'n10': 'Десять', 'n9': 'Девять', 'n8': 'Восемь', 'n7': 'Семь', 'n6': 'Шесть',
    'n5': 'Пять', 'n4': 'Четыре', 'n3': 'Три', 'n2': 'Два', 'n1': 'Один',
    'finish':  'Готово. Отличная работа — вы молодец.',
    # упражнения
    'march':   'Шаг на месте. Колени постепенно чуть выше, руки работают свободно.',
    'jumps':   'Мини-прыжки на месте. Приземляемся мягко, на носки, колени чуть согнуты.',
    'hinge':   'Наклон с прямой спиной. Таз уходит назад, спина ровная, руки скользят по бёдрам.',
    'calf':    'Подъём на носки. Медленно вверх, задержались — и медленно вниз. Рукой можно держаться за стул.',
    'chair':   'Присед к стулу. Таз назад, как будто садитесь, колени смотрят туда же, куда носки. Вставая — выдох.',
    'goblet':  'Гоблет-присед. Гантель у груди, грудь вверх, таз назад. Вставая — выдох.',
    'rdlKnee': 'Румынская тяга. Колени чуть согнуты, гантели скользят по ногам до колен, спина ровная. Поднимаясь — выдох.',
    'rdlShin': 'Румынская тяга глубже, до середины голени. Опускайтесь ниже, только пока спина остаётся ровной.',
    'wallPU':  'Отжимания от стены. Тело — одна прямая линия, локти ближе к телу. От стены — выдох.',
    'kneePU':  'Отжимания с колен. Прямая линия от головы до колен, локти ближе к телу. Вверх — выдох.',
    'row':     'Тяга гантелей в наклоне. Спина ровная, тянем локти к поясу и медленно опускаем.',
    'lungeR':  'Выпад назад, ноги по очереди. Колено передней ноги — над стопой. Толкаемся пяткой и возвращаемся.',
    'press':   'Жим над головой сидя. Спина прямая. На выдохе гантели вверх, медленно — к плечам.',
    'farmer':  'Прогулка фермера на месте. Гантели тяжёлые, плечи вниз, корпус не раскачивается.',
    'plankFK': 'Планка на коленях. Локти под плечами, прямая линия от головы до колен. Дышите спокойно, не задерживайте дыхание.',
    'plankF':  'Планка на локтях. Прямая линия от головы до пяток, таз не провисает. Дышите спокойно.',
    'plankHK': 'Планка на прямых руках, с колен. Ладони под плечами, линия от головы до колен. Дышите.',
    'bridge':  'Ягодичный мост. На выдохе поднимаем таз до прямой линии от колен до плеч, на вдохе медленно опускаем.',
    'bug':     'Мёртвый жук. Поясница прижата к коврику. Опускаем противоположные руку и ногу, возвращаем — и меняем сторону.',
    'bird':    'Птица-собака. Вытягиваем противоположные руку и ногу до линии спины. Спина неподвижна, двигаемся медленно.',
    'balanceR': 'Баланс на правой ноге. Колено мягкое, взгляд в одну точку. Рукой можно касаться спинки стула.',
    'balanceL': 'Теперь на левой ноге.',
}


def key():
    k = os.environ.get('CARTESIA_API_KEY')
    if not k:
        p = os.path.expanduser('~/.cartesia/key')
        if os.path.exists(p):
            k = open(p).read().strip()
    if not k:
        sys.exit('Нет ключа: положите его в ~/.cartesia/key')
    return k


def call(path, k, body=None):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body else None,
                                 headers={'Authorization': 'Bearer ' + k, 'Cartesia-Version': VERSION,
                                          'Content-Type': 'application/json'})
    with urllib.request.urlopen(req) as r:
        return r.read()


def voice_id(k):
    data = json.loads(call('/voices?' + urllib.parse.urlencode({'q': VOICE_NAME, 'limit': 50}), k))
    items = data.get('data', data) if isinstance(data, dict) else data
    for v in items:
        if v.get('name', '').strip().lower().startswith(VOICE_NAME.lower()):
            return v['id']
    sys.exit(f'Голос {VOICE_NAME} не найден')


def main(folder, force):
    k = key()
    vid = voice_id(k)
    out = os.path.join(folder, 'voice')
    os.makedirs(out, exist_ok=True)
    chars = 0
    for name, text in TEXTS.items():
        dst = os.path.join(out, name + '.mp3')
        if os.path.exists(dst) and not force:
            continue
        audio = call('/tts/bytes', k, {
            'model_id': MODEL, 'transcript': text, 'voice': {'mode': 'id', 'id': vid}, 'language': LANG,
            'output_format': {'container': 'mp3', 'sample_rate': 44100, 'bit_rate': 128000},
            'generation_config': {'speed': SPEED}})
        open(dst, 'wb').write(audio)
        chars += len(text)
        print(f'✓ {name}.mp3')
    print(f'Готово, озвучено знаков: {chars}')


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if a != '--force']
    main(args[0] if args else '.', '--force' in sys.argv)

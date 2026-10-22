#!/usr/bin/env python3
"""«Бумеранг» для клипов упражнений: одно движение вперёд + то же назад → петля без стыка.

Владелец проверил на iPhone 2026-10-05/06: присед «вперёд-назад» — «нормуль», стык не виден.
Режимы (CLIPS ниже):
  rep  — от исходной позы до нижней точки первого повторения и обратно = ровно 1 повтор на петлю
         (счёт повторов в проигрывателе идёт по концу петли);
  full — весь клип вперёд и назад (шаг, прыжки, фермер — движения без «туда-обратно»);
  trim — клип как есть, обрезан на кадре, совпадающем с первым (упражнения в две стороны:
         в бумеранге потерялась бы вторая сторона);
  ('loop', a, b) — кадры a..b-1, подобраны вручную по позе И направлению движения (шаг: в бумеранге
         на развороте одна нога шагает дважды — владелец заметил 2026-10-09).
Исходники не трогает, пишет H.264 в <папка>/pingpong/.

  python3 tools/fitness_boomerang.py "скрин/Eva тренер видео"
"""
import json, os, subprocess, sys
import numpy as np

CLIPS = {  # файл: режим
    '01_присед-к-стулу_ОБЛЕГЧЁННЫЙ.mp4': 'rep',
    '02_гоблет-присед.mp4': 'rep',
    '03_румынская-тяга до колена 3 наклона.mp4': 'rep',
    ' 03_румынская-тяга до голени - 3 наклона.mp4': 'rep',
    '04_наклон-без-веса.mp4': 'rep',
    '06 Подъём на носки.mp4': 'rep',
    '07 Ягодичный мост.mp4': 'rep',
    '10 Отжимания от стены.mp4': 'rep',
    '11_отжимания-с-колен3.mp4': 'rep',
    '12_тяга-в-наклоне.mp4': 'rep',
    '13_жим-над-головой-сидя.mp4': 'rep',
    'ВЫПАД НАЗАД.mp4': 'trim',          # обе ноги по очереди — бумеранг оставил бы одну
    '15 «Прогулка фермера»на месте.mp4': 'full',
    '16 Мини-прыжки на месте .mp4': 'full',   # цикл пробовали 10-09: руки в клипе расходятся — на стыке прыжок рук; бумеранг плавнее
    '17 Шаг на месте.mp4': ('loop', 42, 104),   # бумеранг давал два шага одной ногой; петля по фазе шага
    '08 Мёртвый жук.mp4': 'trim',
    '09_птица-собака.mp4': 'trim',
}
HOLD = 3   # кадров задержки в нижней точке (в бумеранге удваивается)


def frames(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', 'scale=192:108,format=gray',
                          '-f', 'rawvideo', '-'], capture_output=True).stdout
    a = np.frombuffer(raw, np.uint8).reshape(-1, 108, 192).astype(np.float32)
    sd = a.std(0)
    return a[:, sd > np.percentile(sd, 85)]   # только подвижные пиксели (тело)


def first_peak(v):
    """Нижняя точка первого повторения: первый максимум отклонения от стартовой позы выше 80% общего."""
    dev = np.convolve([float(np.abs(x - v[0]).mean()) for x in v], np.ones(5) / 5, mode='same')
    thr = dev.max() * 0.8
    i = int(np.argmax(dev > thr))
    while i + 1 < len(dev) and dev[i + 1] >= dev[i]:
        i += 1
    return i


def encode(src, dst, fc):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', fc, '-map', '[v]', '-an',
                    '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dst],
                   check=True)


def boomerang_fc(s, e):
    # вперёд s..e, назад e-1..s+1 (без повторов крайних кадров — иначе «залипание» на стыке)
    return (f"[0:v]split[x][y];[x]trim=start_frame={s}:end_frame={e + 1},setpts=PTS-STARTPTS[a];"
            f"[y]trim=start_frame={s + 1}:end_frame={e},setpts=PTS-STARTPTS,reverse[b];"
            f"[a][b]concat=n=2:v=1,format=yuv420p[v]")


def main(folder):
    out = os.path.join(folder, 'pingpong')
    os.makedirs(out, exist_ok=True)
    info = {}
    for name, mode in CLIPS.items():
        src = os.path.join(folder, name)
        if not os.path.exists(src):
            print('нет файла:', name)
            continue
        v = frames(src)
        n = len(v)
        if isinstance(mode, tuple):
            encode(src, os.path.join(out, name),
                   f"[0:v]trim=start_frame={mode[1]}:end_frame={mode[2]},setpts=PTS-STARTPTS,format=yuv420p[v]")
            mode = 'loop'
        elif mode == 'rep':
            e = min(n - 1, first_peak(v) + HOLD)
            encode(src, os.path.join(out, name), boomerang_fc(0, e))
        elif mode == 'full':
            encode(src, os.path.join(out, name), boomerang_fc(0, n - 1))
        else:
            j = min(range(int(n * 0.85), n), key=lambda k: float(np.abs(v[k] - v[0]).mean()))
            encode(src, os.path.join(out, name),
                   f"[0:v]trim=start_frame=0:end_frame={j},setpts=PTS-STARTPTS,format=yuv420p[v]")
        o = frames(os.path.join(out, name))
        dur = round(len(o) / 24, 2)
        info[name] = {'mode': mode, 'dur': dur}
        print(f"{mode:4} {dur:5.2f}с  стык {float(np.abs(o[-1] - o[0]).mean()):4.1f}  {name}")
    json.dump(info, open(os.path.join(out, 'info.json'), 'w'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')

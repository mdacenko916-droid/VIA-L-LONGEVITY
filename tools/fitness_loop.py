#!/usr/bin/env python3
"""Бесшовные петли для клипов упражнений (docs/FITNESS-AI-CLIPS-PROMPTS.md).

Генератор не заканчивает клип ровно в той позе, с которой начал, — при повторе виден перескок.
Скрипт для каждого mp4 в папке:
  1. сравнивает кадры ТОЛЬКО по пикселям, где есть движение (тело), а не по всему кадру — иначе
     совпадают комната и свет, а поза разная (2026-10-05: так и вышло, тело прыгало на стыке);
  2. ищет пару «около начала» / «около конца», где совпадают и поза, и движение (кадры ±2), режет
     по ней жёстко, без наплыва — наплыв двух разных поз даёт призрак и скачок;
  3. если обрезка не лучше исходного стыка хотя бы на треть — клип остаётся целым;
  4. сохраняет в H.264 (HEVC не везде играет) в подпапку loop/ под тем же именем.
Исходники не трогает. Печатает разницу стыка по телу до и после (меньше — лучше).

  python3 tools/fitness_loop.py "скрин/Eva тренер видео"
"""
import glob, json, os, subprocess, sys
import numpy as np

W, H = 192, 108        # уменьшенные кадры для сравнения поз
K = 2                  # сдвиг для сравнения движения, кадров
MIN_LOOP = 2.5         # петля не короче, секунд


def probe(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v', '-show_entries',
                          'stream=r_frame_rate', '-of', 'json', path], capture_output=True, text=True).stdout
    n, d = json.loads(out)['streams'][0]['r_frame_rate'].split('/')
    return float(n) / float(d)


def frames(path):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H},format=gray',
                          '-f', 'rawvideo', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)


def body(fr):
    """Оставить только пиксели, которые заметно меняются за клип (тело), — 15% самых подвижных."""
    sd = fr.std(0)
    return fr[:, sd > np.percentile(sd, 85)]


def seam(v, a, b):
    return float(np.abs(v[a] - v[b]).mean())


def best_loop(v, fps):
    n = len(v)
    min_len = int(max(MIN_LOOP * fps, n * 0.5))
    # исходный стык: после последнего кадра идёт первый
    orig = seam(v, n - 1, 0) + 0.5 * (seam(v, n - 1 - K, 0) + seam(v, n - 1, K)) if n > 2 * K else 1e9
    best = (orig, 0, n)
    for i in range(K, max(K + 1, int(n * 0.3))):
        for j in range(i + min_len, n - K):
            # петля i..j-1: после j-1 снова i, значит кадр j должен совпасть с i — и поза, и движение
            s = seam(v, i, j) + 0.5 * (seam(v, i - K, j - K) + seam(v, i + K, j + K))
            if s < best[0]:
                best = (s, i, j)
    if best[1:] != (0, n) and best[0] > orig * 0.67:   # выигрыш меньше трети — не режем
        best = (orig, 0, n)
    return best, orig


def make(src, dst, fps, i, j):
    fc = f"[0:v]trim=start_frame={i}:end_frame={j},setpts=PTS-STARTPTS,format=yuv420p[v]"
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', fc, '-map', '[v]', '-an',
                    '-c:v', 'libx264', '-crf', '18', '-preset', 'slow', '-pix_fmt', 'yuv420p',
                    '-movflags', '+faststart', dst], check=True)


def main(folder):
    out = os.path.join(folder, 'loop')
    os.makedirs(out, exist_ok=True)
    print(f"{'было':>6} {'стало':>6}  {'длина':>6}  файл")
    for src in sorted(glob.glob(os.path.join(folder, '*.mp4'))):
        name = os.path.basename(src)
        fps = probe(src)
        v = body(frames(src))
        (after, i, j), before = best_loop(v, fps)
        make(src, os.path.join(out, name), fps, i, j)
        cut = 'целиком' if (i, j) == (0, len(v)) else f'{(j - i) / fps:4.1f}с'
        flag = '' if after < 12 else '   ⚠ поза в конце другая — перегенерировать (начальный кадр = конечный)'
        print(f"{before:6.1f} {after:6.1f}  {cut:>7}  {name}{flag}")


if __name__ == '__main__':
    main(sys.argv[1] if len(sys.argv) > 1 else '.')

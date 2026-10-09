#!/usr/bin/env python3
"""Убрать «плывущую» камеру из сгенерированного клипа: каждый кадр совмещается с первым по неподвижному
фону (стена, растение, стул), тело в расчёт не берётся. Потом все кадры одинаково слегка обрезаются, чтобы
не было чёрных краёв, и клип режется на кадре, где поза совпадает с первой (для упражнений в две стороны).

Нужен OpenCV:  python3 -m venv venv && venv/bin/pip install opencv-python-headless numpy
  venv/bin/python tools/fitness_stabilize.py "скрин/Eva тренер видео/09_птица-собака.mp4"
  --top вторым аргументом — обрезка снизу, а не по центру (голова у верхнего края кадра).
Результат — <папка>/stab/<имя>.mp4 (H.264). Исходник не трогает.
"""
import os, subprocess, sys
import cv2
import numpy as np


def main(src, top=False):
    cap = cv2.VideoCapture(src)
    fps = cap.get(cv2.CAP_PROP_FPS) or 24
    frames = []
    while True:
        ok, f = cap.read()
        if not ok:
            break
        frames.append(f)
    n, (H, W) = len(frames), frames[0].shape[:2]

    # тело = пиксели, которые сильно меняются за клип; их исключаем из поиска точек фона
    small = np.stack([cv2.cvtColor(cv2.resize(f, (192, 108)), cv2.COLOR_BGR2GRAY) for f in frames]).astype(np.float32)
    sd = small.std(0)
    body = cv2.resize((sd > np.percentile(sd, 80)).astype(np.uint8) * 255, (W, H), interpolation=cv2.INTER_NEAREST)
    body = cv2.dilate(body, np.ones((61, 61), np.uint8))
    bg_mask = cv2.bitwise_not(body)

    g0 = cv2.cvtColor(frames[0], cv2.COLOR_BGR2GRAY)
    pts0 = cv2.goodFeaturesToTrack(g0, maxCorners=800, qualityLevel=0.005, minDistance=12, mask=bg_mask)
    mats = []
    for f in frames:
        g = cv2.cvtColor(f, cv2.COLOR_BGR2GRAY)
        p1, st, _ = cv2.calcOpticalFlowPyrLK(g0, g, pts0, None, winSize=(31, 31), maxLevel=4)
        good = st.ravel() == 1
        M, _ = cv2.estimateAffinePartial2D(p1[good], pts0[good], method=cv2.RANSAC, ransacReprojThreshold=2.0)
        mats.append(M if M is not None else np.float32([[1, 0, 0], [0, 1, 0]]))

    # общая рамка без чёрных краёв: пересечение образов всех кадров
    x0, y0, x1, y1 = 0, 0, W, H
    for M in mats:
        c = cv2.transform(np.float32([[[0, 0], [W, 0], [0, H], [W, H]]]), M)[0]
        x0, y0 = max(x0, c[0][0], c[2][0]), max(y0, c[0][1], c[1][1])
        x1, y1 = min(x1, c[1][0], c[3][0]), min(y1, c[2][1], c[3][1])
    # подогнать к 16:9 вокруг центра рамки
    cw, ch = x1 - x0, y1 - y0
    if cw / ch > W / H:
        cw = ch * W / H
    else:
        ch = cw * H / W
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    if top:  # --top: рамку прижать к верху допустимой зоны, срезать снизу — голова у верхнего края не режется
        cy = y0 + ch / 2
    crop = (int(cx - cw / 2), int(cy - ch / 2), int(cw), int(ch))
    print(f'кадров {n}, обрезка {100 * (1 - cw / W):.1f}% по ширине')

    out = [cv2.resize(cv2.warpAffine(f, M, (W, H), flags=cv2.INTER_CUBIC)[crop[1]:crop[1] + crop[3], crop[0]:crop[0] + crop[2]],
                      (W, H), interpolation=cv2.INTER_CUBIC) for f, M in zip(frames, mats)]

    # петля: конец там, где поза ближе всего к первой (последние 15% клипа)
    sm = np.stack([cv2.cvtColor(cv2.resize(f, (192, 108)), cv2.COLOR_BGR2GRAY) for f in out]).astype(np.float32)
    v = sm[:, sm.std(0) > np.percentile(sm.std(0), 85)]
    j = min(range(int(n * 0.85), n), key=lambda k: float(np.abs(v[k] - v[0]).mean()))
    out = out[:j]
    whole = float(np.abs(sm[j - 1] - sm[0]).mean())
    step = float(np.median([np.abs(sm[k + 1] - sm[k]).mean() for k in range(n - 1)]))
    print(f'стык по всему кадру {whole:.1f} (обычный шаг кадр→кадр {step:.1f}), длина {len(out) / fps:.2f}с')

    d = os.path.join(os.path.dirname(src), 'stab')
    os.makedirs(d, exist_ok=True)
    dst = os.path.join(d, os.path.basename(src))
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-s', f'{W}x{H}',
                          '-r', str(fps), '-i', '-', '-an', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
                          '-movflags', '+faststart', dst], stdin=subprocess.PIPE)
    for f in out:
        p.stdin.write(f.tobytes())
    p.stdin.close()
    p.wait()
    print('→', dst)


if __name__ == '__main__':
    main(sys.argv[1], '--top' in sys.argv[2:])

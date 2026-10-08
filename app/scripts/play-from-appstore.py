# Кадры Google Play 1080×2160 (2:1 — предел Play) из готовых кадров App Store 1290×2796.
# Берём золотую рамку со снимком целиком (туман и подпись уже на нём), вписываем по высоте в холст Play.
#   python3 app/scripts/play-from-appstore.py            → app/store/images/screenshots-play/<язык>/NN.png
import glob, os
from PIL import Image
SRC = 'app/store/images/screenshots-appstore'; DST = 'app/store/images/screenshots-play'
W, H, PAD = 1080, 2160, 20
for lang in sorted(d for d in os.listdir(SRC) if os.path.isdir(os.path.join(SRC, d))):
    os.makedirs(os.path.join(DST, lang), exist_ok=True)
    for f in sorted(glob.glob(os.path.join(SRC, lang, '*.png'))):
        im = Image.open(f).convert('RGB'); bg = im.getpixel((5, 5))
        # рамка = всё, что отличается от фона холста
        px = im.load(); w, h = im.size
        ys = [y for y in range(h) if any(abs(px[x, y][0] - bg[0]) > 12 for x in range(0, w, 8))]
        xs = [x for x in range(w) if any(abs(px[x, y][0] - bg[0]) > 12 for y in range(0, h, 8))]
        box = im.crop((xs[0], ys[0], xs[-1] + 1, ys[-1] + 1))
        nh = H - 2 * PAD; nw = round(box.width * nh / box.height)
        c = Image.new('RGB', (W, H), bg); c.paste(box.resize((nw, nh), Image.LANCZOS), ((W - nw) // 2, PAD))
        c.save(os.path.join(DST, lang, os.path.basename(f)))
    print(lang, len(glob.glob(os.path.join(DST, lang, '*.png'))))

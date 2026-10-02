# Кадр App Store 1290×2796: снимок экрана в золотой рамке, подпись — поверх размытой полосы самого снимка
# (сверху или снизу — где на экране нет важного), бирюзой приложения (--ok #4ECCA3), Playfair Display.
#   python3 compose-store-shot.py <снимок> "Строка 1\nСтрока 2" <out.png> top|bottom [высота_полосы]
# Шрифт: SHOT_FONT=/путь/PlayfairDisplay[wght].ttf (github.com/google/fonts, ofl/playfairdisplay).
# Apple рамки и подписи на скриншотах не запрещает; нельзя только показывать то, чего в приложении нет.
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W, H = 1290, 2796
M = 44                                   # поле вокруг снимка
BG = (16, 19, 26); TEAL = (78, 204, 163); GOLD = [(243, 217, 139), (198, 140, 52), (238, 175, 84), (142, 104, 40)]
R = 78; FRAME = 9

def font(size, weight=500):
    f = ImageFont.truetype(os.environ.get('SHOT_FONT', 'Playfair.ttf'), size)
    try: f.set_variation_by_axes([weight])
    except Exception: pass
    return f

def gold_gradient(w, h):
    g = Image.new('RGB', (1, h)); n = len(GOLD) - 1
    for y in range(h):
        t = y / max(1, h - 1) * n; i = min(int(t), n - 1); k = t - i
        g.putpixel((0, y), tuple(round(GOLD[i][c] * (1 - k) + GOLD[i + 1][c] * k) for c in range(3)))
    return g.resize((w, h))

def compose(src, caption, out, where='top', band=None, patch=None):
    im = Image.open(src).convert('RGB')
    if patch:                              # закрасить «◂ Chrome» в строке состояния цветом фона рядом
        x0, y0, x1, y1 = patch; ImageDraw.Draw(im).rectangle(tuple(patch), fill=im.getpixel((x1 + 30, (y0 + y1) // 2)))
    sw = W - 2 * M; sh = round(im.height * sw / im.width); top = (H - sh) // 2
    im = im.resize((sw, sh), Image.LANCZOS)
    lines = caption.split('\n'); f = font(88)
    d0 = ImageDraw.Draw(im)
    while max(d0.textlength(l, font=f) for l in lines) > sw - 150: f = font(f.size - 4)
    lh = round(f.size * 1.22); th = lh * len(lines)
    bh = band or (th + 250)
    y0 = 0 if where == 'top' else sh - bh
    # размытая полоса + затемнение, к внутреннему краю сходит на нет
    blur = im.filter(ImageFilter.GaussianBlur(34))
    dark = Image.blend(blur, Image.new('RGB', im.size, BG), 0.62)
    mask = Image.new('L', (sw, sh), 0); md = ImageDraw.Draw(mask); fade = 110
    for i in range(bh):
        a = 255 if i < bh - fade else round(255 * (bh - i) / fade)
        y = y0 + i if where == 'top' else sh - 1 - i
        md.line((0, y, sw, y), fill=a)
    im = Image.composite(dark, im, mask); d = ImageDraw.Draw(im)
    ty = (y0 + (bh - fade - th) // 2 + 20) if where == 'top' else (sh - (bh - fade) + (bh - fade - th) // 2 - 10)
    for l in lines:
        w = d.textlength(l, font=f)
        d.text(((sw - w) / 2 + 2, ty + 3), l, font=f, fill=(0, 0, 0))          # лёгкая тень для читаемости
        d.text(((sw - w) / 2, ty), l, font=f, fill=TEAL); ty += lh
    gl = gold_gradient(200, 3); im.paste(gl, ((sw - 200) // 2, ty + 34))
    # холст, золотая рамка, скругление
    c = Image.new('RGB', (W, H), BG)
    ring = Image.new('L', (W, H), 0); rd = ImageDraw.Draw(ring)
    rd.rounded_rectangle((M - FRAME, top - FRAME, M + sw + FRAME, top + sh + FRAME), radius=R + FRAME, fill=255)
    c.paste(gold_gradient(W, H), (0, 0), ring)
    sm = Image.new('L', (sw, sh), 0); ImageDraw.Draw(sm).rounded_rectangle((0, 0, sw, sh), radius=R, fill=255)
    c.paste(im, (M, top), sm); c.save(out)

if __name__ == '__main__':
    a = sys.argv
    compose(a[1], a[2].replace('\\n', '\n'), a[3], a[4] if len(a) > 4 else 'top', int(a[5]) if len(a) > 5 else None)

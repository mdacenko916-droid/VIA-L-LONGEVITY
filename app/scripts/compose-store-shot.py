# Кадр App Store 1290×2796 в оформлении боевого набора: подпись (Playfair Display — в Didot нет кириллицы),
# золотая черта, экран телефона со скруглением. python3 compose-store-shot.py <снимок> "Строка 1\nСтрока 2" <out.png>
# Шрифт: SHOT_FONT=/путь/PlayfairDisplay[wght].ttf (github.com/google/fonts, ofl/playfairdisplay).
import sys, os
from PIL import Image, ImageDraw, ImageFont, ImageFilter
REF='app/store/images/screenshots-appstore/01.png'
W,H=1290,2796; X0,X1,Y0=125,1163,475
BG=(14,18,25); CREAM=(240,232,216); GOLD=(201,162,84)
def font(size):
    for path,idx in ((os.environ.get('SHOT_FONT','Playfair.ttf'),0),):
        return ImageFont.truetype(path,size,index=idx)
def compose(src,caption,out):
    im=Image.open(src).convert('RGB')
    sw=X1-X0; sh=round(im.height*sw/im.width)
    if im.width<sw:
        im=im.resize((sw,sh),Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2,percent=60,threshold=2))
    else: im=im.resize((sw,sh),Image.LANCZOS)
    c=Image.new('RGB',(W,H),BG); d=ImageDraw.Draw(c)
    lines=caption.split('\n'); f=font(84)
    while max(d.textlength(l,font=f) for l in lines)>W-160: f=font(f.size-4)
    y=150 if len(lines)==2 else 205
    for l in lines:
        w=d.textlength(l,font=f); d.text(((W-w)/2,y),l,font=f,fill=CREAM); y+=104
    d.rectangle((555,376,735,378),fill=GOLD)
    mask=Image.new('L',(sw,sh),0); ImageDraw.Draw(mask).rounded_rectangle((0,0,sw,sh),radius=92,fill=255)
    ImageDraw.Draw(c).rounded_rectangle((X0-2,Y0-2,X1+2,Y0+sh+2),radius=94,outline=(70,74,84),width=2)
    c.paste(im,(X0,Y0),mask); c.save(out)
if __name__=='__main__': compose(sys.argv[1],sys.argv[2].replace('\\n','\n'),sys.argv[3])

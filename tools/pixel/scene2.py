import sys
from px import Canvas, PAL, ellipse, box, rounded_corners
from scene import QQ

OUT = sys.argv[1] if len(sys.argv) > 1 else "."

CAPY = [
    "..................cc..........",
    "..................cdccccccc...",
    ".................chhhhhhhhhc..",
    "................cheeeeeeeeKKc.",
    "................cheeeddeeeedc.",
    "................ceeeeKKeeeedc.",
    ".......ccccccccceeeeeeeeeeddc.",
    "....ccchhhhhhhheeeeeeeeeedddc.",
    "..cchhheeeeeeeeeeeeeeeeeeeedc.",
    ".chheeeeeeeeeeeeeeeeeeeeddec..",
    ".cheeeeeeeeeeeeeeddddddddcc...",
    "cheeeeddeeeeeeeeeddddcccc.....",
    "ceeeeeeedeeeeeeeeeddc.........",
    "ceeeeeeeedeeeeeeeeeddc........",
    "ceeeeeeeedeeeeeeeeeeddc.......",
    "c" + "e" * 7 + "d" + "e" * 12 + "ddc......",
    "c" + "e" * 16 + "d" * 7 + "cccc..",
    ".c" + "d" * 22 + "hhhc..",
    "..ccccccccccccccccccccccccc...",
]
assert all(len(r) == 30 for r in CAPY), [len(r) for r in CAPY]

DIE_RED = ["UUUUUUU", "URwRwRU", "URRRRRU", "URwRwRU", "URRRRRU", "URwRwRU", "UUUUUUU"]
DIE_YEL = ["YYYYYYY", "YsssssY", "YsSsssY", "YsssssY", "YsssSsY", "YsssssY", "YYYYYYY"]


def tv(cv, ox, oy):
    cab = box(ox, oy, 24, 18, r=2)
    for (x, y) in cab:
        edge = any(n not in cab for n in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
        cv.set(x, y, "1" if edge else "2")
    for x in range(ox + 2, ox + 22):
        cv.set(x, oy + 1, "4")
    for y in range(oy + 2, oy + 16):
        cv.set(ox + 1, y, "3")
    for x in range(ox + 2, ox + 23):
        cv.set(x, oy + 16, "1")
    cv.fill_mask(box(ox + 2, oy + 2, 15, 14, r=2), "K")
    scr = box(ox + 3, oy + 3, 13, 12, r=2)
    cv.fill_mask(scr, "b")
    screen = [
        "ZZOOO..LLL...",
        "ZOOOO..LLy...",
        ".OO...yyyyy..",
        "..gwgg.yryyy.",
        ".ggggg.yyyry.",
        "..gggg..yyy..",
        "..gwgG..yry..",
        "...ggG...yY..",
        "...gG....Y...",
        "....G........",
        ".............",
        ".............",
    ]
    for j, row in enumerate(screen):
        for i, ch in enumerate(row):
            if ch != "." and (ox + 3 + i, oy + 3 + j) in scr:
                cv.set(ox + 3 + i, oy + 3 + j, ch)
    knob = ["mMm", "MMM", "mMm"]
    cv.blit(knob, ox + 18, oy + 3)
    cv.blit(knob, ox + 18, oy + 7)
    cv.set(ox + 19, oy + 3, "1")
    for gy in (oy + 11, oy + 13):
        for gx in range(ox + 18, ox + 22):
            cv.set(gx, gy, "1")
    # pé palito legs
    for (x0, x1) in ((ox + 3, ox + 1), (ox + 20, ox + 22)):
        cv.line(x0, oy + 18, x1, 49, "2")
        cv.line(x0 + 1, oy + 18, x1 + 1, 49, "1")


PAL.update({
    "W": "#15323C",  # floor lit by the TV
    "X": "#1F4652",  # rug lit by the TV
    "H": "#0E2026",  # wall halo
    "t": "#17404C",  # window horizon glow
    "D": "#4A2C22",  # rug border
})
B4 = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]]


def dither(cv, x, y, inten, swap):
    if inten * 16 > B4[y % 4][x % 4]:
        ch = cv.get(x, y)
        if ch in swap:
            cv.set(x, y, swap[ch])


def window(cv):
    # frame x3..19, y5..22; sill one pixel wider below
    cv.rect(3, 5, 17, 18, "i")
    view = [
        "...............",
        "..w.......MM...",
        ".........MMMM..",
        "......w..MMMm..",
        "..........Mm...",
        "w.............w",
        "...............",
        "...............",
        "K.K.K.K........",
        "KKKKKKK...K.K.K",
        ".KKKKK....KKKKK",
        "...K.......KKK.",
        "...K........K..",
        "tttKttttttttKtt",
        "VVVKVVVVVVVVKVV",
        "KKKKKKKKKKKKKKK",
    ]
    for j, row in enumerate(view):
        for i, ch in enumerate(row):
            cv.set(4 + i, 6 + j, "j" if ch == "." else ch)
    cv.rect(2, 22, 19, 1, "f")
    cv.rect(2, 23, 19, 1, "F")


def garland(cv, x0=48, x1=71, sag=3, base=2, avoid="aAfF"):
    cols = "ryZgOL"
    k = 0
    for x in range(x0, x1 + 1):
        t = (x - x0) / (x1 - x0)
        y = round(base + sag * 4 * t * (1 - t))
        if cv.get(x, y) not in avoid:
            cv.set(x, y, "i")
        if (x - x0) % 6 == 3:
            c = cols[k % len(cols)]; k += 1
            spr = [c * 3, c * 3, c + "." + c]
            hit = any(cv.get(x - 1 + i, y + 1 + j) in avoid for j in range(3) for i in range(3))
            if not hit:
                cv.blit(spr, x - 1, y + 1)


CUIA = [
    "....a.",
    "...a..",
    ".cgac.",
    "chhhec",
    "ceeedc",
    ".cddc.",
]


def scene(extras=True, garl="full", dice=True, corners=True):
    cv = Canvas(72, 72, "T")
    # TV halo on the wall
    for y in range(0, 50):
        for x in range(72):
            d = ((x - 36) / 22) ** 2 + ((y - 24) / 18) ** 2
            dither(cv, x, y, max(0.0, 0.55 - 0.5 * d), {"T": "H"})
    cv.rect(0, 50, 72, 22, "u")
    cv.rect(0, 50, 72, 1, "V")
    rug = ellipse(36, 63, 33, 7.2)
    inner = ellipse(36, 63, 30.5, 5.6)
    for (x, y) in rug:
        cv.set(x, y, "D" if (x, y) not in inner else ("v" if abs(y - 63) < 4.5 or (x + y) % 2 else "V"))
    # floor glow under the TV
    for y in range(51, 72):
        for x in range(72):
            half = 11 + (y - 51) * 1.25
            dx = (x - 36) / half
            inten = max(0.0, 0.9 - dx * dx - (y - 51) / 26)
            dither(cv, x, y, inten, {"u": "W", "v": "X", "V": "X"})
    window(cv)
    # antenna and Bombril
    cv.line(33, 14, 28, 9, "a"); cv.set(27, 8, "A"); cv.set(26, 7, "a")
    cv.line(38, 14, 43, 9, "a")
    cv.blit([".ff.", "fFfF", "FfFf", ".fF."], 43, 6)
    tv(cv, 24, 15)
    # console on the floor between the legs, War cartridge plugged in
    cv.blit([
        "....KKKKKK....",
        "....KyyyyK....",
        ".KKKKYYYYKKKK.",
        "KaaaaaaaaaaaaK",
        "KffffffffffffK",
        "KFRRRFFFFFFrFK",
        ".KKKKKKKKKKKK.",
    ], 29, 43)
    # cables along the floor
    for (x, y) in [(30, 50), (30, 51), (31, 52), (31, 53), (31, 54), (30, 55), (30, 56), (31, 57),
                   (32, 58), (32, 59), (31, 60), (31, 61), (31, 62), (32, 63), (32, 64), (32, 65)]:
        cv.set(x, y, "k")
    cv.poly([(43, 47), (45, 47), (47, 46), (48, 45)], "k")
    # capivara with its controller on the floor
    cv.blit(CAPY, 1, 50)
    cv.blit(["kkkkkkk", "kAkkRkR", ".kkkkk."], 29, 66)
    # quero-quero
    cv.blit(QQ, 48, 27)
    # dice: red attacks, yellow defends
    if dice:
        cv.blit(DIE_RED, 38, 57)
        cv.blit(DIE_YEL, 46, 60)
    if extras:
        if garl == "right":
            garland(cv)
        elif garl == "full":
            garland(cv, 21, 71, sag=3, base=1)
        cv.blit(CUIA, 59, 61)
    if corners:
        rounded_corners(cv)
    return cv


if __name__ == "__main__":
    for g in ("none", "right", "full"):
        scene(garl=g).save_png(f"{OUT}/var_{g}.png", 8, (27, 43, 49, 255))
    cv = scene()
    cv.save_png(f"{OUT}/scene2.png", 8, (27, 43, 49, 255))
    open(f"{OUT}/scene2.svg", "w", encoding="utf-8").write(cv.svg())
    open(f"{OUT}/scene2.txt", "w", encoding="utf-8").write("\n".join(cv.to_rows()))
    print("ok")

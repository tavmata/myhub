import sys
from px import Canvas, ellipse, box, rounded_corners

OUT = sys.argv[1] if len(sys.argv) > 1 else "."

QQ = [  # quero-quero, facing left, 20x33
    "..................xx",
    "................xx..",
    "......zzzzz...xx....",
    ".....xxxqqQzxx......",
    "....xxxxQqQQz.xxx...",
    "....xxxxxQQQz.......",
    ".xppxEEQQQQQz.......",
    "xxPPxQQQQQQQz.......",
    "....xxQQQQQQz.......",
    ".....xxQQQQz........",
    "......xxQQz.........",
    ".....xxQQz..........",
    ".....xxQQz..........",
    ".....xxQQQz.........",
    "....xxxxQzNNNN......",
    "...xxxxxnoonnnnNN...",
    "..kkkkxxEnnnnnnnnN..",
    ".kRkRknxxnnnnnnnnNww",
    "..kkkkxxxNNNNNNNNNwx",
    "....zxxxwwwwwwwwwwwx",
    "....zxxwwwwwwwwwwwz.",
    ".....zwwwwwwwwwwwz..",
    "......zqwwwwwwwqz...",
    ".......zzqqqqqzz....",
    ".........l...l......",
    ".........l...l......",
    ".........l...l......",
    ".........l...l......",
    "........l.....l.....",
    "........l.....l.....",
    "........l.....l.....",
    "........l.....l.....",
    "......llll....llll..",
]
assert all(len(r) == 20 for r in QQ), [len(r) for r in QQ]


def tv(cv, ox, oy):
    """Wooden TV de tubo, 24x18, top-left at (ox, oy)."""
    cab = box(ox, oy, 24, 18, r=2)
    for (x, y) in cab:
        edge = any(n not in cab for n in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)))
        cv.set(x, y, "1" if edge else "2")
    for x in range(ox + 2, ox + 22):
        cv.set(x, oy + 1, "4")
    for y in range(oy + 2, oy + 16):
        cv.set(ox + 1, y, "3")
    for x in range(ox + 2, ox + 22):
        cv.set(x, oy + 16, "1")
    # bezel + screen
    bez = box(ox + 2, oy + 2, 15, 14, r=2)
    cv.fill_mask(bez, "K")
    scr = box(ox + 3, oy + 3, 13, 12, r=2)
    cv.fill_mask(scr, "b")
    sx, sy = ox + 3, oy + 3
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
            if ch != "." and (sx + i, sy + j) in scr:
                cv.set(sx + i, sy + j, ch)
    # knobs and grille
    for (kx, ky) in ((ox + 19, oy + 4), (ox + 19, oy + 8)):
        cv.blit([".M.", "MmM", ".M."], kx - 1, ky - 1)
    cv.set(ox + 19, oy + 4, "1")
    for gy in (oy + 11, oy + 13):
        for gx in range(ox + 18, ox + 22):
            cv.set(gx, gy, "1")


def capivara(cv, ox, oy):
    body = ellipse(ox + 12.5, oy + 12.2, 12.6, 6.4)
    body = {(x, y) for (x, y) in body if y <= oy + 17}
    head = box(ox + 16, oy + 1, 13, 10, r=3)
    neck = box(ox + 13, oy + 6, 9, 7)
    ear = box(ox + 17, oy + 0, 2, 2)
    mask = body | head | neck | ear
    cv.shaded(mask, "c", "h", "e", "d")
    # half-closed eye, nostril, mouth, ear inside
    cv.set(ox + 22, oy + 4, "K"); cv.set(ox + 23, oy + 4, "K")
    cv.set(ox + 22, oy + 3, "d"); cv.set(ox + 23, oy + 3, "d")
    cv.set(ox + 27, oy + 3, "K"); cv.set(ox + 26, oy + 3, "c")
    cv.set(ox + 25, oy + 8, "d"); cv.set(ox + 26, oy + 8, "d")
    cv.set(ox + 18, oy + 1, "d")
    # thigh line
    cv.poly([(ox + 3, oy + 16), (ox + 4, oy + 13), (ox + 6, oy + 11), (ox + 9, oy + 11), (ox + 11, oy + 13)], "d")


def scene():
    cv = Canvas(64, 64, "T")
    # floor and rug
    cv.rect(0, 47, 64, 17, "u")
    rug = ellipse(32, 56.5, 29, 5.6)
    for (x, y) in rug:
        cv.set(x, y, "v" if (x + y) % 2 or abs(y - 56.5) < 4 else "V")
    # window on the serra at night
    cv.rect(3, 5, 13, 13, "i")
    cv.rect(4, 6, 11, 11, "j")
    cv.blit([".M.", "MMM", ".M."], 11, 7)
    cv.blit(["K.K.K", "KKKKK", "..K..", "..K..", "..K.."], 4, 12)
    cv.rect(9, 6, 1, 11, "i")
    cv.rect(4, 11, 11, 1, "i")
    # TV with antenna and Bombril
    cv.line(31, 7, 26, 2, "a"); cv.set(26, 2, "A"); cv.set(25, 1, "a")
    cv.line(34, 7, 38, 3, "a")
    cv.blit([".ff.", "fFfF", "FfFf", ".fF."], 37, 0)
    tv(cv, 20, 7)
    # console
    cv.rect(22, 25, 20, 3, "C")
    cv.rect(24, 26, 16, 1, "R")
    # capivara lying on the rug, controller on the floor
    capivara(cv, 1, 39)
    cv.blit(["kkkkkkk", "kAkkRkR", ".kkkkk."], 25, 54)
    cv.blit(["hh", "hh"], 23, 54)
    # cables
    cv.poly([(24, 28), (24, 33), (27, 38), (29, 46), (29, 53)], "C")
    cv.poly([(39, 28), (39, 34), (42, 40)], "C")
    # quero-quero
    cv.blit(QQ, 41, 25)
    # dice: red attacks, yellow defends
    cv.blit(["UUUUU", "RwRwR", "RwRwR", "RwRwR", "RRRRR"], 33, 52)
    cv.blit(["sssss", "sSsss", "sssss", "sssSs", "sssss"], 38, 54)
    rounded_corners(cv)
    return cv


if __name__ == "__main__":
    cv = scene()
    cv.save_png(f"{OUT}/scene.png", 8, (27, 43, 49, 255))
    open(f"{OUT}/scene.svg", "w", encoding="utf-8").write(cv.svg())
    open(f"{OUT}/scene.txt", "w", encoding="utf-8").write("\n".join(cv.to_rows()))
    print("ok")

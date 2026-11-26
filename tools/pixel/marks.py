"""TV de tubo marks: 32x32 (nav, touch icon) and 16x16 (favicon), transparent background."""
import sys
from px import Canvas, box

OUT = sys.argv[1] if len(sys.argv) > 1 else "."

MAP32 = [
    "ZZOOOO....LLL....",
    "ZOOOOO...LLLL....",
    ".OOOO....LLy.....",
    "..OO....yyyyy....",
    "...gg..yyyyyyy...",
    "..gwggg.yyyryy...",
    "..ggggg..yyyyy...",
    "...gggg...yry....",
    "...gwgG...yyY....",
    "....ggG....yY....",
    "....gG.....Y.....",
    ".....G...........",
    ".................",
]


def cabinet(cv, x, y, w, h, r):
    cab = box(x, y, w, h, r=r)
    for (px_, py_) in cab:
        edge = any(n not in cab for n in ((px_ + 1, py_), (px_ - 1, py_), (px_, py_ + 1), (px_, py_ - 1)))
        cv.set(px_, py_, "1" if edge else "2")
    return cab


def tv32():
    cv = Canvas(32, 32, ".")
    # antennas, ball tip and Bombril
    cv.line(13, 9, 7, 3, "a"); cv.set(6, 2, "a"); cv.set(7, 2, "A"); cv.set(6, 3, "A")
    cv.line(18, 9, 23, 4, "a")
    cv.blit([".ff.", "fFfF", "FfFf", ".fF."], 23, 1)
    cab = cabinet(cv, 1, 9, 30, 19, 3)
    for x in range(3, 29):
        cv.set(x, 10, "4")
    for y in range(11, 26):
        cv.set(2, y, "3")
    for x in range(3, 30):
        cv.set(x, 26, "1")
    cv.fill_mask(box(3, 11, 19, 15, r=2), "K")
    scr = box(4, 12, 17, 13, r=2)
    cv.fill_mask(scr, "b")
    for j, row in enumerate(MAP32):
        for i, ch in enumerate(row):
            if ch != "." and (4 + i, 12 + j) in scr:
                cv.set(4 + i, 12 + j, ch)
    # glare
    cv.set(5, 23, "Z"); cv.set(6, 24, "Z")
    knob = ["mMm", "MMM", "mMm"]
    cv.blit(knob, 24, 12)
    cv.blit(knob, 24, 16)
    cv.set(25, 12, "1")
    for gy in (21, 23):
        for gx in range(23, 28):
            cv.set(gx, gy, "1")
    # pé palito legs
    cv.line(5, 28, 4, 31, "1"); cv.line(6, 28, 5, 31, "2")
    cv.line(26, 28, 27, 31, "1"); cv.line(25, 28, 26, 31, "2")
    return cv


MAP16 = [
    "OO...LL.",
    "OO..yyy.",
    ".g.yyyyy",
    ".gw.yry.",
    "..g..y..",
    "........",
]


def tv16():
    cv = Canvas(16, 16, ".")
    cv.set(4, 1, "a"); cv.set(5, 2, "a"); cv.set(6, 3, "a")
    cv.set(9, 3, "a"); cv.set(10, 2, "a")
    cv.blit(["ff", "fF"], 11, 0)
    cabinet(cv, 0, 4, 16, 10, 1)
    for x in range(1, 15):
        cv.set(x, 5, "4") if cv.get(x, 5) == "2" else None
    cv.rect(1, 5, 10, 8, "K")
    scr = box(2, 6, 8, 6, r=1)
    cv.fill_mask(scr, "b")
    for j, row in enumerate(MAP16):
        for i, ch in enumerate(row):
            if ch != "." and (2 + i, 6 + j) in scr:
                cv.set(2 + i, 6 + j, ch)
    cv.rect(12, 6, 2, 2, "M")
    cv.rect(12, 9, 2, 2, "M")
    cv.set(1, 14, "1"); cv.set(1, 15, "1")
    cv.set(14, 14, "1"); cv.set(14, 15, "1")
    return cv


if __name__ == "__main__":
    for name, cv in (("tv32", tv32()), ("tv16", tv16())):
        open(f"{OUT}/{name}.svg", "w", encoding="utf-8").write(cv.svg())
        cv.save_png(f"{OUT}/{name}.png", 16)
        print(name)
        print("\n".join(cv.to_rows()))

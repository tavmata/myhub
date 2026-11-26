"""Small art assets for hub v3: pixel cursors, the RPG hand, the capybara passport photo, the cordel woodcut."""
import math, os, random, sys
from PIL import Image
from px import Canvas, PAL
import scene2

IMG = sys.argv[1]


def grid_png(rows, colors, path, scale=2):
    h = len(rows); w = max(len(r) for r in rows)
    im = Image.new("RGBA", (w * scale, h * scale), (0, 0, 0, 0))
    for y, r in enumerate(rows):
        for x, ch in enumerate(r):
            if ch in colors:
                for yy in range(y * scale, (y + 1) * scale):
                    for xx in range(x * scale, (x + 1) * scale):
                        im.putpixel((xx, yy), colors[ch])
    im.save(path)
    return im.size


def hexc(h, a=255):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) + (a,)


# Pixel arrow for the living room
ARROW = [
    "X..........", "XX.........", "XWX........", "XWWX.......", "XWWWX......", "XWWWWX.....",
    "XWWWWWX....", "XWWWWWWX...", "XWWWWWWWX..", "XWWWWWWWWX.", "XWWWWXXXXX.", "XWWXWWX....",
    "XWX.XWWX...", "XX..XWWX...", "X....XWWX..", ".....XXX...",
]
print("cursor-px", grid_png(ARROW, {"X": hexc("#0B0F16"), "W": hexc("#F2E6B6")}, os.path.join(IMG, "cursor-px.png")))

# The RPG glove, pointing right (menu pointer and cursor)
HAND = [
    "..XXXXX.........",
    ".XWWWWWXXXXXXXX.",
    "XWWWWWWWWWWWWWWX",
    "XWWWWWWWXXXXXXX.",
    "XWWWWWWSWX......",
    "XWWWWWWWX.......",
    "XWWWWWWSWX......",
    "XWWWWWWWX.......",
    "XSWWWWWSWX......",
    ".XSSSSSSX.......",
    "..XXXXXX........",
]
cols = {"X": hexc("#0B1240"), "W": hexc("#F4F6F6"), "S": hexc("#AEB8C8")}
print("hand", grid_png(HAND, cols, os.path.join(IMG, "hand.png")))
print("cursor-hand", grid_png(HAND, cols, os.path.join(IMG, "cursor-hand.png")))

# Pencil, tip at the bottom left
pc = Canvas(16, 16, ".")
for y in range(16):
    for x in range(16):
        d = abs(x + y - 15) / math.sqrt(2)
        tpos = (x - y + 15) / 2
        if d <= 1.25 and 0.4 <= tpos <= 15:
            if tpos < 2.2:
                c = "x"
            elif tpos < 4.2:
                c = "h"
            elif tpos < 12.2:
                c = "y"
            elif tpos < 13.4:
                c = "f"
            else:
                c = "p"
            pc.set(x, y, c)
mask = {(x, y) for y in range(16) for x in range(16) if pc.get(x, y) != "."}
for (x, y) in list(mask):
    for (nx, ny) in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if (nx, ny) not in mask and 0 <= nx < 16 and 0 <= ny < 16:
            pc.set(nx, ny, "K")
pc.set(0, 15, "x")
print("cursor-pencil", grid_png(pc.to_rows(), {"x": hexc("#2B2B2B"), "h": hexc("#E8C39E"), "y": hexc("#F2C94C"), "f": hexc("#A3ACB3"), "p": hexc("#E8667A"), "K": hexc("#1D1A15")}, os.path.join(IMG, "cursor-pencil.png")))

# Capybara passport photo: head and shoulders from the room's capybara
crop = [r[12:30] for r in scene2.CAPY[0:14]]
print("capy-photo", grid_png(crop, {k: hexc(PAL[k]) for k in "cdehK"}, os.path.join(IMG, "capy-photo.png"), scale=1))

# Cordel woodcut cover
rnd = random.Random(1987)


def jag(x0, y0, x1, y1, n=18, amp=2.2):
    pts = []
    for i in range(n + 1):
        pts.append((x0 + (x1 - x0) * i / n, y0 + rnd.uniform(-amp, amp)))
    for i in range(n + 1):
        pts.append((x1 + rnd.uniform(-amp, amp), y0 + (y1 - y0) * i / n))
    for i in range(n + 1):
        pts.append((x1 - (x1 - x0) * i / n, y1 + rnd.uniform(-amp, amp)))
    for i in range(n + 1):
        pts.append((x0 + rnd.uniform(-amp, amp), y1 - (y1 - y0) * i / n))
    return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z"


parts = [f'<path d="{jag(6, 6, 294, 294)}" fill="#111"/>',
         '<rect x="15" y="15" width="270" height="270" fill="none" stroke="#fff" stroke-width="2.2"/>']
for i in range(24, 280, 16):
    parts.append(f'<path d="M{i} 15 l4 4 l4 -4" fill="none" stroke="#fff" stroke-width="1.6"/>')
    parts.append(f'<path d="M{i} 285 l4 -4 l4 4" fill="none" stroke="#fff" stroke-width="1.6"/>')
sx, sy = 226, 72
for k in range(16):
    a = k / 16 * 2 * math.pi
    p = [(sx + 31 * math.cos(a - 0.09), sy + 31 * math.sin(a - 0.09)), (sx + 54 * math.cos(a), sy + 54 * math.sin(a)), (sx + 31 * math.cos(a + 0.09), sy + 31 * math.sin(a + 0.09))]
    parts.append('<path d="M{:.1f} {:.1f} L{:.1f} {:.1f} L{:.1f} {:.1f} Z" fill="#fff"/>'.format(*[c for pt in p for c in pt]))
parts.append(f'<circle cx="{sx}" cy="{sy}" r="25" fill="#fff"/><circle cx="{sx}" cy="{sy}" r="17" fill="#111"/><circle cx="{sx}" cy="{sy}" r="9" fill="#fff"/>')
for k, y in enumerate((246, 260, 274)):
    d = f"M18 {y}" + "".join(f" Q {x + 9} {y - 5 + k} {x + 18} {y}" for x in range(18, 282, 18))
    parts.append(f'<path d="{d}" fill="none" stroke="#fff" stroke-width="{3.2 - k * 0.6:.1f}"/>')
parts.append('<path d="M66 236 L76 150 Q100 136 124 150 L136 236 Z" fill="#fff"/>')
for x in (86, 98, 110, 120):
    parts.append(f'<path d="M{x} 160 L{x - 2 + rnd.uniform(-2, 2):.1f} 232" stroke="#111" stroke-width="2.2"/>')
parts.append('<path d="M118 158 L150 128" stroke="#fff" stroke-width="14" stroke-linecap="round"/>')
parts.append('<circle cx="100" cy="118" r="21" fill="#fff"/>')
parts.append('<path d="M79 114 Q82 92 100 92 Q120 92 122 112 Q112 102 100 104 Q88 104 79 114 Z" fill="#111"/>')
parts.append('<circle cx="93" cy="119" r="2.6" fill="#111"/><circle cx="108" cy="119" r="2.6" fill="#111"/><path d="M94 129 Q101 134 108 129" fill="none" stroke="#111" stroke-width="2.4"/>')
parts.append('<g transform="rotate(-16 158 106)"><rect x="146" y="82" width="25" height="42" rx="3" fill="#fff"/><rect x="150" y="87" width="17" height="28" fill="#111"/><circle cx="158.5" cy="119.5" r="2" fill="#111"/></g>')
for r in (16, 28, 40):
    parts.append(f'<path d="M{182 + r * 0.2:.1f} {104 - r:.1f} A {r} {r} 0 0 1 {182 + r * 0.2:.1f} {104 + r:.1f}" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>')
heads = [(198, 186, 10), (226, 182, 11), (256, 188, 10), (184, 214, 11), (214, 210, 12), (244, 214, 11), (272, 210, 10), (200, 236, 10), (232, 238, 11), (262, 236, 10)]
for (hx, hy, hr) in heads:
    parts.append(f'<path d="M{hx - hr * 1.5:.1f} {hy + hr * 2.4:.1f} Q{hx} {hy + hr * 0.6:.1f} {hx + hr * 1.5:.1f} {hy + hr * 2.4:.1f} Z" fill="#fff"/>')
    parts.append(f'<circle cx="{hx}" cy="{hy}" r="{hr}" fill="#fff"/>')
    parts.append(f'<path d="M{hx - hr * 0.8:.1f} {hy - hr * 0.2:.1f} Q{hx} {hy - hr * 1.2:.1f} {hx + hr * 0.8:.1f} {hy - hr * 0.2:.1f}" fill="none" stroke="#111" stroke-width="2"/>')


def busy(x, y):
    return (55 <= x <= 140 and 88 <= y <= 240) or (140 <= x <= 200 and 60 <= y <= 150) or (170 <= x <= 290 and 168 <= y <= 250) or (162 <= x <= 290 and 10 <= y <= 132) or y > 236


n = 0
while n < 70:
    x, y = rnd.uniform(22, 278), rnd.uniform(22, 236)
    if busy(x, y):
        continue
    L = rnd.uniform(5, 15); a = rnd.uniform(-0.35, 0.35)
    parts.append(f'<path d="M{x:.1f} {y:.1f} l{L * math.cos(a):.1f} {L * math.sin(a):.1f}" stroke="#fff" stroke-width="{rnd.uniform(1.2, 2.4):.1f}" stroke-linecap="round"/>')
    n += 1
svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" width="300" height="300">'
       '<defs><filter id="c" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="8"/>'
       '<feDisplacementMap in="SourceGraphic" scale="2.6" xChannelSelector="R" yChannelSelector="G"/></filter></defs>'
       '<g filter="url(#c)">' + "".join(parts) + '</g></svg>')
open(os.path.join(IMG, "cordel.svg"), "w", encoding="utf-8").write(svg)
print("cordel.svg", len(svg), "bytes")

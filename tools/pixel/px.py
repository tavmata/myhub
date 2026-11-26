"""Tiny pixel-art toolkit: a palette canvas, primitives, auto outline + shading,
and export to crisp SVG (one path per color) and scaled PNG."""
from PIL import Image

PAL = {
    "T": "#0A171C",  # night wall
    "u": "#10242B",  # floor
    "v": "#183740",  # rug
    "V": "#14303A",  # rug dither
    "K": "#0B0F16",  # black
    "C": "#16191E",  # console / cable
    "k": "#2B3037",  # controller
    "w": "#F4F6F6",  # white
    "M": "#F2E6B6",  # moon / cream
    "m": "#CDBF8E",  # cream shade
    # wood TV
    "1": "#4A2412", "2": "#8A4524", "3": "#B0603A", "4": "#D08850",
    # screen
    "B": "#1D3C80", "b": "#2D5DB8", "Z": "#7FA6E8",
    "g": "#46B154", "G": "#2B7A3A", "y": "#EDC04E", "Y": "#B98C24", "O": "#C9713F", "L": "#B48CD8",
    "r": "#E8483C", "R": "#D93A2B", "U": "#8E1E16", "s": "#F2C94C", "S": "#3A2A06",
    # metal / Bombril
    "a": "#C7CDD2", "A": "#7E878E", "f": "#A3ACB3", "F": "#69727A",
    # window
    "i": "#2A3A40", "j": "#0F2A33",
    # capivara
    "c": "#3B2316", "d": "#6E4127", "e": "#9A6440", "h": "#C08A58",
    # quero-quero
    "q": "#D9DDDF", "Q": "#A7AEB3", "z": "#6E767C", "x": "#0F1114", "p": "#E8667A", "P": "#B23E52",
    "l": "#E0606A", "E": "#E0303A", "n": "#8A8474", "N": "#5E5A4E", "o": "#7C9354",
}


class Canvas:
    def __init__(self, w, h, fill="."):
        self.w, self.h = w, h
        self.px = [[fill] * w for _ in range(h)]

    def set(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.px[y][x] = c

    def get(self, x, y):
        if 0 <= x < self.w and 0 <= y < self.h:
            return self.px[y][x]
        return "."

    def rect(self, x, y, w, h, c):
        for yy in range(y, y + h):
            for xx in range(x, x + w):
                self.set(xx, yy, c)

    def line(self, x0, y0, x1, y1, c):
        dx, dy = abs(x1 - x0), -abs(y1 - y0)
        sx, sy = (1 if x0 < x1 else -1), (1 if y0 < y1 else -1)
        err = dx + dy
        while True:
            self.set(x0, y0, c)
            if x0 == x1 and y0 == y1:
                break
            e2 = 2 * err
            if e2 >= dy:
                err += dy; x0 += sx
            if e2 <= dx:
                err += dx; y0 += sy

    def poly(self, pts, c):
        for (a, b) in zip(pts, pts[1:]):
            self.line(a[0], a[1], b[0], b[1], c)

    def blit(self, rows, x, y, skip="."):
        for j, row in enumerate(rows):
            for i, ch in enumerate(row):
                if ch != skip:
                    self.set(x + i, y + j, ch)

    def fill_mask(self, mask, c):
        for (x, y) in mask:
            self.set(x, y, c)

    def shaded(self, mask, outline, light, mid, dark, light_dir=(-1, -1)):
        """Fill a mask with 1px outline, a light rim facing light_dir and a dark rim opposite."""
        lx, ly = light_dir
        for (x, y) in mask:
            nb = [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]
            if any(n not in mask for n in nb):
                self.set(x, y, outline)
                continue
            lit = (x + lx, y) not in mask or (x, y + ly) not in mask or (x + 2 * lx, y + 2 * ly) not in mask and (x + lx, y + ly) in mask and False
            toward = (x + lx, y + ly)
            away = (x - lx, y - ly)
            # neighbour two steps toward the light is outside -> rim light
            if (x + lx, y) not in mask or (x, y + ly) not in mask or (x + lx, y + ly) not in mask:
                self.set(x, y, light)
            elif (x - lx, y) not in mask or (x, y - ly) not in mask or (x - lx, y - ly) not in mask:
                self.set(x, y, dark)
            elif (x - 2 * lx, y - 2 * ly) not in mask:
                self.set(x, y, dark)
            else:
                self.set(x, y, mid)

    def to_rows(self):
        return ["".join(r) for r in self.px]

    def save_png(self, path, scale=8, bg=None):
        im = Image.new("RGBA", (self.w * scale, self.h * scale), bg or (0, 0, 0, 0))
        for y in range(self.h):
            for x in range(self.w):
                ch = self.px[y][x]
                if ch == ".":
                    continue
                col = PAL[ch].lstrip("#")
                rgb = tuple(int(col[i:i + 2], 16) for i in (0, 2, 4)) + (255,)
                for yy in range(y * scale, (y + 1) * scale):
                    for xx in range(x * scale, (x + 1) * scale):
                        im.putpixel((xx, yy), rgb)
        im.save(path)

    def svg(self):
        paths = {}
        for y in range(self.h):
            x = 0
            while x < self.w:
                ch = self.px[y][x]
                if ch == ".":
                    x += 1
                    continue
                x2 = x
                while x2 < self.w and self.px[y][x2] == ch:
                    x2 += 1
                paths.setdefault(ch, []).append(f"M{x} {y}h{x2 - x}v1h-{x2 - x}z")
                x = x2
        body = "".join(f'<path fill="{PAL[k]}" d="{"".join(v)}"/>' for k, v in paths.items())
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {self.w} {self.h}" shape-rendering="crispEdges">{body}</svg>'


def ellipse(cx, cy, rx, ry):
    out = set()
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            if ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1.0:
                out.add((x, y))
    return out


def box(x, y, w, h, r=0):
    out = set()
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            cx = min(max(xx, x + r), x + w - 1 - r)
            cy = min(max(yy, y + r), y + h - 1 - r)
            if r == 0 or (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r + 0.5:
                out.add((xx, yy))
    return out


def rounded_corners(cv, r_rows=(4, 2, 1, 1)):
    w, h = cv.w, cv.h
    for j, n in enumerate(r_rows):
        for i in range(n):
            for (x, y) in ((i, j), (w - 1 - i, j), (i, h - 1 - j), (w - 1 - i, h - 1 - j)):
                cv.set(x, y, ".")

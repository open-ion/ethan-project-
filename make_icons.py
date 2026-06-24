#!/usr/bin/env python3
"""アプリアイコンを生成する（依存ゼロ・純Pythonの最小PNGライタ）。

赤い角丸スクエアに白い「ニュースの行」を描いた簡素なアイコン。
実行すると apps/news/ に icon-192.png / icon-512.png / apple-touch-icon-180.png を出力。
"""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

BRAND = (0xFF, 0x4D, 0x4F)  # #ff4d4f


def _png(width: int, height: int, buf: bytearray) -> bytes:
    def chunk(typ: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data)) + typ + data
            + struct.pack(">I", zlib.crc32(typ + data) & 0xFFFFFFFF)
        )

    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)  # 8bit RGBA
    raw = bytearray()
    stride = width * 4
    for y in range(height):
        raw.append(0)  # filter type 0
        raw.extend(buf[y * stride:(y + 1) * stride])
    idat = zlib.compress(bytes(raw), 9)
    return (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", ihdr)
        + chunk(b"IDAT", idat)
        + chunk(b"IEND", b"")
    )


def _set(buf: bytearray, w: int, x: int, y: int, rgba: tuple[int, int, int, int]):
    i = (y * w + x) * 4
    buf[i:i + 4] = bytes(rgba)


def make_icon(size: int) -> bytes:
    buf = bytearray(size * size * 4)  # 透明で初期化
    radius = int(size * 0.22)
    r, g, b = BRAND

    # 角丸の赤背景
    for y in range(size):
        for x in range(size):
            if _in_rounded(x, y, size, radius):
                _set(buf, size, x, y, (r, g, b, 255))

    # 白い「ニュースの行」
    white = (255, 255, 255, 255)
    margin = int(size * 0.20)
    bar_h = max(2, int(size * 0.075))
    gap = int(size * 0.075)
    top = int(size * 0.30)
    # 見出し（短く太い） + 本文3行
    widths = [0.42, 0.60, 0.60, 0.44]
    for idx, wr in enumerate(widths):
        y0 = top + idx * (bar_h + gap)
        x1 = margin + int((size - 2 * margin) * wr)
        for y in range(y0, min(y0 + bar_h, size)):
            for x in range(margin, min(x1, size)):
                _set(buf, size, x, y, white)

    return _png(size, size, buf)


def _in_rounded(x: int, y: int, size: int, radius: int) -> bool:
    # 角の外側だけ透明にする
    corners = [
        (radius, radius),
        (size - 1 - radius, radius),
        (radius, size - 1 - radius),
        (size - 1 - radius, size - 1 - radius),
    ]
    if radius <= x <= size - 1 - radius or radius <= y <= size - 1 - radius:
        return True
    for cx, cy in corners:
        if abs(x - cx) <= radius and abs(y - cy) <= radius:
            if (x - cx) ** 2 + (y - cy) ** 2 <= radius * radius:
                return True
    return False


def main() -> None:
    out = Path(__file__).resolve().parent / "apps" / "news"
    out.mkdir(parents=True, exist_ok=True)
    for name, size in [
        ("icon-192.png", 192),
        ("icon-512.png", 512),
        ("apple-touch-icon-180.png", 180),
    ]:
        (out / name).write_bytes(make_icon(size))
        print(f"wrote {name} ({size}x{size})")


if __name__ == "__main__":
    main()

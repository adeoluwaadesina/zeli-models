"""
Remove flat mat (brown + neutral frame) from zeli-logo-light.png → RGBA for footer/splash.
Run: python scripts/knockout-logo-bg.py
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "zeli-logo-light.png"
OUT = ROOT / "public" / "zeli-logo-light-transparent.png"


def trim_transparent_rgba(path: Path, alpha_threshold: int = 12) -> tuple[int, int]:
    """Crop to the bounding box of visible pixels so layout sits tight under the wordmark."""
    im = Image.open(path).convert("RGBA")
    alpha = np.array(im.split()[-1])
    rows = np.any(alpha > alpha_threshold, axis=1)
    cols = np.any(alpha > alpha_threshold, axis=0)
    if not rows.any() or not cols.any():
        return im.size
    y0, y1 = int(np.argmax(rows)), int(len(rows) - np.argmax(rows[::-1]))
    x0, x1 = int(np.argmax(cols)), int(len(cols) - np.argmax(cols[::-1]))
    cropped = im.crop((x0, y0, x1 + 1, y1 + 1))
    cropped.save(path, optimize=True)
    return cropped.size


def main() -> None:
    img = Image.open(SRC).convert("RGB")
    rgb = np.asarray(img, dtype=np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h, w = r.shape
    lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
    chroma = np.max(rgb, axis=2) - np.min(rgb, axis=2)

    # Brown mat: mid luminance, not fire-white
    mat = (lum > 38) & (lum < 125) & (chroma < 72)
    brown_ref = np.median(rgb[mat], axis=0) if np.any(mat) else np.array([58.0, 41.0, 26.0])

    edge_px = np.vstack([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    edge_ref = np.median(edge_px, axis=0)

    dist_b = np.sqrt(np.square(rgb - brown_ref).sum(axis=2))
    dist_e = np.sqrt(np.square(rgb - edge_ref).sum(axis=2))
    dist = np.minimum(dist_b, dist_e)

    t0, t1 = 12.0, 46.0
    a_k = (dist - t0) / (t1 - t0)
    a_k = np.clip(a_k, 0.0, 1.0)

    # Recover anti-aliased strokes (off-white)
    a_l = (lum - 98.0) / 62.0
    a_l = np.clip(a_l, 0.0, 1.0)

    a = np.maximum(a_k, a_l)
    alpha = (a * 255.0).astype(np.uint8)
    out = np.dstack([rgb.astype(np.uint8), alpha])
    Image.fromarray(out, "RGBA").save(OUT, optimize=True)
    cw, ch = trim_transparent_rgba(OUT)
    print(
        f"Wrote {OUT.relative_to(ROOT)} ({cw}x{ch} trimmed) | brown {np.round(brown_ref).astype(int)} edge {np.round(edge_ref).astype(int)}"
    )


if __name__ == "__main__":
    main()

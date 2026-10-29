#!/usr/bin/env python3
"""Generate responsive WebP + JPG sizes for site photography.

Usage:  python3 scripts/build-images.py

Reads each source listed in SOURCES and writes
assets/images/responsive/<name>-<width>.{webp,jpg} at 640/1024/1600w
(never upscaling: a source narrower than 1600px gets its own width as
the largest size). Every output is kept under MAX_BYTES by stepping
quality down if needed.

To add a new photo: drop the original into assets/images/couples/,
add it to SOURCES, re-run, then reference the generated files.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets/images/responsive"
WIDTHS = (640, 1024, 1600)
MAX_BYTES = 250 * 1024

# name -> source file (relative to repo root)
SOURCES = {
    "lifestyle-01": "assets/images/lifestyle-01.jpg",
    "lifestyle-03": "assets/images/lifestyle-03.jpg",
    "lifestyle-04": "assets/images/lifestyle-04.jpg",
    "lifestyle-05": "assets/images/lifestyle-05.jpg",
    "lifestyle-06": "assets/images/lifestyle-06.jpg",
    "lifestyle-07": "assets/images/lifestyle-07.jpg",
    "lifestyle-10": "assets/images/lifestyle-10.jpg",
    "lifestyle-11": "assets/images/lifestyle-11.jpg",
    "lifestyle-12": "assets/images/lifestyle-12.jpg",
    # New couple photography (assets/images/couples/) — add as files land:
    # "beach-sunset":   "assets/images/couples/beach-sunset.jpg",
    # "plane-selfie":   "assets/images/couples/plane-selfie.jpg",
    # "promenade-talk": "assets/images/couples/promenade-talk.jpg",
    # "cafe-date":      "assets/images/couples/cafe-date.jpg",
    # "village-walk":   "assets/images/couples/village-walk.jpg",
    # "garden-bbq":     "assets/images/couples/garden-bbq.jpg",
}


def save_under_budget(img, path, fmt, quality):
    while True:
        opts = {"quality": quality}
        if fmt == "JPEG":
            opts.update(optimize=True, progressive=True)
        else:
            opts.update(method=6)
        img.save(path, fmt, **opts)
        if path.stat().st_size <= MAX_BYTES or quality <= 50:
            return quality
        quality -= 5


def widths_for(src_width):
    ws = [w for w in WIDTHS if w < src_width]
    if src_width <= WIDTHS[-1]:
        ws.append(src_width)
    else:
        ws.append(WIDTHS[-1])
    return sorted(set(ws))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for name, rel in SOURCES.items():
        src = ROOT / rel
        if not src.exists():
            print(f"skip {name}: {rel} not found")
            continue
        img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
        for w in widths_for(img.width):
            h = round(img.height * w / img.width)
            resized = img.resize((w, h), Image.LANCZOS)
            for ext, fmt, q in (("webp", "WEBP", 78), ("jpg", "JPEG", 80)):
                path = OUT / f"{name}-{w}.{ext}"
                used = save_under_budget(resized, path, fmt, q)
                print(f"{path.relative_to(ROOT)}  {w}x{h}  q{used}  {path.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()

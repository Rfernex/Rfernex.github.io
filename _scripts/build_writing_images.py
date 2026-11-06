"""Build the images used on writing.qmd.

- assets/writing/portraits/<slug>.jpg: the figure's image from each portrait PDF,
  cropped to 4:5 around the face.
- assets/writing/dossier-cover.jpg: first page of the Japanese higher-education dossier.

Needs poppler (pdfimages, pdftoppm) and Pillow. Run from the repo root:
    python3 _scripts/build_writing_images.py
"""
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
PDFS = ROOT / "Resources" / "writing"
OUT = ROOT / "assets" / "writing"

# slug -> where the face sits in the image, as fractions of width and height
PORTRAITS = {
    "kishida-toshiko": (0.50, 0.35),
    "fukuzawa-yukichi": (0.50, 0.32),
    "date-masamune": (0.50, 0.45),
    "kusunoki-masashige": (0.50, 0.30),
    "matsuo-basho": (0.50, 0.30),
    "gustave-boissonade": (0.50, 0.40),
    "prince-shotoku": (0.50, 0.20),
    "minamoto-no-yoritomo": (0.50, 0.35),
    "tokugawa-yoshimune": (0.42, 0.40),
    "sakamoto-ryoma": (0.60, 0.40),
}
THUMB = (300, 375)  # 4:5


def crop_around(im, fx, fy, aspect=THUMB[0] / THUMB[1]):
    w, h = im.size
    if w / h > aspect:  # too wide: trim the sides
        cw, ch = round(h * aspect), h
    else:  # too tall: trim top and bottom
        cw, ch = w, round(w / aspect)
    left = min(max(round(fx * w - cw / 2), 0), w - cw)
    top = min(max(round(fy * h - ch / 2), 0), h - ch)
    return im.crop((left, top, left + cw, top + ch))


def main():
    (OUT / "portraits").mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        tmp = Path(tmp)
        for slug, (fx, fy) in PORTRAITS.items():
            subprocess.run(["pdfimages", "-png", "-f", "1", "-l", "1",
                            str(PDFS / f"{slug}.pdf"), str(tmp / slug)], check=True)
            src = sorted(tmp.glob(f"{slug}-*.png"))[0]
            im = Image.open(src).convert("RGB")
            thumb = crop_around(im, fx, fy).resize(THUMB, Image.LANCZOS)
            thumb.save(OUT / "portraits" / f"{slug}.jpg", quality=84, optimize=True, progressive=True)

        dossier = PDFS / "internationalisation-enseignement-superieur-japonais.pdf"
        subprocess.run(["pdftoppm", "-f", "1", "-l", "1", "-r", "110", "-png",
                        str(dossier), str(tmp / "cover")], check=True)
        cover = Image.open(sorted(tmp.glob("cover*.png"))[0]).convert("RGB")
        cover = cover.resize((560, round(560 * cover.height / cover.width)), Image.LANCZOS)
        cover.save(OUT / "dossier-cover.jpg", quality=84, optimize=True, progressive=True)


if __name__ == "__main__":
    main()

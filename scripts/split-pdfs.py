#!/usr/bin/env python3
from pathlib import Path
from pypdf import PdfReader, PdfWriter

SOURCE = Path("quran-original.pdf")
OUTPUT = Path("quran")
OUTPUT.mkdir(exist_ok=True)

RANGES = [
    ("friday", 2, 147),
    ("saturday", 147, 288),
    ("sunday", 288, 393),
    ("monday", 393, 511),
    ("tuesday", 511, 618),
    ("wednesday", 618, 721),
    ("thursday", 721, 849),
]

reader = PdfReader(str(SOURCE))
for name, first, last in RANGES:
    writer = PdfWriter()
    for page_number in range(first, last + 1):
        writer.add_page(reader.pages[page_number - 1])
    with (OUTPUT / f"{name}.pdf").open("wb") as f:
        writer.write(f)
    print(f"{name}: pages {first}-{last}")

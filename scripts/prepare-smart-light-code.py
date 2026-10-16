"""Render class coding references. Requires PyMuPDF; run from the repository root."""
from pathlib import Path
import pymupdf

source = Path('public/Session 25. Smart Light.pdf')
output = Path('public/assets/smart-light-code')
output.mkdir(parents=True, exist_ok=True)
with pymupdf.open(source) as lesson:
    # The last slide reverses the lesson goal. SmartLightCoding renders the
    # corrected dark-on/bright-off program directly instead of copying it.
    for step, page in enumerate((25, 26, 28, 30, 31, 33), start=1):
        lesson[page - 1].get_pixmap(matrix=pymupdf.Matrix(1.4, 1.4)).save(output / f'{step}.png')

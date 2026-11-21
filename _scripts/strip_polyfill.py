"""Quarto post-render step: remove the polyfill script Quarto adds next to MathJax.

It is loaded from cdnjs (Cloudflare), so every visitor's IP address would reach that service.
Browsers from 2017 on support what it adds. MathJax itself is served from assets/mathjax.
"""
import os
from pathlib import Path

LINE = '<script src="https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?features=es6"></script>'
files = os.environ.get('QUARTO_PROJECT_OUTPUT_FILES', '').split('\n')
for name in filter(None, files):
    path = Path(name)
    if path.suffix == '.html' and path.exists():
        text = path.read_text(encoding='utf-8')
        if LINE in text:
            path.write_text('\n'.join(l for l in text.split('\n') if l.strip() != LINE), encoding='utf-8')

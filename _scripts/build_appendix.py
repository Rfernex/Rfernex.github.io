"""Build the online appendix page (thesis-appendix.qmd) from the thesis manuscript appendix.

Run from any folder with: python3 _scripts/build_appendix.py, then quarto render.
"""
import re
import shutil
import subprocess
import tempfile
from pathlib import Path

MANUSCRIPT = Path("/Users/rfernex/Documents/Education/SciencesPo/Courses/M2/Master thesis/Master_Thesis_Manuscript")
SITE = Path("/Users/rfernex/Documents/Education/SciencesPo/Courses/CSS/Website/Rfernex.github.io")
WORK = Path(tempfile.mkdtemp())
FIG_DIR = SITE / "assets" / "thesis-appendix"

lines = (MANUSCRIPT / "main.tex").read_text().splitlines()
macros = "\n".join(lines[35:49])                     # \newcommand block of the preamble
start = next(i for i, l in enumerate(lines) if l.strip() == r"\appendix") + 1
end = next(i for i, l in enumerate(lines) if l.strip() == r"\end{document}")
body = "\n".join(lines[start:end])

#--- LaTeX clean-up before conversion ---
body = re.sub(r"\\cmidrule(\([^)]*\))?\{[^}]*\}", "", body)
body = body.replace("{,}", ",")
def numeric_cell(match):
    sign, number, stars = match.group(1), match.group(2), match.group(3)
    text = ("\u2212" if sign else "") + number
    if stars:
        text += r"\textsuperscript{" + ("\u2020" if "dagger" in stars else stars) + "}"
    return text
body = re.sub(r"\$(-?)\s*(\(?\d[\d.,]*\)?)\s*(?:\^\{?\s*(\\dagger|\*+)\s*\}?)?\$", numeric_cell, body)

tex = WORK / "appendix_clean.tex"
tex.write_text("\\documentclass{article}\n" + macros + "\n\\begin{document}\n" + body + "\n\\end{document}\n")
md_path = WORK / "appendix_clean.md"
subprocess.run(["quarto", "pandoc", str(tex), "-f", "latex",
                "-t", "markdown-simple_tables-multiline_tables-grid_tables-pipe_tables",
                "--wrap=none", "--shift-heading-level-by=1", "-o", str(md_path)], check=True)
md = md_path.read_text()

#--- Section letters, ids and cross-references ---
letters = iter("ABCDEFGH")
def letter_section(match):
    return f"## {next(letters)}. {match.group(1)} {{#app-{match.group(2)}}}"
md = re.sub(r"^## (.+?) \{#app:([A-Za-z_]+)\}$", letter_section, md, flags=re.M)
md = re.sub(r"\[6\]\(#app:constrained_derivations\)(\{[^}]*\})?", "[Appendix F](#app-constrained_derivations)", md)
md = md.replace("(#app:", "(#app-")
md = re.sub(r"\{#fig:[^\s}]+\s*", "{", md)

#--- MathJax does not allow \tag inside aligned: label those lines in text ---
def untag_aligned(match):
    block = match.group(0)
    head, sep, rest = block.partition(r"\end{aligned}")
    head = re.sub(r"\\tag\{([^{}]*?)(\$'\$)?\}", lambda t: r"\qquad\text{(" + t.group(1) + ("'" if t.group(2) else "") + ")}", head)
    return head + sep + rest
md = re.sub(r"\$\$\s*\\begin\{aligned\}.*?\$\$", untag_aligned, md, flags=re.S)

#--- Web addresses written without a scheme in the manuscript ---
md = re.sub(r"\]\((?!https?:|#|assets/|Resources/|thesis)([a-z0-9.-]+\.[a-z]{2,}/[^)\s]*)\)", r"](https://\1)", md)

#--- Typography: no em dashes, clean significance stars ---
md = md.replace(" --- ", ", ").replace(" — ", ", ")
md = re.sub(r"<sup>\s*\*\s*\*\s*\*\s*</sup>", "<sup>***</sup>", md)
md = re.sub(r"<sup>\s*\*\s*\*\s*</sup>", "<sup>**</sup>", md)

#--- Figures ---
FIG_DIR.mkdir(parents=True, exist_ok=True)
for name in re.findall(r"\]\(Graphs/([^)\s]+)\)", md):
    source = MANUSCRIPT / "Graphs" / name
    if name.endswith(".pdf"):
        target = FIG_DIR / name.replace(".pdf", ".png")
        subprocess.run(["pdftoppm", "-r", "170", "-png", "-singlefile", str(source), str(target.with_suffix(""))], check=True)
    else:
        shutil.copy2(source, FIG_DIR / name)
md = re.sub(r"\]\(Graphs/([^)\s]+)\.pdf\)", r"](assets/thesis-appendix/\1.png)", md)
md = md.replace("](Graphs/", "](assets/thesis-appendix/")

#--- Tables: a cell starting with "(1) " would be read as a numbered list ---
md = re.sub(r"(<t[hd][^>]*>)\((\d+)\)(\s)", r"\1&#40;\2)\3", md)

#--- Tables: italics inside maths spans use <i>, so <em> never nests in a cell ---
md = re.sub(r'<span class="math inline">(.*?)</span>',
            lambda m: '<span class="math inline">' + m.group(1).replace("<em>", "<i>").replace("</em>", "</i>") + "</span>", md)

header = """---
title: Online appendix
subtitle: Supplementary material for my master thesis, "Self-Employment and Dual-Jobholding".
toc: true
toc-depth: 2
body-classes: appendix-page
---

This page reproduces the appendix of my master thesis, [Self-employment and dual jobholding](thesis.qmd), written at Sciences Po under the supervision of Pierre Cahuc. It documents how occupational states are built from the French Labour Force Survey, the robustness checks of the interrupted time series, the full coefficient tables of the individual-level models, the socio-professional profile of hybrid microentrepreneurs, the earnings distributions of dual jobholders, the derivations of both versions of the structural model, and the grids of calibrated parameters. Section letters follow those of the [full thesis (PDF)](Resources/sciences-po-thesis.pdf).

::: {.btn-row}
[← Back to the thesis overview](thesis.qmd){.btn-ghost} [Full thesis (PDF)](Resources/sciences-po-thesis.pdf){.btn-ghost}
:::

"""
(SITE / "thesis-appendix.qmd").write_text(header + md.strip() + "\n\n[← Back to the thesis overview](thesis.qmd)\n")
print("sections:", re.findall(r"^## ([A-H]\. .+?) \{", md, flags=re.M))
print("figures:", sorted(p.name for p in FIG_DIR.iterdir()))

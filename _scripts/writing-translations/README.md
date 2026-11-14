# Beyond economics: bilingual documents

The manifest is `assets/writing/documents.json`. Each original PDF remains unchanged; the second language uses an `-en` or `-fr` filename. `writing-language.js` embeds the same manifest so switching does not depend on a network fetch. Update both when adding a document.

## Translation sources and layout

- `latex/`: 14 complete, editable translated documents and their original illustrations. Compile with XeLaTeX in each document’s directory and copy the resulting PDF to `Resources/writing/`. Fonts and layout match the source LaTeX templates (Libertinus and Hiragino Mincho ProN). The French EU–Korea report and Quad series reuse the author’s original French text.
- `translations/*.json` and `*.blocks.json`: translations keyed to original PDF text blocks, for the three recent portraits, illustrated dossier and two presentations. Original photographs, figures, screenshots, quotations within reproduced images and bibliographic titles remain unchanged. The dossier retains its original bilingual abstract.
- `overlay_pdf.py SLUG en`: rebuild one of the three recent portraits with PyMuPDF and the Latin Modern fonts at the path specified in the script.
- `overlay_designed.py SLUG LANGUAGE`: rebuild the illustrated dossier or slides. Provide the full source fonts in `fonts/` (not committed): Lato, Poppins, League Spartan, Libre Baskerville, Roboto, Ubuntu, Calibri, Rockwell and Arial, with the font filenames found in the block manifests. Commercial fonts are supplied by the local Office installation; Google Fonts use their original families.
- After rebuilding the EU–Korea slides, run `translate_wordart.py` to translate the outlined vector headings. `wordart.json` preserves source shape geometry. Original raster text shadows are replaced by shadows of the translated text, while figures and pictograms remain intact.

Translations retain content, section order, illustrations, notes, references, page size, and document design. Text naturally reflows in the LaTeX templates: the French trade report has 5 pages (English 4), the French Quad series 12 (English 11), the English Meiji article 7 (French 8), and the English Bashō portrait 1 (French 2). All fixed-layout PDFs retain their source page counts. These are translations of historical articles, not factual revisions or updates.

## Site build and checks

Run `quarto render writing.qmd`. Output is `docs/`. The page-only English/Français choice updates every PDF link, the dossier cover and the inline portrait reader. It is stored under `writing.documentLanguage`; `?doclang=en` or `?doclang=fr` overrides the stored choice. Without JavaScript, English links and explicit French alternatives remain available.

Validated: all 40 document links, unchanged originals, PDF rendering, language switching and persistence, URL override, inline-reader refresh, JavaScript-disabled links, mobile layout and isolation from the homepage.

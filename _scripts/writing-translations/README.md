# Beyond economics: bilingual documents

The manifest is `assets/writing/documents.json`. Each translated PDF uses an `-en` or `-fr` filename. `writing-language.js` embeds the same manifest so switching does not depend on a network fetch. Update both when adding a document.

## Translation sources and layout

- `latex/`: 14 complete, editable translated documents and their original illustrations. Compile with XeLaTeX in each document’s directory and copy the resulting PDF to `Resources/writing/`. Fonts and layout match the source LaTeX templates (Libertinus and Hiragino Mincho ProN). The French EU–Korea report and Quad series reuse the author’s original French text.
- `translations/*.json` and `*.blocks.json`: translations keyed to original PDF text blocks, for the three recent portraits, illustrated dossier and two presentations. Original photographs, figures, screenshots, quotations within reproduced images and bibliographic titles remain unchanged. The dossier retains its original bilingual abstract.
- `overlay_pdf.py SLUG en`: rebuild one of the three recent portraits with PyMuPDF and the Latin Modern fonts at the path specified in the script.
- `overlay_designed.py SLUG LANGUAGE`: rebuild the illustrated dossier or slides. Provide the full source fonts in `fonts/` (not committed): Lato, Poppins, League Spartan, Libre Baskerville, Roboto, Ubuntu, Calibri, Rockwell and Arial, with the font filenames found in the block manifests. Commercial fonts are supplied by the local Office installation; Google Fonts use their original families.
- After rebuilding the EU–Korea slides, run `translate_wordart.py` to translate the outlined vector headings. `wordart.json` preserves source shape geometry. Original raster text shadows are replaced by shadows of the translated text, while figures and pictograms remain intact.
- `fix_english_lecture.py PDF FONTS_DIR`: corrects the established English titles in the original Descartes lecture PDF. The 1629 timeline entry now says Descartes began `The World`; the work was not published in 1629. The quote cites `Treatise on Light`, and the `Discourse on Method` and `Principles of Philosophy` use their standard English titles. The script requires full Calibri and Poppins fonts in `FONTS_DIR`.

Translations retain content, section order, illustrations, notes, references, page size, and document design. Text naturally reflows in the LaTeX templates: the French trade report has 5 pages (English 4), the French Quad series 12 (English 11), the English Meiji article 7 (French 8), and the English Bashō portrait 1 (French 2). All fixed-layout PDFs retain their source page counts. These are translations of historical articles, not factual revisions or updates.

## Site build and checks

Run `quarto render writing.qmd`. Output is `docs/`. The page-only English/Français choice updates the page title, document titles and summaries, PDF links, dossier cover and inline portrait reader. It is stored under `writing.documentLanguage`; `?doclang=en` or `?doclang=fr` overrides the stored choice. Without JavaScript, English text and links and explicit French PDF alternatives remain available.

Validated: all 40 document links, PDF rendering, language switching and persistence, URL override, inline-reader refresh, JavaScript-disabled links, mobile layout and isolation from the homepage. The corrected English lecture retains its 13-slide format.

/* Portrait reader on writing.qmd.
   Each tile links to its PDF, so the page still works without JavaScript.
   With JavaScript, a click shows the portrait's pages inline, drawn with PDF.js. */
(function () {
  const root = document.querySelector(".pr");
  if (!root) return;

  const PDFJS = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/";
  const strip = root.querySelector(".pr-strip");
  const tiles = Array.from(root.querySelectorAll(".pr-tile"));
  const pages = root.querySelector(".pr-pages");
  const $ = (sel) => root.querySelector(sel);
  const ZOOMS = [0.75, 1, 1.25, 1.5, 2, 2.5];

  let current = 0;
  let zoomIndex = 1; // 1 = fit to width
  let token = 0;
  let tasks = [];
  let shownSlug = null;
  let pdfjs = null;
  const docs = new Map();

  root.classList.add("is-ready");

  // --- PDF.js, loaded only when the reader comes near the screen ---------------
  function loadPdfjs() {
    if (!pdfjs) {
      pdfjs = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = PDFJS + "build/pdf.min.js";
        s.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + "build/pdf.worker.min.js";
          resolve(window.pdfjsLib);
        };
        s.onerror = reject;
        document.head.appendChild(s);
      });
    }
    return pdfjs;
  }

  function getDoc(lib, src) {
    if (!docs.has(src)) {
      // The character maps and standard fonts are needed for some of the embedded fonts
      const p = lib.getDocument({
        url: src,
        cMapUrl: PDFJS + "cmaps/",
        cMapPacked: true,
        standardFontDataUrl: PDFJS + "standard_fonts/",
      }).promise;
      p.catch(() => docs.delete(src));
      docs.set(src, p);
    }
    return docs.get(src);
  }

  // --- Header and tiles ---------------------------------------------------------
  function updateHeader() {
    const t = tiles[current].dataset;
    $(".pr-count").textContent = `${current + 1} / ${tiles.length}`;
    $(".pr-year").textContent = t.year;
    $(".pr-name").textContent = t.name;
    $(".pr-kanji").textContent = t.kanji || "";
    $(".pr-desc").textContent = t.desc;
    $(".pr-open").href = tiles[current].getAttribute("href");
    $(".pr-open").hreflang = document.documentElement.dataset.documentLanguage || "en";
    $("[data-act=prev]").disabled = current === 0;
    $("[data-act=next]").disabled = current === tiles.length - 1;
    tiles.forEach((tile, i) => {
      if (i === current) tile.setAttribute("aria-current", "true");
      else tile.removeAttribute("aria-current");
    });
  }

  function updateZoomLabel() {
    const z = ZOOMS[zoomIndex];
    $(".pr-zoom").textContent = z === 1 ? "Fit" : Math.round(z * 100) + "%";
    $("[data-act=zoom-out]").disabled = zoomIndex === 0;
    $("[data-act=zoom-in]").disabled = zoomIndex === ZOOMS.length - 1;
  }

  function centerTile(smooth) {
    const tile = tiles[current];
    const offset = tile.getBoundingClientRect().left - strip.getBoundingClientRect().left;
    strip.scrollBy({ left: offset - (strip.clientWidth - tile.offsetWidth) / 2, behavior: smooth ? "smooth" : "auto" });
  }

  function select(i, opts = {}) {
    if (i < 0 || i >= tiles.length) return;
    const changed = i !== current;
    current = i;
    updateHeader();
    centerTile(opts.smooth !== false);
    if (opts.hash !== false) history.replaceState(null, "", "#portrait-" + tiles[i].dataset.slug);
    if (changed || shownSlug === null) render(true);
  }

  // --- Drawing pages --------------------------------------------------------------
  function message(html) {
    pages.innerHTML = `<p class="pr-message">${html}</p>`;
  }

  async function render(reset) {
    const my = ++token;
    tasks.forEach((t) => t.cancel());
    tasks = [];
    const tile = tiles[current];
    const src = tile.getAttribute("href");

    if (reset) {
      pages.scrollTop = 0;
      pages.scrollLeft = 0;
      pages.innerHTML = '<div class="pr-sheet is-loading"></div>';
      shownSlug = null;
    }

    let doc;
    try {
      const lib = await loadPdfjs();
      doc = await getDoc(lib, src);
    } catch (e) {
      if (my === token) message(`The preview could not load here. <a href="${src}">Open the PDF</a> instead.`);
      return;
    }
    if (my !== token) return;

    const style = getComputedStyle(pages);
    const inner = pages.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const width = Math.round(Math.min(inner, 860) * ZOOMS[zoomIndex]);
    const ratio = Math.min(3, (window.devicePixelRatio || 1) * 1.25);

    let sheets = Array.from(pages.querySelectorAll(".pr-sheet"));
    if (shownSlug !== tile.dataset.slug || sheets.length !== doc.numPages) {
      pages.innerHTML = "";
      sheets = [];
      for (let n = 1; n <= doc.numPages; n++) {
        const sheet = document.createElement("div");
        sheet.className = "pr-sheet is-loading";
        sheet.setAttribute("aria-label", `Page ${n} of ${doc.numPages}`);
        pages.appendChild(sheet);
        sheets.push(sheet);
      }
      shownSlug = tile.dataset.slug;
    }
    // Resize at once, so zooming feels instant, then redraw sharply
    sheets.forEach((s) => (s.style.width = width + "px"));

    for (let n = 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      if (my !== token) return;
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({ scale: (width / base.width) * ratio });
      const canvas = document.createElement("canvas");
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const sheet = sheets[n - 1];
      sheet.style.aspectRatio = `${base.width} / ${base.height}`;
      const task = page.render({ canvasContext: canvas.getContext("2d"), viewport });
      tasks.push(task);
      try {
        await task.promise;
      } catch (e) {
        return; // cancelled by a newer render
      }
      if (my !== token) return;
      sheet.replaceChildren(canvas);
      sheet.classList.remove("is-loading");
    }

    // Fetch the next portrait in the background so it opens quickly
    const next = tiles[current + 1];
    if (next) loadPdfjs().then((lib) => getDoc(lib, next.getAttribute("href"))).catch(() => {});
  }

  // --- Events ------------------------------------------------------------------------
  tiles.forEach((tile, i) => {
    tile.addEventListener("click", (e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      e.preventDefault();
      select(i);
      const box = root.querySelector(".pr-viewer").getBoundingClientRect();
      if (box.top > window.innerHeight * 0.7) root.querySelector(".pr-viewer").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    tile.addEventListener("keydown", (e) => {
      const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!step || !tiles[i + step]) return;
      e.preventDefault();
      tiles[i + step].focus();
      select(i + step);
    });
  });

  root.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-act]");
    if (!btn) return;
    const act = btn.dataset.act;
    if (act === "prev") select(current - 1);
    else if (act === "next") select(current + 1);
    else if (act === "scroll-left") strip.scrollBy({ left: -strip.clientWidth * 0.8, behavior: "smooth" });
    else if (act === "scroll-right") strip.scrollBy({ left: strip.clientWidth * 0.8, behavior: "smooth" });
    else if (act.startsWith("zoom")) {
      if (act === "zoom-in") zoomIndex = Math.min(zoomIndex + 1, ZOOMS.length - 1);
      if (act === "zoom-out") zoomIndex = Math.max(zoomIndex - 1, 0);
      if (act === "zoom-fit") zoomIndex = 1;
      updateZoomLabel();
      render(false);
    }
  });

  document.addEventListener("writing:languagechange", () => {
    updateHeader();
    if (shownSlug !== null || tasks.length || pages.querySelector(".pr-sheet")) render(true);
  });

  // Strip arrows only show when there is more to scroll to
  function updateArrows() {
    $("[data-act=scroll-left]").hidden = strip.scrollLeft < 8;
    $("[data-act=scroll-right]").hidden = strip.scrollLeft + strip.clientWidth > strip.scrollWidth - 8;
  }
  strip.addEventListener("scroll", updateArrows, { passive: true });

  // Redraw when the reader's width changes
  let lastWidth = pages.clientWidth;
  let resizeTimer;
  new ResizeObserver(() => {
    updateArrows();
    if (Math.abs(pages.clientWidth - lastWidth) < 24 || shownSlug === null) return;
    lastWidth = pages.clientWidth;
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => render(false), 180);
  }).observe(root);

  // --- Start ---------------------------------------------------------------------------
  const fromHash = location.hash.startsWith("#portrait-")
    ? tiles.findIndex((t) => "#portrait-" + t.dataset.slug === location.hash)
    : -1;
  current = fromHash >= 0 ? fromHash : 0;
  updateHeader();
  updateZoomLabel();
  updateArrows();
  if (fromHash >= 0) {
    centerTile(false);
    root.scrollIntoView({ block: "start" });
    render(true);
  } else if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      if (entries.some((en) => en.isIntersecting)) {
        io.disconnect();
        render(true);
      }
    }, { rootMargin: "600px 0px" });
    io.observe(root);
  } else {
    render(true);
  }
})();

/* Document language is scoped to writing.qmd; site navigation remains unchanged. */
(() => {
  const select = document.getElementById('document-language-select');
  if (!select) return;
  document.getElementById("document-language").hidden = false;
  const documents = {
  "internationalisation-enseignement-superieur-japonais": {
    "fr": "Resources/writing/internationalisation-enseignement-superieur-japonais.pdf",
    "en": "Resources/writing/internationalisation-enseignement-superieur-japonais-en.pdf"
  },
  "eu-korea-fta-report": {
    "fr": "Resources/writing/eu-korea-fta-report-fr.pdf",
    "en": "Resources/writing/eu-korea-fta-report.pdf"
  },
  "quad-article-series": {
    "fr": "Resources/writing/quad-article-series-fr.pdf",
    "en": "Resources/writing/quad-article-series.pdf"
  },
  "goguryeo-1": {
    "fr": "Resources/writing/goguryeo-1.pdf",
    "en": "Resources/writing/goguryeo-1-en.pdf"
  },
  "goguryeo-2": {
    "fr": "Resources/writing/goguryeo-2.pdf",
    "en": "Resources/writing/goguryeo-2-en.pdf"
  },
  "goguryeo-3": {
    "fr": "Resources/writing/goguryeo-3.pdf",
    "en": "Resources/writing/goguryeo-3-en.pdf"
  },
  "olmeques": {
    "fr": "Resources/writing/olmeques.pdf",
    "en": "Resources/writing/olmeques-en.pdf"
  },
  "femme-japonaise-ere-meiji": {
    "fr": "Resources/writing/femme-japonaise-ere-meiji.pdf",
    "en": "Resources/writing/femme-japonaise-ere-meiji-en.pdf"
  },
  "sakamoto-ryoma": {
    "fr": "Resources/writing/sakamoto-ryoma.pdf",
    "en": "Resources/writing/sakamoto-ryoma-en.pdf"
  },
  "tokugawa-yoshimune": {
    "fr": "Resources/writing/tokugawa-yoshimune.pdf",
    "en": "Resources/writing/tokugawa-yoshimune-en.pdf"
  },
  "minamoto-no-yoritomo": {
    "fr": "Resources/writing/minamoto-no-yoritomo.pdf",
    "en": "Resources/writing/minamoto-no-yoritomo-en.pdf"
  },
  "prince-shotoku": {
    "fr": "Resources/writing/prince-shotoku.pdf",
    "en": "Resources/writing/prince-shotoku-en.pdf"
  },
  "gustave-boissonade": {
    "fr": "Resources/writing/gustave-boissonade.pdf",
    "en": "Resources/writing/gustave-boissonade-en.pdf"
  },
  "matsuo-basho": {
    "fr": "Resources/writing/matsuo-basho.pdf",
    "en": "Resources/writing/matsuo-basho-en.pdf"
  },
  "kusunoki-masashige": {
    "fr": "Resources/writing/kusunoki-masashige.pdf",
    "en": "Resources/writing/kusunoki-masashige-en.pdf"
  },
  "date-masamune": {
    "fr": "Resources/writing/date-masamune.pdf",
    "en": "Resources/writing/date-masamune-en.pdf"
  },
  "fukuzawa-yukichi": {
    "fr": "Resources/writing/fukuzawa-yukichi.pdf",
    "en": "Resources/writing/fukuzawa-yukichi-en.pdf"
  },
  "kishida-toshiko": {
    "fr": "Resources/writing/kishida-toshiko.pdf",
    "en": "Resources/writing/kishida-toshiko-en.pdf"
  },
  "eu-korea-fta-presentation": {
    "fr": "Resources/writing/eu-korea-fta-presentation-fr.pdf",
    "en": "Resources/writing/eu-korea-fta-presentation.pdf"
  },
  "descartes-epistemology-lecture": {
    "fr": "Resources/writing/descartes-epistemology-lecture-fr.pdf",
    "en": "Resources/writing/descartes-epistemology-lecture.pdf"
  }
};
  const key = 'writing.documentLanguage';
  const labels = { en: 'In English', fr: 'En français' };
  const valid = value => value === 'en' || value === 'fr';
  const links = Array.from(document.querySelectorAll('a[href]')).flatMap(link => {
    const href = link.getAttribute('href');
    const match = Object.entries(documents).find(([, versions]) => Object.values(versions).includes(href));
    return match ? [{ link, versions: match[1] }] : [];
  });
  function apply(language, save = false) {
    if (!valid(language)) return;
    select.value = language;
    document.documentElement.dataset.documentLanguage = language;
    links.forEach(({ link, versions }) => {
      link.setAttribute('href', versions[language]);
      link.setAttribute('hreflang', language);
      link.dataset.documentLanguage = language;
    });
    document.querySelectorAll('span[data-document-language]').forEach(label => {
      label.textContent = labels[language];
      label.lang = language;
    });
    const cover = document.querySelector('.featured-cover img');
    if (cover) cover.src = language === 'en' ? 'assets/writing/dossier-cover-en.jpg' : 'assets/writing/dossier-cover.jpg';
    document.dispatchEvent(new CustomEvent('writing:languagechange', { detail: { language } }));
    if (save) {
      try { localStorage.setItem(key, language); } catch (_) { /* Storage is optional. */ }
      const url = new URL(location.href);
      url.searchParams.set('doclang', language);
      history.replaceState(history.state, '', url);
      document.querySelector('.document-language-status').textContent = language === 'en'
        ? 'Documents and the portrait reader are now in English.'
        : 'Les documents et le lecteur de portraits sont maintenant en français.';
    }
  }
  let preferred;
  try { preferred = localStorage.getItem(key); } catch (_) { /* Use the page default. */ }
  const requested = new URL(location.href).searchParams.get('doclang');
  apply(valid(requested) ? requested : valid(preferred) ? preferred : 'en');
  select.addEventListener('change', () => apply(select.value, true));
})();

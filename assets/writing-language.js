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
  "goguryeo": {
    "fr": "Resources/writing/goguryeo.pdf",
    "en": "Resources/writing/goguryeo-en.pdf"
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
  // Keep the page copy with the document choice. English is the HTML fallback.
  const copy = new Map();
  function add(selector, french) {
    const element = document.querySelector(selector);
    if (element) copy.set(element, { en: element.innerHTML, fr: french });
  }
  add('#title-block-header h1.title', `Mes loisirs`);
  add('#title-block-header .subtitle', `L’économie n’est pas la seule chose qui compte dans la vie. Cette partie du site est consacrée aux textes que j’ai écrits sur d’autres sujets qui m’intéressent. Bonne lecture !`);
  add('#document-language label', `Langue des documents`);
  add('#document-language-help', `Choisissez la langue des PDF et du lecteur de portraits sur cette page.`);
  add('#toc-title', `Sur cette page`);
  [
    ['reports-and-analyses', 'Rapports et analyses'],
    ['history-articles', 'Articles d’histoire'],
    ['portraits-from-japanese-history', 'Portraits de l’histoire japonaise'],
    ['talks', 'Présentations']
  ].forEach(([id, title]) => {
    add(`#${id} > h2`, title);
    add(`#toc-${id}`, title);
  });
  add('.featured-body > p.eyebrow', `Dossier à la une`);
  add('.featured-body h3 a', `L’internationalisation de l’enseignement supérieur japonais : histoire, défis et perspectives`);
  add('.featured-body > p:not(.eyebrow):not(.featured-actions)', `Un dossier sur les relations que le système universitaire japonais entretient avec le reste du monde depuis 1868 : l’alternance entre ouverture et repli, les efforts pour réaffirmer la place du Japon sur le marché universitaire international et les tensions entre ambitions internationales et priorités nationales.`);
  add('.featured-actions a', `Lire le dossier (PDF) →`);
  const entries = [
    {
      label: 'Rapport',
      title: 'Rapport sur l’accord de libre-échange UE–Corée du Sud : discussion sur l’histoire et l’avenir de la politique commerciale européenne en Asie',
      meta: 'Version française publiée par Call On U, ESCP Europe',
      description: 'Partant des difficultés rencontrées par l’UE pour conclure de nouveaux accords commerciaux en Asie, ce rapport revient sur l’accord de libre-échange UE–Corée du Sud, son contenu et les controverses entourant sa mise en œuvre. Il montre comment l’insistance de l’UE sur les normes sociales et environnementales façonne sa politique commerciale dans la région.',
      action: 'Lire le rapport (PDF) →'
    },
    {
      label: 'Série de trois articles',
      title: 'Un OTAN asiatique est-il possible ? Le Dialogue quadrilatéral pour la sécurité et les enjeux de la coopération stratégique en Indopacifique',
      description: 'Une série de trois articles sur le Quad, qui réunit le Japon, l’Australie, l’Inde et les États-Unis. Elle examine si ce dialogue pourrait devenir une alliance de type OTAN dans l’Indopacifique et ce qui limite la coopération stratégique entre ses membres.',
      action: 'Lire la série (PDF) →'
    },
    {
      label: 'Article',
      title: 'Les origines de la Corée et le royaume de Goguryeo : entre récits nationalistes et réalités historiques',
      description: 'Un article sur les origines de la Corée et le royaume de Goguryeo, dont la Chine et la Corée revendiquent toutes deux l’héritage. Il confronte les récits nationalistes aux sources historiques sur la naissance du royaume, son essor et la période des Trois Royaumes.',
      action: 'Lire l’article (PDF) →'
    },
    {
      label: 'Historiographie',
      title: 'Les Olmèques, pionniers ou simples acteurs d’une première « régionalisation » en Amérique du Sud ?',
      meta: 'Brève historiographie du « problème olmèque »',
      description: 'Un panorama des études sur les Olmèques, du XVIIIe siècle au début des années 1980, et de leurs principaux courants : les Olmèques furent-ils les pionniers d’une première régionalisation ou simplement l’un de ses acteurs ? L’article s’ouvre sur l’idée de changement de paradigme de Thomas Kuhn pour expliquer l’évolution de ce débat au fil des découvertes archéologiques.',
      action: 'Lire l’article (PDF) →'
    },
    {
      label: 'Article',
      title: 'La femme japonaise dans le Japon de l’ère Meiji : des trajectoires féministes à l’épreuve du conservatisme',
      description: 'La transformation de l’ère Meiji est souvent décrite comme ayant laissé les femmes japonaises à l’écart. À partir de recherches historiques et sociologiques récentes, cet article montre au contraire comment des mouvements de femmes ont émergé et lutté pour leurs droits dans une société encore marquée par les valeurs patrilinéaires et confucéennes.',
      action: 'Lire l’article (PDF) →'
    },
    {
      label: 'Présentation',
      title: 'Accord de libre-échange UE–Corée : histoire et débats autour d’une étape majeure du commerce international',
      meta: 'Diapositives',
      description: 'Une présentation sur le même accord, avec les principaux chiffres des échanges entre l’UE et la Corée du Sud et les débats qu’il a suscités.',
      action: 'Voir les diapositives (PDF) →'
    },
    {
      label: 'Cours',
      title: 'Cours d’introduction à l’épistémologie : le cogito cartésien et la mathesis universalis',
      meta: 'Diapositives',
      description: 'Une introduction à la pensée de Descartes, de la révolution galiléo-cartésienne au cogito, au <em>Discours de la méthode</em> et aux <em>Méditations métaphysiques</em>.',
      action: 'Voir les diapositives (PDF) →'
    }
  ];
  const workEntries = document.querySelectorAll('.work-entry');
  entries.forEach((entry, index) => {
    const root = workEntries[index];
    if (!root) return;
    const title = root.querySelector('h3 a') || root.querySelector('h3');
    if (title) copy.set(title, { en: title.innerHTML, fr: entry.title });
    const label = root.querySelector('.eyebrow');
    if (label) copy.set(label, { en: label.innerHTML, fr: entry.label });
    const meta = root.querySelector('.meta span:first-child');
    if (meta && entry.meta) copy.set(meta, { en: meta.innerHTML, fr: entry.meta });
    const description = root.querySelector('section > p');
    if (description) copy.set(description, { en: description.innerHTML, fr: entry.description });
    const actions = root.querySelectorAll('section > p:nth-of-type(2) a');
    actions.forEach((action, n) => copy.set(action, {
      en: action.innerHTML,
      fr: entry.actions ? entry.actions[n] : entry.action
    }));
  });
  add('#portraits-from-japanese-history > p', `Ma série de courts portraits de personnages de l’histoire japonaise, écrite pour la lettre d’information d’ESCP Japon (l’association des anciens élèves de l’ESCP consacrée à la culture japonaise, dont je suis membre du conseil d’administration), se poursuit. Chaque portrait est disponible en français et en anglais.`);
  const portraitDescriptions = {
    'sakamoto-ryoma': 'Un héros du récit national japonais, et les débats entre historiens sur son rôle réel.',
    'tokugawa-yoshimune': 'Le huitième shogun Tokugawa, qui hérita d’un régime endetté en 1716 et réforma son administration et ses finances.',
    'minamoto-no-yoritomo': 'Le fondateur du shogunat de Kamakura, premier shogunat de l’histoire japonaise.',
    'prince-shotoku': 'Le prince du VIIe siècle auquel sont attribués le système des douze rangs à la cour et le renouvellement des relations avec la Chine.',
    'gustave-boissonade': 'Le juriste français appelé au Japon en 1873, à l’origine de la modernisation du droit japonais.',
    'matsuo-basho': 'Le maître du haïku de l’époque d’Edo, de ses voyages à son poème le plus célèbre.',
    'kusunoki-masashige': 'Le guerrier du XIVe siècle dont le sacrifice au service de l’empereur fit une figure héroïque.',
    'date-masamune': 'Le « dragon borgne » qui conquit le nord du Japon, se rallia à Hideyoshi et marqua durablement la région du Tōhoku.',
    'fukuzawa-yukichi': 'Un penseur à l’image de l’ère Meiji, qui étudia les savoirs occidentaux et fonda l’ancêtre de l’université Keiō.',
    'kishida-toshiko': 'L’une des premières figures du mouvement féministe japonais, de sa fonction de préceptrice de l’impératrice à son rôle d’oratrice publique.'
  };
  document.querySelectorAll('.pr-tile').forEach(tile => {
    tile.dataset.descFr = portraitDescriptions[tile.dataset.slug];
  });
  [
    ['.pr-tools', 'Commandes du lecteur'],
    ['.pr-pages', 'Pages du portrait sélectionné'],
    ['.pr-arrow-left', 'Afficher les portraits plus récents'],
    ['.pr-arrow-right', 'Afficher les portraits plus anciens'],
    ['[data-act=prev]', 'Portrait précédent'],
    ['[data-act=next]', 'Portrait suivant'],
    ['[data-act=zoom-out]', 'Dézoomer'],
    ['[data-act=zoom-in]', 'Zoomer'],
    ['[data-act=zoom-fit]', 'Ajuster la page à la largeur']
  ].forEach(([selector, french]) => {
    const element = document.querySelector(selector);
    if (element) element.dataset.ariaFr = french;
  });
  const ariaEnglish = new Map(Array.from(document.querySelectorAll('[data-aria-fr]'), node => [node, node.getAttribute('aria-label')]));
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
    copy.forEach((versions, element) => {
      element.innerHTML = versions[language];
      element.lang = language;
    });
    document.querySelectorAll('[data-aria-fr]').forEach(element => {
      element.setAttribute('aria-label', language === 'fr' ? element.dataset.ariaFr : ariaEnglish.get(element));
    });
    document.documentElement.lang = language;
    document.title = (language === 'fr' ? 'Mes loisirs' : 'My Hobbies') + ' – Romain Fernex';
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

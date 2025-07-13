
const currentLang = getCurrentLanguage();

const translations = {
  ro: {
    // Settings & UI
    main_title: "Hoarda de Aur",
    page_title: "Hoarda de Aur",
    toc: "Cuprins",
    settings: "Setări",
    map: "Hartă",
    menu: "Meniu",
    up: "Sus",
    back: "Înapoi",
    close: "Închide",
    high_contrast: 'Contrast ridicat',
    dark_mode: 'Mod întunecat',
    debug_panel: 'Arată panou debug',
    particles: 'Arată particule',
    video: 'Video',
    video_play: 'Rulează în fundal',
    video_pause: 'Oprește',
    video_pip: 'Picture in Picture',
    dyslexia: 'Mod Dislexie',
    sidebar_open: 'Meniu deschis',
    font_style: 'Stil font',
    font_standard: 'Standard',
    font_dyslexia: 'Dislexie',
    font_readable: 'Lizibil',
    language: 'Limba',

    // Buttons & Controls
    video_show: 'Arată Video',
    video_hide: 'Ascunde Video',

    // Section Titles & Infos
    home: "Acasă",
    prolog: "Prolog",
    prolog_info: "18 August 1206, Mongolia",
    kulikovo_title: "Punct de cotitură: Bătălia de la Kulikovo",
    kulikovo_info: "8 Septembrie 1380, Râul Don, Rusia",
    kalka_title: "Bătălia de pe râul Kalka",
    kalka_info: "1 Ianuarie 1381, Râul Kalka, Ucraina",
    tokhtamysh_title: "Tokhtamysh: restaurarea puterii",
    tokhtamysh_info: "2 Ianuarie 1381, Rusia",
    moscova_title: "Asediul Moscovei",
    moscova_info: "23 August 1382, Rusia",
    razboi_title: "Războiul Tokhtamysh–Timur",
    razboi_info: "1 Ianuarie 1386, Munții Caucaz",
    kondurcha_title: "Bătălia de pe râul Kondurcha",
    kondurcha_info: "18 Iunie 1391, Bulgaria",
    terek_title: "Bătălia de pe râul Terek",
    terek_info: "15 Aprilie 1395",
    vorskla_title: "Bătălia de pe râul Vorskla",
    vorskla_info: "12 August 1399",
    declin_title: "Declinul Hoardei De Aur",
    declin_info: "1 Ianuarie 1406",
    dezintegrare_title: "Dezintegrare",
    dezintegrare_info: "1 Ianuarie 1419",
    lipnic_title: "Bătălia de la Lipnic",
    lipnic_info: "20 August 1470",
    sfarsit_title: "Sfârșitul asupririi mongole",
    sfarsit_info: "8 August 1480, Râul Ugra",
    ultimul_title: "Ultimul Khan",
    ultimul_info: "1 Ianuarie 1502, Kaunas",
    recomandari_title: "Recomandări",
    toc_quiz: "Chestionar",
    quiz_title: "Chestionar",
    galerie_title: "Galerie",
    bibliografie_title: "Bibliografie",
    note_title: "Note",
    // Main title
    main_title: "HOARDA DE AUR",
    period: "1380 – 1502",
    declin_big: "– DECLINUL –",

    // Gallery captions and alt texts (ensure all are present)
    galerie_hoarda_caption: "Hoarda de Aur",
    galerie_hoarda_alt: "Imagine Hoarda de Aur",
    galerie_prolog_caption: "Prolog",
    galerie_prolog_alt: "Imagine Prolog",
    galerie_kulikovo_caption: "Bătălia de la Kulikovo",
    galerie_kulikovo_alt: "Bătălia de la Kulikovo",
    galerie_kalka_caption: "Bătălia de pe râul Kalka",
    galerie_kalka_alt: "Bătălia de pe râul Kalka",
    galerie_tokhtamysh_caption: "Tokhtamysh",
    galerie_tokhtamysh_alt: "Imagine Tokhtamysh",
    galerie_moscova_caption: "Asediul Moscovei",
    galerie_moscova_alt: "Imagine Asediul Moscovei",
    galerie_razboi_caption: "Războiul Tokhtamysh–Timur",
    galerie_razboi_alt: "Imagine Războiul Tokhtamysh–Timur",
    galerie_kondurcha_caption: "Bătălia de pe râul Kondurcha",
    galerie_kondurcha_alt: "Imagine Bătălia de pe râul Kondurcha",
    galerie_terek_caption: "Bătălia de pe râul Terek",
    galerie_terek_alt: "Imagine Bătălia de pe râul Terek",
    galerie_vorskla_caption: "Bătălia de pe râul Vorskla",
    galerie_vorskla_alt: "Imagine Bătălia de pe râul Vorskla",
    galerie_declin_caption: "Declinul Hoardei De Aur",
    galerie_declin_alt: "Imagine Declinul Hoardei De Aur",
    galerie_dezintegrare_caption: "Dezintegrare",
    galerie_dezintegrare_alt: "Imagine Dezintegrare",
    galerie_lipnic_caption: "Bătălia de la Lipnic",
    galerie_lipnic_alt: "Imagine Bătălia de la Lipnic",
    galerie_sfarsit_caption: "Sfârșitul asupririi mongole",
    galerie_sfarsit_alt: "Imagine Sfârșitul asupririi mongole",
    galerie_ultimul_caption: "Ultimul Khan",
    galerie_ultimul_alt: "Imagine Ultimul Khan",
    galerie_bibliografie_caption: "Bibliografie",
    galerie_bibliografie_alt: "Imagine Bibliografie",

    // TOC entries
    toc_acasa: "Acasă",
    toc_prolog: "1206 – Prolog",
    toc_kulikovo: "1380 – Kulikovo",
    toc_kalka: "1381 – Kalka",
    toc_tokhtamysh: "1381 – Tokhtamysh",
    toc_moscova: "1382 – Moscova",
    toc_razboi: "1386 – Caucaz",
    toc_kondurcha: "1391 – Kondurcha",
    toc_terek: "1395 – Terek",
    toc_vorskla: "1399 – Vorskla",
    toc_declin: "1406 – Declinul",
    toc_dezintegrare: "1419 – Dezintegrare",
    toc_lipnic: "1470 – Lipnic",
    toc_sfarsit: "1480 – Sfârșitul",
    toc_ultimul: "1502 – Ultimul Khan",
    toc_recomandari: "Recomandări",
    toc_galerie: "Galerie",
    toc_bibliografie: "Bibliografie",
    toc_note: "Note",

    // Map entries
    map_acasa: "Acasă",
    map_prolog: "Prolog",
    map_kulikovo: "Bătălia de la Kulikovo",
    map_kalka: "Bătălia de pe râul Kalka",
    map_tokhtamysh: "Tokhtamysh",
    map_moscova: "Asediul Moscovei",
    map_razboi: "Războiul Tokhtamysh–Timur",
    map_kondurcha: "Bătălia de pe râul Kondurcha",
    map_terek: "Bătălia de pe râul Terek",
    map_vorskla: "Bătălia de pe râul Vorskla",
    map_declin: "Declinul Hoardei De Aur",
    map_dezintegrare: "Dezintegrare",
    map_lipnic: "Bătălia de la Lipnic",
    map_sfarsit: "Sfârșitul asupririi mongole",
    map_ultimul: "Ultimul Khan",

    // FAB aria-labels
    fab_main_aria: "Acțiuni rapide",
    fab_top_aria: "Sus",
    fab_last_aria: "Înapoi",
    fab_settings_aria: "Setări",
    fab_menu_aria: "Meniu",

    quiz_start: "Începe Quiz-ul",
quiz_questions: "întrebări",
quiz_start_btn: "Start Quiz",
quiz_next: "Următoarea",
quiz_finish: "Finalizare",
quiz_check: "Verifică răspunsul",
quiz_result: "Rezultat",
quiz_score: "corecte",
quiz_try_again: "Reîncepe",
quiz_try_text: "Vrei să încerci din nou?",
quiz_retry: "Reîncepe",
quiz_correct: "Corect!",
quiz_wrong: "Greșit!",
quiz_answered: "răspunsuri",
quiz_correct_cnt: "corecte",
quiz_drag: "Trage în ordine corectă.",
quiz_select: "Alege...",
quiz_true: "Adevărat",
quiz_false: "Fals",
quiz_order: "Ordine corectă:",
quiz_right: "Corect:",
quiz_input: "Răspuns...",
quiz_answer_check:"Verifică răspunsul",
  },

  en: {
    page_title: "The Golden Horde",
    main_title: "The Golden Horde",
    // Settings & UI
    toc: "Contents",
    settings: "Settings",
    map: "Map",
    menu: "Menu",
    up: "Up",
    back: "Back",
    close: "Close",
    high_contrast: 'High contrast',
    dark_mode: 'Dark mode',
    debug_panel: 'Show debug panel',
    particles: 'Show particles',
    video: 'Video',
    video_play: 'Play in background',
    video_pause: 'Pause',
    video_pip: 'Picture in Picture',
    dyslexia: 'Dyslexia mode',
    sidebar_open: 'Menu open',
    font_style: 'Font style',
    font_standard: 'Standard',
    font_dyslexia: 'Dyslexia',
    font_readable: 'Readable',
    language: 'Language',

    // Buttons & Controls
    video_show: 'Show Video',
    video_hide: 'Hide Video',

    // Section Titles & Infos
    home: "Home",
    prolog: "Prologue",
    prolog_info: "August 18, 1206, Mongolia",
    kulikovo_title: "Turning Point: Battle of Kulikovo",
    kulikovo_info: "September 8, 1380, Don River, Russia",
    kalka_title: "Battle of the Kalka River",
    kalka_info: "January 1, 1381, Kalka River, Ukraine",
    tokhtamysh_title: "Tokhtamysh: Restoration of Power",
    tokhtamysh_info: "January 2, 1381, Russia",
    moscova_title: "Siege of Moscow",
    moscova_info: "August 23, 1382, Russia",
    razboi_title: "Tokhtamysh–Timur War",
    razboi_info: "January 1, 1386, Caucasus Mountains",
    kondurcha_title: "Battle of the Kondurcha River",
    kondurcha_info: "June 18, 1391, Bulgaria",
    terek_title: "Battle of the Terek River",
    terek_info: "April 15, 1395",
    vorskla_title: "Battle of the Vorskla River",
    vorskla_info: "August 12, 1399",
    declin_title: "Decline of the Golden Horde",
    declin_info: "January 1, 1406",
    dezintegrare_title: "Disintegration",
    dezintegrare_info: "January 1, 1419",
    lipnic_title: "Battle of Lipnic",
    lipnic_info: "August 20, 1470",
    sfarsit_title: "End of Mongol Rule",
    sfarsit_info: "August 8, 1480, Ugra River",
    ultimul_title: "The Last Khan",
    ultimul_info: "January 1, 1502, Kaunas",
    recomandari_title: "Recommendations",
    galerie_title: "Gallery",
    bibliografie_title: "Bibliography",
    note_title: "Notes",
    // Main title
    main_title: "THE GOLDEN HORDE",
    period: "1380 – 1502",
    declin_big: "– DECLINE –",

    // Gallery captions and alt texts
    galerie_hoarda_caption: "The Golden Horde",
    galerie_hoarda_alt: "Image of the Golden Horde",
    galerie_prolog_caption: "Prologue",
    galerie_prolog_alt: "Prologue image",
    galerie_kulikovo_caption: "Battle of Kulikovo",
    galerie_kulikovo_alt: "Battle of Kulikovo image",
    galerie_kalka_caption: "Battle of the Kalka River",
    galerie_kalka_alt: "Battle of the Kalka River image",
    galerie_tokhtamysh_caption: "Tokhtamysh",
    galerie_tokhtamysh_alt: "Image of Tokhtamysh",
    galerie_moscova_caption: "Siege of Moscow",
    galerie_moscova_alt: "Image of the Siege of Moscow",
    galerie_razboi_caption: "Tokhtamysh–Timur War",
    galerie_razboi_alt: "Image of Tokhtamysh–Timur War",
    galerie_kondurcha_caption: "Battle of the Kondurcha River",
    galerie_kondurcha_alt: "Battle of the Kondurcha River image",
    galerie_terek_caption: "Battle of the Terek River",
    galerie_terek_alt: "Battle of the Terek River image",
    galerie_vorskla_caption: "Battle of the Vorskla River",
    galerie_vorskla_alt: "Battle of the Vorskla River image",
    galerie_declin_caption: "Decline of the Golden Horde",
    galerie_declin_alt: "Image of the Decline of the Golden Horde",
    galerie_dezintegrare_caption: "Disintegration",
    galerie_dezintegrare_alt: "Image of Disintegration",
    galerie_lipnic_caption: "Battle of Lipnic",
    galerie_lipnic_alt: "Image of the Battle of Lipnic",
    galerie_sfarsit_caption: "End of Mongol Rule",
    galerie_sfarsit_alt: "Image of the End of Mongol Rule",
    galerie_ultimul_caption: "The Last Khan",
    galerie_ultimul_alt: "Image of the Last Khan",
    galerie_bibliografie_caption: "Bibliography",
    galerie_bibliografie_alt: "Image of Bibliography",

    // TOC entries
    toc_acasa: "Home",
    toc_prolog: "1206 – Prologue",
    toc_kulikovo: "1380 – Kulikovo",
    toc_kalka: "1381 – Kalka",
    toc_tokhtamysh: "1381 – Tokhtamysh",
    toc_moscova: "1382 – Moscow",
    toc_razboi: "1386 – Caucasus",
    toc_kondurcha: "1391 – Kondurcha",
    toc_terek: "1395 – Terek",
    toc_vorskla: "1399 – Vorskla",
    toc_declin: "1406 – Decline",
    toc_dezintegrare: "1419 – Disintegration",
    toc_lipnic: "1470 – Lipnic",
    toc_sfarsit: "1480 – End",
    toc_ultimul: "1502 – Last Khan",
    toc_recomandari: "Recommendations",
    toc_galerie: "Gallery",
    toc_bibliografie: "Bibliography",
    toc_note: "Notes",
    toc_quiz: "Quiz",
    quiz_title: "Quiz",


    // Map entries
    map_acasa: "Home",
    map_prolog: "Prologue",
    map_kulikovo: "Battle of Kulikovo",
    map_kalka: "Battle of the Kalka River",
    map_tokhtamysh: "Tokhtamysh",
    map_moscova: "Siege of Moscow",
    map_razboi: "Tokhtamysh–Timur War",
    map_kondurcha: "Battle of the Kondurcha River",
    map_terek: "Battle of the Terek River",
    map_vorskla: "Battle of the Vorskla River",
    map_declin: "Decline of the Golden Horde",
    map_dezintegrare: "Disintegration",
    map_lipnic: "Battle of Lipnic",
    map_sfarsit: "End of Mongol Rule",
    map_ultimul: "Last Khan",

    // FAB aria-labels
    fab_main_aria: "Quick Actions",
    fab_top_aria: "Top",
    fab_last_aria: "Back",
    fab_settings_aria: "Settings",
    fab_menu_aria: "Menu",
quiz_start: "Start Quiz",
quiz_questions: "questions",
quiz_start_btn: "Start Quiz",
quiz_next: "Next",
quiz_finish: "Finish",
quiz_check: "Check Answer",
quiz_result: "Result",
quiz_score: "correct",
quiz_try_again: "Retry",
quiz_try_text: "Want to try again?",
quiz_retry: "Retry",
quiz_correct: "Correct!",
quiz_wrong: "Wrong!",
quiz_answered: "answered",
quiz_correct_cnt: "correct",
quiz_drag: "Drag to reorder.",
quiz_select: "Select...",
quiz_true: "True",
quiz_false: "False",
quiz_order: "Correct order:",
quiz_right: "Correct:",
quiz_input: "Answer...",
quiz_answer_check:"Check Answer",

  },

  de: {
    page_title: "Die Goldene Horde",
    main_title: "Die Goldene Horde",
    toc: "Inhalt",
    settings: "Einstellungen",
    map: "Karte",
    menu: "Menü",
    up: "Nach oben",
    back: "Zurück",
    close: "Schließen",
    high_contrast: 'Hoher Kontrast',
    dark_mode: 'Dunkelmodus',
    debug_panel: 'Debug-Anzeige anzeigen',
    particles: 'Partikel anzeigen',
    video: 'Video',
    video_play: 'Im Hintergrund abspielen',
    video_pause: 'Pause',
    video_pip: 'Bild-in-Bild',
    dyslexia: 'Dyslexie-Modus',
    sidebar_open: 'Menü geöffnet',
    font_style: 'Schriftstil',
    font_standard: 'Standard',
    font_dyslexia: 'Dyslexie',
    font_readable: 'Lesbar',
    language: 'Sprache',

    // Buttons & Controls
    video_show: 'Video anzeigen',
    video_hide: 'Video ausblenden',

    // Section Titles & Infos
    home: "Startseite",
    prolog: "Prolog",
    prolog_info: "18. August 1206, Mongolei",
    kulikovo_title: "Wendepunkt: Schlacht bei Kulikowo",
    kulikovo_info: "8. September 1380, Don, Russland",
    kalka_title: "Schlacht am Kalka-Fluss",
    kalka_info: "1. Januar 1381, Kalka, Ukraine",
    tokhtamysh_title: "Tokhtamysh: Wiederherstellung der Macht",
    tokhtamysh_info: "2. Januar 1381, Russland",
    moscova_title: "Belagerung von Moskau",
    moscova_info: "23. August 1382, Russland",
    razboi_title: "Tokhtamysh-Timur-Krieg",
    razboi_info: "1. Januar 1386, Kaukasus",
    kondurcha_title: "Schlacht am Kondurcha-Fluss",
    kondurcha_info: "18. Juni 1391, Bulgarien",
    terek_title: "Schlacht am Terek-Fluss",
    terek_info: "15. April 1395",
    vorskla_title: "Schlacht am Worskla-Fluss",
    vorskla_info: "12. August 1399",
    declin_title: "Niedergang der Goldenen Horde",
    declin_info: "1. Januar 1406",
    dezintegrare_title: "Zerfall",
    dezintegrare_info: "1. Januar 1419",
    lipnic_title: "Schlacht bei Lipnic",
    lipnic_info: "20. August 1470",
    sfarsit_title: "Ende der mongolischen Herrschaft",
    sfarsit_info: "8. August 1480, Ugra",
    ultimul_title: "Der letzte Khan",
    ultimul_info: "1. Januar 1502, Kaunas",
    recomandari_title: "Empfehlungen",
    galerie_title: "Galerie",
    bibliografie_title: "Bibliographie",
    note_title: "Anmerkungen",
    // Main title
    main_title: "DIE GOLDENE HORDE",
    period: "1380 – 1502",
    declin_big: "– NIEDERGANG –",

    // Gallery captions and alt texts
    galerie_hoarda_caption: "Die Goldene Horde",
    galerie_hoarda_alt: "Bild der Goldenen Horde",
    galerie_prolog_caption: "Prolog",
    galerie_prolog_alt: "Prolog Bild",
    galerie_kulikovo_caption: "Schlacht bei Kulikowo",
    galerie_kulikovo_alt: "Bild der Schlacht bei Kulikowo",
    galerie_kalka_caption: "Schlacht am Kalka-Fluss",
    galerie_kalka_alt: "Bild der Schlacht am Kalka-Fluss",
    galerie_tokhtamysh_caption: "Tokhtamysh",
    galerie_tokhtamysh_alt: "Bild von Tokhtamysh",
    galerie_moscova_caption: "Belagerung von Moskau",
    galerie_moscova_alt: "Bild der Belagerung von Moskau",
    galerie_razboi_caption: "Tokhtamysh-Timur-Krieg",
    galerie_razboi_alt: "Bild des Tokhtamysh-Timur-Krieges",
    galerie_kondurcha_caption: "Schlacht am Kondurcha-Fluss",
    galerie_kondurcha_alt: "Bild der Schlacht am Kondurcha-Fluss",
    galerie_terek_caption: "Schlacht am Terek-Fluss",
    galerie_terek_alt: "Bild der Schlacht am Terek-Fluss",
    galerie_vorskla_caption: "Schlacht am Worskla-Fluss",
    galerie_vorskla_alt: "Bild der Schlacht am Worskla-Fluss",
    galerie_declin_caption: "Niedergang der Goldenen Horde",
    galerie_declin_alt: "Bild des Niedergangs der Goldenen Horde",
    galerie_dezintegrare_caption: "Zerfall",
    galerie_dezintegrare_alt: "Bild des Zerfalls",
    galerie_lipnic_caption: "Schlacht bei Lipnic",
    galerie_lipnic_alt: "Bild der Schlacht bei Lipnic",
    galerie_sfarsit_caption: "Ende der mongolischen Herrschaft",
    galerie_sfarsit_alt: "Bild des Endes der mongolischen Herrschaft",
    galerie_ultimul_caption: "Der letzte Khan",
    galerie_ultimul_alt: "Bild des letzten Khans",
    galerie_bibliografie_caption: "Bibliographie",
    galerie_bibliografie_alt: "Bild der Bibliographie",

    // TOC entries
    toc_acasa: "Startseite",
    toc_prolog: "1206 – Prolog",
    toc_kulikovo: "1380 – Kulikowo",
    toc_kalka: "1381 – Kalka",
    toc_tokhtamysh: "1381 – Tokhtamysh",
    toc_moscova: "1382 – Moskau",
    toc_razboi: "1386 – Kaukasus",
    toc_kondurcha: "1391 – Kondurcha",
    toc_terek: "1395 – Terek",
    toc_vorskla: "1399 – Worskla",
    toc_declin: "1406 – Niedergang",
    toc_dezintegrare: "1419 – Zerfall",
    toc_lipnic: "1470 – Lipnic",
    toc_sfarsit: "1480 – Ende",
    toc_ultimul: "1502 – Letzter Khan",
    toc_recomandari: "Empfehlungen",
    toc_galerie: "Galerie",
    toc_bibliografie: "Bibliographie",
    toc_note: "Anmerkungen",
    toc_quiz: "Quiz",
    quiz_title: "Quiz",


    // Map entries
    map_acasa: "Startseite",
    map_prolog: "Prolog",
    map_kulikovo: "Schlacht bei Kulikowo",
    map_kalka: "Schlacht am Kalka-Fluss",
    map_tokhtamysh: "Tokhtamysh",
    map_moscova: "Belagerung von Moskau",
    map_razboi: "Tokhtamysh-Timur-Krieg",
    map_kondurcha: "Schlacht am Kondurcha-Fluss",
    map_terek: "Schlacht am Terek-Fluss",
    map_vorskla: "Schlacht am Worskla-Fluss",
    map_declin: "Niedergang der Goldenen Horde",
    map_dezintegrare: "Zerfall",
    map_lipnic: "Schlacht bei Lipnic",
    map_sfarsit: "Ende der mongolischen Herrschaft",
    map_ultimul: "Letzter Khan",

    // FAB aria-labels
    fab_main_aria: "Schnellaktionen",
    fab_top_aria: "Oben",
    fab_last_aria: "Zurück",
    fab_settings_aria: "Einstellungen",
    fab_menu_aria: "Menü",
quiz_start: "Quiz starten",
quiz_questions: "Fragen",
quiz_start_btn: "Quiz starten",
quiz_next: "Weiter",
quiz_finish: "Fertigstellen",
quiz_check: "Antwort prüfen",
quiz_result: "Ergebnis",
quiz_score: "richtig",
quiz_try_again: "Nochmal",
quiz_try_text: "Möchten Sie es noch einmal versuchen?",
quiz_retry: "Nochmal",
quiz_correct: "Richtig!",
quiz_wrong: "Falsch!",
quiz_answered: "Antworten",
quiz_correct_cnt: "korrekt",
quiz_drag: "Ziehen Sie die Einträge in die richtige Reihenfolge.",
quiz_select: "Wähle...",
quiz_true: "Wahr",
quiz_false: "Falsch",
quiz_order: "Richtige Reihenfolge:",
quiz_right: "Richtig:",
quiz_input: "Antwort...",
quiz_answer_check:"Antwort prüfen",

  }
};

// 1. Update all static UI texts and ARIA labels
function updateStaticUiTexts() {
  const currentLang = getCurrentLanguage();

  // All labels with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang] && translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });

  // FABs and floating action buttons: aria-labels and titles
  const fabMain = document.getElementById('fabMain');
  if (fabMain && translations[currentLang].fab_main_aria) {
    fabMain.setAttribute('aria-label', translations[currentLang].fab_main_aria);
    fabMain.title = translations[currentLang].fab_main_aria;
  }
  const fabTop = document.getElementById('fabTop');
  if (fabTop && translations[currentLang].fab_top_aria) {
    fabTop.setAttribute('aria-label', translations[currentLang].fab_top_aria);
    fabTop.title = translations[currentLang].fab_top_aria;
  }
  const fabLast = document.getElementById('fabLast');
  if (fabLast && translations[currentLang].fab_last_aria) {
    fabLast.setAttribute('aria-label', translations[currentLang].fab_last_aria);
    fabLast.title = translations[currentLang].fab_last_aria;
  }
  const fabSettings = document.getElementById('fabSettings');
  if (fabSettings && translations[currentLang].fab_settings_aria) {
    fabSettings.setAttribute('aria-label', translations[currentLang].fab_settings_aria);
    fabSettings.title = translations[currentLang].fab_settings_aria;
  }
  const fabMeniu = document.getElementById('fabMeniu');
  if (fabMeniu && translations[currentLang].fab_menu_aria) {
    fabMeniu.setAttribute('aria-label', translations[currentLang].fab_menu_aria);
    fabMeniu.title = translations[currentLang].fab_menu_aria;
  }

  // Set page <title>
  document.title = translations[currentLang]?.page_title || "Hoarda de Aur";
}

// 2. Set language and translate page
function setLanguage(lang) {
  localStorage.setItem('uiLang', lang);

  // All static labels
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Dropdowns/selects (Video behaviour)
  const videoSelect = document.getElementById('videoPlaybackSelect');
  if (videoSelect) {
    const opts = videoSelect.options;
    if (opts.length >= 3) {
      opts[0].text = translations[lang].video_play;
      opts[1].text = translations[lang].video_pause;
      opts[2].text = translations[lang].video_pip;
    }
  }
  // Font style select
  const fontSelect = document.getElementById('fontStyleSelect');
  if (fontSelect) {
    const opts = fontSelect.options;
    if (opts.length >= 3) {
      opts[0].text = translations[lang].font_standard;
      opts[1].text = translations[lang].font_dyslexia;
      opts[2].text = translations[lang].font_readable;
    }
  }
  if (window.updateMapPopups) window.updateMapPopups();
  if (window.initTextSections) window.initTextSections();
  updateStaticUiTexts();

  // --- QUIZ: Live re-render on language switch ---
  if (window._quizApi) {
    // If quiz started, rerender the current screen (question/results)
    if (window._quizApi.quizState && window._quizApi.quizState.started) {
      window._quizApi.renderQuiz();
    } else {
      // If quiz not started, rerender the start screen
      window._quizApi.renderStart && window._quizApi.renderStart();
    }
  }
}

// 3. On page load and on dropdown change
document.addEventListener('DOMContentLoaded', function() {
  const savedLang = localStorage.getItem('uiLang') || 'ro';
  const langDropdown = document.getElementById('lang-dropdown');
  if (langDropdown) {
    langDropdown.value = savedLang;
    langDropdown.addEventListener('change', function() {
      setLanguage(this.value);
    });
  }
  setLanguage(savedLang);
});

// 4. Utility: get current language (safe fallback)
function getCurrentLanguage() {
  return localStorage.getItem('uiLang') || 'ro';
}

// --- Expose globally! ---
window.translations = translations;
window.setLanguage = setLanguage;
window.getCurrentLanguage = getCurrentLanguage;

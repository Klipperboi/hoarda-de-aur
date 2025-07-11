// -------- GLOBAL VARS --------
const SECTION_HIGHLIGHT_CLASS = "current-section-title";
let lastSavedSectionId = null;
let currentSectionId = null;
let observerPaused = false;
let videoId = null;
let mapUpdateTimeout = null;
let mobileMapInstance = null; // To track the Leaflet map object


const mapFlyZoom = 6;
const mapFlyAnim = { animate: true, duration: 1.15, easeLinearity: 0.27 };
let map = null;
let mapMarkers = {};
let particlesVisible = true;

const TEXT_SECTIONS = [
  "acasa", "prolog", "kulikovo", "kalka", "tokhtamysh", "moscova", "razboi",
  "kondurcha", "terek", "vorskla", "declin", "dezintegrare", "lipnic", "sfarsit", "ultimul",
  "recomandari", "bibliografie", "note"
];

// MAP LOCATIONS
const locations = {
  prolog:       { coords: [46, 105]},
  kulikovo:     { coords: [54, 39]},
  kalka:        { coords: [48, 37]},
  tokhtamysh:   { coords: [46, 48]},
  moscova:      { coords: [55, 37]},
  razboi:       { coords: [43, 45]},
  kondurcha:    { coords: [54.5, 52.0]},
  terek:        { coords: [43.5402, 45.1698]},
  vorskla:      { coords: [50, 35]},
  declin:       { coords: [60, 105]},
  dezintegrare: { coords: [46, 48]},
  lipnic:       { coords: [53, 17]},
  sfarsit:      { coords: [54.6778, 36.2865]},
  ultimul:      { coords: [54.8985, 23.9036]},
  principal:    { coords: [48,      42]},
  note:         { coords: [44, 41]},
  recomandari:  { coords: [44, 41]},
  galerie:      { coords: [44, 41]},
  bibliografie: { coords: [44,      41]},
};

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'auto'; // or 'manual' if you want to handle everything yourself
}

function updateActiveLink(activeId) {
  document.querySelectorAll(".dropdown-content a[data-loc]").forEach(link => {
    if (link.dataset.loc === activeId) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });
  document.querySelectorAll("#mobileTocDropdown a").forEach(link => {
    const linkTarget = link.getAttribute("href")?.replace(/^#/, "");
    if (linkTarget === activeId) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });
}
window.updateActiveLink = updateActiveLink; // optional, but good if you use window. in other places


// -------- VIDEO TOGGLE & ADVANCED BEHAVIOUR --------

let currentVideoElement = null; // Track current playing video DOM node

function initVideoToggle() {
document.querySelectorAll(".dropdown-content a[data-loc]").forEach(link => {
  link.addEventListener("click", function(e) {
    e.preventDefault();
    const locKey = this.dataset.loc;
    updateActiveLink(locKey);
    saveCurrentSectionAsLast(currentSectionId); // Correct: save the section you’re leaving

    if (locKey === "top") {
      smartSmoothJumpToSection("top");
    } else if (locations[locKey]) {
      smartSmoothJumpToSection(locKey);
    }
    // Do NOT set currentSectionId or call highlight directly here!
    // The jump function will handle it after the scroll completes.
  });
});

}

function initVideoIdStealOnPlay() {
  document.querySelectorAll('.videoContainer video').forEach(video => {
    video.addEventListener('play', () => {
      const section = video.closest('section');
      if (section) {
        videoId = section.id;
        lastSavedSectionId = section.id;
        currentVideoElement = video;
        updateStatsPanel();
      }
    });

    video.addEventListener('pause', () => {
      // Always update the panel, even if PiP is active
      updateStatsPanel();
    });

    video.addEventListener('enterpictureinpicture', () => {
      // Might have resumed in PiP
      updateStatsPanel();
    });

    video.addEventListener('leavepictureinpicture', () => {
      updateStatsPanel();
    });
  });
}



function enforceVideoBehaviour() {
  if (!videoId || !currentSectionId || videoId === currentSectionId) return;
  const mode = localStorage.getItem('videoBehaviour') || 'play';
  const section = document.getElementById(videoId);
  if (!section) return;
  const video = section.querySelector('video');
  if (!video) return;

  if (mode === 'pause') {
    video.pause();
  } else if (mode === 'pip') {
    if (video.requestPictureInPicture && document.pictureInPictureElement !== video) {
      video.requestPictureInPicture().catch(() => {});
    }
  }
  // 'play' mode: do nothing
}


/**
 * On section change: enforces the selected video behaviour
 * Call this whenever currentSectionId changes!
 */
function setupVideoSectionBehaviour() {
  let lastSectionId = null;
  let lastVideoId = null;
  // Listen for section change (hook into observer)
  const observer = new MutationObserver(() => {
    if (lastSectionId !== currentSectionId || lastVideoId !== videoId) {
      enforceVideoBehaviour();
      lastSectionId = currentSectionId;
      lastVideoId = videoId;
    }
  });
  observer.observe(document.body, { attributes: false, childList: false, subtree: false });
  // Or: call enforceVideoBehaviour directly from setupSectionTracking (recommended)
  window._enforceVideoBehaviour = enforceVideoBehaviour;
}

function requestPiPForCurrentVideo() {
  if (videoId) {
    const section = document.getElementById(videoId);
    if (section) {
      const video = section.querySelector('video');
      if (video && video.requestPictureInPicture) {
        if (document.pictureInPictureElement !== video) {
          video.requestPictureInPicture().catch(() => {});
        }
      }
    }
  }
}

function updateCurrentSection(newSectionId, { syncMap = true, syncTOC = true } = {}) {
  currentSectionId = newSectionId;
  highlightCurrentSectionTitle(currentSectionId);
  updateStatsPanel();
  enforceVideoBehaviour();
  if (syncTOC) updateActiveLink(currentSectionId);

  // Only fly if marker exists!
  if (syncMap && mapMarkers[currentSectionId]) {
    if (mapUpdateTimeout) clearTimeout(mapUpdateTimeout);
    mapUpdateTimeout = setTimeout(() => {
      // Only call if marker is still there (paranoia)
      if (mapMarkers[currentSectionId]) {
        map.flyTo(mapMarkers[currentSectionId].getLatLng(), mapFlyZoom, mapFlyAnim);
        mapMarkers[currentSectionId].openPopup();
      }
    }, 250);
  }
}


// --- Add this call inside your observer in setupSectionTracking:
function setupSectionTracking() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  let lastScrollY = window.scrollY;
  let scrollDirection = 'down';

  window.addEventListener('scroll', () => {
    let newScrollY = window.scrollY;
    scrollDirection = newScrollY > lastScrollY ? 'down' : 'up';
    lastScrollY = newScrollY;

    // Extra check, always update if title in view
    let id = detectCurrentSectionByTitle();
    if (id && id !== currentSectionId) updateCurrentSection(id);
  }, { passive: true });

  const observer = new IntersectionObserver((entries) => {
    if (observerPaused) return;

    // Filter for intersecting entries
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .map(entry => ({
        id: entry.target.id,
        top: entry.boundingClientRect.top
      }));

    if (!visible.length) return;

    visible.sort((a, b) => a.top - b.top);

    let newSectionId = null;
    if (scrollDirection === 'down') {
      newSectionId = visible[0].id;
    } else {
      newSectionId = visible[visible.length - 1].id;
    }

    // Always double-check with title-in-view detector
    let bestId = detectCurrentSectionByTitle() || newSectionId;
    if (bestId && bestId !== currentSectionId) {
      updateCurrentSection(bestId);
    }
  }, { threshold: 0.05 }); // <-- lower threshold
  sections.forEach(section => observer.observe(section));
}



/* SMART SMOOTH SCROLL JUMP */
function smartSmoothJumpToSection(targetId, callback) {
  observerPaused = true;
  const section = document.getElementById(targetId);
  if (!section) return;
  const offset = 15;
  const targetY = section.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top: targetY, behavior: "smooth" });

  let lastCheck = null;
  function onScroll() {
    if (Math.abs(window.scrollY - targetY) < 3) {
      window.removeEventListener('scroll', onScroll);
      setTimeout(() => {
        runSectionRefreshBurst(targetId, callback);
      }, 80);
    } else {
      if (!lastCheck) lastCheck = Date.now();
      if (Date.now() - lastCheck > 600) {
        window.removeEventListener('scroll', onScroll);
        observerPaused = false;
      }
    }
  }
  window.addEventListener('scroll', onScroll);
}

function runSectionRefreshBurst(targetId, callback) {
  let tries = 0, maxTries = 7, delay = 60;
  function burst() {
    let detectedId = detectCurrentSectionByTitle() || targetId;
    if (detectedId !== currentSectionId) {
      updateCurrentSection(detectedId);
    }
    tries++;
    if (tries < maxTries) {
      setTimeout(burst, delay);
    } else {
      observerPaused = false;
      if (callback) callback(currentSectionId);
    }
  }
  burst();
}

/* SIDEBAR & DROPDOWN MENU */
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const sidebarToc = document.getElementById("sidebarToc");
  const tocDropdown = document.getElementById("tocDropdown");

  const sidebarMenuBtn = document.getElementById("sidebarMenu");
  if (sidebarMenuBtn) {
    sidebarMenuBtn.addEventListener("click", function() {
      toggleSidebar();
    });
  }

  if (sidebarToc && tocDropdown) {
    sidebarToc.addEventListener("click", function(event) {
      event.stopPropagation();
      if (tocDropdown.style.display === "block") {
        tocDropdown.style.display = "none";
      } else {
        tocDropdown.style.display = "block";
        sidebar.classList.add("open");
      }
    });
  }
}



/* PARTICLES (background) */
function loadParticles(mode) {
  const particlesContainer = document.getElementById("particles-js");
  if (!particlesContainer) return;

  // Step 1: Disable & clear immediately if particles were on
  if (!window._particlesReloading && particlesVisible) {
    particlesVisible = false;
    window._particlesReloading = true;
    particlesContainer.innerHTML = "";
    setTimeout(() => loadParticles(mode), 100); // 2 sec delay before redraw
    return;
  }

  // Step 2: Redraw if visible and reloading is active
  if (window._particlesReloading) {
    particlesVisible = true;
    window._particlesReloading = false;
  }

  // Step 3: Respect user setting – if disabled, don't draw
  if (!particlesVisible) {
    particlesContainer.innerHTML = "";
    return;
  }

  // Step 4: Get fresh styles AFTER reflow delay
  const accent = getComputedStyle(document.body).getPropertyValue('--color-accent').trim();
  const bg = getComputedStyle(document.body).getPropertyValue('--color-bg-particles').trim();
  const lineColor = (mode === "dark") ? "#fff" : "#555";

  const config = {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: accent },
      shape: { type: "circle", stroke: { width: 0, color: "#000" } },
      opacity: { value: 0.5 },
      size: { value: 3, random: true },
      line_linked: {
        enable: true,
        distance: 150,
        color: lineColor,
        opacity: 0.4,
        width: 1
      },
      move: {
        enable: true,
        speed: 2,
        out_mode: "out"
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" }
      },
      modes: {
        repulse: { distance: 50, duration: 0.4 },
        push: { particles_nb: 4 }
      }
    },
    retina_detect: true
  };

  particlesContainer.innerHTML = "";
  particlesJS("particles-js", config);
  particlesContainer.style.backgroundColor = bg;
}

/* Drop cap first letter in each .section-content */
function applyDropCapToSections() {
document.querySelectorAll(".dropdown-content a[data-loc]").forEach(link => {
  link.addEventListener("click", function(e) {
    e.preventDefault();
    const locKey = this.dataset.loc;
    updateActiveLink(locKey);
    saveCurrentSectionAsLast(currentSectionId);

    if (locKey === "top") {
      smartSmoothJumpToSection("top");
    } else if (locations[locKey]) {
      smartSmoothJumpToSection(locKey);
    }
    // DO NOT set currentSectionId or call highlight directly here!
    // The jump function will handle it after the scroll completes.
  });
});

}

/* Drop cap first letter in each .section-content */
function applyDropCapToSections() {
document.querySelectorAll(".dropdown-content a[data-loc]").forEach(link => {
  link.addEventListener("click", function(e) {
    e.preventDefault();
    const locKey = this.dataset.loc;
    updateActiveLink(locKey);
    saveCurrentSectionAsLast(currentSectionId);

    if (locKey === "top") {
      smartSmoothJumpToSection("top");
    } else if (locations[locKey]) {
      smartSmoothJumpToSection(locKey);
    }
    // DO NOT set currentSectionId or call highlight directly here!
    // The jump function will handle it after the scroll completes.
  });
});

}

/* HIGHLIGHT CURRENT SECTION TITLE + SMOOTH SCROLL ON CLICK */
function setupTitleClicks() {
  document.querySelectorAll('.title-text').forEach(titleSpan => {
    const section = titleSpan.closest('section');
    if (!section) return;
    const link = document.createElement('a');
    link.href = `#${section.id}`;
    link.className = 'section-title-link';
    link.style.color = 'inherit';
    link.style.textDecoration = 'none';
    link.textContent = titleSpan.textContent;
    titleSpan.textContent = '';
    titleSpan.appendChild(link);
    link.addEventListener('click', e => {
      e.preventDefault();
      saveCurrentSectionAsLast(currentSectionId); // Correct!
      smartSmoothJumpToSection(section.id);
    });
  });
}

/* HIGHLIGHT CURRENT SECTION TITLE */
function highlightCurrentSectionTitle(sectionId) {
  document.querySelectorAll('.title-text').forEach(span => {
    span.classList.remove(SECTION_HIGHLIGHT_CLASS);
  });
  if (sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
      const span = section.querySelector('.title-text');
      if (span) span.classList.add(SECTION_HIGHLIGHT_CLASS);
    }
  }
}

/* SAVE LAST SECTION */
function saveCurrentSectionAsLast(id = null) {
  lastSavedSectionId = id || currentSectionId;
  updateStatsPanel();
}

/* IMAGE POPUPS */
function initImagePopups() {
  const popup = document.getElementById("imagePopup");
  const popupImage = document.getElementById("popupImage");
  const closePopup = document.getElementById("closePopup");
  const images = document.querySelectorAll("img.popup-enabled");

  // Helper: set max size for any screen
  function setPopupImageMaxSize() {
    const padding = 40; // px for top/bottom/left/right
    const maxW = window.innerWidth - padding * 2;
    const maxH = window.innerHeight - padding * 2;
    popupImage.style.maxWidth = `${maxW}px`;
    popupImage.style.maxHeight = `${maxH}px`;
    popupImage.style.width = 'auto';
    popupImage.style.height = 'auto';
    popupImage.style.display = 'block';
    popupImage.style.margin = '0 auto';
    popupImage.style.objectFit = 'contain';
  }

  images.forEach(img => {
    img.addEventListener("click", function() {
      if (!popup || !popupImage) return;
      popupImage.src = this.src || this.getAttribute("data-src") || "";
      setPopupImageMaxSize();
      popup.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });

  // Resize image live if user rotates/resizes window while open
  window.addEventListener('resize', () => {
    if (popup && popup.style.display === "flex") setPopupImageMaxSize();
  });

  if (closePopup) {
    closePopup.addEventListener("click", function() {
      if (!popup) return;
      popup.style.display = "none";
      document.body.style.overflow = "auto";
    });
  }



  if (popup) {
    popup.addEventListener("click", function(event) {
      if (event.target === popup) {
        popup.style.display = "none";
        document.body.style.overflow = "auto";
      }
    });
  }
}

const NO_MAP_SECTIONS = [
  "principal", "recomandari", "galerie", "bibliografie", "note"
];

/* LEAFLET MAP (with TOC sync) */
function initMap() {
  map = L.map("map").setView([45.9432, 24.9668], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  // --- Custom Soyombo Icon ---
  const customIcon = L.icon({
    iconUrl: "assets/soyombo.svg",
    iconSize: [48, 48],
    iconAnchor: [24, 46],
    popupAnchor: [0, -40]
  });

  // --- Popup labels ---
  const popupLabels = {
    prolog:        "Mongolia – 1206",
    kulikovo:      "Kulikovo – 1380",
    kalka:         "Kalka – 1381",
    tokhtamysh:    "Rusia – 1381",
    moscova:       "Moscova – 1382",
    razboi:        "Munții Caucaz – 1386",
    kondurcha:     "Kondurcha – 1391",
    terek:         "Terek – 1395",
    vorskla:       "Vorskla – 1399",
    declin:        "Rusia – 1406",
    dezintegrare:  "Rusia – 1419",
    lipnic:        "Lipnic – 1470",
    sfarsit:       "Ugra – 1480",
    ultimul:       "Kaunas – 1502"
  };

  // --- Add pins ---
  mapMarkers = {};
  for (const key in locations) {
    if (
      locations.hasOwnProperty(key) &&
      !NO_MAP_SECTIONS.includes(key) &&
      popupLabels[key]
    ) {
      const loc = locations[key];
      // Get the translated label for map popups:
const currentLang = getCurrentLanguage ? getCurrentLanguage() : 'ro'; // fallback for safety

const labelKey = `map_${key}`;
const translatedLabel = translations[currentLang][labelKey] || ""; // fallback to blank if missing

const marker = L.marker(loc.coords, { icon: customIcon, labelKey })
  .addTo(map)
  .bindPopup(`<div class="custom-map-popup">${translatedLabel}</div>`, { autoPan: false });
mapMarkers[key] = marker;

    }
  }

  // Pin click scrolls to section
  for (const key in mapMarkers) {
    if (!mapMarkers.hasOwnProperty(key)) continue;
    mapMarkers[key].on('click', function () {
      if (document.getElementById(key)) {
        smartSmoothJumpToSection(key);
      }
    });
  }

  // --- DESKTOP/Sidebar refresh control ---
  if (window.innerWidth > 900) {
    L.Control.RefreshMap = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function (map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-refreshmap');
        container.title = "Refresh Map";
        container.innerHTML = '<span style="font-size:1.13em;font-weight:bold;">⟳</span>';
        container.style.cursor = 'pointer';
container.onclick = function(e) {
  e.stopPropagation();
  closeMobileMap();
};

        return container;
      }
    });
    map.addControl(new L.Control.RefreshMap());
  }

  // --- MOBILE: close (X) and refresh (⟳) controls ---
  const mapHolder = document.getElementById('mobileMapHolder');
  if (
    window.innerWidth <= 900 &&
    mapHolder &&
    mapHolder.contains(document.getElementById('map'))
  ) {
    // CLOSE
L.Control.CloseMap = L.Control.extend({
  options: { position: 'topright' },
  onAdd: function(map) {
    var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-closemap');
    container.title = "Închide harta";
    container.innerHTML = '<span style="font-size:1.3em;font-weight:bold;">&times;</span>';
    container.style.cursor = 'pointer';
    container.onclick = function(e) {
      e.stopPropagation();
      closeMobileMap('[from X button]');  // <--- now calls your central close function with a label
    };
    return container;
  }
});
map.addControl(new L.Control.CloseMap());


    // REFRESH
    L.Control.RefreshMapMobile = L.Control.extend({
      options: { position: 'topleft' },
      onAdd: function(map) {
        var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-refreshmap');
        container.title = "Refresh Map";
        container.innerHTML = '<span style="font-size:1.13em;font-weight:bold;">⟳</span>';
        container.style.cursor = 'pointer';
        container.onclick = function(e) {
          e.stopPropagation();
          map.invalidateSize(true);
          container.style.background = '#ededed';
          setTimeout(() => {
            container.style.background = '';
          }, 150);
        };
        return container;
      }
    });
    map.addControl(new L.Control.RefreshMapMobile());
  }

  window._leafletMap = map;

  // --- TOC link logic (unchanged) ---
  function updateActiveLink(activeId) {
    document.querySelectorAll(".dropdown-content a[data-loc]").forEach(link => {
      if (link.dataset.loc === activeId) {
        link.classList.add("active-link");
      } else {
        link.classList.remove("active-link");
      }
    });
    document.querySelectorAll("#mobileTocDropdown a").forEach(link => {
      const linkTarget = link.getAttribute("href")?.replace(/^#/, "");
      if (linkTarget === activeId) {
        link.classList.add("active-link");
      } else {
        link.classList.remove("active-link");
      }
    });
  }
  window.updateActiveLink = updateActiveLink;

  document.querySelectorAll(".dropdown-content a[data-loc]").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const locKey = this.dataset.loc;
      updateActiveLink(locKey);
      saveCurrentSectionAsLast(currentSectionId);

      if (locKey === "top") {
        smartSmoothJumpToSection("top");
      } else if (locations[locKey]) {
        smartSmoothJumpToSection(locKey);
      }
    });
  });

  // Map follows section (only for those with pins)
  const observerOptions = { root: null, threshold: 0.5 };
  const observerCallback = (entries) => {
    if (observerPaused) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (mapMarkers[id]) {
          setTimeout(() => {
            map.flyTo(mapMarkers[id].getLatLng(), mapFlyZoom, mapFlyAnim);
            mapMarkers[id].openPopup();
          }, 200);
        }
        updateCurrentSection(id, {
          syncMap: false,
          syncTOC: true
        });
      }
    });
  };

  document.querySelectorAll("section[id]").forEach(section => {
    const obs = new IntersectionObserver(observerCallback, observerOptions);
    obs.observe(section);
  });
}

function updateMapPopups() {
  if (!mapMarkers) return;
  const lang = getCurrentLanguage ? getCurrentLanguage() : 'ro';
  Object.entries(mapMarkers).forEach(([key, marker]) => {
    const labelKey = `map_${key}`;
    const translatedLabel = translations[lang][labelKey] || "";
    marker.setPopupContent(`<div class="custom-map-popup">${translatedLabel}</div>`);
  });
}
window.updateMapPopups = updateMapPopups;


/* TEXT PRINCIPAL din text.txt */
function initTextSections() {
  const lang = getCurrentLanguage ? getCurrentLanguage() : 'ro';

  fetch("text.txt")
    .then(response => {
      if (!response.ok) throw new Error(`Eroare la încărcarea fișierului: ${response.status}`);
      return response.text();
    })
    .then(text => {
      // Build a mapping: { sectionId: { ro: "...", en: "...", de: "..." } }
      const sectionLangRegex = /--([a-z0-9_-]+)-(ro|en|de)--\s*([\s\S]*?)(?=--[a-z0-9_-]+-(?:ro|en|de)--|$)/gi;
      let match;
      let contentMap = {};

      while ((match = sectionLangRegex.exec(text)) !== null) {
        const sectionId = match[1].trim();
        const sectionLang = match[2].trim();
        const sectionContent = match[3].trim();

        if (!contentMap[sectionId]) contentMap[sectionId] = {};
        contentMap[sectionId][sectionLang] = sectionContent;
      }

      // For each section in DOM, fill the correct language text
TEXT_SECTIONS.forEach(id => {
  const section = document.getElementById(id);
  if (!section) return;
  let langContent = contentMap[id]?.[lang];
  if (!langContent) {
    langContent = contentMap[id]?.['ro'] || `[No content for "${id}" in "${lang}"]`;
  }
  let contentDiv = section.querySelector('.section-content') || section.querySelector('#principal');
  if (contentDiv) {
    contentDiv.innerHTML = langContent.match(/^</) ? langContent : `<p>${langContent}</p>`;
  }
});


      applyDropCapToSections?.();
      setupTitleClicks?.();
      initImagePopups?.();
      initAllTooltips?.();
      initExternalLinkTooltips?.();
      decorateExternalLinks?.();
    })
    .catch(error => console.error("Eroare la procesarea textului:", error));
}


/* NOTE TOOLTIP (and smooth jump) */
function initAllTooltips() {
  const tooltipDiv = document.getElementById("note-tooltip");
  if (!tooltipDiv) return;

  document.querySelectorAll('.note-ref').forEach(ref => {
    const noteNum = ref.dataset.note;
    const noteTarget = document.getElementById(`note-${noteNum}`);
    if (!noteTarget) return;

    ref.onmouseenter = function() {
      tooltipDiv.textContent = noteTarget.textContent.trim();
      tooltipDiv.style.opacity = "1";
    };
    ref.onmousemove = function(e) {
      const padding = 8;
      let x = e.pageX + padding;
      let y = e.pageY - tooltipDiv.offsetHeight - padding;
      if (x + tooltipDiv.offsetWidth > window.scrollX + window.innerWidth)
        x = window.scrollX + window.innerWidth - tooltipDiv.offsetWidth - padding;
      if (y < window.scrollY)
        y = e.pageY + padding;
      tooltipDiv.style.left = x + "px";
      tooltipDiv.style.top = y + "px";
    };
    ref.onmouseleave = function() {
      tooltipDiv.style.opacity = "0";
    };
    ref.onclick = function(e) {
      e.preventDefault();
      saveCurrentSectionAsLast();
      const section = noteTarget.closest("section");
      if (section) smartSmoothJumpToSection(section.id);
    };
  });
}

/* THEME TOGGLE (dark/light) */
function initThemeToggle() {
  const particlesJSBackground = document.getElementById("particles-js");
  const modeToggle = document.getElementById("modeToggle");
  const savedMode = localStorage.getItem("theme");
  if (savedMode === "dark") {
    document.body.classList.add("dark-mode");
    if (particlesJSBackground) particlesJSBackground.style.backgroundColor = "#333";
    loadParticles("dark");
  } else {
    document.body.classList.remove("dark-mode");
    if (particlesJSBackground) particlesJSBackground.style.backgroundColor = "#f4f4f4";
    loadParticles("light");
  }
  if (modeToggle) {
    modeToggle.addEventListener("click", function() {
      const isDark = document.body.classList.toggle("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      if (particlesJSBackground)
        particlesJSBackground.style.backgroundColor = isDark ? "#333" : "#f4f4f4";
      loadParticles(isDark ? "dark" : "light");
      updateStatsPanel();
    });
  }
}

/* PARTICLES TOGGLE */
function initParticlesToggle() {
  const particlesToggle = document.getElementById('particlesToggle');
  const savedParticles = localStorage.getItem('particlesEnabled');
  particlesVisible = savedParticles !== 'false'; // default true
  if (!particlesVisible) {
    const particlesContainer = document.getElementById("particles-js");
    if (particlesContainer) particlesContainer.innerHTML = "";
  }
  if (particlesToggle) {
    particlesToggle.checked = particlesVisible;
    particlesToggle.addEventListener('change', () => {
      particlesVisible = particlesToggle.checked;
      localStorage.setItem('particlesEnabled', particlesVisible);
      if (particlesVisible) {
        const mode = document.body.classList.contains('dark-mode') ? "dark" : "light";
        loadParticles(mode);
      } else {
        const particlesContainer = document.getElementById("particles-js");
        if (particlesContainer) particlesContainer.innerHTML = "";
      }
      updateStatsPanel();
    });
  }
}


/* FAB BUTTONS (floating actions) */
function initFab() {
  const fabMain = document.getElementById('fabMain');
  const fabContainer = document.querySelector('.fab-container');
  const fabActions = document.querySelectorAll('.fab-action');
  const fabTop = document.getElementById('fabTop');
  const fabLast = document.getElementById('fabLast');
  const fabMeniu = document.getElementById('fabMeniu');
  const AUTO_CLOSE_FAB = false;

  fabMain && fabMain.addEventListener('click', function(e) {
    e.stopPropagation();
    fabContainer.classList.toggle('active');
    updateStatsPanel();
  });


fabTop && fabTop.addEventListener('click', () => {
  saveCurrentSectionAsLast(currentSectionId); // Always save before jumping
  smartSmoothJumpToSection('top');
});

fabLast && fabLast.addEventListener('click', () => {
  if (lastSavedSectionId) {
    smartSmoothJumpToSection(lastSavedSectionId);
  } else {
    smartSmoothJumpToSection('acasa');
  }
});


  fabMeniu && fabMeniu.addEventListener('click', function(event) {
    event.stopPropagation();
    window.toggleSidebar && window.toggleSidebar();
  });
}

function getCurrentFontStyleKey() {
  // Returns: 'font-default', 'font-dyslexia', 'font-readable'
  return localStorage.getItem('fontStyle') || 'font-default';
}
function getCurrentFontStyleLabel() {
  switch (getCurrentFontStyleKey()) {
    case 'font-dyslexia': return 'Dyslexic';
    case 'font-readable': return 'Readable';
    case 'font-default':
    default: return 'Standard';
  }
}

function updateStatsPanel() {
  let statsDiv = document.getElementById('section-stats-indicator');
  if (!statsDiv) {
    statsDiv = document.createElement('div');
    statsDiv.id = "section-stats-indicator";
    statsDiv.style.position = "fixed";
    statsDiv.style.top = "10px";
    statsDiv.style.right = "22px";
    statsDiv.style.background = "#222";
    statsDiv.style.color = "#fff";
    statsDiv.style.padding = "7px 18px";
    statsDiv.style.borderRadius = "10px";
    statsDiv.style.fontFamily = "monospace";
    statsDiv.style.fontSize = "14px";
    statsDiv.style.zIndex = "3002";
    statsDiv.style.opacity = "0.85";
    statsDiv.style.pointerEvents = "auto";
    statsDiv.style.userSelect = "none";
    statsDiv.style.minWidth = "240px";
    document.body.appendChild(statsDiv);
    window.addEventListener('resize', updateStatsPanel);
  }

  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const sidebarOpenPx = Math.round(vw * 0.20);
  const sidebarClosedPx = 0;
  let sidebar = document.getElementById('sidebar');
  let sidebarOpen = sidebar && sidebar.classList.contains('open');
  let sidebarWidthDisplay = sidebarOpen
    ? `${sidebarOpenPx}px (open)`
    : `${sidebarClosedPx}px (closed)`;

  const container = document.querySelector('.container');
  const fabContainer = document.querySelector('.fab-container');
  const fabActive = fabContainer && fabContainer.classList.contains('active');
  const videoSelect = document.getElementById('videoPlaybackSelect');
  const videoText = videoSelect
    ? videoSelect.options[videoSelect.selectedIndex].text
    : "-";
  const debugPanelEnabled = localStorage.getItem('debugPanelEnabled') === 'true';

  // ==== MOBILE MAP STATUS ====
  let mapStatusLine = "";
  const mapHolder = document.getElementById('mobileMapHolder');
  if (mapHolder && window.innerWidth <= 900) {
    const isMapVisible = mapHolder.style.display !== 'none' && mapHolder.style.display !== '';
    mapStatusLine = `<div>Mobile Map: <span id="stats-mobile-map">${isMapVisible ? 'Shown' : 'Hidden'}</span></div>`;
    // Save to localStorage so it persists across reloads
    localStorage.setItem('mobileMapVisible', isMapVisible ? 'true' : 'false');
  }

  statsDiv.innerHTML = `
    <div class="debug-panel-interactive" style="margin-bottom: 10px;">
      <div id="devToolsToggleWrap" style="margin-bottom: 8px;">
        <label style="display:flex;align-items:center;justify-content:space-between;width:100%;font-size:15px;font-family:inherit;">
          <span style="flex:1;text-align:center;">Dev Tools</span>
          <input type="checkbox" id="devToolsToggle"
            style="accent-color:#ed143d;width:20px;height:20px;margin-left:10px;outline:1.5px solid #444;border-radius:4px;cursor:pointer;">
        </label>
      </div>
      <button id="forcePiPBtn"
        style="margin-bottom:6px;width:100%;padding:8px 0;background:#d00000;color:#fff;border:none;border-radius:7px;font-weight:bold;font-size:15px;cursor:pointer;box-shadow:0 2px 16px #d0000030;">Picture in Picture</button>
      <button id="forcePauseBtn"
        style="margin-bottom:8px;width:100%;padding:8px 0;background:#333;color:#fff;border:none;border-radius:7px;font-weight:bold;font-size:15px;cursor:pointer;box-shadow:0 2px 16px #2227;">Pause Video</button>
      <button id="refreshMapBtn"
        style="margin-bottom:8px;width:100%;padding:8px 0;background:#177b83;color:#fff;border:none;border-radius:7px;font-weight:bold;font-size:15px;cursor:pointer;box-shadow:0 2px 16px #177b8333;">Refresh Map</button>
      <button id="restoreSettingsBtn"
        style="margin-bottom:8px;width:100%;padding:8px 0;background:#f2992e;color:#fff;border:none;border-radius:7px;font-weight:bold;font-size:15px;cursor:pointer;box-shadow:0 2px 16px #f2992e33;">Restore Settings</button>
    </div>
    <hr>
    <div class="debug-panel-info">
      <div>Display size: <span id="stats-display">${window.innerWidth} × ${window.innerHeight}</span></div>
      <div>Device type: <span id="stats-device-type">${getDeviceType()}</span></div>
      <div>Container width: <span id="stats-container-width">${container ? `${container.offsetWidth}px` : '?'}</span></div>
      <div>Sidebar width: <span id="stats-sidebar-width">${sidebarWidthDisplay}</span></div>
      ${mapStatusLine}
    </div>
    <hr>
    <div class="debug-panel-video">
      <div>Video Behaviour: <span>${localStorage.getItem('videoBehaviour') || 'play'}</span></div>
      <div>Video ID: <span>${videoId || '-'}${videoId && currentSectionId && videoId !== currentSectionId ? ' <b>(!)</b>' : ''}</span></div>
      <div>Video Status: <span>${currentVideoElement ? (currentVideoElement.paused ? 'Paused' : 'Playing') : '-'}</span></div>
    </div>
    <hr>
    <div class="debug-panel-info-bottom" style="margin-bottom: 0;">
      <div>Current section: <span id="stats-current">${currentSectionId || "?"}</span></div>
      <div>Last saved: <span id="stats-last">${lastSavedSectionId || "-"}</span></div>
      <div>Sidebar open: <span>${(localStorage.getItem('sidebarOpen') === null || localStorage.getItem('sidebarOpen') === 'true') ? 'Open' : 'Closed'}</span></div>
      <div>Debug panel: <span>${localStorage.getItem('debugPanelEnabled') === 'true' ? 'Enabled' : 'Disabled'}</span></div>
      <hr style="margin:8px 0 5px 0;border-top:1.5px solid #444;">
      <div>Dark mode: <span>${localStorage.getItem('theme') || 'light'}</span></div>
      <div>Font style: <span>${getCurrentFontStyleLabel()}</span></div>
      <div>Particles: <span>${localStorage.getItem('particlesEnabled') !== 'false' ? 'Enabled' : 'Disabled'}</span></div>
      <div>Dyslexia Mode: <span>${localStorage.getItem('dyslexiaMode') === 'true' ? 'Enabled' : 'Disabled'}</span></div>
    </div>
  `;

  // DEV TOOLS TOGGLE
  let devToolsToggle = document.getElementById('devToolsToggle');
  let devEnabled = localStorage.getItem('devToolsEnabled');
  devEnabled = devEnabled === 'true';
  devToolsToggle.checked = devEnabled;
  devToolsToggle.onchange = function () {
    localStorage.setItem('devToolsEnabled', devToolsToggle.checked);
    updateDevToolsVisibility();
  };

  const showDev = devEnabled;
  ['forcePiPBtn', 'forcePauseBtn', 'refreshMapBtn', 'restoreSettingsBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.style.display = showDev ? 'block' : 'none';
  });

  const restoreBtn = document.getElementById('restoreSettingsBtn');
  if (restoreBtn) {
    restoreBtn.onclick = function () {
      if (!confirm("Restore all settings to default?")) return;

      // Save defaults
      localStorage.setItem('contrast', 'false');
      localStorage.setItem('theme', 'light');
      localStorage.setItem('debugPanelEnabled', 'false');
      localStorage.setItem('particlesEnabled', getDeviceType() === 'mobile' ? 'false' : 'true');
      localStorage.setItem('videoBehaviour', 'pause');
      localStorage.setItem('sidebarOpen', 'true');
      localStorage.setItem('fontStyle', 'font-default');
      localStorage.setItem('dyslexiaMode', 'false');
      localStorage.removeItem('previousFontStyle');

      // Reload to apply visually
      location.reload();
    };
  }
  statsDiv.style.display = debugPanelEnabled ? 'block' : 'none';
}

window.addEventListener('resize', updateStatsPanel);

// Make sure to also define getDeviceType somewhere globally:
function getDeviceType() {
  return window.innerWidth > window.innerHeight ? "desktop" : "mobile";
}

// Add live update on resize (outside function, just once)
window.addEventListener('resize', () => {
  let deviceTypeDiv = document.getElementById('stats-device-type');
  if (deviceTypeDiv) deviceTypeDiv.textContent = "Device type: " + getDeviceType();
});


function updateDevToolsVisibility() {
  const show = localStorage.getItem('devToolsEnabled') === 'true';
  // Toggle dev panel buttons (add refreshMapBtn, etc)
  ['forcePiPBtn', 'forcePauseBtn', 'refreshMapBtn', 'restoreSettingsBtn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.style.display = show ? 'block' : 'none';
  });

  // Handle the debug line in the modal
  const modal = document.getElementById('settingsPopup');
  if (modal) {
    let debugLine = document.getElementById('modalDebugLine');
    if (show) {
      if (!debugLine) {
        debugLine = document.createElement('div');
        debugLine.id = 'modalDebugLine';
        debugLine.className = 'modal-center-line';
        modal.appendChild(debugLine);
      }
      debugLine.style.display = 'block';
    } else {
      if (debugLine) debugLine.style.display = 'none';
    }
  }

  // Show hover zone in dev mode
  const hoverZone = document.getElementById('sidebarHoverZone');
  if (hoverZone) {
    if (show) {
      hoverZone.classList.add('dev-visible');
    } else {
      hoverZone.classList.remove('dev-visible');
    }
  }
}



function toggleDevToolsPanel(show) {
  const panel = document.getElementById('debug-tools-panel');
  if (panel) {
    panel.style.display = show ? 'block' : 'none';
  }
}



function pauseCurrentVideo() {
  if (videoId) {
    const section = document.getElementById(videoId);
    if (section) {
      const video = section.querySelector('video');
      if (video) video.pause();
    }
  }
}

// Helper for reading dropdown value
function getCurrentVideoBehaviour() {
  const videoSelect = document.getElementById('videoPlaybackSelect');
  return videoSelect ? videoSelect.value : 'play';
}



// -------- SETTINGS POPUP --------
function initSettingsPopup() {
  const overlay = document.getElementById('settingsOverlay');
  const popup = document.getElementById('settingsPopup');
  const closeBtn = document.getElementById('closeSettingsBtn');
  
  function toggleSettings() {
    if (overlay.style.display === 'flex') {
      overlay.style.display = 'none';
      document.body.style.overflow = 'auto';
    } else {
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      // focus on popup header if possible (for accessibility)
      const h2 = popup.querySelector('h2');
      if (h2) h2.focus();
    }
  }

  // Close modal on X button click
  if (closeBtn) closeBtn.addEventListener('click', toggleSettings);

  // Close when clicking outside popup (on overlay)
  if (overlay) {
    overlay.addEventListener('click', (e) => { 
      if (e.target === overlay) toggleSettings();
    });
  }



  // Buttons that open the settings modal
  const sidebarSettingsBtn = document.getElementById('sidebarSettings');
  const fabSettingsBtn = document.getElementById('fabSettings');
  [sidebarSettingsBtn, fabSettingsBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); toggleSettings(); });
  });

  // Update stats panel when changing video playback mode
  const videoPlaybackSelect = document.getElementById('videoPlaybackSelect');
  if (videoPlaybackSelect) {
    videoPlaybackSelect.addEventListener('change', updateStatsPanel);
  }
}


function forceBodyBgUpdate() {
  document.body.style.backgroundColor = getComputedStyle(document.body).getPropertyValue('--color-bg').trim();
}

// -------- SETTINGS CONTROLS --------
function initSettingsControls() {
  const contrastToggle    = document.getElementById('contrastToggle');
  const themeToggle       = document.getElementById('themeToggle');
  const debugToggle       = document.getElementById('debugToggle');
  const particlesToggle   = document.getElementById('particlesToggle');
  const videoSelect       = document.getElementById('videoPlaybackSelect');
  const dyslexiaToggle    = document.getElementById('dyslexiaToggle');
  const sidebarOpenToggle = document.getElementById('sidebarOpenToggle');
  const fontStyleSelect   = document.getElementById('fontStyleSelect');

  const savedContrast      = localStorage.getItem('contrast');
  const savedTheme         = localStorage.getItem('theme');
  const savedDebug         = localStorage.getItem('debugPanelEnabled');
  const savedParticles     = localStorage.getItem('particlesEnabled');
  const savedVideoBehaviour= localStorage.getItem('videoBehaviour');
  const savedSidebarOpen   = localStorage.getItem('sidebarOpen');
  const savedFontStyle     = localStorage.getItem('fontStyle');
  const savedDyslexia      = localStorage.getItem('dyslexiaMode');

  const isMobile = getDeviceType() === 'mobile';
  const defaultParticles = isMobile ? false : true;

  // === High Contrast ===
  const contrast = savedContrast === null ? false : (savedContrast === 'true');
  contrastToggle.checked = contrast;
  localStorage.setItem('contrast', contrast);
  updateHighContrastClass();

  // === Dark Mode ===
  const isDark = savedTheme === 'dark';
  themeToggle.checked = isDark;
  document.body.classList.toggle('dark-mode', isDark);

  // === Debug Panel ===
  const debug = savedDebug === 'true';
  debugToggle.checked = debug;
  const statsDiv = document.getElementById('section-stats-indicator');
  if (statsDiv) statsDiv.style.display = debug ? 'block' : 'none';

  // === Particles ===
  const particles = savedParticles === null ? defaultParticles : (savedParticles === 'true');
  particlesVisible = particles;
  particlesToggle.checked = particles;
  if (!particles) {
    const container = document.getElementById("particles-js");
    if (container) container.innerHTML = "";
  }

  // === Video Behaviour ===
  const videoMode = savedVideoBehaviour || 'pause';
  if (videoSelect) {
    videoSelect.value = videoMode;
    localStorage.setItem('videoBehaviour', videoMode);
  }

  // === Sidebar Open ===
  const sidebarOpen = savedSidebarOpen === null ? true : (savedSidebarOpen === 'true');
  sidebarOpenToggle.checked = sidebarOpen;
  localStorage.setItem('sidebarOpen', sidebarOpen);

  // === Font Style & Dyslexia ===
  const fontStyle = savedFontStyle || 'font-default';
  const dyslexiaMode = savedDyslexia === 'true';

  fontStyleSelect.value = fontStyle;
  document.body.classList.remove('font-default', 'font-dyslexia', 'font-readable');
  document.body.classList.add(fontStyle);
  if (dyslexiaMode) document.body.classList.add('dyslexia-mode');
  dyslexiaToggle.checked = fontStyle === 'font-dyslexia';

  // === Event Listeners ===

  contrastToggle.addEventListener('change', () => {
    localStorage.setItem('contrast', contrastToggle.checked);
    updateHighContrastClass();
    triggerParticleRefresh();
    updateStatsPanel();
  });

  themeToggle.addEventListener('change', () => {
    const isDark = themeToggle.checked;
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    updateHighContrastClass();
    triggerParticleRefresh();
    updateStatsPanel();
  });

  debugToggle.addEventListener('change', () => {
    localStorage.setItem('debugPanelEnabled', debugToggle.checked);
    if (statsDiv) statsDiv.style.display = debugToggle.checked ? 'block' : 'none';
    updateStatsPanel();
  });

  particlesToggle.addEventListener('change', () => {
    particlesVisible = particlesToggle.checked;
    localStorage.setItem('particlesEnabled', particlesVisible);
    triggerParticleRefresh();
    updateStatsPanel();
  });

  if (videoSelect) {
    videoSelect.addEventListener('change', function () {
      localStorage.setItem('videoBehaviour', videoSelect.value);
      updateStatsPanel();
    });
  }

  sidebarOpenToggle.addEventListener('change', () => {
    localStorage.setItem('sidebarOpen', sidebarOpenToggle.checked);
    updateStatsPanel();
  });

  dyslexiaToggle.addEventListener('change', () => {
    if (dyslexiaToggle.checked) {
      enableDyslexiaMode();
      fontStyleSelect.value = 'font-dyslexia';
    } else {
      disableDyslexiaMode();
      fontStyleSelect.value = localStorage.getItem('fontStyle') || 'font-default';
    }
    updateStatsPanel();
  });

  fontStyleSelect.addEventListener('change', () => {
    const value = fontStyleSelect.value;
    if (value === 'font-dyslexia') {
      enableDyslexiaMode();
      dyslexiaToggle.checked = true;
    } else {
      localStorage.setItem('fontStyle', value);
      document.body.classList.remove('font-default', 'font-readable', 'font-dyslexia');
      document.body.classList.add(value);
      document.body.classList.remove('dyslexia-mode');
      localStorage.setItem('dyslexiaMode', false);
      dyslexiaToggle.checked = false;
    }
    updateStatsPanel();
  });

  function triggerParticleRefresh() {
    if (!particlesVisible) return;
    particlesVisible = false;
    window._particlesReloading = true;
    const container = document.getElementById("particles-js");
    if (container) container.innerHTML = "";
    setTimeout(() => {
      const isDark = document.body.classList.contains('dark-mode');
      loadParticles(isDark ? 'dark' : 'light');
    }, 100);
  }
}



// -------- SIDEBAR TOGGLE (UNCHANGED) --------
window.toggleSidebar = function() {
  const sidebar = document.getElementById("sidebar");
  const tocDropdown = document.getElementById("tocDropdown");
  sidebar.classList.toggle("open");
  if (!sidebar.classList.contains("open") && tocDropdown) {
    tocDropdown.style.display = "none";
  }
  if (window._leafletMap) {
    window._leafletMap.invalidateSize();
  }
  updateStatsPanel();
};


function initVideoShowButtons() {
  // Section ID -> YouTube link mapping
  const ytLinks = {
    acasa:    "https://www.youtube.com/watch?v=3eEhruOZXHA",
    kulikovo: "https://www.youtube.com/watch?v=d4vROzoKElU",
    terek:    "https://www.youtube.com/watch?v=y95sYUkQJuA"
  };

  document.querySelectorAll('.toggleVideo').forEach(btn => {
    const videoSection = btn.closest('section');
    if (!videoSection) return;
    const sectionId = videoSection.id;
    const container = videoSection.querySelector('.videoContainer');
    if (!container) return;

    // If needed, add the YouTube link *below* the .videoContainer, not inside
    let ytLinkDiv = videoSection.querySelector('.video-source-link');
    if (!ytLinkDiv && ytLinks[sectionId]) {
      ytLinkDiv = document.createElement('div');
      ytLinkDiv.className = 'video-source-link';
      ytLinkDiv.style.display = 'none';
      ytLinkDiv.style.textAlign = 'center';
      ytLinkDiv.innerHTML = `
        <a href="${ytLinks[sectionId]}" target="_blank" rel="noopener" class="external-link">
          Vizionează pe YouTube
        </a>
      `;
      // Place AFTER the container, not inside
      container.after(ytLinkDiv);
    } else if (ytLinkDiv && ytLinks[sectionId]) {
      ytLinkDiv.innerHTML = `
        <a href="${ytLinks[sectionId]}" target="_blank" rel="noopener" class="external-link">
          Vizionează pe YouTube
        </a>
      `;
    }

    // Button toggles both video and link
    btn.addEventListener('click', function () {
      const show = (container.style.display === 'none' || !container.style.display);
      container.style.display = show ? 'block' : 'none';
      btn.textContent = show ? 'Ascunde Video' : 'Arată Video';
      if (ytLinkDiv) ytLinkDiv.style.display = show ? 'block' : 'none';
    });
  });
}




function updateProgressBar() {
  const bar = document.getElementById("page-progress-bar");
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight ? (scrollTop / docHeight) : 0;
  bar.style.width = (progress * 100) + "%";
}
window.addEventListener("scroll", updateProgressBar);
window.addEventListener("resize", updateProgressBar);

function initGalleryTooltips() {
  const tooltipDiv = document.getElementById("note-tooltip");
  document.querySelectorAll('.gallery-item img').forEach(img => {
    img.addEventListener('mouseenter', function() {
      tooltipDiv.textContent = img.nextElementSibling.textContent;
      tooltipDiv.style.opacity = '1';
    });
    img.addEventListener('mousemove', function(e) {
      tooltipDiv.style.left = (e.pageX + 12) + "px";
      tooltipDiv.style.top = (e.pageY - 40) + "px";
    });
    img.addEventListener('mouseleave', function() {
      tooltipDiv.style.opacity = '0';
    });
  });
}

function getDeviceType() {
  return window.innerWidth > window.innerHeight ? "desktop" : "mobile";
}

function getDeviceType() {
  return window.innerWidth > window.innerHeight ? "desktop" : "mobile";
}

function detectCurrentSectionByTitle() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  let bestId = null;
  let minTop = Infinity;
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    // Check if the very top of the section is within the top 20% of the viewport
    if (rect.top >= 0 && rect.top < window.innerHeight * 0.2) {
      if (rect.top < minTop) {
        minTop = rect.top;
        bestId = section.id;
      }
    }
  });
  return bestId;
}


function initExternalLinkTooltips() {
  let tooltip = document.getElementById('note-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = "note-tooltip";
    document.body.appendChild(tooltip);
  }

  function getBaseDomain(url) {
    try {
      const { hostname } = new URL(url, window.location.href);
      return hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  function isExternal(link) {
    const href = link.getAttribute('href');
    if (!href) return false;
    if (href.startsWith('#') || href.startsWith('/') || href.startsWith('mailto:')) return false;
    try {
      const parsed = new URL(href, window.location.href);
      return parsed.hostname !== window.location.hostname;
    } catch {
      return false;
    }
  }

  document.querySelectorAll('a[href]').forEach(link => {
    if (!isExternal(link)) return;
    link.classList.add('external-link');

    // Remove old handlers first (avoid stacking)
    link.onmouseenter = null;
    link.onmouseleave = null;
    link.onfocus = null;
    link.onblur = null;
    link.onmousemove = null;

    link.addEventListener('mouseenter', function (e) {
      tooltip.textContent = getBaseDomain(link.href);
      tooltip.style.opacity = '1';
      function move(ev) {
        tooltip.style.left = (ev.pageX + 12) + "px";
        tooltip.style.top = (ev.pageY - 40) + "px";
      }
      move(e);
      link.addEventListener('mousemove', move);
      link._moveTooltip = move;
    });
    link.addEventListener('mouseleave', function () {
      tooltip.style.opacity = '0';
      if (link._moveTooltip) link.removeEventListener('mousemove', link._moveTooltip);
    });
    link.addEventListener('focus', function () {
      tooltip.textContent = getBaseDomain(link.href);
      tooltip.style.opacity = '1';
      const rect = link.getBoundingClientRect();
      tooltip.style.left = (rect.left + window.scrollX + 20) + "px";
      tooltip.style.top = (rect.top + window.scrollY - 40) + "px";
    });
    link.addEventListener('blur', function () {
      tooltip.style.opacity = '0';
    });
  });
}

function decorateExternalLinks() {
  document.querySelectorAll('a.external-link').forEach(link => {
    // Already decorated? (avoid duplicates if you run multiple times)
    if (
      link.nextSibling &&
      link.nextSibling.nodeType === 1 &&
      link.nextSibling.classList.contains('external-arrow')
    ) return;

    // Create the arrow span
    const arrow = document.createElement('span');
    arrow.textContent = '↗';
    arrow.className = 'external-arrow';
    link.after(arrow);
  });
}

function jumpToSection(targetId, callback) {
  if (currentSectionId && currentSectionId !== targetId) {
    lastSavedSectionId = currentSectionId;
    updateStatsPanel && updateStatsPanel();
  }
  smartSmoothJumpToSection(targetId, callback);
}

function setupSidebarHoverOpen() {
  const hoverZone = document.getElementById("sidebarHoverZone");
  const sidebar = document.getElementById("sidebar");
  let hoverEnabled = true; // allow hover to open sidebar
  let manuallyOpened = false; // tracks manual close

  // Only for desktop!
  function isDesktop() {
    return window.innerWidth > 900;
  }

  // Hover opens and locks sidebar (desktop only)
  hoverZone.addEventListener('mouseenter', () => {
    if (!isDesktop()) return;
    sidebar.classList.add('open');
    hoverEnabled = false;
    manuallyOpened = false;
    updateStatsPanel && updateStatsPanel();
  });

  // Clicking close button always closes and re-enables hover
  document.getElementById('sidebarCloseBtn')?.addEventListener('click', () => {
    sidebar.classList.remove('open');
    hoverEnabled = true;
    manuallyOpened = false;
    updateStatsPanel && updateStatsPanel();
  });

  // Clicking menu/settings locks sidebar open
  document.getElementById('sidebarToc')?.addEventListener('click', () => { hoverEnabled = false; manuallyOpened = true; });
  document.getElementById('sidebarSettings')?.addEventListener('click', () => { hoverEnabled = false; manuallyOpened = true; });
}


function restoreSettings() {
  const isMobile = getDeviceType() === 'mobile';
  const defaultParticles = isMobile ? 'false' : 'true';

  localStorage.setItem('contrast', 'false');
  localStorage.setItem('theme', 'light');
  localStorage.setItem('debugPanelEnabled', 'false');
  localStorage.setItem('particlesEnabled', defaultParticles);
  localStorage.setItem('videoBehaviour', 'pause');
  localStorage.setItem('sidebarOpen', 'true');
  localStorage.setItem('fontStyle', 'font-default');
  localStorage.setItem('dyslexiaMode', 'false');
  localStorage.removeItem('previousFontStyle');

  // 🔧 Ensure contrast class is removed now
  updateHighContrastClass();

  // 🧼 Optional: also remove existing class manually to be 100% safe
  document.body.classList.remove('high-contrast-light', 'high-contrast-dark');

  // 🌀 Reload to apply everything fresh
  location.reload();
}


function updateHighContrastClass() {
  document.body.classList.remove('high-contrast-light', 'high-contrast-dark');
  const isHighContrast = localStorage.getItem('contrast') === 'true';
  const isDark = document.body.classList.contains('dark-mode');
  if (isHighContrast) {
    document.body.classList.add(isDark ? 'high-contrast-dark' : 'high-contrast-light');
  }
  forceBodyBgUpdate(); // <--- YES, right place
}

contrastToggle.addEventListener('change', () => {
  localStorage.setItem('contrast', contrastToggle.checked);
  updateHighContrastClass();
  updateStatsPanel();
});
themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode', themeToggle.checked);
  localStorage.setItem('theme', themeToggle.checked ? 'dark' : 'light');
  updateHighContrastClass();
  updateStatsPanel();
});

function openMobileMap(from = "unknown") {
  const mapHolder = document.getElementById('mobileMapHolder');
  if (!mapHolder) return;
  // 1. Remove any existing #map DOM node
  let oldMapDiv = document.getElementById('map');
  if (oldMapDiv && oldMapDiv.parentNode === mapHolder) {
    oldMapDiv.parentNode.removeChild(oldMapDiv);
    // Defensive: kill leaflet
    if (window._leafletMap) {
      window._leafletMap.remove();
      window._leafletMap = null;
    }
  }
  // 2. Create a new #map node (always, fresh)
  const newMapDiv = document.createElement('div');
  newMapDiv.id = 'map';
  newMapDiv.style.width = '100%';
  newMapDiv.style.height = '100%';
  mapHolder.appendChild(newMapDiv);

  // 3. Show the mapHolder
  mapHolder.style.display = '';
  mapHolder.hidden = false;
  localStorage.setItem('mobileMapVisible', 'true');

  // 4. Re-initialize leaflet
  initMap();

  // 5. Debug state
  console.log(`[openMobileMap] [${from}] - SHOWN. Exists:`, !!document.getElementById('map'));
}

function closeMobileMap(from = "unknown") {
  const mapHolder = document.getElementById('mobileMapHolder');
  if (!mapHolder) return;
  // 1. Remove Leaflet instance if exists
  if (window._leafletMap) {
    window._leafletMap.remove();
    window._leafletMap = null;
  }
  // 2. Remove the #map node for real
  let oldMapDiv = document.getElementById('map');
  if (oldMapDiv && oldMapDiv.parentNode === mapHolder) {
    oldMapDiv.parentNode.removeChild(oldMapDiv);
  }
  // 3. Hide the mapHolder
  mapHolder.style.display = 'none';
  mapHolder.hidden = true;
  localStorage.setItem('mobileMapVisible', 'false');

  // 4. Debug state
  console.log(`[closeMobileMap] [${from}] - HIDDEN. Exists:`, !!document.getElementById('map'));
}


// Helper to save/restore previous font style
function enableDyslexiaMode() {
  const currentFontStyle = localStorage.getItem('fontStyle') || 'font-default';
  if (currentFontStyle !== 'font-dyslexia') {
    localStorage.setItem('previousFontStyle', currentFontStyle);
  }
  localStorage.setItem('fontStyle', 'font-dyslexia');
  document.body.classList.remove('font-default', 'font-readable', 'font-dyslexia');
  document.body.classList.add('font-dyslexia');
  document.body.classList.add('dyslexia-mode');
}

function disableDyslexiaMode() {
  const previous = localStorage.getItem('previousFontStyle');
  const restoreFont = previous || 'font-default';
  localStorage.setItem('fontStyle', restoreFont);
  document.body.classList.remove('font-default', 'font-readable', 'font-dyslexia');
  document.body.classList.add(restoreFont);
  document.body.classList.remove('dyslexia-mode');
  localStorage.removeItem('previousFontStyle');
}

// === RESPONSIVE MAP SWAP: Sidebar->Mobile Top ===
function moveMapForMobile() {
  const isMobile = window.innerWidth <= 900;
  const sidebarMap = document.querySelector('.sidebar-map');
  const mapDiv = document.getElementById('map');
  const mobileHolder = document.getElementById('mobileMapHolder');
  if (!mapDiv || !mobileHolder || !sidebarMap) return;

  if (isMobile) {
    // Move #map into mobileMapHolder if not already there
    if (!mobileHolder.contains(mapDiv)) {
      mobileHolder.appendChild(mapDiv);
      mobileHolder.style.display = 'block';
      if (window._leafletMap) window._leafletMap.invalidateSize();
    }
  } else {
    // Move #map back to sidebar if not already there
    if (!sidebarMap.contains(mapDiv)) {
      sidebarMap.appendChild(mapDiv);
      mobileHolder.style.display = 'none';
      if (window._leafletMap) window._leafletMap.invalidateSize();
    }
  }
}
window.addEventListener('DOMContentLoaded', moveMapForMobile);

// === MOBILE RIBBON, TOC, MAP TOGGLE, RIBBON HIDE ON SCROLL ===
function setupMobileRibbon() {
  const tocBtn = document.getElementById('mobileTocBtn');
  const settingsBtn = document.getElementById('mobileSettingsBtn');
  const mapBtn = document.getElementById('mobileMapBtn');
  const tocDropdown = document.getElementById('mobileTocDropdown');
  const mapHolder = document.getElementById('mobileMapHolder');
  const settingsOverlay = document.getElementById('settingsOverlay');

  // TOC DROPDOWN
  if (tocBtn && tocDropdown) {
    tocBtn.onclick = function(e) {
      e.stopPropagation();
      tocDropdown.classList.toggle('open');
      if (window.innerWidth <= 900 && settingsOverlay) {
        settingsOverlay.style.display = 'none';
        document.body.style.overflow = '';
      }
    };

    tocDropdown.querySelectorAll('a').forEach(link => {
      link.onclick = function(e) {
        e.preventDefault();
        tocDropdown.classList.remove('open');
        const targetId = this.getAttribute('href').replace('#', '');
        if (document.getElementById(targetId)) {
          if (window.smartSmoothJumpToSection) {
            smartSmoothJumpToSection(targetId);
          } else {
            document.getElementById(targetId).scrollIntoView({behavior: "smooth"});
          }
        }
      };
    });
  }

  // SETTINGS MODAL
if (settingsBtn && settingsOverlay) {
  settingsBtn.onclick = function(e) {
    e.stopPropagation();
    const isOpen = isSettingsOpen();
    if (isOpen) {
      settingsOverlay.style.display = 'none';
      document.body.style.overflow = '';
      console.log('[settingsBtn] CLOSE settings');
    } else {
      settingsOverlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      if (window.innerWidth <= 900 && tocDropdown) {
        tocDropdown.classList.remove('open');
      }
      console.log('[settingsBtn] OPEN settings');
    }
  };
  settingsOverlay.onclick = function(e) {
    if (e.target === settingsOverlay) {
      settingsOverlay.style.display = 'none';
      document.body.style.overflow = '';
      console.log('[settingsOverlay] CLOSE by overlay');
    }
  };
}

// MAP TOGGLE (Harta)
if (mapBtn && mapHolder) {
mapBtn.onclick = function(e) {
  e.stopPropagation();

  if (isMobileMapVisible()) {
    console.log('[mapBtn] requests CLOSE (ribbon)');
    closeMobileMap('[from ribbon]');
  } else {
    console.log('[mapBtn] requests OPEN (ribbon)');
    openMobileMap('[from ribbon]');
    if (tocDropdown) tocDropdown.classList.remove('open');
    if (settingsOverlay) settingsOverlay.style.display = 'none';
    document.body.style.overflow = '';
  }
};
}
}

function isSettingsOpen() {
  const overlay = document.getElementById('settingsOverlay');
  return overlay && overlay.style.display === 'flex';
}

window._debugMapStatus = function(label = '') {
  const mapHolder = document.getElementById('mobileMapHolder');
  const mapDiv = document.getElementById('map');
  const lsState = localStorage.getItem('mobileMapVisible');
  let display, hidden, exists;

  if (!mapHolder) {
    console.log(`[MAP STATUS${label ? ' ' + label : ''}] mobileMapHolder missing!`);
    return;
  }

  display = mapHolder.style.display;
  hidden = mapHolder.hidden;
  exists = !!mapDiv;

  // Better test for "visible"
  const actuallyVisible =
    exists &&
    display !== 'none' &&
    !hidden &&
    mapHolder.offsetWidth > 0 &&
    mapHolder.offsetHeight > 0;

  // Print all!
  console.log(`[MAP STATUS${label ? ' ' + label : ''}] visible? ${actuallyVisible ? 'YES' : 'NO'}`);
  console.log({
    display,
    hidden,
    exists,
    offsetWidth: mapHolder.offsetWidth,
    offsetHeight: mapHolder.offsetHeight,
    lsState,
  });
};

function isMobileMapVisible() {
  const mapHolder = document.getElementById('mobileMapHolder');
  const mapDiv = document.getElementById('map');
  if (!mapHolder || !mapDiv) return false;
  // Check true DOM visibility
  return (
    mapHolder.style.display !== 'none' &&
    !mapHolder.hidden &&
    mapHolder.offsetWidth > 0 &&
    mapHolder.offsetHeight > 0
  );
}


function hideMobileMap(force = false) {
  const mapHolder = document.getElementById('mobileMapHolder');
  if (mapHolder) {
    mapHolder.style.setProperty('display', 'none', 'important');
    if (force) mapHolder.hidden = true; // hide for good measure
    localStorage.setItem('mobileMapVisible', 'false');
  }
}


function showMobileMap() {
  if (!mapHolder) return;
  mapHolder.style.removeProperty('display');
  mapHolder.hidden = false;
  localStorage.setItem('mobileMapVisible', 'true');
  setTimeout(() => {
    if (window._leafletMap) window._leafletMap.invalidateSize();
    ensureMapCloseBtn();
  }, 170);
}

function ensureMapCloseBtn() {
  const mapHolder = document.getElementById('mobileMapHolder');
  if (!mapHolder) return;
  // Remove any duplicate buttons
  mapHolder.querySelectorAll('.map-close-btn').forEach(btn => btn.remove());
  // Only add if visible
  if (mapHolder.style.display === 'none') return;
  // Add X close button (same style as refresh)
  const btn = document.createElement('button');
  btn.className = 'map-close-btn';
  btn.type = "button";
  btn.title = "Închide harta";
  btn.innerHTML = '&times;';
  btn.onclick = () => {
    mapHolder.style.setProperty('display', 'none', 'important');
    mapHolder.hidden = true;
    localStorage.setItem('mobileMapVisible', 'false');
  };
  mapHolder.appendChild(btn);
}


// ----------- MAIN BOOTSTRAP -----------
document.addEventListener('DOMContentLoaded', function() {
  // Sidebar state
  const sidebar = document.getElementById("sidebar");
  if (sidebar) {
    const sidebarOpen = localStorage.getItem('sidebarOpen');
    if (sidebarOpen === null || sidebarOpen === 'true') {
      sidebar.classList.add('open');
    } else {
      sidebar.classList.remove('open');
    }
  }

  // Always DOM-move the map to the right place
  moveMapForMobile();

  // Desktop map init (only if desktop at load)
  if (window.innerWidth > 900) {
    initMap();
  }

  // --- All your other init functions, just once each ---
  setupTitleClicks();
  initSidebar();
  loadParticles();
  initImagePopups();
  initTextSections();
  initThemeToggle();
  initParticlesToggle();
  setupSectionTracking();
  initFab();
  updateStatsPanel();
  initVideoToggle();
  initVideoIdStealOnPlay();
  initSettingsPopup();
  initSettingsControls();
  initGalleryTooltips();
  initVideoShowButtons();
  decorateExternalLinks();
  updateHighContrastClass();
  setupSidebarHoverOpen();
  updateDevToolsVisibility();

  // --- Only ONCE on load, restore map visibility on mobile ---
// ...
if (window.innerWidth <= 900) {
  setupMobileRibbon();
  const vis = localStorage.getItem('mobileMapVisible');
  if (vis === 'true') {
    console.log('[DOMContentLoaded] requests OPEN (restore)');
    openMobileMap('[from restore]');
  } else {
    console.log('[DOMContentLoaded] requests CLOSE (restore)');
    closeMobileMap('[from restore]');
  }
}

});

// Only this for map DOM swap!
window.addEventListener('resize', moveMapForMobile);

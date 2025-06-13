// -------- GLOBAL VARS --------
const SECTION_HIGHLIGHT_CLASS = "current-section-title";
let lastSavedSectionId = null;
let currentSectionId = null;
let observerPaused = false;
let videoId = null;
let mapUpdateTimeout = null;


// MAP LOCATIONS
const locations = {
  prolog:       { coords: [46, 105],    popupLabel: "Mongolia – 1206" },
  kulikovo:     { coords: [54, 39],     popupLabel: "Kulikovo – 1380" },
  kalka:        { coords: [48, 37],     popupLabel: "Kalka – 1381" },
  tokhtamysh:   { coords: [46, 48],     popupLabel: "Rusia – 1381" },
  moscova:      { coords: [55, 37],     popupLabel: "Moscova – 1382" },
  razboi:       { coords: [43, 45],     popupLabel: "Munții Caucaz – 1386" },
  kondurcha:    { coords: [54.5, 52.0], popupLabel: "Kondurcha – 1391" },
  terek:        { coords: [43.5402, 45.1698], popupLabel: "Terek – 1395" },
  vorskla:      { coords: [50, 35],     popupLabel: "Vorskla – 1399" },
  declin:       { coords: [60, 105],    popupLabel: "Rusia – 1406" },
  dezintegrare: { coords: [46, 48],     popupLabel: "Rusia – 1419" },
  lipnic:       { coords: [53, 17],     popupLabel: "Lipnic – 1470" },
  sfarsit:      { coords: [54.6778, 36.2865], popupLabel: "Ugra – 1480" },
  ultimul:      { coords: [54.8985, 23.9036], popupLabel: "Kaunas – 1502" },
  principal:    { coords: [48,      42] },
  note:         { coords: [44, 41]},
  recomandari:  { coords: [44, 41]},
  galerie:      { coords: [44, 41]},
  bibliografie: { coords: [44,      41]},
};
const mapFlyZoom = 6;
const mapFlyAnim = { animate: true, duration: 1.15, easeLinearity: 0.27 };
let map = null;
let mapMarkers = {};
let particlesVisible = true;

if ('scrollRestoration' in history) {
  history.scrollRestoration = 'auto'; // or 'manual' if you want to handle everything yourself
}



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

// Handle videoId and remember which is playing
function initVideoIdStealOnPlay() {
  document.querySelectorAll('.videoContainer video').forEach(video => {
    video.addEventListener('play', function () {
      const section = video.closest('section');
      if (section) {
        videoId = section.id;
        lastSavedSectionId = section.id;
        currentVideoElement = video;
        updateStatsPanel();
      }
    });

    // Optional: clear on pause (not required)
    video.addEventListener('pause', function () {
      // Don't clear videoId, keep last played info for debug
    });
  });
}

/**
 * On section change: enforces the selected video behaviour
 * Call this whenever currentSectionId changes!
 */
function setupVideoSectionBehaviour() {
  let lastSectionId = null;
  let lastVideoId = null;

  function enforceVideoBehaviour() {
    // Only if a video is playing and we have a current videoId
    if (!currentVideoElement || !videoId) return;
    const selected = document.getElementById('videoPlaybackSelect');
    if (!selected) return;
    const mode = selected.value;

    // If we're still in the same section as the video, do nothing
    if (videoId === currentSectionId) return;

    // Oprește: Pause the video
    if (mode === 'pause') {
      currentVideoElement.pause();
    }

    // Picture in Picture: trigger PiP if supported
    else if (mode === 'pip') {
      // Only if not already in PiP
      if (document.pictureInPictureElement !== currentVideoElement) {
        if (currentVideoElement.requestPictureInPicture) {
          currentVideoElement.requestPictureInPicture().catch(e => {
            // Sometimes PiP fails (browser, or user denied)
            // console.warn("PiP error", e);
          });
        }
      }
    }
    // "Rulează în fundal": do nothing
  }

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
  if (!particlesVisible) {
    const particlesContainer = document.getElementById("particles-js");
    if (particlesContainer) particlesContainer.innerHTML = "";
    return;
  }
  const particlesJSBackground = document.getElementById("particles-js");
  if (!particlesJSBackground) return;
  particlesJSBackground.innerHTML = "";
  const accent = getComputedStyle(document.body).getPropertyValue('--color-accent').trim();
  const lineColor = (mode === "dark") ? "#fff" : "#555";
  const config = {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: accent },
      shape: { type: "circle", stroke: { width: 0, color: "#000000" } },
      opacity: { value: 0.5, anim: { enable: false } },
      size: { value: 3, random: true, anim: { enable: false } },
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
        direction: "none",
        random: false,
        straight: false,
        out_mode: "out",
        bounce: false,
        attract: { enable: false }
      }
    },
    interactivity: {
      detect_on: "canvas",
      events: {
        onhover: { enable: true, mode: "repulse" },
        onclick: { enable: true, mode: "push" }
      },
      modes: {
        grab: { distance: 200, line_linked: { opacity: 1 } },
        bubble: { distance: 200, size: 40, duration: 2, opacity: 8, speed: 1 },
        repulse: { distance: 50, duration: 0.4 },
        push: { particles_nb: 4 },
        remove: { particles_nb: 2 }
      }
    },
    retina_detect: true
  };
  particlesJS("particles-js", config);
  if (particlesJSBackground) {
    particlesJSBackground.style.backgroundColor = (mode === "dark") ? "#333" : "#f4f4f4";
  }
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

function updateCurrentSection(newSectionId, { syncMap = true, syncTOC = true } = {}) {
  currentSectionId = newSectionId;
  highlightCurrentSectionTitle(currentSectionId);
  updateStatsPanel();
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

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape" && popup && popup.style.display === "flex") {
      popup.style.display = "none";
      document.body.style.overflow = "auto";
    }
  });

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

  // --- Custom Leaflet Refresh Control (⟳) ---
  L.Control.RefreshMap = L.Control.extend({
    options: { position: 'topleft' },
    onAdd: function (map) {
      var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-refresh');
      container.title = "Refresh/Redraw Map";
      container.innerHTML = '<span style="font-size: 1.55em; font-weight:bold; line-height:1;">⟳</span>';
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.on(container, 'click', function (e) {
        e.preventDefault();
        map.invalidateSize(true);
      });
      return container;
    }
  });
  map.addControl(new L.Control.RefreshMap());

  // --- Custom Soyombo Icon ---
  const customIcon = L.icon({
    iconUrl: "assets/soyombo.svg",
    iconSize: [48, 48],      // Adjust size as needed
    iconAnchor: [24, 46],    // Pin point
    popupAnchor: [0, -40]
  });

  // --- Popup labels, manual mapping for historical sections ---
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
      const label = popupLabels[key];
      const marker = L.marker(loc.coords, { icon: customIcon })
        .addTo(map)
        .bindPopup(
          `<div class="custom-map-popup">${label}</div>`,
          { autoPan: false }
        );
      mapMarkers[key] = marker;
    }
  }

  // Pin click scrolls to section (safe)
  for (const key in mapMarkers) {
    if (!mapMarkers.hasOwnProperty(key)) continue;
    mapMarkers[key].on('click', function () {
      if (document.getElementById(key)) {
        smartSmoothJumpToSection(key);
      }
    });
  }

  // Sidebar TOC link logic
  function updateActiveLink(activeId) {
    document.querySelectorAll(".dropdown-content a[data-loc]").forEach(link => {
      if (link.dataset.loc === activeId) {
        link.classList.add("active-link");
      } else {
        link.classList.remove("active-link");
      }
    });
  }
  window.updateActiveLink = updateActiveLink;

  // Handle TOC clicks
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

  window._leafletMap = map;
}




/* TEXT PRINCIPAL din text.txt */
function initTextSections() {
  fetch("text.txt")
    .then(response => {
      if (!response.ok) throw new Error(`Eroare la încărcarea fișierului: ${response.status}`);
      return response.text();
    })
    .then(text => {
      const regex = /--([\w-]+)--\s*([\s\S]*?)(?=--[\w-]+--|$)/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const sectionId = match[1].trim();
        const content = match[2].trim();
        if (sectionId === "principal") {
          const principalP = document.getElementById("principal");
          if (principalP) {
            principalP.innerHTML = content;
          }
        } else {
          const sectionElement = document.getElementById(sectionId);
          if (sectionElement) {
            let container = sectionElement.querySelector(".section-content");
            if (container) {
              if (!content.trim().startsWith('<p')) {
                container.innerHTML = `<p>${content}</p>`;
              } else {
                container.innerHTML = content;
              }
            }
          }
        }
      }
      applyDropCapToSections();
      setupTitleClicks();
      initImagePopups();

      // 🟦 🟦 🟦  INIT TOOLTIP HANDLERS HERE  🟦 🟦 🟦
      initAllTooltips();            // for .note-ref, etc
      initExternalLinkTooltips();   // for external links
    })
    .catch(error => console.error("Eroare la procesarea text.txt:", error));
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

  if (AUTO_CLOSE_FAB) {
    document.addEventListener('click', function(e) {
      if (!fabContainer.contains(e.target)) {
        fabContainer.classList.remove('active');
        updateStatsPanel();
      }
    });
    fabActions.forEach(btn => {
      btn.addEventListener('click', () => {
        fabContainer.classList.remove('active');
        updateStatsPanel();
      });
    });
  }

fabTop && fabTop.addEventListener('click', () => {
  saveCurrentSectionAsLast(currentSectionId); // Always save before jumping
  smartSmoothJumpToSection('top');
});

fabLast && fabLast.addEventListener('click', () => {
  saveCurrentSectionAsLast(currentSectionId); // Save the section before you jump back!
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

/* PANEL STATS (top right) */
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

  // Calculate the sidebar theoretical width (20vw)
  const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
  const sidebarOpenPx = Math.round(vw * 0.20);
  const sidebarClosedPx = 0;
  let sidebar = document.getElementById('sidebar');
  let sidebarOpen = sidebar && sidebar.classList.contains('open');
  let sidebarWidthDisplay = sidebarOpen
    ? `${sidebarOpenPx}px (open)`
    : `${sidebarClosedPx}px (closed)`;

  // Core stats
  const container = document.querySelector('.container');
  const fabContainer = document.querySelector('.fab-container');
  const fabActive = fabContainer && fabContainer.classList.contains('active');
  const videoSelect = document.getElementById('videoPlaybackSelect');
  const videoText = videoSelect
    ? videoSelect.options[videoSelect.selectedIndex].text
    : "-";
  const debugPanelEnabled = localStorage.getItem('debugPanelEnabled') === 'true';

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
        style="margin-bottom:8px;width:100%;padding:8px 0;">Refresh Map</button>
    </div>
    <hr>
    <div class="debug-panel-info">
      <div>Display size: <span id="stats-display">${window.innerWidth} × ${window.innerHeight}</span></div>
      <div>Device type: <span id="stats-device-type">${getDeviceType()}</span></div>
      <div>Container width: <span id="stats-container-width">${container ? `${container.offsetWidth}px` : '?'}</span></div>
      <div>Sidebar width: <span id="stats-sidebar-width">${sidebarWidthDisplay}</span></div>
      <hr>
      <div>Current section: <span id="stats-current">${currentSectionId || "?"}</span></div>
      <div>Last saved: <span id="stats-last">${lastSavedSectionId || "-"}</span></div>
      <div>Dark mode: <span id="stats-darkmode">${document.body.classList.contains('dark-mode') ? "Enabled" : "Disabled"}</span></div>
      <div>Debug panel: <span id="stats-debugpanel">${debugPanelEnabled ? "Enabled" : "Disabled"}</span></div>
      <div>Particles: <span id="stats-particles">${particlesVisible ? "Enabled" : "Disabled"}</span></div>
      <div>FAB Status: <span id="stats-fab">${fabActive ? "Open" : "Closed"}</span></div>
      <div>Video Behaviour: <span id="stats-video-behaviour">${videoText}</span></div>
      <div>Current video: <span id="stats-video-id">${videoId || "-"}</span></div>
    </div>
  `;

  // DEV TOOLS TOGGLE (checkbox)
  let devToolsToggle = document.getElementById('devToolsToggle');
  let devEnabled = localStorage.getItem('devToolsEnabled');
  if (devEnabled === null) devEnabled = false;
  else devEnabled = devEnabled === 'true';
  devToolsToggle.checked = devEnabled;
  devToolsToggle.onchange = function () {
    localStorage.setItem('devToolsEnabled', devToolsToggle.checked);
    updateDevToolsVisibility();
  };

  // DEV BUTTONS (show/hide by devToolsEnabled)
  let pipBtn = document.getElementById('forcePiPBtn');
  let pauseBtn = document.getElementById('forcePauseBtn');
  let refreshBtn = document.getElementById('refreshMapBtn');
  
  // Inline style for PiP
  Object.assign(pipBtn.style, {
    background: "#d00000",
    color: "#fff",
    marginBottom: "6px",
    width: "100%",
    padding: "8px 0",
    border: "none",
    borderRadius: "7px",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 2px 16px #d0000030",
    transition: "background 0.18s"
  });

  // Inline style for Pause
  Object.assign(pauseBtn.style, {
    background: "#333",
    color: "#fff",
    marginBottom: "8px",
    width: "100%",
    padding: "8px 0",
    border: "none",
    borderRadius: "7px",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 2px 16px #2227",
    transition: "background 0.18s"
  });

  // Inline style for Refresh Map (teal)
  Object.assign(refreshBtn.style, {
    background: "#177b83",
    color: "#fff",
    marginBottom: "8px",
    width: "100%",
    padding: "8px 0",
    border: "none",
    borderRadius: "7px",
    fontWeight: "bold",
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 2px 16px #177b8333",
    transition: "background 0.18s"
  });
  refreshBtn.onmouseenter = () => refreshBtn.style.background = "#20a7b0";
  refreshBtn.onmouseleave = () => refreshBtn.style.background = "#177b83";

  updateDevToolsVisibility();

  // Show/hide panel depending on Debug toggle
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
  // Toggle dev panel buttons (add refreshMapBtn)
  ['forcePiPBtn', 'forcePauseBtn', 'refreshMapBtn'].forEach(id => {
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
}




// Run this once at startup so it respects the stored state on reload
document.addEventListener('DOMContentLoaded', updateDevToolsVisibility);


// Make sure to call updateDevToolsVisibility once at startup!
document.addEventListener('DOMContentLoaded', () => {
  updateDevToolsVisibility();
});


function toggleDevToolsPanel(show) {
  const panel = document.getElementById('debug-tools-panel');
  if (panel) {
    panel.style.display = show ? 'block' : 'none';
  }
}

// On page load, restore panel state
document.addEventListener('DOMContentLoaded', function() {
  const enabled = localStorage.getItem('devToolsEnabled') === 'true';
  toggleDevToolsPanel(enabled);
});


// --- BUTTONS WIRING (use event delegation for robustness) ---
document.addEventListener("DOMContentLoaded", function () {
  document.body.addEventListener('click', function (e) {
    // PIP BUTTON
    if (e.target && e.target.id === 'forcePiPBtn') {
      if (!videoId) {
        alert("Niciun video nu este activ.");
        return;
      }
      const section = document.getElementById(videoId);
      if (!section) {
        alert("Nu s-a găsit secțiunea video.");
        return;
      }
      const video = section.querySelector('video');
      if (!video) {
        alert("Nu s-a găsit video-ul în secțiunea curentă.");
        return;
      }
      if (video.requestPictureInPicture) {
        video.requestPictureInPicture().catch((err) => {
          alert("Nu am putut activa modul Picture in Picture: " + err.message);
        });
      } else {
        alert("Picture in Picture nu este suportat de browserul tău.");
      }
    }

    // PAUSE BUTTON
    if (e.target && e.target.id === 'forcePauseBtn') {
      if (!videoId) {
        alert("Niciun video nu este activ.");
        return;
      }
      const section = document.getElementById(videoId);
      if (!section) {
        alert("Nu s-a găsit secțiunea video.");
        return;
      }
      const video = section.querySelector('video');
      if (!video) {
        alert("Nu s-a găsit video-ul în secțiunea curentă.");
        return;
      }
      video.pause();
    }

    // Refresh Map Button
    if (e.target && e.target.id === 'refreshMapBtn') {
      e.target.textContent = "Refreshing…";
      setTimeout(() => { e.target.textContent = "Refresh Map"; }, 400);

      // Remove leaflet instance if exists
      if (window._leafletMap) {
        window._leafletMap.remove();
        window._leafletMap = null;
      }
      // Remove old map node
      const oldMap = document.getElementById("map");
      if (oldMap) oldMap.parentNode.removeChild(oldMap);

      // Add new map node
      const sidebarMap = document.querySelector('.sidebar-map');
      if (sidebarMap) {
        const newMap = document.createElement("div");
        newMap.id = "map";
        sidebarMap.appendChild(newMap);
      }

      // Re-init the map
      setTimeout(() => {
        initMap();
        // Optionally fly to current section's marker if exists
        if (window.currentSectionId && window.mapMarkers && window.mapMarkers[window.currentSectionId]) {
          window._leafletMap.flyTo(
            window.mapMarkers[window.currentSectionId].getLatLng(),
            mapFlyZoom,
            mapFlyAnim
          );
          window.mapMarkers[window.currentSectionId].openPopup();
        }
      }, 150);
    }
  });
});

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
      popup.querySelector('h2').focus();
    }
  }
  closeBtn.addEventListener('click', toggleSettings);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) toggleSettings(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display === 'flex') toggleSettings();
  });
  const sidebarSettingsBtn = document.getElementById('sidebarSettings');
  const fabSettingsBtn = document.getElementById('fabSettings');
  [sidebarSettingsBtn, fabSettingsBtn].forEach(btn => {
    if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); toggleSettings(); });
  });
  const videoPlaybackSelect = document.getElementById('videoPlaybackSelect');
  if (videoPlaybackSelect) {
    videoPlaybackSelect.addEventListener('change', updateStatsPanel);
  }
}

// -------- SETTINGS CONTROLS --------
function initSettingsControls() {
  const themeToggle = document.getElementById('themeToggle');
  const debugToggle = document.getElementById('debugToggle');
  const particlesToggle = document.getElementById('particlesToggle');
  const videoSelect = document.getElementById('videoPlaybackSelect');
  const savedTheme = localStorage.getItem('theme');
  const savedDebug = localStorage.getItem('debugPanelEnabled') === 'true';
  const savedParticles = localStorage.getItem('particlesEnabled');
  const savedVideoBehaviour = localStorage.getItem('videoBehaviour');

  // --- Restore Video Behaviour Select ---
  if (videoSelect && savedVideoBehaviour) {
    videoSelect.value = savedVideoBehaviour;
  }
  if (videoSelect) {
    videoSelect.addEventListener('change', function() {
      localStorage.setItem('videoBehaviour', videoSelect.value);
      updateStatsPanel();
    });
  }

  // --- Theme toggle ---
  themeToggle.checked = (savedTheme === 'dark');
  if (themeToggle.checked) {
    document.body.classList.add('dark-mode');
    loadParticles('dark');
  } else {
    document.body.classList.remove('dark-mode');
    loadParticles('light');
  }

  // --- Particles toggle ---
  particlesToggle.checked = savedParticles !== 'false'; // default true
  if (!particlesToggle.checked) {
    const particlesContainer = document.getElementById("particles-js");
    if (particlesContainer) particlesContainer.innerHTML = "";
  }

  // --- Debug toggle ---
  debugToggle.checked = savedDebug;
  const statsDiv = document.getElementById('section-stats-indicator');
  if (statsDiv) {
    statsDiv.style.display = debugToggle.checked ? 'block' : 'none';
  }

  // --- Event listeners for toggles ---
  themeToggle.addEventListener('change', () => {
    if (themeToggle.checked) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
      loadParticles('dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
      loadParticles('light');
    }
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

function initVideoIdStealOnPlay() {
  document.querySelectorAll('.videoContainer video').forEach(video => {
    video.addEventListener('play', function () {
      const section = video.closest('section');
      if (section) {
        videoId = section.id;
        lastSavedSectionId = section.id;
        updateStatsPanel();
      }
    });
  });
}

function initVideoShowButtons() {
  document.querySelectorAll('.toggleVideo').forEach(btn => {
    btn.addEventListener('click', function() {
      // Find the nearest .video-section, then .videoContainer
      const videoSection = btn.closest('.video-section');
      if (!videoSection) return;
      const container = videoSection.querySelector('.videoContainer');
      if (!container) return;
      // Toggle display
      if (container.style.display === 'none' || !container.style.display) {
        container.style.display = 'block';
        btn.textContent = 'Ascunde Video';
      } else {
        container.style.display = 'none';
        btn.textContent = 'Arată Video';
      }
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
document.addEventListener("DOMContentLoaded", updateProgressBar);

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


document.addEventListener("DOMContentLoaded", function () {
  // Get or create the tooltip
  let tooltip = document.getElementById('note-tooltip'); // <-- this line must be active!
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.id = "note-tooltip";
    document.body.appendChild(tooltip);
  }

  // Returns only the domain (no www.)
  function getBaseDomain(url) {
    try {
      const { hostname } = new URL(url, window.location.href);
      return hostname.replace(/^www\./, '');
    } catch {
      return url;
    }
  }

  // True if link is external
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
    if (isExternal(link)) link.classList.add('external-link');
    else link.classList.remove('external-link');
    if (!isExternal(link)) return;
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
    link.addEventListener('focus', function (e) {
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
});


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



// -------- MAIN INIT --------
document.addEventListener("DOMContentLoaded", function() {
  setupTitleClicks();
  initSidebar();
  loadParticles(document.body.classList.contains("dark-mode") ? "dark" : "light");
  initImagePopups();
  initMap();
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
});


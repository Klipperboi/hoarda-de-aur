// =============================
// HOARDA DE AUR - FULL JS
// =============================

// -------- GLOBAL VARS --------
const SECTION_HIGHLIGHT_CLASS = "current-section-title";
let lastSavedSectionId = null;
let currentSectionId = null;
let observerPaused = false;
let videoId = null;

// MAP LOCATIONS
const locations = {
  prolog:       { coords: [46,     105], msg: "Prolog – 1206 - 1380, Mongolia" },
  kulikovo:     { coords: [54,      39], msg: "Kulikovo – 8 Septembrie, Rusia" },
  kalka:        { coords: [48,      37], msg: "Kalka - 31 Mai 1223, Ucraina" },
  tokhtamysh:   { coords: [46,      48], msg: "Tokhtamysh - 2 Ianuarie 1381, Astrakhan" },
  moscova:      { coords: [55,      37], msg: "Asediul - 23 August 1382, Moscova" },
  razboi:       { coords: [43,      45], msg: "Războiul - 1 Ianuarie 1386, Munții Caucaz" },
  kondurcha:    { coords: [54.5,   52.0], msg: "Kondurcha - 18 Iunie 1391, Rusia" },
  terek:        { coords: [43.5402, 45.1698], msg: "Terek - 15 Aprilie 1395, Caucaz" },
  vorskla:      { coords: [50,      35], msg: "Vorskla - 12 August 1399, Ucraina" },
  declin:       { coords: [60,     105], msg: "Declin - 1 Ianuarie 1406, Siberia" },
  dezintegrare: { coords: [46,      48], msg: "Dezintegrare - 1 Ianuarie 1419, Astrakhan" },
  lipnic:       { coords: [53,      17], msg: "Lipnic - 20 August 1470, Polonia" },
  sfarsit:      { coords: [54.6778, 36.2865], msg: "Sfârșit - 8 August 1480, Râul Ugra" },
  ultimul:      { coords: [54.8985, 23.9036], msg: "Ultimul Khan - 1 Ianuarie 1502, Kaunas" },
  principal:    { coords: [48,      42] },
  bibliografie: { coords: [44,      41] },
  note:         { coords: [44,      41] }
};
const mapFlyZoom = 6;
const mapFlyAnim = { animate: true, duration: 1.15, easeLinearity: 0.27 };
let map = null;
let mapMarkers = {};
let particlesVisible = true;

// -------- VIDEO TOGGLE & TRACKING --------

function initVideoToggle() {
  document.querySelectorAll(".toggleVideo").forEach(button => {
    button.addEventListener("click", function() {
      const videoContainer = this.nextElementSibling;
      if (!videoContainer) return;

      const video = videoContainer.querySelector("video");
      const isHidden = videoContainer.style.display === "none" || !videoContainer.style.display;

      if (isHidden) {
        videoContainer.style.display = "block";
        videoContainer.removeAttribute('inert');
        this.textContent = "Ascunde Video";
      } else {
        videoContainer.style.display = "none";
        videoContainer.setAttribute('inert', '');
        this.textContent = "Arată Video";
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      }
    });
  });
}

function initVideoIdStealOnPlay() {
  document.querySelectorAll('video').forEach(video => {
    video.addEventListener('play', function() {
      const section = video.closest('section');
      if (!section) return;
      videoId = section.id;
      lastSavedSectionId = section.id;
      updateStatsPanel();
    });
  });
}


/* SMART SMOOTH SCROLL JUMP */
function smartSmoothJumpToSection(targetId) {
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
        observerPaused = false;
        currentSectionId = targetId;
        highlightCurrentSectionTitle(currentSectionId);
        updateStatsPanel();
        updateActiveLink(currentSectionId);
        if (
          locations[currentSectionId] &&
          currentSectionId !== "bibliografie" &&
          currentSectionId !== "note"
        ) {
          map.flyTo(locations[currentSectionId].coords, mapFlyZoom, mapFlyAnim);
          mapMarkers[currentSectionId].openPopup();
        }
      }, 70);
    } else {
      if (!lastCheck) lastCheck = Date.now();
      if (Date.now() - lastCheck > 550) {
        window.removeEventListener('scroll', onScroll);
        observerPaused = false;
      }
    }
  }
  window.addEventListener('scroll', onScroll);
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
  document.querySelectorAll('.section-content').forEach(container => {
    if (container.querySelector('.drop-cap')) return;
    const paragraphs = container.querySelectorAll('p');
    let firstParagraph = null;
    for (const p of paragraphs) {
      if (p.textContent.trim().length > 0) {
        firstParagraph = p;
        break;
      }
    }
    if (!firstParagraph) return;
    function findFirstTextNode(node) {
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          if (child.textContent.trim().length > 0) return child;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const found = findFirstTextNode(child);
          if (found) return found;
        }
      }
      return null;
    }
    const textNode = findFirstTextNode(firstParagraph);
    if (!textNode) return;
    const text = textNode.textContent;
    const firstLetterIndex = text.search(/\S/);
    if (firstLetterIndex === -1) return;
    const before = text.slice(0, firstLetterIndex);
    const letter = text[firstLetterIndex];
    const after = text.slice(firstLetterIndex + 1);
    const span = document.createElement('span');
    span.className = 'drop-cap';
    span.textContent = letter;
    const parent = textNode.parentNode;
    const beforeNode = document.createTextNode(before);
    const afterNode = document.createTextNode(after);
    parent.replaceChild(afterNode, textNode);
    parent.insertBefore(span, afterNode);
    parent.insertBefore(beforeNode, span);
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
      smartSmoothJumpToSection(section.id);
      saveCurrentSectionAsLast(section.id);
      currentSectionId = section.id;
      highlightCurrentSectionTitle(section.id);
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
  images.forEach(img => {
    img.addEventListener("click", function() {
      popupImage.src = this.src;
      popup.style.display = "flex";
      document.body.style.overflow = "hidden";
    });
  });
  if (closePopup) {
    closePopup.addEventListener("click", function() {
      popup.style.display = "none";
      document.body.style.overflow = "auto";
    });
  }
  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
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

/* LEAFLET MAP (with TOC sync) */
function initMap() {
  map = L.map("map").setView([45.9432, 24.9668], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  mapMarkers = {};
  for (const key in locations) {
    if (locations.hasOwnProperty(key)) {
      const loc = locations[key];
      const marker = L.marker(loc.coords).addTo(map).bindPopup(loc.msg || "", { autoPan: false });
      mapMarkers[key] = marker;
    }
  }

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

  document.querySelectorAll(".dropdown-content a[data-loc]").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const locKey = this.dataset.loc;
      updateActiveLink(locKey);
      saveCurrentSectionAsLast(locKey);

      if (locKey === "acasa") {
        smartSmoothJumpToSection("acasa");
      } else if (locations[locKey]) {
        smartSmoothJumpToSection(locKey);
      }
    });
  });

  const observerOptions = { root: null, threshold: 0.5 };
  const observerCallback = (entries) => {
    if (observerPaused) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (locations[id] && id !== "bibliografie" && id !== "note") {
          map.flyTo(locations[id].coords, mapFlyZoom, mapFlyAnim);
          mapMarkers[id].openPopup();
        }
        updateActiveLink(id);
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
      initAllTooltips();
      setupTitleClicks();
      initImagePopups();
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

/* SECTION TRACKING (observer) */
function setupSectionTracking() {
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const observer = new IntersectionObserver((entries) => {
    if (observerPaused) return;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        currentSectionId = entry.target.id;
        updateStatsPanel();
        highlightCurrentSectionTitle(currentSectionId);
      }
    });
  }, { threshold: 0.5 });
  sections.forEach(section => observer.observe(section));
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
    if (window.scrollY < 5 || currentSectionId === 'acasa') {
      saveCurrentSectionAsLast('acasa');
      smartSmoothJumpToSection('acasa');
    } else {
      saveCurrentSectionAsLast(currentSectionId);
      smartSmoothJumpToSection('acasa');
    }
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
    statsDiv.style.pointerEvents = "none";
    statsDiv.style.userSelect = "none";
    statsDiv.style.minWidth = "240px";
    statsDiv.innerHTML = `
      <div>Current section: <span id="stats-current">?</span></div>
      <div>Last saved: <span id="stats-last">?</span></div>
      <div>Display size: <span id="stats-display">?</span></div>
      <div>Dark mode: <span id="stats-darkmode">?</span></div>
      <div>Debug panel: <span id="stats-debugpanel">?</span></div>
      <div>Particles: <span id="stats-particles">?</span></div>
      <div>FAB Status: <span id="stats-fab">?</span></div>
      <div>Sidebar: <span id="stats-sidebar">?</span></div>
      <div>Video Behaviour: <span id="stats-video-behaviour">?</span></div>
      <div>Current video: <span id="stats-video-id">-</span></div>
    `;
    document.body.appendChild(statsDiv);
    window.addEventListener('resize', updateStatsPanel);
  }

  document.getElementById('stats-current').textContent = currentSectionId || "?";
  document.getElementById('stats-last').textContent = lastSavedSectionId || "-";
  document.getElementById('stats-display').textContent = `${window.innerWidth} × ${window.innerHeight}`;

  const isDark = document.body.classList.contains('dark-mode');
  document.getElementById('stats-darkmode').textContent = isDark ? "Enabled" : "Disabled";

  const debugPanelEnabled = localStorage.getItem('debugPanelEnabled') === 'true';
  document.getElementById('stats-debugpanel').textContent = debugPanelEnabled ? "Enabled" : "Disabled";

  document.getElementById('stats-particles').textContent = particlesVisible ? "Enabled" : "Disabled";

  // FAB Status
  const fabContainer = document.querySelector('.fab-container');
  const fabActive = fabContainer && fabContainer.classList.contains('active');
  document.getElementById('stats-fab').textContent = fabActive ? "Open" : "Closed";

  // Sidebar Status
  const sidebar = document.getElementById('sidebar');
  const sidebarOpen = sidebar && sidebar.classList.contains('open');
  document.getElementById('stats-sidebar').textContent = sidebarOpen ? "Open" : "Closed";

  // Video Behaviour Status
  const videoSelect = document.getElementById('videoPlaybackSelect');
  if (videoSelect) {
    const videoText = videoSelect.options[videoSelect.selectedIndex].text;
    document.getElementById('stats-video-behaviour').textContent = videoText;
  } else {
    document.getElementById('stats-video-behaviour').textContent = "-";
  }

  // Show/hide panel depending on Debug toggle
  statsDiv.style.display = debugPanelEnabled ? 'block' : 'none';

  document.getElementById('stats-video-id').textContent = videoId || "-";
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
  const savedTheme = localStorage.getItem('theme');
  themeToggle.checked = (savedTheme === 'dark');
  const savedDebug = localStorage.getItem('debugPanelEnabled') === 'true';
  debugToggle.checked = savedDebug;
  const savedParticles = localStorage.getItem('particlesEnabled');
  particlesToggle.checked = savedParticles !== 'false'; // default true

  if (themeToggle.checked) {
    document.body.classList.add('dark-mode');
    loadParticles('dark');
  } else {
    document.body.classList.remove('dark-mode');
    loadParticles('light');
  }
  if (!particlesToggle.checked) {
    const particlesContainer = document.getElementById("particles-js");
    if (particlesContainer) particlesContainer.innerHTML = "";
  }

  const statsDiv = document.getElementById('section-stats-indicator');
  if (statsDiv) {
    statsDiv.style.display = debugToggle.checked ? 'block' : 'none';
  }

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



// -------- MAIN INIT --------
document.addEventListener("DOMContentLoaded", function() {
  setupTitleClicks();
  initSidebar();
  loadParticles(document.body.classList.contains("dark-mode") ? "dark" : "light");
  initImagePopups();
  initMap();
  initTextSections();
  initAllTooltips();
  initThemeToggle();
  initParticlesToggle();
  setupSectionTracking();
  initFab();
  updateStatsPanel();
  initVideoToggle();
  initVideoIdStealOnPlay();  // <-- this does the magic
  initSettingsPopup();
  initSettingsControls();
});


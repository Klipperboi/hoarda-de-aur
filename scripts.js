/* ============================
   CONSTANTS & REFERENCES
   ============================ */
const SECTION_HIGHLIGHT_CLASS = "current-section-title";
const FLAG_ACTIVE_CLASS = "active";
let lastSavedSectionId = null;
let currentSectionId = null;
let observerPaused = false;

/* ============================
   SIDEBAR & DROPDOWN MENU
   ============================ */
function initSidebar() {
  const sidebar = document.getElementById("sidebar");
  const sidebarToc = document.getElementById("sidebarToc");
  const tocDropdown = document.getElementById("tocDropdown");

  // Sidebar open/close (toggle .open class)
  function toggleSidebar() {
    sidebar.classList.toggle("open");
    // Hide TOC dropdown if closing sidebar
    if (!sidebar.classList.contains("open") && tocDropdown) {
      tocDropdown.style.display = "none";
    }
  }

  window.toggleSidebar = toggleSidebar;

  // TOC toggle inside sidebar
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

/* ============================
   PARTICULE (background)
   ============================ */
function loadParticles(mode) {
  const particlesJSBackground = document.getElementById("particles-js");
  if (!particlesJSBackground) return;
  particlesJSBackground.innerHTML = "";
  const lineColor = (mode === "dark") ? "#ffffff" : "#555";
  const config = {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: "#ed143d" },
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
}

/* ============================
   SECTION FLAGS (automatic)
   ============================ */
function setupSectionTitlesAndFlags() {
  document.querySelectorAll('.section-header.flag-float-header').forEach(header => {
    if (!header.querySelector('.section-link-flag')) {
      const flag = document.createElement('a');
      flag.className = 'section-link-flag';
      flag.setAttribute('href', '#');
      flag.setAttribute('tabindex', '0');
      flag.setAttribute('title', 'Salvează această secțiune');
      flag.innerHTML = '<span class="flag-icon" data-outline="⚐" data-filled="⚑">⚐</span>';
      header.insertBefore(flag, header.firstChild);
    }
  });
}

/* ============================
   FLAGS: Click/hover/tooltip
   ============================ */
function initFlagClickEvents() {
  document.querySelectorAll('.section-link-flag').forEach(flag => {
    const flagIcon = flag.querySelector('.flag-icon');
    flag.onmouseenter = () => flagIcon.textContent = flagIcon.getAttribute('data-filled');
    flag.onmouseleave = () => {
      if (flag.classList.contains(FLAG_ACTIVE_CLASS)) {
        flagIcon.textContent = flagIcon.getAttribute('data-filled');
      } else {
        flagIcon.textContent = flagIcon.getAttribute('data-outline');
      }
    };
    flag.onfocus = flag.onmouseenter;
    flag.onblur = flag.onmouseleave;
    flag.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      let section = flag.closest('section');
      if (section) saveCurrentSectionAsLast(section.id);
    };
  });
  document.querySelectorAll('.title-text').forEach(title => {
    title.onclick = (e) => {
      const section = title.closest('section');
      if (section) saveCurrentSectionAsLast(section.id);
    }
  });
}

function saveCurrentSectionAsLast(id = null) {
  lastSavedSectionId = id || currentSectionId;
  document.querySelectorAll('.section-link-flag').forEach(flag => {
    flag.classList.remove(FLAG_ACTIVE_CLASS);
    const icon = flag.querySelector('.flag-icon');
    if (icon) icon.textContent = icon.getAttribute('data-outline');
  });
  if (lastSavedSectionId) {
    const section = document.getElementById(lastSavedSectionId);
    if (section) {
      const flag = section.querySelector('.section-link-flag');
      const icon = flag ? flag.querySelector('.flag-icon') : null;
      if (flag) {
        flag.classList.add(FLAG_ACTIVE_CLASS);
        if (icon) icon.textContent = icon.getAttribute('data-filled');
        setTimeout(() => flag.classList.remove(FLAG_ACTIVE_CLASS), 700);
      }
    }
  }
  updateStatsPanel();
}

/* ============================
   Highlight current section title
   ============================ */
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

/* ============================
   IMAGE POPUPS
   ============================ */
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

/* ============================
   LEAFLET MAP (with TOC sync)
   ============================ */
function initMap() {
  // Map positions (edit as needed)
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
    // bibliografie: { coords: [44,      41] },
    // note:         { coords: [44,      41] }
  };

  // You can make these configurable
  const mapFlyZoom = 6;
  const mapFlyAnim = { animate: true, duration: 1.15, easeLinearity: 0.27 };

  const map = L.map("map").setView([45.9432, 24.9668], 4);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  const mapMarkers = {};
  for (const key in locations) {
    if (locations.hasOwnProperty(key)) {
      const loc = locations[key];
      const marker = L.marker(loc.coords).addTo(map).bindPopup(loc.msg || "");
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

  document.querySelectorAll(".dropdown-content a[data-loc]").forEach(link => {
    link.addEventListener("click", function(e) {
      e.preventDefault();
      const locKey = this.dataset.loc;
      updateActiveLink(locKey);
      saveCurrentSectionAsLast(locKey); // <--- Save last

      if (locKey === "acasa") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (locations[locKey]) {
        map.flyTo(locations[locKey].coords, mapFlyZoom, mapFlyAnim);
        mapMarkers[locKey].openPopup();
        const section = document.getElementById(locKey);
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Observer: auto-fly when visible
  const observerOptions = { root: null, threshold: 0.5 };
  const observerCallback = (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        if (locations[id]) {
          map.flyTo(locations[id].coords, mapFlyZoom, mapFlyAnim);
          mapMarkers[id].openPopup();
          updateActiveLink(id);
        } else {
          updateActiveLink("");
        }
      }
    });
  };
  document.querySelectorAll("section[id]").forEach(section => {
    const obs = new IntersectionObserver(observerCallback, observerOptions);
    obs.observe(section);
  });
  window._leafletMap = map;
}

/* ============================
   TEXT PRINCIPAL din text.txt
   ============================ */
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
              container.innerHTML = content;
            }
          }
        }
      }
      initAllTooltips();
      setupSectionTitlesAndFlags();
      initFlagClickEvents();
    })
    .catch(error => console.error("Eroare la procesarea text.txt:", error));
}

/* ============================
   NOTE TOOLTIP
   ============================ */
function initAllTooltips() {
  const tooltipDiv = document.getElementById("note-tooltip");
  if (!tooltipDiv) return;

  document.querySelectorAll('.note-ref, .title-text').forEach(el => {
    el.onmouseenter = el.onmousemove = el.onmouseleave = null;
  });

  // Notes
  document.querySelectorAll(".note-ref").forEach(ref => {
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
      observerPaused = true;
      setTimeout(() => {
        observerPaused = false;
        noteTarget.scrollIntoView({ behavior: "smooth" });
      }, 100);
    };
  });
  // Title tooltips
  document.querySelectorAll('.title-text').forEach(title => {
    title.onmouseenter = function() {
      tooltipDiv.textContent = "Salvează această secțiune";
      tooltipDiv.style.opacity = "1";
    };
    title.onmousemove = function(e) {
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
    title.onmouseleave = function() {
      tooltipDiv.style.opacity = "0";
    };
  });
}

/* ============================
   THEME TOGGLE (dark/light)
   ============================ */
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
    });
  }
}

/* ============================
   SECTION TRACKING (observer)
   ============================ */
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

/* ============================
   FAB BUTTONS (floating actions)
   ============================ */
function initFab() {
  const fabMain = document.getElementById('fabMain');
  const fabContainer = document.querySelector('.fab-container');
  const fabActions = document.querySelectorAll('.fab-action');
  const fabTop = document.getElementById('fabTop');
  const fabLast = document.getElementById('fabLast');
  const fabMeniu = document.getElementById('fabMeniu');
  const AUTO_CLOSE_FAB = false;

  fabMain.addEventListener('click', function(e) {
    e.stopPropagation();
    fabContainer.classList.toggle('active');
  });

  if (AUTO_CLOSE_FAB) {
    document.addEventListener('click', function(e) {
      if (!fabContainer.contains(e.target)) {
        fabContainer.classList.remove('active');
      }
    });
    fabActions.forEach(btn => {
      btn.addEventListener('click', () => {
        fabContainer.classList.remove('active');
      });
    });
  }

  fabTop.addEventListener('click', () => {
    if (window.scrollY < 5 || currentSectionId === 'acasa') {
      saveCurrentSectionAsLast('acasa');
    } else {
      saveCurrentSectionAsLast(currentSectionId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  fabLast.addEventListener('click', () => {
    if (lastSavedSectionId) {
      const lastSection = document.getElementById(lastSavedSectionId);
      if (lastSection) {
        lastSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  fabMeniu && fabMeniu.addEventListener('click', function(event) {
    event.stopPropagation();
    window.toggleSidebar && window.toggleSidebar();
  });
}

/* ============================
   PANEL STATS (top right)
   ============================ */
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
    statsDiv.style.fontSize = "15px";
    statsDiv.style.zIndex = "3002";
    statsDiv.style.opacity = "0.82";
    statsDiv.style.pointerEvents = "none";
    statsDiv.style.userSelect = "none";
    statsDiv.innerHTML = `
      <div>Current section: <span id="stats-current">?</span></div>
      <div>Last saved: <span id="stats-last">?</span></div>
    `;
    document.body.appendChild(statsDiv);
  }
  document.getElementById('stats-current').textContent = currentSectionId || "?";
  document.getElementById('stats-last').textContent = lastSavedSectionId || "-";
}

/* ============================
   VIDEO TOGGLE
   ============================ */
function initVideoToggle() {
  document.querySelectorAll(".toggleVideo").forEach(button => {
    button.addEventListener("click", function() {
      const videoContainer = this.nextElementSibling;
      if (!videoContainer) return;
      if (!videoContainer.style.display || videoContainer.style.display === "none") {
        videoContainer.style.display = "block";
        this.textContent = "Ascunde Video";
      } else {
        videoContainer.style.display = "none";
        this.textContent = "Arată Video";
      }
    });
  });
}

/* ============================
   INIT GLOBAL
   ============================ */
document.addEventListener("DOMContentLoaded", function() {
  setupSectionTitlesAndFlags();
  initFlagClickEvents();
  highlightCurrentSectionTitle(); // initially none
  initSidebar();
  loadParticles("light");
  initImagePopups();
  initMap();
  initTextSections();
  initAllTooltips();
  initThemeToggle();
  setupSectionTracking();
  initFab();
  updateStatsPanel();
  initVideoToggle();
  initAllTooltips();
});

document.addEventListener("DOMContentLoaded", function() {
  // Referințe DOM
  const particlesJSBackground = document.getElementById("particles-js");
  const sidebar = document.getElementById("sidebar");
  const modeToggle = document.getElementById("modeToggle");
  const toggleMapBtn = document.getElementById("toggleMap");
  const menuToggle = document.getElementById("menuToggle");
  const popup = document.getElementById("imagePopup");
  const popupImage = document.getElementById("popupImage");
  const closePopup = document.getElementById("closePopup");

  let isSidebarOpen = false;

  // Definirea locațiilor pentru secțiuni
  const locations = {
    prolog:       { coords: [46,     105], msg: "Prolog – 1206 - 1380, Mongolia" },
    kulikovo:     { coords: [54,      39], msg: "Kulikovo – 8 Septembrie, Rusia" },
    kalka:        { coords: [48,      37], msg: "Kalka - 31 Mai 1223, Ucraina" },
    tokhtamysh:   { coords: [46,      48], msg: "Tokhtamysh - 2 Ianuarie 1381, Astrakhan" },
    moscova:      { coords: [55,      37], msg: "Asediul - 23 August 1382, Moscova" },
    razboi:       { coords: [43,      45], msg: "Războiul - 1 Ianuarie 1386, M-ții Caucaz" },
    kondurcha:    { coords: [54.5,   52.0], msg: "Kondurcha - 18 Iunie 1391, Rusia" },
    terek:        { coords: [43.5402, 45.1698], msg: "Terek - 15 Aprilie 1395, Caucaz" },
    vorskla:      { coords: [50,      35], msg: "Vorskla - 12 August 1399, Ucraina" },
    declin:       { coords: [60,     105], msg: "Declin - 1 Ianuarie 1406, Siberia" },
    dezintegrare: { coords: [46,      48], msg: "Dezintegrare - 1 Ianuarie 1419, Astrakhan" },
    lipnic:       { coords: [53,      17], msg: "Lipnic - 20 August 1469, Polonia" },
    sfarsit:      { coords: [54.6778, 36.2865], msg: "Sfârșit - 8 August 1480, Râul Ugra" },
    ultimul:      { coords: [54.8985, 23.9036], msg: "Ultimul Khan - 1 Ianuarie 1502, Kaunas" },
    principal:    { coords: [48,      42] },
    bibliografie: { coords: [44,      41] }
  };

  /* ============================
       Funcții modulare
  ============================ */

  // Gestionarea meniului lateral
  function initSidebar() {
    menuToggle.addEventListener("click", function(event) {
      event.stopPropagation();
      isSidebarOpen = !isSidebarOpen;
      if (sidebar) {
        sidebar.style.width = isSidebarOpen ? "250px" : "0";
        sidebar.style.paddingTop = isSidebarOpen ? "20px" : "0";
      }
    });

    const dropbtn = document.querySelector(".dropbtn");
    const dropdownContent = document.querySelector(".dropdown-content");
    if (dropbtn && dropdownContent) {
      dropbtn.addEventListener("click", function(event) {
        event.stopPropagation();
        dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
      });
    }
  }

  // Încărcare particule (light/dark)
  function loadParticles(mode) {
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

  // Popup pentru imagini
  function initImagePopups() {
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

  // Inițializare harta Leaflet
  function initMap() {
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

        if (locKey === "acasa") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (locations[locKey]) {
          map.setView(locations[locKey].coords, 6);
          mapMarkers[locKey].openPopup();
          const section = document.getElementById(locKey);
          if (section) {
            section.scrollIntoView({ behavior: "smooth" });
          }
        }
      });
    });

    const observerOptions = { root: null, threshold: 0.5 };
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (locations[id]) {
            map.setView(locations[id].coords, 6);
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

    toggleMapBtn.addEventListener("click", () => {
      const mapContainer = document.getElementById("map");
      if (!mapContainer.style.display || mapContainer.style.display === "none") {
        mapContainer.style.display = "block";
        setTimeout(() => map.invalidateSize(), 100);
      } else {
        mapContainer.style.display = "none";
      }
    });
  }

  // Încărcare secțiuni din text.txt și injectare
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
          const sectionElement = document.getElementById(sectionId);
          if (sectionElement) {
            let contentElement = sectionElement.querySelector(".section-content p");
            if (!contentElement) contentElement = sectionElement;
            contentElement.innerHTML = content;
          }
        }

        // După ce am injectat toate <li id="note-X">…, putem inițializa tooltips
        initNoteTooltips();
      })
      .catch(error => console.error("Eroare la procesarea text.txt:", error));
  }

  // Inițializează tooltips pentru referințele de notă
  function initNoteTooltips() {
    const tooltipDiv = document.getElementById("note-tooltip");
    if (!tooltipDiv) return;

    // Ascunde inițial
    tooltipDiv.style.opacity = "0";

    document.querySelectorAll(".note-ref").forEach(ref => {
      const noteNum = ref.dataset.note;
      const noteTarget = document.getElementById(`note-${noteNum}`);
      if (!noteTarget) return;

      // Când intri cu mouse-ul pe .note-ref
      ref.addEventListener("mouseenter", e => {
        const noteText = noteTarget.textContent.trim();
        tooltipDiv.textContent = noteText;
        tooltipDiv.style.opacity = "1";
      });

      // Reconfortează poziția tooltip-ului urmând cursorul
      ref.addEventListener("mousemove", e => {
        const padding = 8; // mic spațiu față de cursor
        let x = e.pageX + padding;
        let y = e.pageY - tooltipDiv.offsetHeight - padding;

        // Dacă s-ar depăși marginea dreaptă a ferestrei
        if (x + tooltipDiv.offsetWidth > window.scrollX + window.innerWidth) {
          x = window.scrollX + window.innerWidth - tooltipDiv.offsetWidth - padding;
        }
        // Dacă s-ar depăși marginea de sus, afișează dedesubt
        if (y < window.scrollY) {
          y = e.pageY + padding;
        }

        tooltipDiv.style.left = x + "px";
        tooltipDiv.style.top = y + "px";
      });

      // Când ieși cu mouse-ul din .note-ref
      ref.addEventListener("mouseleave", () => {
        tooltipDiv.style.opacity = "0";
      });
    });
  }

  /* ===============================
       Inițializări la încărcare
  =============================== */
  initSidebar();
  loadParticles("light");
  particlesJSBackground.style.backgroundColor = "#f4f4f4";
  initImagePopups();
  initMap();
  initTextSections();

  // Modul salvarea preferinței theme (light/dark) în localStorage
  const savedMode = localStorage.getItem("theme");
  if (savedMode === "dark") {
    document.body.classList.add("dark-mode");
    particlesJSBackground.style.backgroundColor = "#333";
    loadParticles("dark");
  } else {
    document.body.classList.remove("dark-mode");
    particlesJSBackground.style.backgroundColor = "#f4f4f4";
    loadParticles("light");
  }

  if (modeToggle) {
    modeToggle.addEventListener("click", function() {
      const isDark = document.body.classList.toggle("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      particlesJSBackground.style.backgroundColor = isDark ? "#333" : "#f4f4f4";
      loadParticles(isDark ? "dark" : "light");
    });
  }

  // Toggle pentru videoclipuri
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
});

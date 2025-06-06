document.addEventListener('DOMContentLoaded', function() {
  const particlesJSBackground = document.getElementById('particles-js');
  const sidebar = document.getElementById('sidebar');
  const modeToggle = document.getElementById('modeToggle');
  const toggleMapBtn = document.getElementById('toggleMap');
  const menuToggle = document.getElementById('menuToggle');
  const popup = document.getElementById('imagePopup');
  const popupImage = document.getElementById('popupImage');
  const closePopup = document.getElementById('closePopup');
  const tooltip = document.createElement('div');
  tooltip.id = "note-tooltip";
  document.body.appendChild(tooltip);

  let isSidebarOpen = false;

  var locations = {
    prolog: { coords: [46, 105], msg: "Prolog – 1206 - 1380, Mongolia" },
    kulikovo: { coords: [54, 39], msg: "Kulikovo – 8 Septembrie, Rusia" },
    kalka: { coords: [48, 37], msg: "Kalka - 31 Mai 1223, Ucraina" },
    tokhtamysh: { coords: [46, 48], msg: "Tokhtamysh - 2 Ianuarie 1381, Astrakhan" },
    moscova: { coords: [55, 37], msg: "Asediul - 23 August 1382, Moscova" },
    razboi: { coords: [43, 45], msg: "Războiul - 1 Ianuarie 1386, M-ții Caucaz" },
    kondurcha: { coords: [54.5, 52.0], msg: "Kondurcha - 18 Iunie 1391, Rusia" },
    terek: { coords: [43.5402, 45.1698], msg: "Terek - 15 Aprilie 1395, Caucaz" },
    vorskla: { coords: [50, 35], msg: "Vorskla - 12 August 1399, Ucraina" },
    declin: { coords: [60, 105], msg: "Declin - 1 Ianuarie 1406, Siberia" },
    dezintegrare: { coords: [46, 48], msg: "Dezintegrare - 1 Ianuarie 1419, Astrakhan" },
    lipnic: { coords: [53, 17], msg: "Lipnic - 20 August 1469, Polonia" },
    sfarsit: { coords: [54.6778, 36.2865], msg: "Sfârșit - 8 August 1480, Râul Ugra" },
    ultimul: { coords: [54.8985, 23.9036], msg: "Ultimul Khan - 1 Ianuarie 1502, Kaunas" },
    principal: { coords: [48, 42] },
    bibliografie: { coords: [44, 41] }
  };

  function initSidebar() {
    menuToggle.addEventListener('click', function(event) {
      event.stopPropagation();
      isSidebarOpen = !isSidebarOpen;
      if (sidebar) {
        sidebar.style.width = isSidebarOpen ? '250px' : '0';
        sidebar.style.paddingTop = isSidebarOpen ? '20px' : '0';
      }
    });

    const dropbtn = document.querySelector('.dropbtn');
    const dropdownContent = document.querySelector('.dropdown-content');
    if (dropbtn && dropdownContent) {
      dropbtn.addEventListener('click', function(event) {
        event.stopPropagation();
        dropdownContent.style.display = dropdownContent.style.display === "block" ? "none" : "block";
      });
    }
  }

  function loadParticles(mode) {
    particlesJSBackground.innerHTML = "";
    const lineColor = (mode === 'dark') ? '#ffffff' : '#555';
    const config = {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: '#ed143d' },
        shape: { type: 'circle', stroke: { width: 0, color: '#000000' } },
        opacity: { value: 0.5 },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: lineColor, opacity: 0.4, width: 1 },
        move: { enable: true, speed: 2 }
      },
      interactivity: {
        detect_on: 'canvas',
        events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' } },
        modes: { repulse: { distance: 50 }, push: { particles_nb: 4 } }
      },
      retina_detect: true
    };
    particlesJS('particles-js', config);
  }

  function initImagePopups() {
    const images = document.querySelectorAll('img.popup-enabled');
    images.forEach(img => {
      img.addEventListener('click', function() {
        popupImage.src = this.src;
        popup.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      });
    });

    if (closePopup) {
      closePopup.addEventListener('click', () => popup.style.display = 'none');
    }
  }

  function initMap() {
    var map = L.map('map').setView([45.9432, 24.9668], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(map);

    var mapMarkers = {};
    for (var key in locations) {
      var loc = locations[key];
      var marker = L.marker(loc.coords).addTo(map).bindPopup(loc.msg);
      mapMarkers[key] = marker;
    }

    document.querySelectorAll('.dropdown-content a[data-loc]').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var locKey = this.dataset.loc;
        if (locations[locKey]) {
          map.setView(locations[locKey].coords, 6);
          mapMarkers[locKey].openPopup();
          document.getElementById(locKey)?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });

    toggleMapBtn.addEventListener('click', () => {
      const mapContainer = document.getElementById('map');
      mapContainer.style.display = (mapContainer.style.display === "block") ? "none" : "block";
      if (mapContainer.style.display === "block") setTimeout(() => map.invalidateSize(), 100);
    });
  }

  function initTextSections() {
    fetch('text.txt')
      .then(response => {
        if (!response.ok) throw new Error(`Eroare: ${response.status}`);
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
            let contentElement = sectionElement.querySelector('.section-content p') || sectionElement;
            contentElement.innerHTML = content;
          }
        }

        // TOOLTIP ONLY
        const tooltipBox = document.getElementById("note-tooltip");
        document.querySelectorAll('.note-ref').forEach(ref => {
          const noteNumber = ref.dataset.note;
          const noteEntry = document.getElementById(`note-${noteNumber}`);
          if (!noteEntry) return;

          const noteText = noteEntry.textContent;

          ref.addEventListener("mouseover", () => {
            tooltipBox.textContent = noteText;
            tooltipBox.style.opacity = "1";
          });

          ref.addEventListener("mousemove", (e) => {
            tooltipBox.style.top = `${e.pageY + 15}px`;
            tooltipBox.style.left = `${e.pageX + 15}px`;
          });

          ref.addEventListener("mouseout", () => {
            tooltipBox.style.opacity = "0";
          });
        });
      })
      .catch(err => console.error("Eroare text.txt:", err));
  }

  initSidebar();
  loadParticles('light');
  particlesJSBackground.style.backgroundColor = '#f4f4f4';
  initImagePopups();
  initMap();
  initTextSections();

  const savedMode = localStorage.getItem('theme');
  if (savedMode === 'dark') {
    document.body.classList.add('dark-mode');
    particlesJSBackground.style.backgroundColor = '#333';
    loadParticles('dark');
  }

  if (modeToggle) {
    modeToggle.addEventListener('click', function () {
      const isDark = document.body.classList.toggle('dark-mode');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      particlesJSBackground.style.backgroundColor = isDark ? '#333' : '#f4f4f4';
      loadParticles(isDark ? 'dark' : 'light');
    });
  }

  document.querySelectorAll('.toggleVideo').forEach(button => {
    button.addEventListener('click', function() {
      var videoContainer = this.nextElementSibling;
      videoContainer.style.display = (videoContainer.style.display === "block") ? "none" : "block";
      this.textContent = (videoContainer.style.display === "block") ? "Ascunde Video" : "Arată Video";
    });
  });
});

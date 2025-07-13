# Hoarda de Aur

Acesta este un proiect web dedicat prezentării istoriei Hoardei de Aur. Site-ul este construit folosind HTML, CSS și JavaScript și include mai multe secțiuni istorice, videoclipuri integrate, hărți interactive și un sistem de navigare cu sidebar.

Testați direct accesând linkul sau scanând codul QR de mai jos:

<img src="assets/qr.png" alt="QR code" width="180">

https://klipperboi.github.io/hoarda-de-aur

---

## Caracteristici

- Suport multilingv (română, engleză, germană)
- Secțiuni tematice și cronologie completă, conținut text dinamic
- Hartă interactivă (Leaflet) cu marcaje și popup-uri traduse
- Galerie de imagini cu popup și descrieri
- Chestionar interactiv cu feedback instant, scor live și tipuri variate de întrebări
- Navigare rapidă: sidebar, dropdown, butoane rapide (FAB)
- Mod întunecat, contrast ridicat, fonturi pentru dislexie/lizibilitate, setări salvate local
- Control video avansat: Picture-in-Picture, play/pause în fundal, link sursă extern
- Efect de particule (opțional, performant inclusiv pe mobil)
- Bară progres, stats panel și dev tools
- Tooltip la hover pe note și pe linkuri externe
- Fără backend sau baze de date, doar fișiere statice

---

## Cum poate fi accesat

- Gratuit, online, pe [GitHub Pages](https://klipperboi.github.io/hoarda-de-aur/)
- Sau local, deschizând direct `index.html`  
  (ideal cu un server local:  
  `python3 -m http.server`  
  apoi deschizi `http://localhost:8000` în browser)

---

## Changelog

**2.0.3**
    - Reparat scroll-ul și focusul la quiz pe ecrane mici.
    - Tooltip-urile la notițe și linkuri externe mai reactive și stabile.
    - Corectat traduceri lipsă la schimbarea limbii.
    - *Shameful fix*: am uitat o clasă CSS, prinsă abia după prezentare.

**2.0.0**
    - Suport complet multilingv pentru întregul site (română, engleză, germană).
    - Chestionar rescris cu feedback instant, scor live, toate tipurile de întrebări.
    - Font dislexic, mod contrast, panou de statistici, salvare automată a setărilor.
    - *Shameful fix*: am lăsat un string hardcodat la quiz, corectat pe fugă.

**1.9.0**
    - Recomandări extinse: cărți, filme, podcasturi, citate, personalități.
    - Galerie cu descrieri și titluri, navigare mai rapidă.

**1.8.0**
    - Temă light/dark/contrast, comutabilă instant.
    - Schimbare rapidă de font (standard, lizibil, dislexic), meniu setări reorganizat.

**1.7.0**
    - Control video avansat: PiP, pauză automată, play în fundal, link YouTube.
    - *Shameful fix*: bug la Picture-in-Picture pe Chrome Mobile.

**1.6.0**
    - Scroll și highlight automat pe secțiuni, drop cap la început de text.
    - Galerie și popup-uri imagini optimizate.

**1.5.0**
    - Hartă interactivă cu pinuri custom și popup-uri traduse, refresh rapid pe mobil/desktop.

**1.4.0**
    - Panel dev: “stats for nerds”, debugging rapid, vizualizare live a setărilor.

**1.3.0**
    - Sidebar și meniu responsive, hover open pe desktop, modal setări pentru mobil.

**1.2.0**
    - Stiluri avansate la butoane și titluri, scrollbar custom, popup la notițe.

**1.1.0**
    - Scroll pe secțiuni, salvare poziție, meniu acțiuni rapide (FAB), bară progres.

**1.0.0 – Faza Județeană**  
Prima versiune stabilă, folosită la faza județeană.

Caracteristici:
- Secțiuni text dinamice (`text.txt`)
- Video toggle embed YouTube
- Hărți interactive (Leaflet)
- Efect de particule (`particles.js`)
- Mod light/dark manual
- Sidebar cu cuprins

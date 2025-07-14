# Hoarda de Aur

*Hoarda de Aur* este o aplicație web interactivă, construită cu HTML, CSS și JavaScript, ce prezintă istoria Hoardei de Aur printr-o interfață modulară și responsivă. Platforma oferă secțiuni dinamice cu încărcare multi-lingvă, navigare avansată (sidebar/cuprins), hărți interactive sincronizate cu conținutul, integrare video YouTube, efecte vizuale personalizabile (inclusiv particule și mod întunecat/luminos), suport pentru fonturi accesibile și un sistem de setări adaptiv pentru desktop și mobil. Toate funcționalitățile sunt gestionate client-side, cu sincronizare automată între secțiuni, hartă și progres, și extensibilitate pentru viitoare module interactive (quiz, galerie, etc.).

---

Testați direct accesând linkul sau scanând codul QR de mai jos:  

<a href="https://klipperboi.github.io/hoarda-de-aur/"><img src="assets/qr.png" alt="QR code" width="180"></a>  
[https://klipperboi.github.io/hoarda-de-aur](https://klipperboi.github.io/hoarda-de-aur)

---

## Caracteristici

**Text și Conținut**
- suport multilingv (română, engleză, germană)
- text încărcat dinamic pentru fiecare secțiune
- note de subsol, bibliografie și recomandări
- secțiuni istorice și chestionar interactiv

**Interfață (UI)**
- design responsiv, optimizat pentru desktop și mobil
- mod luminos și întunecat, cu contrast ridicat, accent specific modului
- fonturi speciale, pentru dislexie sau mod lizibil
- meniu structurat special pentru desktop și mobil (meniu lateral vs meniu sus)
- galerie de imagini

**Experiență (UX) și Navigare**
- navigare rapidă prin meniu/cuprins, salturi animate între secțiuni
- hartă interactivă, sincronizată cu secțiunile
- efect vizual de progres la scroll & înaintare în pagină
- tooltips (sfaturi) pentru note și linkuri externe
- panou de setări pentru personalizare design și experiență

**Tehnologii și Funcții speciale**
- hărți interactive (Leaflet) cu marcatori custom
- integrare videoclipuri YouTube prin embed și funcții personalizabile (redare, oprire sau PiP la scroll)
- efect de particule animat cu `particles.js` (opțional, adaptat modurilor selectate; specific modului desktop)
- sincronizare automată între secțiunea activă, hartă, meniu/cuprins și progres în pagină
- chestionar interactiv

## Versiuni principale (Stable releases)

- **2.1.0** — Chestionar interactiv
- **2.0.0** — Suport multilingv (română/engleză/germană)
- **1.7.0** — Mod dislexie & contrast ridicat
- **1.6.0** — Meniu și container responsiv (desktop & mobil)
- **1.5.0** — Recomandări & galerie imagini
- **1.4.0** — Control avansat video (scroll, PiP, fundal)
- **1.3.0** — Pop-up setări, sistem hartă refăcut
- **1.2.0** — Meniu acțiuni rapide (FAB)
- **1.1.0** — Statistici, tooltips pentru note
- **1.0.0** — Faza Județeană (prima versiune stabilă)

## Changelog

**2.1.0 - Chestionar Interactiv**
- adăugare chestionar

**2.0.0 - Suport Multilingv**
- suport multi-lingvistic
- rescriere text

**1.7.3**
- implementare meniu specific mobil & funcții
- reiterare funcții butoane dispozitiv mobil

**1.7.2**
- actualizare design mobil/desktop

**1.7.1**
- footer (subsol)
- actualizare mod întunecat (contrast)
- actualizare mod contrast

**1.7.0 - Mod dislexie (font și contrast ridicat - feedback de la persoane dislexice)**
- implementare logică oprire comportament video la oprire video
- stiluri text
  - standard
  - lizibil
  - dislexic
- sistem high contrast & features

**1.6.3**
- salvare setări utilizator
  - buton restaurare setări implicite
- sidebar (meniu) actualizat
  - deschis la intrarea pe pagină
  - setare pentru status
  - reformatare stil închidere
  - deschidere la hover
- reimplementare logică comportament video

**1.6.2**
- buton refresh hartă
- pin custom
- redefinire frame video (mobil)

**1.6.1**
- implementare sistem locație -> secțiune
- stilizare, formatare și tooltip la hyperlink (linkuri externe)
- scrollbar custom

**1.6.0 - Meniu și container responsiv**
- reiterare logică scroll & schimbare secțiuni
- rescriere logică popups imagini, fără overflow
- sidebar & container scalabile
- tip device în funcție de dimensiune display (px)
- modal setări adaptat pentru ecran telefon
- sidebar adaptat pentru ecran telefon

**1.5.0 - Recomandări și Galerie**
- secțiuni noi, funcții implementate
  - recomandări
    - cărți
    - filme
    - podcasturi/videoclipuri
    - articole
    - citate
    - personalități
  - galerie imagini

**1.4.0 - Control avansat video**
- rescriere embed video, mp4 (files.garden) vs youtube
- funcții comportament video
- comportament video
    - stop la scroll
    - PiP (Picture in Picture) la scroll
    - rulează în fundal
- dev tools

**1.3.1**
- actualizare debug panel
- actualizare palete de culori
- frame pentru video
- restructurare meniu setări
    - organizare în coloane

**1.3.0 - Pop-up setări, sistem hartă**
- hyperlink titlu secțiune
- distanță titlu - top bar
- pop-up setări - stil, highlight
    - mod
    - debug panel
    - particule
- refacere sistem hartă
- highlight litere secțiune text

**1.2.2**
- stil diferit mod luminos/întunecat
- bară progres
- refacere sistem particule + canvas

**1.2.1**
- refacere stocare poziție în pagină
- "stats for nerds"
- editare meniu
- refacere sistem highlight & setare start și destinație la click
- reimplementare & cizelare hartă:
  - tranziție între poziții
  - repoziționare în meniu

**1.2.0 - Meniu acțiuni rapide (FAB)**
- formatare butoane
- formatare text (font, culoare, stil)
- stocare poziție în pagină & buton întoarcere la ultima secțiune
- meniu acțiuni rapide (FAB - Floating Action Buttons)

**1.1.0 - Statistici și tooltips (sfaturi)**
- păstrare mod + progres în pagină (status utilizator)
- adăugare "tooltip" și trimitere la secțiunea "Note" la hover resp. click pe note

**1.0.0 – Faza Județeană**  
Prima versiune stabilă, folosită la faza județeană.

Caracteristici:
- Secțiuni text dinamice (`text.txt`)
- Video toggle embed YouTube
- Hărți interactive (Leaflet)
- Efect de particule (`particles.js`)
- Mod light/dark manual
- Sidebar cu cuprins

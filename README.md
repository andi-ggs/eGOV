# eGOV - Proiecte Formulare Electronice

Repository care conține proiecte pentru sistemul de formulare electronice pentru guvernare electronică.

## 📁 Structura Repository-ului

```
eGOV/
├── HW1/                        # Proiect inițial - Formular Electronic
│   ├── index.html              # Formularul principal
│   ├── admin.html              # Panou administrare
│   ├── status.html             # Verificare status
│   ├── script.js               # Logica JavaScript
│   ├── styles.css              # Stiluri CSS
│   ├── server-simple.js        # Server Node.js
│   ├── package.json            # Configurare dependențe
│   ├── forms-data.json         # Date formulare (JSON)
│   └── README.md               # Documentație HW1
│
└── electronic-forms-system/    # Proiect complet - Sistem Formulare cu Raportare
    ├── index.html              # Formularul principal
    ├── admin.html              # Panou administrare
    ├── status.html             # Verificare status
    ├── report.html             # Pagină raportare analitică
    ├── report.js               # Logica raportării
    ├── report-styles.css       # Stiluri pentru raport
    ├── script.js                # Logica JavaScript
    ├── styles.css               # Stiluri CSS
    ├── server-simple.js         # Server Node.js (unificat)
    ├── package.json             # Configurare dependențe
    ├── forms-data.json          # Date formulare (JSON)
    ├── uploads/                # Fișiere atașate
    └── README.md                # Documentație proiect
```

## 🚀 Proiecte Disponibile

### HW1 - Formular Electronic de Bază
Sistem de bază pentru completarea și trimiterea formularelor electronice.

**Funcționalități:**
- ✅ Calculare automată TVA și impozite
- ✅ Generare PDF și XML
- ✅ Validare în timp real
- ✅ Upload fișiere atașate
- ✅ Panou administrare
- ✅ Verificare status formulare

**Instalare și rulare:**
```bash
cd HW1
npm install
node server-simple.js
```

**Accesare:**
- Formular: http://localhost:3000
- Admin: http://localhost:3000/admin
- Status: http://localhost:3000/status

---

### electronic-forms-system - Sistem Complet cu Raportare
Sistem complet care include toate funcționalitățile din HW1 plus raportare analitică automată.

**Funcționalități:**
- ✅ Toate funcționalitățile din HW1
- ✅ Raportare analitică automată
- ✅ Grafice interactive (Chart.js)
- ✅ Analiză după scopul plății
- ✅ Analiză după monedă
- ✅ Analiză după cota TVA
- ✅ Filtrare rapoarte după dată
- ✅ Export raport în PDF
- ✅ Statistici generale

**Instalare și rulare:**
```bash
cd electronic-forms-system
npm install
node server-simple.js
```

**Accesare:**
- Formular: http://localhost:3000
- Admin: http://localhost:3000/admin
- Status: http://localhost:3000/status
- **Raport: http://localhost:3000/report** ⭐

## 📊 Raportare Analitică

Sistemul `electronic-forms-system` include un modul de raportare care generează automat:

1. **Statistici Generale**
   - Total formulare
   - Suma totală
   - Suma medie
   - Interval de date

2. **Analiza după Scopul Plății**
   - Distribuție procentuală
   - Grafic doughnut
   - Tabel detaliat

3. **Analiza după Monedă**
   - Distribuție pe monede
   - Grafic bar chart
   - Sume totale per monedă

4. **Analiza după Cota TVA**
   - Distribuție pe cote TVA
   - Grafic pie chart
   - Procentaje

5. **Filtrare după Dată**
   - Filtrare perioadă specifică
   - Analize personalizate

## 🛠️ Tehnologii Utilizate

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Vizualizare Date:** Chart.js, Chart.js DataLabels Plugin
- **PDF:** jsPDF, jspdf-autotable
- **XML:** xmlbuilder
- **Storage:** JSON (forms-data.json)

## 📝 Note

- Fiecare proiect are propriul `package.json` și `node_modules`
- Datele sunt stocate în `forms-data.json` (JSON format)
- Serverul rulează pe portul 3000 (implicit)
- Pentru a rula ambele proiecte simultan, folosiți porturi diferite

## 📄 Licență

Proiect academic pentru cursul de Guvernare Electronică.

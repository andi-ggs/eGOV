# eGOV - Proiecte Formulare Electronice

Repository care conține proiecte pentru sistemul de formulare electronice pentru guvernare electronică.

## 📁 Structura Repository-ului

```
eGOV/
├── .gitignore                 # Git ignore pentru repository root
├── README.md                  # Acest fișier
│
├── HW1/                       # Proiect inițial - Formular Electronic
│   ├── .env                   # Variabile de mediu (nu este versionat)
│   ├── index.html             # Formularul principal
│   ├── admin.html             # Panou administrare
│   ├── status.html            # Verificare status formular
│   ├── script.js              # Logica JavaScript pentru formular
│   ├── styles.css             # Stiluri CSS
│   ├── server-simple.js       # Server Node.js/Express
│   ├── install-simple.js     # Script de instalare/configurare
│   ├── package.json           # Configurare dependențe npm
│   ├── package-lock.json      # Lock file pentru dependențe
│   ├── forms-data.json        # Baza de date JSON (formulare salvate)
│   ├── README.md              # Documentație specifică HW1
│   └── node_modules/         # Dependențe npm (nu este versionat)
│
└── electronic-forms-system/  # Proiect complet - Sistem Formulare cu Raportare
    ├── .env                   # Variabile de mediu (nu este versionat)
    ├── .gitignore             # Git ignore specific proiectului
    ├── index.html             # Formularul principal
    ├── admin.html             # Panou administrare cu filtrare
    ├── status.html            # Verificare status formular
    ├── report.html            # Pagină raportare analitică
    ├── report.js              # Logica raportării și grafice
    ├── report-styles.css      # Stiluri pentru pagina de raport
    ├── script.js              # Logica JavaScript pentru formular
    ├── styles.css             # Stiluri CSS principale
    ├── server-simple.js       # Server Node.js/Express (unificat)
    ├── install-simple.js      # Script de instalare/configurare
    ├── package.json           # Configurare dependențe npm
    ├── package-lock.json      # Lock file pentru dependențe
    ├── forms-data.json        # Baza de date JSON (formulare salvate)
    ├── README.md              # Documentație specifică proiectului
    ├── uploads/               # Director pentru fișiere atașate
    └── node_modules/          # Dependențe npm (nu este versionat)
```

## 🚀 Proiecte Disponibile

### HW1 - Formular Electronic de Bază
Sistem de bază pentru completarea și trimiterea formularelor electronice.

**Funcționalități:**
- ✅ Calculare automată TVA și impozite
- ✅ Generare PDF și XML
- ✅ Validare în timp real
- ✅ Panou administrare
- ✅ Verificare status formulare
- ✅ Gestionare formulare (aprobare/respingere/procesare)

**Instalare și rulare:**
```bash
cd HW1
npm install
node server-simple.js
# sau
npm start
```

**Accesare:**
- **Formular**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Status**: http://localhost:3000/status

**API Endpoints:**
- `POST /api/submit-form` - Trimite formular nou
- `GET /api/forms` - Obține lista formularelor (cu filtrare și paginare)
- `GET /api/form-status/:reference` - Verifică status formular
- `PUT /api/forms/:id/status` - Actualizează status formular

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
- ✅ Upload fișiere atașate

**Instalare și rulare:**
```bash
cd electronic-forms-system
npm install
node server-simple.js
# sau
npm start
```

**Accesare:**
- **Formular**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Status**: http://localhost:3000/status
- **Raport**: http://localhost:3000/report ⭐

**API Endpoints:**
- Toate endpoint-urile din HW1
- `GET /api/report-data` - Obține date pentru raportare (cu filtrare după dată)
- `POST /api/generate-pdf-report` - Generează raport PDF

## 📊 Raportare Analitică

Sistemul `electronic-forms-system` include un modul de raportare care generează automat:

1. **Statistici Generale**
   - Total formulare
   - Suma totală
   - Suma medie
   - Interval de date

2. **Analiza după Scopul Plății**
   - Distribuție procentuală
   - Grafic doughnut chart
   - Tabel detaliat cu sume

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
   - Analize personalizate pentru interval selectat

## 🛠️ Tehnologii Utilizate

### Backend
- **Node.js** (>=14.0.0)
- **Express.js** - Framework web
- **Multer** - Upload fișiere
- **dotenv** - Variabile de mediu

### Frontend
- **HTML5, CSS3, JavaScript (ES6+)**
- **Chart.js** - Grafice interactive
- **Chart.js DataLabels Plugin** - Etichete pe grafice

### Generare Documente
- **jsPDF** - Generare PDF
- **jspdf-autotable** - Tabele în PDF
- **xmlbuilder** - Generare XML

### Validare și Securitate
- **validator** - Validare date
- **bcrypt** - Hash parole (pentru funcționalități viitoare)

### Development
- **nodemon** - Auto-reload în development
- **Jest** - Testing framework

## 📝 Configurare

### Variabile de Mediu
Ambele proiecte folosesc fișierul `.env` (nu este versionat) pentru configurare:
```env
PORT=3000
NODE_ENV=development
```

### Dependențe
Fiecare proiect are propriul `package.json` și `node_modules`. Instalați dependențele separat pentru fiecare proiect.

### Date
Datele sunt stocate în `forms-data.json` (format JSON). Fișierul este partajat între toate funcționalitățile.

## 🚦 Utilizare

### Rulare HW1
```bash
cd HW1
npm install
npm start
```

### Rulare electronic-forms-system
```bash
cd electronic-forms-system
npm install
npm start
```

**Notă:** Pentru a rula ambele proiecte simultan, modificați portul în `.env` sau în `server-simple.js`.

## 📄 Licență

Proiect academic pentru cursul de Guvernare Electronică.

## 🔗 Repository

GitHub: https://github.com/andi-ggs/eGOV

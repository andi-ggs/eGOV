const express = require('express');
const multer = require('multer');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Configurare upload fișiere
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Rute pentru pagini statice
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/status', (req, res) => {
    res.sendFile(path.join(__dirname, 'status.html'));
});

app.get('/forms', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

app.get('/report', (req, res) => {
    res.sendFile(path.join(__dirname, 'report.html'));
});

// Creare director pentru upload-uri
async function createUploadsDirectory() {
    try {
        await fs.mkdir('uploads', { recursive: true });
        console.log('✅ Directorul uploads a fost creat');
    } catch (error) {
        console.error('❌ Eroare la crearea directorului uploads:', error);
    }
}

// Endpoint pentru trimiterea formularului (versiune simplificată)
app.post('/api/submit-form', upload.array('attachments'), async (req, res) => {
    try {
        const formData = req.body;
        const files = req.files || [];
        
        // Validare simplă
        if (!formData.payerName || !formData.beneficiaryName) {
            return res.status(400).json({
                success: false,
                message: 'Date invalide - numele plătitorului și beneficiarului sunt obligatorii'
            });
        }
        
        // Generare referință
        const reference = `REF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        
        // Salvare în fișier JSON (în loc de bază de date)
        const formRecord = {
            id: Date.now(),
            reference: reference,
            ...formData,
            files: files.map(f => ({
                filename: f.filename,
                originalname: f.originalname,
                size: f.size
            })),
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Salvare în fișier
        const dataFile = 'forms-data.json';
        let forms = [];
        
        try {
            const existingData = await fs.readFile(dataFile, 'utf8');
            forms = JSON.parse(existingData);
        } catch (error) {
            // Fișierul nu există, începem cu array gol
        }
        
        forms.push(formRecord);
        await fs.writeFile(dataFile, JSON.stringify(forms, null, 2));
        
        res.json({
            success: true,
            message: 'Formularul a fost trimis cu succes',
            formId: formRecord.id,
            reference: reference
        });
        
    } catch (error) {
        console.error('Eroare la procesarea formularului:', error);
        res.status(500).json({
            success: false,
            message: 'Eroare internă a serverului'
        });
    }
});

// Endpoint pentru obținerea statusului unui formular
app.get('/api/form-status/:reference', async (req, res) => {
    try {
        const { reference } = req.params;
        const dataFile = 'forms-data.json';
        
        let forms = [];
        try {
            const data = await fs.readFile(dataFile, 'utf8');
            forms = JSON.parse(data);
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: 'Formularul nu a fost găsit'
            });
        }
        
        const form = forms.find(f => f.reference === reference);
        if (!form) {
            return res.status(404).json({
                success: false,
                message: 'Formularul nu a fost găsit'
            });
        }
        
        res.json({
            success: true,
            form: {
                id: form.id,
                reference: form.reference,
                status: form.status,
                createdAt: form.createdAt,
                updatedAt: form.updatedAt,
                logs: [
                    {
                        action: 'form_submitted',
                        details: 'Formular trimis cu succes',
                        created_at: form.createdAt
                    }
                ]
            }
        });
        
    } catch (error) {
        console.error('Eroare la obținerea statusului:', error);
        res.status(500).json({
            success: false,
            message: 'Eroare la obținerea statusului'
        });
    }
});

// Endpoint pentru obținerea tuturor formularelor
app.get('/api/forms', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, dateFrom, dateTo } = req.query;
        const dataFile = 'forms-data.json';
        
        let forms = [];
        try {
            const data = await fs.readFile(dataFile, 'utf8');
            forms = JSON.parse(data);
        } catch (error) {
            // Fișierul nu există, returnăm array gol
        }
        
        // Filtrare după status
        if (status) {
            forms = forms.filter(f => f.status === status);
        }
        
        // Filtrare după dată
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            forms = forms.filter(f => new Date(f.createdAt) >= fromDate);
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999); // Până la sfârșitul zilei
            forms = forms.filter(f => new Date(f.createdAt) <= toDate);
        }
        
        // Sortare după data creării
        forms.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Paginare
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedForms = forms.slice(startIndex, endIndex);
        
        res.json({
            success: true,
            forms: paginatedForms,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: forms.length,
                pages: Math.ceil(forms.length / limit)
            }
        });
        
    } catch (error) {
        console.error('Eroare la obținerea formularelor:', error);
        res.status(500).json({
            success: false,
            message: 'Eroare la obținerea formularelor'
        });
    }
});

// Endpoint pentru actualizarea statusului unui formular
app.put('/api/forms/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        
        const validStatuses = ['pending', 'approved', 'rejected', 'processed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status invalid'
            });
        }
        
        const dataFile = 'forms-data.json';
        let forms = [];
        
        try {
            const data = await fs.readFile(dataFile, 'utf8');
            forms = JSON.parse(data);
        } catch (error) {
            return res.status(404).json({
                success: false,
                message: 'Formularul nu a fost găsit'
            });
        }
        
        const formIndex = forms.findIndex(f => f.id == id);
        if (formIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Formularul nu a fost găsit'
            });
        }
        
        forms[formIndex].status = status;
        forms[formIndex].updatedAt = new Date().toISOString();
        
        await fs.writeFile(dataFile, JSON.stringify(forms, null, 2));
        
        res.json({
            success: true,
            message: 'Status actualizat cu succes'
        });
        
    } catch (error) {
        console.error('Eroare la actualizarea statusului:', error);
        res.status(500).json({
            success: false,
            message: 'Eroare la actualizarea statusului'
        });
    }
});

// ==================== ENDPOINTS PENTRU RAPORTARE ====================

// Endpoint pentru obținerea datelor și generarea analizelor
app.get('/api/report-data', async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        const dataFile = 'forms-data.json';
        let forms = [];
        
        try {
            const data = await fs.readFile(dataFile, 'utf8');
            forms = JSON.parse(data);
        } catch (error) {
            console.error('Eroare la citirea datelor:', error);
            return res.status(404).json({
                success: false,
                message: 'Nu s-au găsit date pentru raportare'
            });
        }

        // Filtrare după dată dacă este specificată
        if (dateFrom) {
            const fromDate = new Date(dateFrom);
            forms = forms.filter(f => new Date(f.createdAt) >= fromDate);
        }
        
        if (dateTo) {
            const toDate = new Date(dateTo);
            toDate.setHours(23, 59, 59, 999); // Până la sfârșitul zilei
            forms = forms.filter(f => new Date(f.createdAt) <= toDate);
        }

        if (forms.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Nu există date pentru raportare în perioada selectată'
            });
        }

        // Analiza 1: Distribuția după scopul plății (paymentPurpose)
        const purposeAnalysis = analyzeByPurpose(forms);
        
        // Analiza 2: Distribuția după monedă (currency)
        const currencyAnalysis = analyzeByCurrency(forms);
        
        // Analiza 3: Analiza sumelor totale
        const amountAnalysis = analyzeAmounts(forms);
        
        // Analiza 4: Distribuția după cota TVA
        const vatAnalysis = analyzeVAT(forms);
        
        // Statistici generale
        const generalStats = {
            totalForms: forms.length,
            totalAmount: forms.reduce((sum, form) => sum + parseFloat(form.totalAmount || 0), 0),
            averageAmount: 0,
            dateRange: {
                from: forms.length > 0 ? forms[0].createdAt : null,
                to: forms.length > 0 ? forms[forms.length - 1].createdAt : null
            }
        };
        generalStats.averageAmount = generalStats.totalAmount / generalStats.totalForms;

        res.json({
            success: true,
            data: {
                purposeAnalysis,
                currencyAnalysis,
                amountAnalysis,
                vatAnalysis,
                generalStats,
                rawData: forms
            }
        });
        
    } catch (error) {
        console.error('Eroare la generarea raportului:', error);
        res.status(500).json({
            success: false,
            message: 'Eroare la generarea raportului'
        });
    }
});

// Funcție pentru analiza după scopul plății
function analyzeByPurpose(forms) {
    const purposeCount = {};
    const purposeAmounts = {};
    
    forms.forEach(form => {
        const purpose = form.paymentPurpose || 'necunoscut';
        purposeCount[purpose] = (purposeCount[purpose] || 0) + 1;
        purposeAmounts[purpose] = (purposeAmounts[purpose] || 0) + parseFloat(form.totalAmount || 0);
    });
    
    const total = forms.length;
    const percentages = {};
    const labels = [];
    const data = [];
    const amounts = [];
    
    Object.keys(purposeCount).forEach(purpose => {
        const count = purposeCount[purpose];
        const percentage = (count / total * 100).toFixed(1);
        const label = getPurposeLabel(purpose);
        labels.push(label);
        percentages[label] = percentage; // Folosim label-ul tradus ca cheie
        data.push(count);
        amounts.push(purposeAmounts[purpose].toFixed(2));
    });
    
    return {
        labels,
        data,
        amounts,
        percentages,
        total,
        details: Object.keys(purposeCount).map(purpose => ({
            purpose: getPurposeLabel(purpose),
            count: purposeCount[purpose],
            percentage: percentages[getPurposeLabel(purpose)],
            totalAmount: purposeAmounts[purpose].toFixed(2)
        }))
    };
}

// Funcție pentru analiza după monedă
function analyzeByCurrency(forms) {
    const currencyCount = {};
    const currencyAmounts = {};
    
    forms.forEach(form => {
        const currency = form.currency || 'necunoscut';
        currencyCount[currency] = (currencyCount[currency] || 0) + 1;
        currencyAmounts[currency] = (currencyAmounts[currency] || 0) + parseFloat(form.totalAmount || 0);
    });
    
    const total = forms.length;
    const percentages = {};
    const labels = [];
    const data = [];
    const amounts = [];
    
    Object.keys(currencyCount).forEach(currency => {
        const count = currencyCount[currency];
        const percentage = (count / total * 100).toFixed(1);
        percentages[currency] = percentage;
        labels.push(currency);
        data.push(count);
        amounts.push(currencyAmounts[currency].toFixed(2));
    });
    
    return {
        labels,
        data,
        amounts,
        percentages,
        total,
        details: Object.keys(currencyCount).map(currency => ({
            currency,
            count: currencyCount[currency],
            percentage: percentages[currency],
            totalAmount: currencyAmounts[currency].toFixed(2)
        }))
    };
}

// Funcție pentru analiza sumelor
function analyzeAmounts(forms) {
    const amounts = forms.map(form => parseFloat(form.totalAmount || 0));
    const sortedAmounts = [...amounts].sort((a, b) => a - b);
    
    return {
        min: Math.min(...amounts).toFixed(2),
        max: Math.max(...amounts).toFixed(2),
        average: (amounts.reduce((a, b) => a + b, 0) / amounts.length).toFixed(2),
        median: sortedAmounts.length % 2 === 0
            ? ((sortedAmounts[sortedAmounts.length / 2 - 1] + sortedAmounts[sortedAmounts.length / 2]) / 2).toFixed(2)
            : sortedAmounts[Math.floor(sortedAmounts.length / 2)].toFixed(2),
        total: amounts.reduce((a, b) => a + b, 0).toFixed(2),
        count: amounts.length
    };
}

// Funcție pentru analiza TVA
function analyzeVAT(forms) {
    const vatCount = {};
    
    forms.forEach(form => {
        const vatRate = form.vatRate || '0';
        vatCount[vatRate] = (vatCount[vatRate] || 0) + 1;
    });
    
    const total = forms.length;
    const percentages = {};
    const labels = [];
    const data = [];
    
    Object.keys(vatCount).forEach(vatRate => {
        const count = vatCount[vatRate];
        const percentage = (count / total * 100).toFixed(1);
        const label = `${vatRate}%`;
        labels.push(label);
        percentages[label] = percentage; // Folosim label-ul cu % ca cheie
        data.push(count);
    });
    
    return {
        labels,
        data,
        percentages,
        total,
        details: Object.keys(vatCount).map(vatRate => ({
            vatRate: `${vatRate}%`,
            count: vatCount[vatRate],
            percentage: percentages[`${vatRate}%`]
        }))
    };
}

// Funcție helper pentru etichete scop plății
function getPurposeLabel(purpose) {
    const labels = {
        'taxe': 'Taxe și impozite',
        'amenzi': 'Amenzi',
        'servicii': 'Servicii publice',
        'alte': 'Alte plăți',
        'necunoscut': 'Necunoscut'
    };
    return labels[purpose] || purpose;
}

// ==================== SFÂRȘIT ENDPOINTS RAPORTARE ====================

// Pornire server
async function startServer() {
    try {
        await createUploadsDirectory();
        
        app.listen(PORT, () => {
            console.log('🚀 Serverul unificat rulează pe portul', PORT);
            console.log('');
            console.log('📱 Pagini disponibile:');
            console.log(`   • Formular: http://localhost:${PORT}/`);
            console.log(`   • Raport: http://localhost:${PORT}/report`);
            console.log(`   • Admin: http://localhost:${PORT}/admin`);
            console.log(`   • Status: http://localhost:${PORT}/status`);
            console.log('');
            console.log('🔌 API Endpoints:');
            console.log(`   • POST /api/submit-form - Trimite formular`);
            console.log(`   • GET /api/forms - Lista formulare`);
            console.log(`   • GET /api/form-status/:reference - Status formular`);
            console.log(`   • PUT /api/forms/:id/status - Actualizează status`);
            console.log(`   • GET /api/report-data - Date pentru raport`);
            console.log('');
            console.log('✅ Sistemul funcționează fără bază de date MySQL!');
            console.log('📄 Datele sunt salvate în fișierul forms-data.json');
        });
    } catch (error) {
        console.error('❌ Eroare la pornirea serverului:', error);
        process.exit(1);
    }
}

startServer();

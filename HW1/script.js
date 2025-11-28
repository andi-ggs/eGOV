// Formular Electronic - Funcționalități Complete
class ElectronicForm {
    constructor() {
        this.form = document.getElementById('paymentForm');
        this.statusMessage = document.getElementById('statusMessage');
        this.initializeEventListeners();
        this.setCurrentDate();
    }

    initializeEventListeners() {
        // Event listeners pentru calculare automată
        document.getElementById('baseAmount').addEventListener('input', () => this.calculateAmounts());
        document.getElementById('vatRate').addEventListener('change', () => this.calculateAmounts());
        document.getElementById('taxRate').addEventListener('input', () => this.calculateAmounts());
        
        // Event listeners pentru butoane
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculateAmounts());
        document.getElementById('generatePdfBtn').addEventListener('click', () => this.generatePDF());
        document.getElementById('generateXmlBtn').addEventListener('click', () => this.generateXML());
        document.getElementById('submitBtn').addEventListener('click', (e) => this.submitForm(e));
        
        // Event listeners pentru validare în timp real
        this.addRealTimeValidation();
        
        // Event listeners pentru corelarea câmpurilor
        this.addFieldCorrelation();
    }

    setCurrentDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('paymentDate').value = today;
    }

    // Calculare automată a sumelor, TVA și impozite
    calculateAmounts() {
        const baseAmount = parseFloat(document.getElementById('baseAmount').value) || 0;
        const vatRate = parseFloat(document.getElementById('vatRate').value) || 0;
        const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
        
        // Calculare TVA
        const vatAmount = (baseAmount * vatRate) / 100;
        document.getElementById('vatAmount').value = vatAmount.toFixed(2);
        
        // Calculare impozit
        const taxAmount = (baseAmount * taxRate) / 100;
        document.getElementById('taxAmount').value = taxAmount.toFixed(2);
        
        // Calculare suma totală
        const totalAmount = baseAmount + vatAmount + taxAmount;
        document.getElementById('totalAmount').value = totalAmount.toFixed(2);
        
        // Actualizare referință plată automată
        this.updatePaymentReference();
        
        this.showStatus('Calculele au fost actualizate automat', 'info');
    }

    // Corelarea câmpurilor - actualizare referință plată
    updatePaymentReference() {
        const payerCUI = document.getElementById('payerCUI').value;
        const totalAmount = document.getElementById('totalAmount').value;
        const paymentDate = document.getElementById('paymentDate').value;
        
        if (payerCUI && totalAmount && paymentDate) {
            const date = new Date(paymentDate);
            const dateStr = date.toISOString().slice(0,10).replace(/-/g, '');
            const reference = `REF-${payerCUI}-${dateStr}-${Math.floor(Math.random() * 1000)}`;
            document.getElementById('paymentReference').value = reference;
        }
    }

    // Validare în timp real
    addRealTimeValidation() {
        const requiredFields = ['payerName', 'payerCUI', 'beneficiaryName', 'beneficiaryCUI', 'beneficiaryAccount'];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            field.addEventListener('blur', () => this.validateField(field));
            field.addEventListener('input', () => this.clearFieldError(field));
        });
        
        // Validare CUI/CIF
        document.getElementById('payerCUI').addEventListener('blur', () => this.validateCUI('payerCUI'));
        document.getElementById('beneficiaryCUI').addEventListener('blur', () => this.validateCUI('beneficiaryCUI'));
        
        // Validare IBAN
        document.getElementById('beneficiaryAccount').addEventListener('blur', () => this.validateIBAN());
    }

    validateField(field) {
        if (!field.value.trim()) {
            this.showFieldError(field, 'Acest câmp este obligatoriu');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    validateCUI(fieldId) {
        const field = document.getElementById(fieldId);
        const cui = field.value.trim();
        
        if (cui && !this.isValidCUI(cui)) {
            this.showFieldError(field, 'CUI/CIF invalid. Trebuie să conțină doar cifre și să aibă între 2 și 10 cifre');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    validateIBAN() {
        const field = document.getElementById('beneficiaryAccount');
        const iban = field.value.trim().replace(/\s/g, '');
        
        if (iban && !this.isValidIBAN(iban)) {
            this.showFieldError(field, 'IBAN invalid. Format corect: RO + 2 cifre + 20 caractere alfanumerice (ex: RO49 INGB 1B31 0075 9384 0000)');
            return false;
        }
        this.clearFieldError(field);
        return true;
    }

    isValidCUI(cui) {
        return /^\d{2,10}$/.test(cui);
    }

    isValidIBAN(iban) {
        // Validare IBAN românesc - format corect: RO + 2 cifre + 20 caractere alfanumerice
        // Eliminăm spațiile și verificăm formatul
        const cleanIban = iban.replace(/\s/g, '').toUpperCase();
        
        // Format IBAN românesc: RO + 2 cifre + 20 caractere alfanumerice = 24 caractere total
        if (cleanIban.length !== 24) {
            return false;
        }
        
        // Verificăm că începe cu RO
        if (!cleanIban.startsWith('RO')) {
            return false;
        }
        
        // Verificăm că urmează 2 cifre
        if (!/^RO\d{2}/.test(cleanIban)) {
            return false;
        }
        
        // Verificăm că urmează 20 caractere alfanumerice (litere și cifre)
        if (!/^RO\d{2}[A-Z0-9]{20}$/.test(cleanIban)) {
            return false;
        }
        
        return true;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        field.style.borderColor = '#dc3545';
        field.style.backgroundColor = '#fff5f5';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        field.style.backgroundColor = '';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Corelarea câmpurilor
    addFieldCorrelation() {
        // Când se schimbă CUI-ul plătitorului, se actualizează referința
        document.getElementById('payerCUI').addEventListener('input', () => {
            this.updatePaymentReference();
        });
        
        // Când se schimbă data plății, se actualizează referința
        document.getElementById('paymentDate').addEventListener('change', () => {
            this.updatePaymentReference();
        });
        
        // Când se schimbă suma totală, se actualizează referința
        document.getElementById('totalAmount').addEventListener('input', () => {
            this.updatePaymentReference();
        });
    }

    // Generare PDF
    generatePDF() {
        if (!this.validateForm()) {
            this.showStatus('Vă rugăm să completați toate câmpurile obligatorii', 'error');
            return;
        }
    
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
    
        // === HEADER ===
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('ORDIN DE PLATĂ ELECTRONIC', 105, 20, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(20, 25, 190, 25);
    
        // === DATE PLĂTITOR ===
        doc.setFontSize(14);
        doc.text('DATE PLĂTITOR', 20, 40);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nume/Denumire: ${document.getElementById('payerName').value}`, 25, 50);
        doc.text(`CUI/CIF: ${document.getElementById('payerCUI').value}`, 25, 58);
        doc.text(`Adresă: ${document.getElementById('payerAddress').value}`, 25, 66);
        doc.text(`Telefon: ${document.getElementById('payerPhone').value}`, 25, 74);
    
        // Linie de separare
        doc.setLineWidth(0.2);
        doc.line(20, 80, 190, 80);
    
        // === DATE BENEFICIAR ===
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('DATE BENEFICIAR', 20, 95);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Nume/Denumire: ${document.getElementById('beneficiaryName').value}`, 25, 105);
        doc.text(`CUI/CIF: ${document.getElementById('beneficiaryCUI').value}`, 25, 113);
        doc.text(`Adresă: ${document.getElementById('beneficiaryAddress').value}`, 25, 121);
        doc.text(`Cont IBAN: ${document.getElementById('beneficiaryAccount').value}`, 25, 129);
    
        // Linie de separare
        doc.line(20, 135, 190, 135);
    
        // === DETALII PLATĂ ===
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('DETALII PLATĂ', 20, 150);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Data plății: ${document.getElementById('paymentDate').value}`, 25, 160);
        doc.text(`Referință: ${document.getElementById('paymentReference').value}`, 25, 168);
        doc.text(`Scopul plății: ${document.getElementById('paymentPurpose').value}`, 25, 176);
        doc.text(`Monedă: ${document.getElementById('currency').value}`, 25, 184);
    
        // Linie de separare
        doc.line(20, 190, 190, 190);
    
        // === CALCULARE ===
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('CALCULARE', 20, 205);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Suma de bază: ${document.getElementById('baseAmount').value} ${document.getElementById('currency').value}`, 25, 215);
        doc.text(`TVA (${document.getElementById('vatRate').value}%): ${document.getElementById('vatAmount').value} ${document.getElementById('currency').value}`, 25, 223);
        doc.text(`Impozit (${document.getElementById('taxRate').value}%): ${document.getElementById('taxAmount').value} ${document.getElementById('currency').value}`, 25, 231);
    
        // Total bold
        doc.setFont('helvetica', 'bold');
        doc.text(`SUMA TOTALĂ: ${document.getElementById('totalAmount').value} ${document.getElementById('currency').value}`, 25, 245);
    
        // Linie finală
        doc.line(20, 255, 190, 255);
    
        // === FOOTER ===
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        doc.text(`Generat automat pe ${new Date().toLocaleString('ro-RO')}`, 105, 280, { align: 'center' });
    
        // === Salvare PDF ===
        const fileName = `Ordin_Plata_${document.getElementById('paymentReference').value || 'fara_ref'}.pdf`;
        doc.save(fileName);
    
        this.showStatus('PDF-ul a fost generat cu succes', 'success');
    }

    // Generare XML
    generateXML() {
        if (!this.validateForm()) {
            this.showStatus('Vă rugăm să completați toate câmpurile obligatorii', 'error');
            return;
        }

        const formData = this.getFormData();
        const xmlContent = this.createXMLContent(formData);
        
        // Creare și descărcare fișier XML
        const blob = new Blob([xmlContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Ordin_Plata_${formData.paymentReference}.xml`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showStatus('Fișierul XML a fost generat cu succes', 'success');
    }

    createXMLContent(data) {
        return `<?xml version="1.0" encoding="UTF-8"?>
<OrdinPlata>
    <Header>
        <DataGenerare>${new Date().toISOString()}</DataGenerare>
        <Versiune>1.0</Versiune>
    </Header>
    <Platitor>
        <Nume>${this.escapeXml(data.payerName)}</Nume>
        <CUI>${data.payerCUI}</CUI>
        <Adresa>${this.escapeXml(data.payerAddress)}</Adresa>
        <Telefon>${data.payerPhone}</Telefon>
    </Platitor>
    <Beneficiar>
        <Nume>${this.escapeXml(data.beneficiaryName)}</Nume>
        <CUI>${data.beneficiaryCUI}</CUI>
        <Adresa>${this.escapeXml(data.beneficiaryAddress)}</Adresa>
        <ContIBAN>${data.beneficiaryAccount}</ContIBAN>
    </Beneficiar>
    <DetaliiPlata>
        <DataPlata>${data.paymentDate}</DataPlata>
        <Referinta>${data.paymentReference}</Referinta>
        <Scopul>${data.paymentPurpose}</Scopul>
        <Moneda>${data.currency}</Moneda>
    </DetaliiPlata>
    <Calculare>
        <SumaBaza>${data.baseAmount}</SumaBaza>
        <CotaTVA>${data.vatRate}</CotaTVA>
        <TVA>${data.vatAmount}</TVA>
        <CotaImpozit>${data.taxRate}</CotaImpozit>
        <Impozit>${data.taxAmount}</Impozit>
        <SumaTotala>${data.totalAmount}</SumaTotala>
    </Calculare>
</OrdinPlata>`;
    }

    escapeXml(text) {
        return text.replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .replace(/"/g, '&quot;')
                  .replace(/'/g, '&apos;');
    }

    // Trimitere formular
    async submitForm(event) {
        event.preventDefault();
        
        if (!this.validateForm()) {
            this.showStatus('Vă rugăm să corectați erorile din formular', 'error');
            return;
        }

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        
        try {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span class="loading"></span> Se trimite...';
            
            const formData = this.getFormData();
            const xmlContent = this.createXMLContent(formData);
            
            // Trimitere către server
            await this.submitToServer(formData, xmlContent);
            
            this.showStatus('Formularul a fost trimis cu succes către autoritatea publică', 'success');
            this.form.reset();
            this.setCurrentDate();
            
        } catch (error) {
            this.showStatus('Eroare la trimiterea formularului: ' + error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }

    async submitToServer(formData, xmlContent) {
        try {
            // Pregătire date pentru trimitere
            const submitData = {
                ...formData,
                xmlContent: xmlContent
            };
            
            // Creare FormData pentru upload fișiere
            const formDataObj = new FormData();
            
            // Adăugare câmpuri text
            Object.keys(submitData).forEach(key => {
                if (submitData[key] !== null && submitData[key] !== undefined) {
                    formDataObj.append(key, submitData[key]);
                }
            });
            
            // Adăugare fișiere atașate
            const attachmentsInput = document.getElementById('attachments');
            if (attachmentsInput.files.length > 0) {
                Array.from(attachmentsInput.files).forEach(file => {
                    formDataObj.append('attachments', file);
                });
            }
            
            // Trimitere către server
            const response = await fetch('/api/submit-form', {
                method: 'POST',
                body: formDataObj
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Afișare popup cu referința
                this.showReferencePopup(result.reference);
                
                // Mesaj de succes simplu
                this.showStatus('Formularul a fost trimis cu succes!', 'success');
                
                return result;
            } else {
                throw new Error(result.message || 'Eroare necunoscută de la server');
            }
            
        } catch (error) {
            console.error('Eroare la trimiterea formularului:', error);
            throw error;
        }
    }

    getFormData() {
        return {
            payerName: document.getElementById('payerName').value,
            payerCUI: document.getElementById('payerCUI').value,
            payerAddress: document.getElementById('payerAddress').value,
            payerPhone: document.getElementById('payerPhone').value,
            beneficiaryName: document.getElementById('beneficiaryName').value,
            beneficiaryCUI: document.getElementById('beneficiaryCUI').value,
            beneficiaryAddress: document.getElementById('beneficiaryAddress').value,
            beneficiaryAccount: document.getElementById('beneficiaryAccount').value,
            paymentDate: document.getElementById('paymentDate').value,
            paymentReference: document.getElementById('paymentReference').value,
            paymentPurpose: document.getElementById('paymentPurpose').value,
            currency: document.getElementById('currency').value,
            baseAmount: document.getElementById('baseAmount').value,
            vatRate: document.getElementById('vatRate').value,
            vatAmount: document.getElementById('vatAmount').value,
            taxRate: document.getElementById('taxRate').value,
            taxAmount: document.getElementById('taxAmount').value,
            totalAmount: document.getElementById('totalAmount').value
        };
    }

    validateForm() {
        const requiredFields = [
            'payerName', 'payerCUI', 'payerAddress', 'payerPhone',
            'beneficiaryName', 'beneficiaryCUI', 'beneficiaryAddress', 'beneficiaryAccount',
            'paymentDate', 'paymentPurpose', 'baseAmount'
        ];
        
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Validare CUI-uri
        if (!this.validateCUI('payerCUI') || !this.validateCUI('beneficiaryCUI')) {
            isValid = false;
        }
        
        // Validare IBAN
        if (!this.validateIBAN()) {
            isValid = false;
        }
        
        // Validare sume
        const baseAmount = parseFloat(document.getElementById('baseAmount').value);
        if (baseAmount <= 0) {
            this.showFieldError(document.getElementById('baseAmount'), 'Suma de bază trebuie să fie mai mare decât 0');
            isValid = false;
        }
        
        return isValid;
    }

    showStatus(message, type) {
        this.statusMessage.textContent = message;
        this.statusMessage.className = `status-message ${type}`;
        
        setTimeout(() => {
            this.statusMessage.style.display = 'none';
        }, 5000);
    }

    showReferencePopup(reference) {
        // Creare overlay pentru popup
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 10000;
            display: flex;
            justify-content: center;
            align-items: center;
            animation: fadeIn 0.3s ease-out;
        `;

        // Creare popup
        const popup = document.createElement('div');
        popup.style.cssText = `
            background: white;
            border-radius: 15px;
            padding: 40px;
            max-width: 500px;
            width: 90%;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease-out;
            position: relative;
        `;

        popup.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 20px;">🎉</div>
            <h2 style="color: #2c3e50; margin-bottom: 20px; font-size: 1.8rem;">Formular Trimis cu Succes!</h2>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <p style="margin: 0; font-size: 1.1rem; font-weight: 600;">📄 Numărul dvs. de referință este:</p>
                <p style="margin: 10px 0 0 0; font-size: 1.4rem; font-weight: bold; letter-spacing: 1px;">${reference}</p>
            </div>
            <p style="color: #7f8c8d; margin: 20px 0; font-size: 1rem;">
                Păstrați acest număr pentru a verifica statusul formularului!
            </p>
            <div style="margin-top: 30px;">
                <button id="checkStatusBtn" style="
                    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    margin-right: 10px;
                    transition: all 0.3s ease;
                ">🔍 Verifică Status</button>
                <button id="closePopupBtn" style="
                    background: #95a5a6;
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                ">✕ Închide</button>
            </div>
        `;

        // Adăugare stiluri CSS pentru animații
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            #checkStatusBtn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(39, 174, 96, 0.4);
            }
            #closePopupBtn:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(149, 165, 166, 0.4);
            }
        `;
        document.head.appendChild(style);

        overlay.appendChild(popup);
        document.body.appendChild(overlay);

        // Event listeners pentru butoane
        document.getElementById('checkStatusBtn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.head.removeChild(style);
            window.open('/status', '_blank');
        });

        document.getElementById('closePopupBtn').addEventListener('click', () => {
            document.body.removeChild(overlay);
            document.head.removeChild(style);
        });

        // Închidere la click pe overlay
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                document.head.removeChild(style);
            }
        });

        // Închidere la apăsarea tastei Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.head.removeChild(style);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
}

// Inițializare aplicație
document.addEventListener('DOMContentLoaded', () => {
    new ElectronicForm();
});

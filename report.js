// Raport Analitic - Funcționalități Complete
class ReportGenerator {
    constructor() {
        this.charts = {};
        this.reportData = null;
        // Register ChartDataLabels plugin if available
        if (typeof Chart !== 'undefined' && typeof ChartDataLabels !== 'undefined') {
            try {
                Chart.register(ChartDataLabels);
            } catch (e) {
                // Plugin might already be registered
                console.log('ChartDataLabels plugin registration:', e.message || 'already registered');
            }
        }
        this.initializeEventListeners();
        this.loadReportData();
    }

    initializeEventListeners() {
        document.getElementById('refreshBtn').addEventListener('click', () => this.loadReportData());
        document.getElementById('generatePdfBtn').addEventListener('click', () => this.generatePDF());
        document.getElementById('applyReportFilters').addEventListener('click', () => this.loadReportData());
        document.getElementById('resetReportFilters').addEventListener('click', () => this.resetFilters());
    }

    getFilters() {
        const filters = {};
        const dateFrom = document.getElementById('reportDateFrom').value;
        const dateTo = document.getElementById('reportDateTo').value;
        
        if (dateFrom) {
            filters.dateFrom = dateFrom;
        }
        if (dateTo) {
            filters.dateTo = dateTo;
        }
        
        return filters;
    }

    resetFilters() {
        document.getElementById('reportDateFrom').value = '';
        document.getElementById('reportDateTo').value = '';
        this.loadReportData();
    }

    async loadReportData() {
        const loadingIndicator = document.getElementById('loadingIndicator');
        const reportContent = document.getElementById('reportContent');
        const errorMessage = document.getElementById('errorMessage');

        try {
            loadingIndicator.style.display = 'block';
            reportContent.style.display = 'none';
            errorMessage.style.display = 'none';

            const filters = this.getFilters();
            const params = new URLSearchParams();
            if (filters.dateFrom) {
                params.append('dateFrom', filters.dateFrom);
            }
            if (filters.dateTo) {
                params.append('dateTo', filters.dateTo);
            }

            const url = `/api/report-data${params.toString() ? '?' + params.toString() : ''}`;
            const response = await fetch(url);
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message || 'Eroare la încărcarea datelor');
            }

            this.reportData = result.data;
            this.renderReport();
            
            loadingIndicator.style.display = 'none';
            reportContent.style.display = 'block';

        } catch (error) {
            console.error('Eroare:', error);
            loadingIndicator.style.display = 'none';
            errorMessage.style.display = 'block';
            errorMessage.textContent = `Eroare: ${error.message}`;
        }
    }

    renderReport() {
        if (!this.reportData) return;

        this.renderGeneralStats();
        this.renderPurposeAnalysis();
        this.renderCurrencyAnalysis();
        this.renderAmountAnalysis();
        this.renderVATAnalysis();
    }

    renderGeneralStats() {
        const stats = this.reportData.generalStats;
        const container = document.getElementById('generalStats');
        
        container.innerHTML = `
            <div class="stat-card">
                <h3>Total Formulare</h3>
                <div class="value">${stats.totalForms}</div>
                <div class="unit">înregistrări</div>
            </div>
            <div class="stat-card">
                <h3>Suma Totală</h3>
                <div class="value">${parseFloat(stats.totalAmount).toFixed(2)}</div>
                <div class="unit">RON</div>
            </div>
            <div class="stat-card">
                <h3>Suma Medie</h3>
                <div class="value">${parseFloat(stats.averageAmount).toFixed(2)}</div>
                <div class="unit">RON</div>
            </div>
        `;
    }

    renderPurposeAnalysis() {
        const analysis = this.reportData.purposeAnalysis;
        
        // Descriere analiză
        const maxPurpose = analysis.details.reduce((max, item) => 
            parseFloat(item.percentage) > parseFloat(max.percentage) ? item : max
        );
        document.getElementById('purposeDescription').textContent = 
            `Analiza arată că ${maxPurpose.purpose} reprezintă ${maxPurpose.percentage}% din totalul formularelor (${maxPurpose.count} formulare). ` +
            `Suma totală pentru această categorie este de ${maxPurpose.totalAmount} RON.`;

        // Grafic
        const ctx = document.getElementById('purposeChart').getContext('2d');
        
        if (this.charts.purpose) {
            this.charts.purpose.destroy();
        }

        // Creez un array de procente în același ordine cu labels pentru accesare mai ușoară
        const labels = analysis.labels;
        const percentagesObj = analysis.percentages || {};
        
        // Creez array-ul de procente folosind exact label-urile din array
        const percentagesArray = labels.map((label, idx) => {
            const percentage = percentagesObj[label];
            if (!percentage) {
                // Dacă nu găsim procentul, calculăm din data
                const total = analysis.data.reduce((a, b) => a + b, 0);
                const value = analysis.data[idx];
                return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            }
            return percentage;
        });

        this.charts.purpose = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: analysis.data,
                    backgroundColor: [
                        'rgba(102, 126, 234, 0.8)',
                        'rgba(118, 75, 162, 0.8)',
                        'rgba(39, 174, 96, 0.8)',
                        'rgba(241, 196, 15, 0.8)',
                        'rgba(231, 76, 60, 0.8)'
                    ],
                    borderColor: [
                        'rgba(102, 126, 234, 1)',
                        'rgba(118, 75, 162, 1)',
                        'rgba(39, 174, 96, 1)',
                        'rgba(241, 196, 15, 1)',
                        'rgba(231, 76, 60, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const index = context.dataIndex;
                                const label = labels[index];
                                const value = context.parsed || 0;
                                const percentage = percentagesArray[index] || '0';
                                return `${label}: ${value} formulare (${percentage}%)`;
                            }
                        }
                    },
                    datalabels: {
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        formatter: (value, ctx) => {
                            const index = ctx.dataIndex;
                            const percentage = percentagesArray[index] || '0';
                            return `${percentage}%`;
                        }
                    }
                }
            }
        });

        // Tabel
        const tbody = document.querySelector('#purposeTable tbody');
        tbody.innerHTML = analysis.details.map(item => `
            <tr>
                <td><strong>${item.purpose}</strong></td>
                <td>${item.count}</td>
                <td>${item.percentage}%</td>
                <td>${item.totalAmount} RON</td>
            </tr>
        `).join('');
    }

    renderCurrencyAnalysis() {
        const analysis = this.reportData.currencyAnalysis;
        
        // Descriere analiză
        const maxCurrency = analysis.details.reduce((max, item) => 
            parseFloat(item.percentage) > parseFloat(max.percentage) ? item : max
        );
        document.getElementById('currencyDescription').textContent = 
            `Analiza arată că moneda ${maxCurrency.currency} este folosită în ${maxCurrency.percentage}% din formulare (${maxCurrency.count} formulare). ` +
            `Suma totală în ${maxCurrency.currency} este de ${maxCurrency.totalAmount} ${maxCurrency.currency}.`;

        // Grafic
        const ctx = document.getElementById('currencyChart').getContext('2d');
        
        if (this.charts.currency) {
            this.charts.currency.destroy();
        }

        // Creez un array de procente în același ordine cu labels
        const currencyLabels = analysis.labels;
        const currencyPercentagesObj = analysis.percentages || {};
        const currencyPercentagesArray = currencyLabels.map((label, idx) => {
            const percentage = currencyPercentagesObj[label];
            if (!percentage) {
                // Dacă nu găsim procentul, calculăm din data
                const total = analysis.data.reduce((a, b) => a + b, 0);
                const value = analysis.data[idx];
                return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            }
            return percentage;
        });

        this.charts.currency = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: currencyLabels,
                datasets: [{
                    label: 'Număr Formulare',
                    data: analysis.data,
                    backgroundColor: 'rgba(102, 126, 234, 0.8)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const index = context.dataIndex;
                                const label = currencyLabels[index];
                                const value = context.parsed.y || 0;
                                const percentage = currencyPercentagesArray[index] || '0';
                                return `${label}: ${value} formulare (${percentage}%)`;
                            }
                        }
                    },
                    datalabels: {
                        anchor: 'end',
                        align: 'top',
                        color: '#333',
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        formatter: (value, ctx) => {
                            const index = ctx.dataIndex;
                            const percentage = currencyPercentagesArray[index] || '0';
                            return `${value} (${percentage}%)`;
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });

        // Tabel
        const tbody = document.querySelector('#currencyTable tbody');
        tbody.innerHTML = analysis.details.map(item => `
            <tr>
                <td><strong>${item.currency}</strong></td>
                <td>${item.count}</td>
                <td>${item.percentage}%</td>
                <td>${item.totalAmount} ${item.currency}</td>
            </tr>
        `).join('');
    }

    renderAmountAnalysis() {
        const analysis = this.reportData.amountAnalysis;
        const container = document.getElementById('amountStats');
        
        container.innerHTML = `
            <div class="stat-card">
                <h3>Suma Minimă</h3>
                <div class="value">${analysis.min}</div>
                <div class="unit">RON</div>
            </div>
            <div class="stat-card">
                <h3>Suma Maximă</h3>
                <div class="value">${analysis.max}</div>
                <div class="unit">RON</div>
            </div>
            <div class="stat-card">
                <h3>Suma Medie</h3>
                <div class="value">${analysis.average}</div>
                <div class="unit">RON</div>
            </div>
            <div class="stat-card">
                <h3>Mediana</h3>
                <div class="value">${analysis.median}</div>
                <div class="unit">RON</div>
            </div>
        `;

        document.getElementById('amountDescription').textContent = 
            `Analiza sumelor totale arată că valoarea minimă este de ${analysis.min} RON, valoarea maximă este de ${analysis.max} RON, ` +
            `suma medie este de ${analysis.average} RON, iar mediana este de ${analysis.median} RON. ` +
            `Suma totală a tuturor formularelor este de ${analysis.total} RON.`;
    }

    renderVATAnalysis() {
        const analysis = this.reportData.vatAnalysis;
        
        // Descriere analiză
        const maxVAT = analysis.details.reduce((max, item) => 
            parseFloat(item.percentage) > parseFloat(max.percentage) ? item : max
        );
        document.getElementById('vatDescription').textContent = 
            `Analiza arată că cota TVA de ${maxVAT.vatRate} este folosită în ${maxVAT.percentage}% din formulare (${maxVAT.count} formulare).`;

        // Grafic
        const ctx = document.getElementById('vatChart').getContext('2d');
        
        if (this.charts.vat) {
            this.charts.vat.destroy();
        }

        // Creez un array de procente în același ordine cu labels
        const vatLabels = analysis.labels;
        const vatPercentagesObj = analysis.percentages || {};
        const vatPercentagesArray = vatLabels.map((label, idx) => {
            const percentage = vatPercentagesObj[label];
            if (!percentage) {
                // Dacă nu găsim procentul, calculăm din data
                const total = analysis.data.reduce((a, b) => a + b, 0);
                const value = analysis.data[idx];
                return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            }
            return percentage;
        });

        this.charts.vat = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: vatLabels,
                datasets: [{
                    data: analysis.data,
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(46, 204, 113, 0.8)',
                        'rgba(241, 196, 15, 0.8)',
                        'rgba(231, 76, 60, 0.8)'
                    ],
                    borderColor: [
                        'rgba(52, 152, 219, 1)',
                        'rgba(46, 204, 113, 1)',
                        'rgba(241, 196, 15, 1)',
                        'rgba(231, 76, 60, 1)'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 20,
                            font: {
                                size: 14
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const index = context.dataIndex;
                                const label = vatLabels[index];
                                const value = context.parsed || 0;
                                const percentage = vatPercentagesArray[index] || '0';
                                return `${label}: ${value} formulare (${percentage}%)`;
                            }
                        }
                    },
                    datalabels: {
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 14
                        },
                        formatter: (value, ctx) => {
                            const index = ctx.dataIndex;
                            const percentage = vatPercentagesArray[index] || '0';
                            return `${percentage}%`;
                        }
                    }
                }
            }
        });

        // Tabel
        const tbody = document.querySelector('#vatTable tbody');
        tbody.innerHTML = analysis.details.map(item => `
            <tr>
                <td><strong>${item.vatRate}</strong></td>
                <td>${item.count}</td>
                <td>${item.percentage}%</td>
            </tr>
        `).join('');
    }

    async generatePDF() {
        if (!this.reportData) {
            alert('Vă rugăm să încărcați mai întâi datele raportului!');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('RAPORT ANALITIC - FORMULARE ELECTRONICE', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`Generat pe: ${new Date().toLocaleString('ro-RO')}`, 105, 30, { align: 'center' });
        doc.line(20, 35, 190, 35);

        let yPos = 45;

        // Statistici generale
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Statistici Generale', 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const stats = this.reportData.generalStats;
        doc.text(`Total Formulare: ${stats.totalForms}`, 25, yPos);
        yPos += 7;
        doc.text(`Suma Totală: ${parseFloat(stats.totalAmount).toFixed(2)} RON`, 25, yPos);
        yPos += 7;
        doc.text(`Suma Medie: ${parseFloat(stats.averageAmount).toFixed(2)} RON`, 25, yPos);
        yPos += 15;

        // Analiza după scopul plății
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Analiza după Scopul Plății', 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        const purposeData = this.reportData.purposeAnalysis.details.map(item => [
            item.purpose,
            item.count.toString(),
            `${item.percentage}%`,
            `${item.totalAmount} RON`
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['Scopul Plății', 'Număr', 'Procent', 'Suma Totală']],
            body: purposeData,
            theme: 'striped',
            headStyles: { fillColor: [102, 126, 234] },
            margin: { left: 20, right: 20 }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Analiza după monedă
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Analiza după Monedă', 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        const currencyData = this.reportData.currencyAnalysis.details.map(item => [
            item.currency,
            item.count.toString(),
            `${item.percentage}%`,
            `${item.totalAmount} ${item.currency}`
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['Monedă', 'Număr', 'Procent', 'Suma Totală']],
            body: currencyData,
            theme: 'striped',
            headStyles: { fillColor: [118, 75, 162] },
            margin: { left: 20, right: 20 }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Analiza sumelor
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Analiza Sumei Totale', 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const amountAnalysis = this.reportData.amountAnalysis;
        doc.text(`Suma Minimă: ${amountAnalysis.min} RON`, 25, yPos);
        yPos += 7;
        doc.text(`Suma Maximă: ${amountAnalysis.max} RON`, 25, yPos);
        yPos += 7;
        doc.text(`Suma Medie: ${amountAnalysis.average} RON`, 25, yPos);
        yPos += 7;
        doc.text(`Mediana: ${amountAnalysis.median} RON`, 25, yPos);
        yPos += 7;
        doc.text(`Suma Totală: ${amountAnalysis.total} RON`, 25, yPos);
        yPos += 15;

        // Analiza TVA
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Analiza după Cota TVA', 20, yPos);
        yPos += 10;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        const vatData = this.reportData.vatAnalysis.details.map(item => [
            item.vatRate,
            item.count.toString(),
            `${item.percentage}%`
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['Cota TVA', 'Număr', 'Procent']],
            body: vatData,
            theme: 'striped',
            headStyles: { fillColor: [52, 152, 219] },
            margin: { left: 20, right: 20 }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text(`Pagina ${i} din ${pageCount}`, 105, 285, { align: 'center' });
        }

        // Salvare PDF
        const fileName = `Raport_Analitic_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
    }
}

// Inițializare aplicație
document.addEventListener('DOMContentLoaded', () => {
    new ReportGenerator();
});


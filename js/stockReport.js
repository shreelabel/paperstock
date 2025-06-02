// Stock Report Functionality for Paper Stock Management
// Handles report generation, printing, and export features

class StockReportManager {
    constructor() {
        this.currentData = [];
        this.reportType = 'overview';
    }

    // Initialize report functionality
    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Report generation
        document.getElementById('generateReportBtn')?.addEventListener('click', () => {
            this.generateReport();
        });

        // Print functionality
        document.getElementById('printStockBtn')?.addEventListener('click', () => {
            this.printStock();
        });

        document.getElementById('printReportBtn')?.addEventListener('click', () => {
            this.printCurrentReport();
        });

        // Export functionality
        document.getElementById('exportExcelBtn')?.addEventListener('click', () => {
            this.exportToExcel();
        });

        document.getElementById('exportCSVBtn')?.addEventListener('click', () => {
            this.exportToCSV();
        });

        // Report type change
        document.getElementById('reportType')?.addEventListener('change', (e) => {
            this.reportType = e.target.value;
        });
    }

    // Generate comprehensive report
    async generateReport() {
        try {
            const response = await fetch('api/get_rolls.php');
            const data = await response.json();
            
            if (data.success) {
                this.currentData = data.rolls;
                this.displayReport(this.reportType, this.currentData);
            } else {
                this.showMessage('Error loading data for report', 'error');
            }
        } catch (error) {
            console.error('Error generating report:', error);
            this.showMessage('Error generating report', 'error');
        }
    }

    // Display report based on type
    displayReport(reportType, data) {
        const container = document.getElementById('reportContent');
        if (!container) return;

        let reportHTML = '';

        switch (reportType) {
            case 'overview':
                reportHTML = this.generateOverviewReport(data);
                break;
            case 'material':
                reportHTML = this.generateMaterialReport(data);
                break;
            case 'company':
                reportHTML = this.generateCompanyReport(data);
                break;
            case 'status':
                reportHTML = this.generateStatusReport(data);
                break;
            case 'detailed':
                reportHTML = this.generateDetailedReport(data);
                break;
            default:
                reportHTML = this.generateOverviewReport(data);
        }

        container.innerHTML = reportHTML;
    }

    // Generate overview report
    generateOverviewReport(data) {
        const totalRolls = data.length;
        const mainRolls = data.filter(r => r.rolltype === 'Main Roll').length;
        const slitRolls = data.filter(r => r.rolltype === 'Slit Roll').length;
        const stockRolls = data.filter(r => r.status === 'Stock').length;
        const jobRolls = data.filter(r => r.status === 'Job').length;
        
        const totalSquareMeter = data.reduce((sum, r) => sum + parseFloat(r.squaremeter || 0), 0);
        const totalWeight = data.reduce((sum, r) => sum + parseFloat(r.weight || 0), 0);

        const materials = [...new Set(data.map(r => r.material))].filter(Boolean);
        const companies = [...new Set(data.map(r => r.papercompany))].filter(Boolean);

        return `
            <div class="report-header text-center mb-4">
                <h2>Paper Stock Overview Report</h2>
                <p class="text-muted">Generated on ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="row mb-4">
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-primary">${totalRolls}</h3>
                            <p class="card-text">Total Rolls</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-success">${stockRolls}</h3>
                            <p class="card-text">In Stock</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-info">${totalSquareMeter.toFixed(2)}</h3>
                            <p class="card-text">Total Sq.M</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="card text-center">
                        <div class="card-body">
                            <h3 class="text-warning">${totalWeight.toFixed(2)}</h3>
                            <p class="card-text">Total Weight (kg)</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <h4>Roll Types</h4>
                    <ul class="list-group">
                        <li class="list-group-item d-flex justify-content-between">
                            <span>Main Rolls</span>
                            <span class="badge bg-primary rounded-pill">${mainRolls}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>Slit Rolls</span>
                            <span class="badge bg-secondary rounded-pill">${slitRolls}</span>
                        </li>
                    </ul>
                </div>
                <div class="col-md-6">
                    <h4>Status Distribution</h4>
                    <ul class="list-group">
                        <li class="list-group-item d-flex justify-content-between">
                            <span>Stock</span>
                            <span class="badge bg-success rounded-pill">${stockRolls}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between">
                            <span>Job</span>
                            <span class="badge bg-info rounded-pill">${jobRolls}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-md-6">
                    <h4>Materials (${materials.length})</h4>
                    <div class="list-group">
                        ${materials.map(material => {
                            const count = data.filter(r => r.material === material).length;
                            return `<div class="list-group-item d-flex justify-content-between">
                                <span>${material}</span>
                                <span class="badge bg-primary rounded-pill">${count}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
                <div class="col-md-6">
                    <h4>Companies (${companies.length})</h4>
                    <div class="list-group">
                        ${companies.map(company => {
                            const count = data.filter(r => r.papercompany === company).length;
                            return `<div class="list-group-item d-flex justify-content-between">
                                <span>${company}</span>
                                <span class="badge bg-primary rounded-pill">${count}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    // Generate material-wise report
    generateMaterialReport(data) {
        const materials = [...new Set(data.map(r => r.material))].filter(Boolean);
        
        return `
            <div class="report-header text-center mb-4">
                <h2>Material-wise Stock Report</h2>
                <p class="text-muted">Generated on ${new Date().toLocaleDateString()}</p>
            </div>

            ${materials.map(material => {
                const materialRolls = data.filter(r => r.material === material);
                const totalRolls = materialRolls.length;
                const stockRolls = materialRolls.filter(r => r.status === 'Stock').length;
                const totalSqM = materialRolls.reduce((sum, r) => sum + parseFloat(r.squaremeter || 0), 0);
                
                return `
                    <div class="card mb-3">
                        <div class="card-header">
                            <h4>${material}</h4>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <p><strong>Total Rolls:</strong> ${totalRolls}</p>
                                    <p><strong>In Stock:</strong> ${stockRolls}</p>
                                </div>
                                <div class="col-md-4">
                                    <p><strong>Total Sq.M:</strong> ${totalSqM.toFixed(2)}</p>
                                </div>
                                <div class="col-md-4">
                                    <p><strong>Companies:</strong> ${[...new Set(materialRolls.map(r => r.papercompany))].filter(Boolean).join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    // Generate company-wise report
    generateCompanyReport(data) {
        const companies = [...new Set(data.map(r => r.papercompany))].filter(Boolean);
        
        return `
            <div class="report-header text-center mb-4">
                <h2>Company-wise Stock Report</h2>
                <p class="text-muted">Generated on ${new Date().toLocaleDateString()}</p>
            </div>

            ${companies.map(company => {
                const companyRolls = data.filter(r => r.papercompany === company);
                const totalRolls = companyRolls.length;
                const stockRolls = companyRolls.filter(r => r.status === 'Stock').length;
                const totalSqM = companyRolls.reduce((sum, r) => sum + parseFloat(r.squaremeter || 0), 0);
                
                return `
                    <div class="card mb-3">
                        <div class="card-header">
                            <h4>${company}</h4>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-4">
                                    <p><strong>Total Rolls:</strong> ${totalRolls}</p>
                                    <p><strong>In Stock:</strong> ${stockRolls}</p>
                                </div>
                                <div class="col-md-4">
                                    <p><strong>Total Sq.M:</strong> ${totalSqM.toFixed(2)}</p>
                                </div>
                                <div class="col-md-4">
                                    <p><strong>Materials:</strong> ${[...new Set(companyRolls.map(r => r.material))].filter(Boolean).join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    // Generate status-wise report
    generateStatusReport(data) {
        const statuses = [...new Set(data.map(r => r.status))].filter(Boolean);
        
        return `
            <div class="report-header text-center mb-4">
                <h2>Status-wise Stock Report</h2>
                <p class="text-muted">Generated on ${new Date().toLocaleDateString()}</p>
            </div>

            ${statuses.map(status => {
                const statusRolls = data.filter(r => r.status === status);
                const totalRolls = statusRolls.length;
                const totalSqM = statusRolls.reduce((sum, r) => sum + parseFloat(r.squaremeter || 0), 0);
                
                return `
                    <div class="card mb-3">
                        <div class="card-header">
                            <h4>${status}</h4>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <p><strong>Total Rolls:</strong> ${totalRolls}</p>
                                    <p><strong>Total Sq.M:</strong> ${totalSqM.toFixed(2)}</p>
                                </div>
                                <div class="col-md-6">
                                    <p><strong>Materials:</strong> ${[...new Set(statusRolls.map(r => r.material))].filter(Boolean).join(', ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        `;
    }

    // Generate detailed report
    generateDetailedReport(data) {
        return `
            <div class="report-header text-center mb-4">
                <h2>Detailed Stock Report</h2>
                <p class="text-muted">Generated on ${new Date().toLocaleDateString()}</p>
            </div>

            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Roll Number</th>
                            <th>Material</th>
                            <th>Company</th>
                            <th>GSM</th>
                            <th>Width</th>
                            <th>Length</th>
                            <th>Sq.M</th>
                            <th>Status</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(roll => `
                            <tr>
                                <td>${roll.rollnumber}</td>
                                <td>${roll.material || '-'}</td>
                                <td>${roll.papercompany || '-'}</td>
                                <td>${roll.gsm || '-'}</td>
                                <td>${roll.width || '-'}</td>
                                <td>${roll.length || '-'}</td>
                                <td>${roll.squaremeter || '-'}</td>
                                <td><span class="badge bg-${roll.status === 'Stock' ? 'success' : 'info'}">${roll.status}</span></td>
                                <td>${roll.rolltype}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Print current stock
    printStock() {
        const printContent = document.getElementById('stockTableContainer')?.innerHTML;
        if (!printContent) {
            this.showMessage('No stock data to print', 'warning');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Paper Stock Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; font-weight: bold; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .no-print { display: none; }
                        @media print {
                            .no-print { display: none; }
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Paper Stock Management Report</h1>
                        <p>Generated on: ${new Date().toLocaleString()}</p>
                    </div>
                    ${printContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    // Print current report
    printCurrentReport() {
        const reportContent = document.getElementById('reportContent')?.innerHTML;
        if (!reportContent) {
            this.showMessage('No report to print. Generate a report first.', 'warning');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Paper Stock Report</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .card { border: 1px solid #ddd; margin-bottom: 15px; padding: 15px; }
                        .card-header { background-color: #f5f5f5; font-weight: bold; margin-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .list-group-item { padding: 5px 0; border-bottom: 1px solid #eee; }
                        .badge { background-color: #007bff; color: white; padding: 2px 6px; border-radius: 3px; }
                        @media print {
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${reportContent}
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    }

    // Export to Excel
    exportToExcel() {
        if (this.currentData.length === 0) {
            this.showMessage('No data to export', 'warning');
            return;
        }

        const csvData = this.convertToCSV(this.currentData);
        this.downloadCSV(csvData, `paper_stock_report_${new Date().toISOString().split('T')[0]}.csv`);
    }

    // Export to CSV
    exportToCSV() {
        if (this.currentData.length === 0) {
            this.showMessage('No data to export', 'warning');
            return;
        }

        const csvData = this.convertToCSV(this.currentData);
        this.downloadCSV(csvData, `paper_stock_${new Date().toISOString().split('T')[0]}.csv`);
    }

    // Convert data to CSV format
    convertToCSV(data) {
        const headers = [
            'Roll Number', 'Material', 'Paper Company', 'GSM', 'Width', 'Length', 
            'Weight', 'Lot No', 'Square Meter', 'Roll Type', 'Status', 'Date Added'
        ];

        const csvRows = [headers.join(',')];

        data.forEach(roll => {
            const row = [
                roll.rollnumber || '',
                roll.material || '',
                roll.papercompany || '',
                roll.gsm || '',
                roll.width || '',
                roll.length || '',
                roll.weight || '',
                roll.lotno || '',
                roll.squaremeter || '',
                roll.rolltype || '',
                roll.status || '',
                this.formatDate(roll.date_added) || ''
            ];
            csvRows.push(row.join(','));
        });

        return csvRows.join('\n');
    }

    // Download CSV file
    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    // Show message to user
    showMessage(message, type = 'info') {
        if (typeof showMessage === 'function') {
            showMessage(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize stock report manager
let stockReportManager;
document.addEventListener('DOMContentLoaded', function() {
    stockReportManager = new StockReportManager();
    stockReportManager.init();
});

// Export for global access
window.stockReportManager = stockReportManager;
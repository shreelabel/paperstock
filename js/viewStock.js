// View Stock Functionality for Paper Stock Management
// Handles stock display, filtering, sorting, and table operations

class ViewStockManager {
    constructor() {
        this.allRolls = [];
        this.filteredRolls = [];
        this.currentSort = { column: null, direction: 'asc' };
        this.filters = {
            material: '',
            company: '',
            gsm: '',
            width: '',
            length: '',
            status: '',
            rolltype: '',
            search: ''
        };
    }

    // Initialize view stock functionality
    init() {
        this.setupEventListeners();
        this.loadStock();
    }

    setupEventListeners() {
        // Filter controls
        document.getElementById('materialFilter')?.addEventListener('change', (e) => {
            this.filters.material = e.target.value;
            this.applyFilters();
        });

        document.getElementById('companyFilter')?.addEventListener('change', (e) => {
            this.filters.company = e.target.value;
            this.applyFilters();
        });

        document.getElementById('gsmFilter')?.addEventListener('change', (e) => {
            this.filters.gsm = e.target.value;
            this.applyFilters();
        });

        document.getElementById('widthFilter')?.addEventListener('change', (e) => {
            this.filters.width = e.target.value;
            this.applyFilters();
        });

        document.getElementById('lengthFilter')?.addEventListener('change', (e) => {
            this.filters.length = e.target.value;
            this.applyFilters();
        });

        document.getElementById('statusFilter')?.addEventListener('change', (e) => {
            this.filters.status = e.target.value;
            this.applyFilters();
        });

        document.getElementById('rolltypeFilter')?.addEventListener('change', (e) => {
            this.filters.rolltype = e.target.value;
            this.applyFilters();
        });

        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        // Clear filters button
        document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
            this.clearAllFilters();
        });

        // Refresh button
        document.getElementById('refreshStockBtn')?.addEventListener('click', () => {
            this.loadStock();
        });

        // Table sorting
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', () => {
                const column = header.dataset.column;
                this.sortTable(column);
            });
        });
    }

    // Load stock data from server
    async loadStock() {
        try {
            this.showLoading(true);
            
            const response = await fetch('api/get_rolls.php');
            const data = await response.json();
            
            if (data.success) {
                this.allRolls = data.rolls || [];
                this.populateFilterDropdowns();
                this.applyFilters();
                this.showMessage(`Loaded ${this.allRolls.length} rolls`, 'success');
            } else {
                this.showMessage('Error loading stock data: ' + data.message, 'error');
                this.allRolls = [];
                this.displayStock([]);
            }
        } catch (error) {
            console.error('Error loading stock:', error);
            this.showMessage('Error loading stock data', 'error');
            this.allRolls = [];
            this.displayStock([]);
        } finally {
            this.showLoading(false);
        }
    }

    // Show/hide loading indicator
    showLoading(show) {
        const loadingDiv = document.getElementById('loadingIndicator');
        if (loadingDiv) {
            loadingDiv.style.display = show ? 'block' : 'none';
        }
        
        const tableContainer = document.getElementById('stockTableContainer');
        if (tableContainer) {
            tableContainer.style.opacity = show ? '0.5' : '1';
        }
    }

    // Populate filter dropdowns with unique values
    populateFilterDropdowns() {
        this.populateMaterialFilter();
        this.populateCompanyFilter();
        this.populateGsmFilter();
        this.populateWidthFilter();
        this.populateLengthFilter();
        this.populateStatusFilter();
        this.populateRollTypeFilter();
    }

    populateMaterialFilter() {
        const materials = [...new Set(this.allRolls.map(r => r.material))].filter(Boolean).sort();
        this.populateSelect('materialFilter', materials, 'All Materials');
    }

    populateCompanyFilter() {
        const companies = [...new Set(this.allRolls.map(r => r.papercompany))].filter(Boolean).sort();
        this.populateSelect('companyFilter', companies, 'All Companies');
    }

    populateGsmFilter() {
        const gsms = [...new Set(this.allRolls.map(r => r.gsm))].filter(Boolean).sort((a, b) => a - b);
        this.populateSelect('gsmFilter', gsms, 'All GSM');
    }

    populateWidthFilter() {
        const widths = [...new Set(this.allRolls.map(r => r.width))].filter(Boolean).sort((a, b) => a - b);
        this.populateSelect('widthFilter', widths, 'All Widths');
    }

    populateLengthFilter() {
        const lengths = [...new Set(this.allRolls.map(r => r.length))].filter(Boolean).sort((a, b) => a - b);
        this.populateSelect('lengthFilter', lengths, 'All Lengths');
    }

    populateStatusFilter() {
        const statuses = [...new Set(this.allRolls.map(r => r.status))].filter(Boolean).sort();
        this.populateSelect('statusFilter', statuses, 'All Status');
    }

    populateRollTypeFilter() {
        const types = [...new Set(this.allRolls.map(r => r.rolltype))].filter(Boolean).sort();
        this.populateSelect('rolltypeFilter', types, 'All Types');
    }

    // Generic function to populate select elements
    populateSelect(selectId, options, defaultText) {
        const select = document.getElementById(selectId);
        if (!select) return;

        const currentValue = select.value;
        select.innerHTML = `<option value="">${defaultText}</option>`;
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });

        // Restore previous selection if it still exists
        if (currentValue && options.includes(currentValue)) {
            select.value = currentValue;
        }
    }

    // Apply all active filters
    applyFilters() {
        this.filteredRolls = this.allRolls.filter(roll => {
            return this.matchesFilter(roll, 'material', this.filters.material) &&
                   this.matchesFilter(roll, 'papercompany', this.filters.company) &&
                   this.matchesFilter(roll, 'gsm', this.filters.gsm) &&
                   this.matchesFilter(roll, 'width', this.filters.width) &&
                   this.matchesFilter(roll, 'length', this.filters.length) &&
                   this.matchesFilter(roll, 'status', this.filters.status) &&
                   this.matchesFilter(roll, 'rolltype', this.filters.rolltype) &&
                   this.matchesSearchFilter(roll, this.filters.search);
        });

        this.displayStock(this.filteredRolls);
        this.updateFilterCounts();
    }

    // Check if roll matches a specific filter
    matchesFilter(roll, field, filterValue) {
        if (!filterValue) return true;
        return String(roll[field] || '').toLowerCase() === String(filterValue).toLowerCase();
    }

    // Check if roll matches search filter
    matchesSearchFilter(roll, searchTerm) {
        if (!searchTerm) return true;
        
        const searchableFields = [
            'rollnumber', 'material', 'papercompany', 'lotno', 
            'jobname', 'jobno', 'mainrollnumber'
        ];
        
        return searchableFields.some(field => 
            String(roll[field] || '').toLowerCase().includes(searchTerm)
        );
    }

    // Update filter result counts
    updateFilterCounts() {
        const countElement = document.getElementById('filterResultCount');
        if (countElement) {
            countElement.textContent = `Showing ${this.filteredRolls.length} of ${this.allRolls.length} rolls`;
        }
    }

    // Clear all filters
    clearAllFilters() {
        // Reset filter values
        Object.keys(this.filters).forEach(key => {
            this.filters[key] = '';
        });

        // Reset form controls
        document.getElementById('materialFilter').value = '';
        document.getElementById('companyFilter').value = '';
        document.getElementById('gsmFilter').value = '';
        document.getElementById('widthFilter').value = '';
        document.getElementById('lengthFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('rolltypeFilter').value = '';
        document.getElementById('searchInput').value = '';

        // Reset sort
        this.currentSort = { column: null, direction: 'asc' };
        
        // Apply filters (will show all data)
        this.applyFilters();
        
        this.showMessage('All filters cleared', 'info');
    }

    // Sort table by column
    sortTable(column) {
        if (this.currentSort.column === column) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort.column = column;
            this.currentSort.direction = 'asc';
        }

        this.filteredRolls.sort((a, b) => {
            let aVal = a[column] || '';
            let bVal = b[column] || '';

            // Handle numeric columns
            if (['gsm', 'width', 'length', 'weight', 'squaremeter'].includes(column)) {
                aVal = parseFloat(aVal) || 0;
                bVal = parseFloat(bVal) || 0;
            } else {
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
            }

            let result = 0;
            if (aVal < bVal) result = -1;
            else if (aVal > bVal) result = 1;

            return this.currentSort.direction === 'desc' ? -result : result;
        });

        this.displayStock(this.filteredRolls);
        this.updateSortIndicators();
    }

    // Update sort indicators in table headers
    updateSortIndicators() {
        document.querySelectorAll('.sortable').forEach(header => {
            const column = header.dataset.column;
            const indicator = header.querySelector('.sort-indicator');
            
            if (column === this.currentSort.column) {
                if (indicator) {
                    indicator.textContent = this.currentSort.direction === 'asc' ? ' ↑' : ' ↓';
                }
            } else {
                if (indicator) {
                    indicator.textContent = '';
                }
            }
        });
    }

    // Display stock data in table
    displayStock(rolls) {
        const tableBody = document.getElementById('stockTableBody');
        if (!tableBody) return;

        if (rolls.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="12" class="text-center text-muted">
                        No rolls found matching current filters
                    </td>
                </tr>
            `;
            return;
        }

        // Group and sort rolls for better display
        const groupedRolls = this.groupAndSortRolls(rolls);
        
        tableBody.innerHTML = groupedRolls.map((roll, index) => 
            this.createStockRow(roll, index + 1)
        ).join('');
    }

    // Group and sort rolls (main rolls first, then slit rolls)
    groupAndSortRolls(rolls) {
        return rolls.sort((a, b) => {
            // First sort by main roll number
            const aMain = this.getMainRollNumber(a.rollnumber);
            const bMain = this.getMainRollNumber(b.rollnumber);
            
            if (aMain !== bMain) {
                return aMain.localeCompare(bMain);
            }
            
            // Then sort by suffix (main rolls first, then A, B, C, etc.)
            const aSuffix = this.getSuffix(a.rollnumber);
            const bSuffix = this.getSuffix(b.rollnumber);
            
            return this.suffixSort(aSuffix, bSuffix);
        });
    }

    // Get main roll number (part before any suffix)
    getMainRollNumber(rollNumber) {
        return rollNumber.split('-')[0];
    }

    // Get suffix from roll number
    getSuffix(rollNumber) {
        const parts = rollNumber.split('-');
        return parts.length > 1 ? parts[1] : '';
    }

    // Custom sort for suffixes (empty first, then letters, then numbers)
    suffixSort(a, b) {
        if (a === '' && b !== '') return -1;
        if (a !== '' && b === '') return 1;
        if (a === '' && b === '') return 0;
        
        const aIsLetter = /^[A-Z]$/.test(a);
        const bIsLetter = /^[A-Z]$/.test(b);
        const aIsNumber = /^\d+$/.test(a);
        const bIsNumber = /^\d+$/.test(b);
        
        if (aIsLetter && bIsLetter) return a.localeCompare(b);
        if (aIsNumber && bIsNumber) return parseInt(a) - parseInt(b);
        if (aIsLetter && bIsNumber) return -1;
        if (aIsNumber && bIsLetter) return 1;
        
        return a.localeCompare(b);
    }

    // Create table row for a roll
    createStockRow(roll, serialNo) {
        const isMainRoll = roll.rolltype === 'Main Roll';
        const rowClass = isMainRoll ? 'table-primary' : '';
        
        return `
            <tr class="${rowClass}">
                <td>${serialNo}</td>
                <td>
                    <strong>${roll.rollnumber}</strong>
                    ${roll.mainrollnumber ? `<br><small class="text-muted">Main: ${roll.mainrollnumber}</small>` : ''}
                </td>
                <td>${roll.material || '-'}</td>
                <td>${roll.papercompany || '-'}</td>
                <td>${roll.gsm || '-'}</td>
                <td>${roll.width || '-'}</td>
                <td>${roll.length || '-'}</td>
                <td>${roll.weight || '-'}</td>
                <td>${roll.squaremeter || '-'}</td>
                <td>
                    <span class="badge bg-${this.getStatusColor(roll.status)}">${roll.status}</span>
                </td>
                <td>
                    <span class="badge bg-${isMainRoll ? 'primary' : 'secondary'}">${roll.rolltype}</span>
                </td>
                <td>
                    ${this.createActionButtons(roll)}
                </td>
            </tr>
        `;
    }

    // Get status badge color
    getStatusColor(status) {
        switch (status?.toLowerCase()) {
            case 'stock': return 'success';
            case 'job': return 'info';
            case 'original': return 'warning';
            default: return 'secondary';
        }
    }

    // Create action buttons for each row
    createActionButtons(roll) {
        const isMainRoll = roll.rolltype === 'Main Roll';
        const canSlit = roll.status === 'Stock' && isMainRoll;
        
        return `
            <div class="btn-group btn-group-sm" role="group">
                <button class="btn btn-outline-primary" onclick="viewStockManager.showEditModal('${roll.rollnumber}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline-info" onclick="viewStockManager.printRoll('${roll.rollnumber}')" title="Print">
                    <i class="fas fa-print"></i>
                </button>
                ${canSlit ? `
                    <button class="btn btn-outline-success" onclick="viewStockManager.goToSlitTab('${roll.rollnumber}')" title="Slit">
                        <i class="fas fa-cut"></i>
                    </button>
                ` : ''}
                <button class="btn btn-outline-danger" onclick="viewStockManager.showDeleteModal('${roll.rollnumber}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
    }

    // Show edit modal for a specific roll
    async showEditModal(rollNumber) {
        const roll = this.allRolls.find(r => r.rollnumber === rollNumber);
        if (!roll) {
            this.showMessage('Roll not found', 'error');
            return;
        }

        // Populate edit form and show modal
        if (typeof showEditModal === 'function') {
            await showEditModal(rollNumber);
        }
    }

    // Show delete confirmation modal
    showDeleteModal(rollNumber) {
        if (typeof showDeleteModal === 'function') {
            showDeleteModal(rollNumber);
        }
    }

    // Print individual roll details
    printRoll(rollNumber) {
        if (typeof printRoll === 'function') {
            printRoll(rollNumber);
        }
    }

    // Navigate to slit tab with pre-selected roll
    goToSlitTab(rollNumber) {
        if (window.slitRollManager && typeof window.slitRollManager.goToSlitTab === 'function') {
            window.slitRollManager.goToSlitTab(rollNumber);
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
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    // Get current filtered data for export
    getCurrentData() {
        return this.filteredRolls;
    }

    // Refresh stock data
    async refresh() {
        await this.loadStock();
    }
}

// Initialize view stock manager
let viewStockManager;
document.addEventListener('DOMContentLoaded', function() {
    viewStockManager = new ViewStockManager();
    viewStockManager.init();
});

// Export for global access
window.viewStockManager = viewStockManager;
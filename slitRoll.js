// Slit Roll Functionality for Paper Stock Management
// Handles both multi-slit and edit modal slitting operations

class SlitRollManager {
    constructor() {
        this.originalRoll = null;
        this.slitInputs = [];
        this.isMultiSlit = false;
    }

    // Initialize slit roll functionality
    init() {
        this.setupEventListeners();
        this.populateMultiSlitDropdown();
    }

    setupEventListeners() {
        // Multi-slit tab events
        document.getElementById('multiSlitRollSelect')?.addEventListener('change', () => {
            this.handleMultiSlitRollSelection();
        });

        document.getElementById('addSlitBtn')?.addEventListener('click', () => {
            this.addSlitInput();
        });

        document.getElementById('processMultiSlitBtn')?.addEventListener('click', () => {
            this.processMultiSlit();
        });

        document.getElementById('clearSlitBtn')?.addEventListener('click', () => {
            this.clearSlitInputs();
        });

        // Edit modal slit events
        document.getElementById('addSlitInputEdit')?.addEventListener('click', () => {
            this.addSlitInputEdit();
        });
    }

    // Populate multi-slit dropdown with available rolls
    async populateMultiSlitDropdown() {
        try {
            const response = await fetch('api/get_rolls.php');
            const data = await response.json();
            
            if (data.success) {
                const select = document.getElementById('multiSlitRollSelect');
                if (!select) return;

                select.innerHTML = '<option value="">Select a roll to slit</option>';
                
                data.rolls.forEach(roll => {
                    if (roll.status === 'Stock' && roll.rolltype === 'Main Roll') {
                        const option = document.createElement('option');
                        option.value = roll.rollnumber;
                        option.textContent = `${roll.rollnumber} - ${roll.material} (${roll.width}x${roll.length})`;
                        select.appendChild(option);
                    }
                });
            }
        } catch (error) {
            console.error('Error loading rolls:', error);
        }
    }

    // Handle multi-slit roll selection
    async handleMultiSlitRollSelection() {
        const rollNumber = document.getElementById('multiSlitRollSelect').value;
        if (!rollNumber) {
            this.clearOriginalRollDetails();
            return;
        }

        try {
            const response = await fetch('api/get_rolls.php');
            const data = await response.json();
            
            if (data.success) {
                const roll = data.rolls.find(r => r.rollnumber === rollNumber);
                if (roll) {
                    this.originalRoll = roll;
                    this.displayOriginalRollDetails(roll);
                    this.setupSlitInputs(roll);
                }
            }
        } catch (error) {
            console.error('Error loading roll details:', error);
        }
    }

    // Display original roll details
    displayOriginalRollDetails(roll) {
        const detailsDiv = document.getElementById('originalRollDetails');
        if (!detailsDiv) return;

        detailsDiv.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Roll Number:</strong> ${roll.rollnumber}</p>
                    <p><strong>Material:</strong> ${roll.material}</p>
                    <p><strong>Company:</strong> ${roll.papercompany}</p>
                    <p><strong>GSM:</strong> ${roll.gsm}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Width:</strong> ${roll.width} mm</p>
                    <p><strong>Length:</strong> ${roll.length} m</p>
                    <p><strong>Weight:</strong> ${roll.weight} kg</p>
                    <p><strong>Square Meter:</strong> ${roll.squaremeter}</p>
                </div>
            </div>
        `;
    }

    // Clear original roll details
    clearOriginalRollDetails() {
        const detailsDiv = document.getElementById('originalRollDetails');
        if (detailsDiv) {
            detailsDiv.innerHTML = '';
        }
        this.clearSlitInputs();
    }

    // Setup initial slit inputs
    setupSlitInputs(roll) {
        this.clearSlitInputs();
        this.addSlitInput(roll);
        this.addSlitInput(roll);
    }

    // Add a new slit input row
    addSlitInput(roll = null) {
        const container = document.getElementById('slitInputsContainer');
        if (!container) return;

        const index = this.slitInputs.length;
        const suffix = String.fromCharCode(65 + index); // A, B, C, etc.
        
        const inputRow = document.createElement('div');
        inputRow.className = 'row mb-3 slit-input-row';
        inputRow.innerHTML = `
            <div class="col-md-2">
                <label class="form-label">Suffix</label>
                <input type="text" class="form-control suffix-input" value="${suffix}" readonly>
            </div>
            <div class="col-md-2">
                <label class="form-label">Width (mm)</label>
                <input type="number" class="form-control width-input" min="1" required>
            </div>
            <div class="col-md-2">
                <label class="form-label">Length (m)</label>
                <input type="number" class="form-control length-input" min="0.1" step="0.1" required>
            </div>
            <div class="col-md-2">
                <label class="form-label">Status</label>
                <select class="form-control status-input">
                    <option value="Stock">Stock</option>
                    <option value="Job">Job</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">Job Name</label>
                <input type="text" class="form-control jobname-input" placeholder="Optional">
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-danger mt-4" onclick="this.closest('.slit-input-row').remove(); slitRollManager.updateSlitButtonText();">
                    Remove
                </button>
            </div>
        `;
        
        container.appendChild(inputRow);
        this.slitInputs.push(inputRow);
        
        // Add event listeners for real-time calculation
        const widthInput = inputRow.querySelector('.width-input');
        const lengthInput = inputRow.querySelector('.length-input');
        
        widthInput?.addEventListener('input', () => this.calculateRemainingDimensions());
        lengthInput?.addEventListener('input', () => this.calculateRemainingDimensions());
        
        this.updateSlitButtonText();
    }

    // Remove slit input (used by inline onclick)
    removeSlitInput(button) {
        const row = button.closest('.slit-input-row');
        const index = Array.from(row.parentNode.children).indexOf(row);
        
        row.remove();
        this.slitInputs.splice(index, 1);
        
        // Update suffixes
        this.updateSuffixes();
        this.updateSlitButtonText();
        this.calculateRemainingDimensions();
    }

    // Update suffixes after removal
    updateSuffixes() {
        const rows = document.querySelectorAll('.slit-input-row');
        rows.forEach((row, index) => {
            const suffixInput = row.querySelector('.suffix-input');
            if (suffixInput) {
                suffixInput.value = String.fromCharCode(65 + index);
            }
        });
    }

    // Calculate remaining dimensions
    calculateRemainingDimensions() {
        if (!this.originalRoll) return;

        let totalUsedWidth = 0;
        let maxUsedLength = 0;

        const rows = document.querySelectorAll('.slit-input-row');
        rows.forEach(row => {
            const width = parseInt(row.querySelector('.width-input').value) || 0;
            const length = parseFloat(row.querySelector('.length-input').value) || 0;
            
            totalUsedWidth += width;
            maxUsedLength = Math.max(maxUsedLength, length);
        });

        const remainingWidth = this.originalRoll.width - totalUsedWidth;
        const remainingLength = this.originalRoll.length - maxUsedLength;

        this.updateRemainingDisplay(remainingWidth, remainingLength);
    }

    // Update remaining display
    updateRemainingDisplay(remainingWidth, remainingLength) {
        const remainingDiv = document.getElementById('remainingDimensions');
        if (!remainingDiv) return;

        const widthStatus = remainingWidth >= 0 ? 'text-success' : 'text-danger';
        const lengthStatus = remainingLength >= 0 ? 'text-success' : 'text-danger';

        remainingDiv.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <p class="${widthStatus}"><strong>Remaining Width:</strong> ${remainingWidth} mm</p>
                </div>
                <div class="col-md-6">
                    <p class="${lengthStatus}"><strong>Remaining Length:</strong> ${remainingLength.toFixed(1)} m</p>
                </div>
            </div>
        `;
    }

    // Update slit button text
    updateSlitButtonText() {
        const button = document.getElementById('processMultiSlitBtn');
        const count = document.querySelectorAll('.slit-input-row').length;
        if (button) {
            button.textContent = `Process ${count} Slit${count !== 1 ? 's' : ''}`;
        }
    }

    // Process multi-slit operation
    async processMultiSlit() {
        if (!this.originalRoll) {
            this.showMessage('Please select a roll first', 'error');
            return;
        }

        const rows = document.querySelectorAll('.slit-input-row');
        if (rows.length === 0) {
            this.showMessage('Please add at least one slit', 'error');
            return;
        }

        const slits = [];
        let isValid = true;

        rows.forEach(row => {
            const suffix = row.querySelector('.suffix-input').value;
            const width = parseInt(row.querySelector('.width-input').value);
            const length = parseFloat(row.querySelector('.length-input').value);
            const status = row.querySelector('.status-input').value;
            const jobname = row.querySelector('.jobname-input').value;

            if (!width || !length) {
                isValid = false;
                return;
            }

            slits.push({
                suffix: suffix,
                width: width,
                length: length,
                status: status,
                jobname: jobname
            });
        });

        if (!isValid) {
            this.showMessage('Please fill in all width and length values', 'error');
            return;
        }

        try {
            const response = await fetch('api/slit_roll.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    originalRollNumber: this.originalRoll.rollnumber,
                    slits: slits,
                    isMultiSlit: true
                })
            });

            const result = await response.json();

            if (result.success) {
                this.showMessage('Roll slit successfully!', 'success');
                this.clearSlitInputs();
                this.clearOriginalRollDetails();
                document.getElementById('multiSlitRollSelect').value = '';
                
                // Refresh stock and go to View Stock tab
                if (typeof loadStock === 'function') {
                    await loadStock();
                }
                
                // Switch to View Stock tab
                const viewStockTab = document.querySelector('a[href="#viewStock"]');
                if (viewStockTab) {
                    viewStockTab.click();
                }
            } else {
                this.showMessage('Error: ' + result.message, 'error');
            }
        } catch (error) {
            console.error('Slit error:', error);
            this.showMessage('Error processing slit operation', 'error');
        }
    }

    // Clear slit inputs
    clearSlitInputs() {
        const container = document.getElementById('slitInputsContainer');
        if (container) {
            container.innerHTML = '';
        }
        this.slitInputs = [];
        this.updateSlitButtonText();
        
        const remainingDiv = document.getElementById('remainingDimensions');
        if (remainingDiv) {
            remainingDiv.innerHTML = '';
        }
    }

    // Add slit input for edit modal
    addSlitInputEdit() {
        const container = document.getElementById('editSlitInputsContainer');
        if (!container) return;

        const index = container.children.length + 1;
        
        const inputRow = document.createElement('div');
        inputRow.className = 'row mb-2 edit-slit-input-row';
        inputRow.innerHTML = `
            <div class="col-md-3">
                <input type="number" class="form-control" placeholder="Width (mm)" min="1" required>
            </div>
            <div class="col-md-3">
                <input type="number" class="form-control" placeholder="Length (m)" min="0.1" step="0.1" required>
            </div>
            <div class="col-md-3">
                <select class="form-control">
                    <option value="Stock">Stock</option>
                    <option value="Job">Job</option>
                </select>
            </div>
            <div class="col-md-3">
                <button type="button" class="btn btn-sm btn-danger" onclick="this.closest('.edit-slit-input-row').remove();">
                    Remove
                </button>
            </div>
        `;
        
        container.appendChild(inputRow);
    }

    // Show message to user
    showMessage(message, type = 'info') {
        // Try to use existing showMessage function or create alert
        if (typeof showMessage === 'function') {
            showMessage(message, type);
        } else {
            alert(message);
        }
    }

    // Go to slit tab with specific roll
    goToSlitTab(rollNumber) {
        // Switch to Multi Slit tab
        const slitTab = document.querySelector('a[href="#multiSlit"]');
        if (slitTab) {
            slitTab.click();
        }

        // Set the roll in dropdown
        setTimeout(() => {
            const select = document.getElementById('multiSlitRollSelect');
            if (select) {
                select.value = rollNumber;
                this.handleMultiSlitRollSelection();
            }
        }, 100);
    }
}

// Initialize slit roll manager when DOM is loaded
let slitRollManager;
document.addEventListener('DOMContentLoaded', function() {
    slitRollManager = new SlitRollManager();
    slitRollManager.init();
});

// Export for global access
window.slitRollManager = slitRollManager;
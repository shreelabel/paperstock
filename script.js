// Global variables
let currentStock = [];
let isAdminLoggedIn = false;
let rollToDelete = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Application starting...');
    updateLoginState();
    loadStock();
    populateDropdowns();
    // Add form submit handler
    document.getElementById('addRollForm').addEventListener('submit', handleAddRoll);

    // Add password change form handler
    const changePasswordForm = document.getElementById('changePasswordForm');
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', handlePasswordChange);
    }

    // Add filter handlers
    document.getElementById('searchInput').addEventListener('input', applyFilters);
    document.getElementById('materialFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    document.getElementById('companyFilter').addEventListener('change', applyFilters);

    // Multi-slit dropdown handler
    document.getElementById('multiSlitRollSelect').addEventListener('change', handleMultiSlitRollSelection);

    // Slitting checkbox handler
    document.getElementById('enableSlitting').addEventListener('change', function() {
        const slittingSection = document.getElementById('slittingSection');
        if (this.checked) {
            slittingSection.classList.remove('d-none');
            populateSlitInputs();
        } else {
            slittingSection.classList.add('d-none');
            clearSlitInputs();
        }
    });

    // Stock Report type change handler
    document.getElementById('reportType').addEventListener('change', function() {
        const dateRangeFilter = document.getElementById('dateRangeFilter');
        if (this.value === 'date') {
            dateRangeFilter.style.display = 'block';
        } else {
            dateRangeFilter.style.display = 'none';
        }
        generateReport();
    });

    // Manual tab click handlers
    document.getElementById('settings-tab').addEventListener('click', function(e) {
        e.preventDefault();
        console.log('Settings tab clicked');

        // Hide all tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('show', 'active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Create settings content dynamically
        let settingsOverlay = document.getElementById('settings-overlay');
        if (settingsOverlay) {
            settingsOverlay.remove();
        }

        settingsOverlay = document.createElement('div');
        settingsOverlay.id = 'settings-overlay';
        settingsOverlay.style.cssText = `
            position: fixed;
            top: 80px;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: white;
            z-index: 10000;
            padding: 20px;
            overflow-y: auto;
        `;

        settingsOverlay.innerHTML = `
            <div class="container">
                <h2 class="mb-4"><i class="fas fa-cog me-2"></i>Admin Settings</h2>
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5>Change Admin Password</h5>
                            </div>
                            <div class="card-body">
                                <form id="changePasswordForm">
                                    <div class="mb-3">
                                        <label class="form-label">Current Password</label>
                                        <input type="password" class="form-control" id="currentPassword" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">New Password</label>
                                        <input type="password" class="form-control" id="newPassword" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Confirm New Password</label>
                                        <input type="password" class="form-control" id="confirmPassword" required>
                                    </div>
                                    <button type="submit" class="btn btn-primary">Change Password</button>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="card">
                            <div class="card-header">
                                <h5>System Information</h5>
                            </div>
                            <div class="card-body">
                                <p><strong>System:</strong> Paper Stock Management v1.0</p>
                                <p><strong>Database:</strong> SQLite</p>
                                <p><strong>Admin:</strong> admin</p>
                                <p><strong>Status:</strong> <span class="text-success">Active</span></p>
                            </div>
                        </div>
                    </div>
                </div>
                <button class="btn btn-secondary mt-3" onclick="document.getElementById('settings-overlay').remove(); document.getElementById('view-stock-tab').click();">Close Settings</button>
            </div>
        `;

        document.body.appendChild(settingsOverlay);
        console.log('Settings overlay created and displayed');

        // Activate settings tab
        this.classList.add('active');
    });

    // Tab navigation handlers
    document.addEventListener('shown.bs.tab', function(event) {
        const targetTab = event.target.getAttribute('href');
        console.log('Tab shown:', targetTab); // Log which tab is shown

        if (targetTab === '#stock-report') {
            // Load Stock Report when tab is activated
            setTimeout(() => {
                generateReport();
            }, 100);
        } else if (targetTab === '#add-roll') { // Check if Add Roll tab is shown
             console.log('Add Roll tab shown, fetching dropdown data...');
             fetchAndPopulateAddRollDropdowns(); // Fetch and populate Add Roll dropdowns when tab is shown
        }
    });
});

// Login/Logout functions
function handleLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === 'admin123') {
        isAdminLoggedIn = true;
        localStorage.setItem('adminLoggedIn', 'true');
        updateLoginState();
        loadStock(); // Reload to show admin buttons
        showMessage('Admin login successful', 'success');
    } else {
        showMessage('Invalid password', 'error');
    }
    document.getElementById('adminPassword').value = '';
}

function handleLogout() {
    isAdminLoggedIn = false;
    localStorage.removeItem('adminLoggedIn');
    updateLoginState();
    loadStock(); // Reload to hide admin buttons
    showMessage('Logged out successfully', 'info');
}

function updateLoginState() {
    isAdminLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const loginBtn = document.querySelector('button[onclick="handleLogin()"]');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminStatus = document.getElementById('adminStatus');
    const addRollTabItem = document.getElementById('add-roll-tab-item');
    const settingsTabItem = document.getElementById('settings-tab-item');

    if (isAdminLoggedIn) {
        loginBtn.style.display = 'none';
        logoutBtn.classList.remove('d-none');
        adminStatus.textContent = 'Admin';
        adminStatus.className = 'text-success ms-2';

        // Show Add Roll tab for admin
        if (addRollTabItem) {
            addRollTabItem.style.display = 'block';
        }

        // Show Settings tab for admin
        if (settingsTabItem) {
            settingsTabItem.style.display = 'block';
        }
    } else {
        loginBtn.style.display = 'inline-block';
        logoutBtn.classList.add('d-none');
        adminStatus.textContent = 'Guest';
        adminStatus.className = 'text-warning ms-2';

        // Hide Add Roll tab for non-admin
        if (addRollTabItem) {
            addRollTabItem.style.display = 'none';
        }

        // Hide Settings tab for non-admin
        if (settingsTabItem) {
            settingsTabItem.style.display = 'none';
        }

        // Switch to View Stock tab if currently on Add Roll or Settings
        const addRollTab = document.getElementById('add-roll-tab');
        const settingsTab = document.getElementById('settings-tab');
        const viewStockTab = document.getElementById('view-stock-tab');
        if ((addRollTab && addRollTab.classList.contains('active')) ||
            (settingsTab && settingsTab.classList.contains('active'))) {
            if (viewStockTab) {
                viewStockTab.click();
            }
        }
    }
}

// Load stock data
async function loadStock() {
    try {
        const response = await fetch('/get_rolls.php');
        const result = await response.json();

        // Handle both formats: direct array or {success: true, data: array}
        let stockData = [];
        if (Array.isArray(result)) {
            stockData = result;
        } else if (result.success && Array.isArray(result.data)) {
            stockData = result.data;
        } else if (result.error) {
            console.error('API Error:', result.error);
            showMessage('Database error: ' + result.error, 'error');
            stockData = [];
        } else {
            console.error('Unexpected response format:', result);
            stockData = [];
        }

        currentStock = stockData;
        displayStock(stockData);
        populateDropdowns();
        populateMultiSlitDropdown();
        // populateAddRollDropdowns(stockData); // Populate Add Roll dropdowns - now fetched from dedicated endpoint
    } catch (error) {
        console.error('Error loading stock:', error);
        currentStock = [];
        displayStock([]);
        showMessage('Error loading stock data', 'error');
    }
}

// Display stock in table
function displayStock(stock) {
    const tbody = document.getElementById('stockTableBody');
    tbody.innerHTML = '';

    if (!stock || stock.length === 0) {
        tbody.innerHTML = '<tr><td colspan="16" class="text-center">No rolls found</td></tr>';
        return;
    }

    // Group and sort rolls
    const groupedRolls = groupAndSortRolls(stock);

    groupedRolls.forEach((roll, index) => {
        const row = createStockRow(roll, index);
        tbody.appendChild(row);
    });
}

// Create table row for stock
function createStockRow(roll, index) {
    const row = document.createElement('tr');

    // Apply status-based styling
    if (roll.rolltype === 'Main Roll') {
        row.className = 'status-original';
    } else {
        switch (roll.status.toLowerCase()) {
            case 'stock':
                row.className = 'status-stock';
                break;
            case 'printing':
                row.className = 'status-printing';
                break;
            case 'used':
                row.className = 'status-used';
                break;
            default:
                row.className = 'status-stock';
        }
    }

    // Format roll number display with special styling for (Main)
    let displayRollNumber = roll.rollnumber || '';
    if (roll.rolltype === 'Main Roll') {
        displayRollNumber = `${roll.rollnumber} <span class="main-label">(Main)</span>`;
    }

    // Create cells
    row.innerHTML = `
        <td>${index + 1}</td>
        <td>${displayRollNumber}</td>
        <td>${roll.status || ''}</td>
        <td>${roll.material || ''}</td>
        <td>${roll.papercompany || ''}</td>
        <td>${parseInt(roll.gsm) || 0}</td>
        <td>${parseInt(roll.width) || 0}</td>
        <td>${parseInt(roll.length) || 0}</td>
        <td>${parseFloat(roll.squaremeter) || 0}</td>
        <td>${parseInt(roll.weight) || 0}</td>
        <td>${roll.lotno || ''}</td>
        <td>${roll.jobname || ''}</td>
        <td>${roll.jobno || ''}</td>
        <td>${roll.jobsize || ''}</td>
        <td>${formatDate(roll.date_added)}</td>
        <td class="action-col">
            ${createActionButtons(roll)}
        </td>
    `;

    return row;
}

// Create action buttons
function createActionButtons(roll) {
    let buttons = '';

    // Print button - always available
    buttons += `<button class="action-btn print-btn" onclick="printRoll('${roll.rollnumber}')" title="Print">
        <i class="fas fa-print"></i>
    </button>`;

    // Slit button - available for Stock rolls, redirects to Multi Slit tab
    if (roll.status === 'Stock') {
        buttons += `<button class="action-btn slit-btn" onclick="goToSlitTab('${roll.rollnumber}')" title="Slit Roll">
            <i class="fas fa-cut"></i>
        </button>`;
    }

    // Admin-only buttons (disabled for sample roll 123456)
    if (isAdminLoggedIn) {
        const isSampleRoll = roll.rollnumber === '123456';

        if (isSampleRoll) {
            buttons += `<button class="action-btn" style="background: #6c757d; cursor: not-allowed;" disabled title="Sample Roll - Cannot Edit">
                <i class="fas fa-edit"></i>
            </button>`;
            buttons += `<button class="action-btn" style="background: #6c757d; cursor: not-allowed;" disabled title="Sample Roll - Cannot Delete">
                <i class="fas fa-trash"></i>
            </button>`;
        } else {
            buttons += `<button class="action-btn edit-btn" onclick="showEditModal('${roll.rollnumber}')" title="Edit">
                <i class="fas fa-edit"></i>
            </button>`;
            buttons += `<button class="action-btn delete-btn" onclick="showDeleteModal('${roll.rollnumber}')" title="Delete">
                <i class="fas fa-trash"></i>
            </button>`;
        }
    }

    return buttons;
}

// Group and sort rolls function
function groupAndSortRolls(rolls) {
    if (!Array.isArray(rolls)) {
        console.error('groupAndSortRolls: rolls is not an array', rolls);
        return [];
    }

    const grouped = {};

    rolls.forEach(roll => {
        const mainRoll = roll.mainrollnumber || roll.rollnumber;
        if (!grouped[mainRoll]) {
            grouped[mainRoll] = [];
        }
        grouped[mainRoll].push(roll);
    });

    const result = [];
    Object.keys(grouped).sort().forEach(mainRoll => {
        const group = grouped[mainRoll];

        // Sort within group: Main Roll first, then slit rolls in order (-A, -B, -C)
        group.sort((a, b) => {
            if (a.rolltype === 'Main Roll' && b.rolltype !== 'Main Roll') return -1;
            if (b.rolltype === 'Main Roll' && a.rolltype !== 'Main Roll') return 1;

            // Both are slit rolls, sort by suffix
            if (a.rolltype === 'Slit Roll' && b.rolltype === 'Slit Roll') {
                const getSuffix = (rollNumber) => {
                    const parts = rollNumber.split('-');
                    return parts.length > 1 ? parts[1] : '';
                };

                const suffixA = getSuffix(a.rollnumber);
                const suffixB = getSuffix(b.rollnumber);

                return suffixA.localeCompare(suffixB);
            }

            return a.rollnumber.localeCompare(b.rollnumber);
        });

        result.push(...group);
    });

    return result;
}

// Handle custom material selection
function handleMaterialChange() {
    const materialSelect = document.getElementById('material');
    const customMaterialInput = document.getElementById('customMaterial');

    if (materialSelect.value === 'Custom') {
        customMaterialInput.classList.remove('d-none');
        customMaterialInput.required = true;
    } else {
        customMaterialInput.classList.add('d-none');
        customMaterialInput.required = false;
        customMaterialInput.value = '';
    }
}

// Handle custom company selection
function handleCompanyChange() {
    const companySelect = document.getElementById('paperCompany');
    const customCompanyInput = document.getElementById('customCompany');

    if (companySelect.value === 'Custom') {
        customCompanyInput.classList.remove('d-none');
        customCompanyInput.required = true;
    } else {
        customCompanyInput.classList.add('d-none');
        customCompanyInput.required = false;
        customCompanyInput.value = '';
    }
}

// Add roll function
async function handleAddRoll(event) {
    event.preventDefault();

    // Check if user is admin
    if (!isAdminLoggedIn) {
        showMessage('Only admin users can add new rolls. Please login as admin.', 'error');
        return;
    }

    // Get material value (custom or selected)
    const materialSelect = document.getElementById('material');
    const customMaterial = document.getElementById('customMaterial');
    const material = materialSelect.value === 'Custom' ? customMaterial.value : materialSelect.value;

    // Get company value (custom or selected)
    const companySelect = document.getElementById('paperCompany');
    const customCompany = document.getElementById('customCompany');
    const paperCompany = companySelect.value === 'Custom' ? customCompany.value : companySelect.value;

    const formData = {
        rollNumber: document.getElementById('rollNumber').value,
        material: material,
        paperCompany: paperCompany,
        gsm: document.getElementById('gsm').value,
        width: document.getElementById('width').value,
        length: document.getElementById('length').value,
        weight: document.getElementById('weight').value,
        lotNo: document.getElementById('lotNo').value,
        squareMeter: document.getElementById('squareMeter').value
    };

    try {
        const response = await fetch('/add_roll.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Roll added successfully!', 'success');
            // Reset form and restore default values
            document.getElementById('addRollForm').reset();
            document.getElementById('width').value = '1000';
            document.getElementById('length').value = '2000';
            document.getElementById('weight').value = '10';
            document.getElementById('material').value = 'Chromo';
            document.getElementById('paperCompany').value = 'Camline';
            // Hide custom input fields
            document.getElementById('customMaterial').classList.add('d-none');
            document.getElementById('customCompany').classList.add('d-none');
            // Reload stock data
            loadStock();
            // Also re-populate Add Roll dropdowns in case new material/company was added
            fetchAndPopulateAddRollDropdowns();

            // Automatically redirect to View Stock tab after successful addition
            setTimeout(() => {
                // Remove active class from all tabs and panes
                document.querySelectorAll('.nav-link').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('show', 'active');
                });

                // Activate View Stock tab
                const viewStockTab = document.getElementById('view-stock-tab');
                const viewStockPane = document.getElementById('view-stock');

                if (viewStockTab && viewStockPane) {
                    viewStockTab.classList.add('active');
                    viewStockPane.classList.add('show', 'active');
                }
            }, 1000); // 1 second delay to allow success message to be seen
        } else {
            showMessage(result.message || 'Error adding roll', 'error');
        }
    } catch (error) {
        console.error('Error adding roll:', error);
        showMessage('Error adding roll', 'error');
    }
}

// Edit modal functions
async function showEditModal(rollNumber) {
    // Check admin access first
    if (!isAdminLoggedIn) {
        showMessage('Only admin users can edit rolls. Please login as admin.', 'error');
        return;
    }

    try {
        const roll = currentStock.find(r => r.rollnumber === rollNumber);
        if (!roll) {
            showMessage('Roll not found', 'error');
            return;
        }

        // Populate edit form with safe assignments
        const setFieldValue = (id, value) => {
            const field = document.getElementById(id);
            if (field) {
                field.value = value || '';
            } else {
                console.warn(`Field with id '${id}' not found`);
            }
        };

        setFieldValue('editRollId', roll.id);
        setFieldValue('editRollNumber', roll.rollnumber);
        setFieldValue('editMaterial', roll.material);
        setFieldValue('editPaperCompany', roll.papercompany);
        setFieldValue('editGsm', roll.gsm);
        setFieldValue('editWidth', roll.width);
        setFieldValue('editLength', roll.length);
        setFieldValue('editWeight', roll.weight);
        setFieldValue('editLotNo', roll.lotno);
        setFieldValue('editStatus', roll.status);
        setFieldValue('editJobName', roll.jobname);
        setFieldValue('editJobNo', roll.jobno);
        setFieldValue('editJobSize', roll.jobsize);

        // Reset slitting section
        const slittingCheckbox = document.getElementById('enableSlitting');
        const slittingSection = document.getElementById('slittingSection');
        if (slittingCheckbox) slittingCheckbox.checked = false;
        if (slittingSection) slittingSection.classList.add('d-none');
        clearSlitInputs();

        const modal = new bootstrap.Modal(document.getElementById('editModal'));
        modal.show();
    } catch (error) {
        console.error('Error showing edit modal:', error);
        showMessage('Error loading roll data', 'error');
    }
}

// Save edited roll
async function saveEditRoll() {
    const originalRollNumber = document.getElementById('editRollNumber').value;
    const enableSlitting = document.getElementById('enableSlitting').checked;

    if (enableSlitting) {
        // Handle slitting
        const slitInputs = document.querySelectorAll('#slitInputsEdit .slit-input-group');
        const slits = [];

        if (slitInputs.length === 0) {
            showMessage('Please add at least one slit when slitting is enabled', 'error');
            return;
        }

        let totalSlitWidth = 0; // Calculate total width for validation
        slitInputs.forEach((group, index) => {
            const width = parseFloat(group.querySelector('.slit-width').value) || 0;
            const length = parseFloat(group.querySelector('.slit-length').value) || 0; // Use parseFloat for length too
            const status = group.querySelector('.slit-status').value;

            totalSlitWidth += width;

            if (width > 0 && length > 0) { // Ensure width and length are positive
                slits.push({
                    width: width, // Keep as float/number
                    length: length, // Keep as float/number
                    status: status,
                    // Generate suffixes -1, -2, etc.
                    suffix: '-' + (index + 1) // Corrected suffix generation
                });
            }
        });

        // Get original roll width for final validation
        const originalRoll = currentStock.find(r => r.rollnumber === originalRollNumber);
        if (originalRoll && totalSlitWidth > originalRoll.width) {
             showMessage(`Total slit width (${totalSlitWidth}mm) exceeds original roll width (${originalRoll.width}mm)`, 'error');
             return; // Stop processing if validation fails
        }


        if (slits.length === 0) {
             showMessage('Please ensure all slit inputs have valid positive width and length values', 'error');
             return;
        }

        try {
            console.log('Sending slit data from Edit Modal:', {
                rollNumber: originalRollNumber,
                slits: slits,
                isMultiSlit: false // Indicate this is from the edit modal slitting
            });

            const response = await fetch('/slit_roll.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rollNumber: originalRollNumber,
                    slits: slits,
                    isMultiSlit: false // Indicate this is from the edit modal slitting
                })
            });

            console.log('Response status from slit_roll.php:', response.status);
            const responseText = await response.text();
            console.log('Response text from slit_roll.php:', responseText);

            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                console.error('Failed to parse JSON from slit_roll.php:', e);
                throw new Error('Invalid response format from slit_roll.php');
            }

            if (result.success) {
                showMessage('Roll slit successfully', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
                loadStock();

                // Automatically redirect to View Stock tab
                setTimeout(() => {
                    document.querySelectorAll('.nav-link').forEach(tab => tab.classList.remove('active'));
                    document.querySelectorAll('.tab-pane').forEach(pane => {
                        pane.classList.remove('show', 'active');
                    });
                    const viewStockTab = document.getElementById('view-stock-tab');
                    const viewStockPane = document.getElementById('view-stock');
                    if (viewStockTab && viewStockPane) {
                        viewStockTab.classList.add('active');
                        viewStockPane.classList.add('show', 'active');
                    }
                }, 1000);
            } else {
                showMessage(result.message || 'Error slitting roll', 'error');
            }
        } catch (error) {
            console.error('Error processing slit from Edit Modal:', error);
            showMessage('Error processing slit', 'error');
        }

    } else {
        // Handle standard roll update (no slitting)
        const formData = {
            id: document.getElementById('editRollId').value,
            rollNumber: originalRollNumber, // Use originalRollNumber for consistency
            material: document.getElementById('editMaterial').value,
            paperCompany: document.getElementById('editPaperCompany').value,
            gsm: document.getElementById('editGsm').value,
            width: document.getElementById('editWidth').value,
            length: document.getElementById('editLength').value,
            weight: document.getElementById('editWeight').value,
            lotNo: document.getElementById('editLotNo').value,
            status: document.getElementById('editStatus').value,
            jobName: document.getElementById('editJobName').value,
            jobNo: document.getElementById('editJobNo').value,
            jobSize: document.getElementById('editJobSize').value
        };

        try {
            const response = await fetch('/update_roll.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (result.success) {
                showMessage('Roll updated successfully', 'success');
                bootstrap.Modal.getInstance(document.getElementById('editModal')).hide();
                loadStock();
            } else {
                showMessage(result.message || 'Error updating roll', 'error');
            }
        } catch (error) {
            console.error('Error updating roll:', error);
            showMessage('Error updating roll', 'error');
        }
    }
}

// Delete functions
function showDeleteModal(rollNumber) {
    rollToDelete = rollNumber;
    document.getElementById('deleteRollNumber').textContent = rollNumber;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
}

// Add event listener to properly clean up modal state
document.addEventListener('DOMContentLoaded', function() {
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.addEventListener('hidden.bs.modal', function () {
            rollToDelete = null;
        });
    }

    // Add event listener for delete all confirmation checkbox
    const confirmDeleteAllCheckbox = document.getElementById('confirmDeleteAll');
    const confirmDeleteAllBtn = document.getElementById('confirmDeleteAllBtn');
    if (confirmDeleteAllCheckbox && confirmDeleteAllBtn) {
        confirmDeleteAllCheckbox.addEventListener('change', function() {
            confirmDeleteAllBtn.disabled = !this.checked;
        });
    }

    // Calculate initial square meter if values are preset
    setTimeout(() => {
        calculateSquareMeter();
    }, 100);

    // Fetch and populate Add Roll dropdowns on DOMContentLoaded
    fetchAndPopulateAddRollDropdowns();
});

async function fetchAndPopulateAddRollDropdowns() {
    console.log('Attempting to fetch materials and companies...'); // Log start of fetch
    const materialSelect = document.getElementById('material');
    const companySelect = document.getElementById('paperCompany');

    // Clear existing options except the default "Select..." option
    materialSelect.innerHTML = '<option value="">Select Material</option>';
    companySelect.innerHTML = '<option value="">Select Company</option>';

    // Define a list of common materials and companies
    const commonMaterials = ['Chromo', 'Art Paper', 'Thermal', 'Film', 'Tag'];
    const commonCompanies = ['Camline', 'JK Paper', 'ITC', 'BILT', 'Orient'];

    let fetchedMaterials = [];
    let fetchedCompanies = [];

    console.log('Attempting to fetch materials and companies from API...'); // Log start of fetch

    try {
        const response = await fetch('/api/get_materials_companies.php');
        console.log('Fetch response status:', response.status); // Log response status

        if (response.ok) {
            const result = await response.json();
            console.log('Fetch response data:', result); // Log response data

            if (result && Array.isArray(result.materials) && Array.isArray(result.companies)) {
                console.log('Successfully fetched materials and companies from API.'); // Log success
                fetchedMaterials = result.materials;
                fetchedCompanies = result.companies;
            } else {
                console.error('Unexpected response format from get_materials_companies.php:', result);
            }
        } else {
             console.error('Fetch failed with status:', response.status);
             // showMessage(`Error fetching materials and companies: Status ${response.status}`, 'error'); // Don't show error for initial load
        }
    } catch (error) {
        console.error('Error fetching materials and companies:', error);
        // showMessage('Error fetching materials and companies: Network or parsing error', 'error'); // Don't show error for initial load
    }

    // Combine common and fetched lists, remove duplicates, and sort
    const allMaterials = [...new Set([...commonMaterials, ...fetchedMaterials])].sort();
    const allCompanies = [...new Set([...commonCompanies, ...fetchedCompanies])].sort();

    // Populate Material dropdown
    allMaterials.forEach(material => {
        if (material !== 'Custom') { // Avoid adding "Custom" if it somehow comes from DB
            const option = document.createElement('option');
            option.value = material;
            option.textContent = material;
            materialSelect.appendChild(option);
        }
    });

    // Populate Company dropdown
    allCompanies.forEach(company => {
         if (company !== 'Custom') { // Avoid adding "Custom" if it somehow comes from DB
            const option = document.createElement('option');
            option.value = company;
            option.textContent = company;
            companySelect.appendChild(option);
         }
    });

    // Add "Custom" option at the end
    const customMaterialOption = document.createElement('option');
    customMaterialOption.value = 'Custom';
    customMaterialOption.textContent = 'Custom';
    materialSelect.appendChild(customMaterialOption);

    const customCompanyOption = document.createElement('option');
    customCompanyOption.value = 'Custom';
    customCompanyOption.textContent = 'Custom';
    companySelect.appendChild(customCompanyOption);

    // Set default selected values if they exist in the combined data
    if (allMaterials.includes('Chromo')) {
        materialSelect.value = 'Chromo';
    } else if (materialSelect.options.length > 1) {
         materialSelect.value = materialSelect.options[1].value; // Select first actual material
    }

    if (allCompanies.includes('Camline')) {
        companySelect.value = 'Camline';
    } else if (companySelect.options.length > 1) {
         companySelect.value = companySelect.options[1].value; // Select first actual company
    }

    console.log('Dropdowns populated with combined data.'); // Log population completion
}


async function confirmDelete() {
    if (!rollToDelete) return;

    try {
        const response = await fetch('/delete_roll.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ rollNumber: rollToDelete })
        });

        const result = await response.json();

        // Hide modal first
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
        if (modal) {
            modal.hide();
        }

        if (result.success) {
            showMessage('Roll deleted successfully', 'success');
            loadStock();
        } else {
            showMessage(result.message || 'Error deleting roll', 'error');
        }
    } catch (error) {
            console.error('Error deleting roll:', error);
            showMessage('Error deleting roll', 'error');
            // Hide modal on error too
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
            if (modal) {
                modal.hide();
            }
        }

    // Reset rollToDelete variable
    rollToDelete = null;
}

// Delete All Stock Rolls functions
function showDeleteAllModal() {
    if (!isAdminLoggedIn) {
        showMessage('Only admin users can delete all stock rolls. Please login as admin.', 'error');
        return;
    }

    // Reset checkbox and button state
    const checkbox = document.getElementById('confirmDeleteAll');
    const button = document.getElementById('confirmDeleteAllBtn');
    if (checkbox) checkbox.checked = false;
    if (button) button.disabled = true;

    const modal = new bootstrap.Modal(document.getElementById('deleteAllModal'));
    modal.show();
}

async function confirmDeleteAll() {
    if (!isAdminLoggedIn) {
        showMessage('Only admin users can delete all stock rolls.', 'error');
        return;
    }

    try {
        const response = await fetch('/delete_all_rolls.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: 'delete_all' })
        });

        const result = await response.json();

        // Hide modal first
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteAllModal'));
        if (modal) {
            modal.hide();
        }

        if (result.success) {
            showMessage('All stock rolls deleted successfully', 'success');
            loadStock(); // Reload stock data
        } else {
            showMessage(result.message || 'Error deleting all stock rolls', 'error');
        }
    } catch (error) {
        console.error('Error deleting all stock rolls:', error);
        showMessage('Error deleting all stock rolls', 'error');
        // Hide modal on error too
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteAllModal'));
        if (modal) {
            modal.hide();
        }
    }
}

// Apply filters function
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const materialFilter = document.getElementById('materialFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    const companyFilter = document.getElementById('companyFilter').value;
    const gsmFilter = document.getElementById('gsmFilter').value;
    const widthFilter = document.getElementById('widthFilter').value;
    const lengthFilter = document.getElementById('lengthFilter').value;
    const lotNoFilter = document.getElementById('lotNoFilter').value.toLowerCase();
    const jobNameFilter = document.getElementById('jobNameFilter').value.toLowerCase();

    const filters = {
        searchTerm: searchTerm,
        material: materialFilter,
        status: statusFilter,
        company: companyFilter,
        gsm: gsmFilter,
        width: widthFilter,
        length: lengthFilter,
        lotNo: lotNoFilter,
        jobName: jobNameFilter
    };

    const filteredStock = currentStock.filter(roll => {
        return (roll.rollnumber.toLowerCase().includes(filters.searchTerm) ||
                roll.material.toLowerCase().includes(filters.searchTerm) ||
                roll.papercompany.toLowerCase().includes(filters.searchTerm) ||
                roll.lotno.toLowerCase().includes(filters.searchTerm) ||
                roll.jobname.toLowerCase().includes(filters.searchTerm)) &&
               (!filters.material || roll.material === filters.material) &&
               (!filters.status || roll.status === filters.status) &&
               (!filters.company || roll.papercompany === filters.company) &&
               (!filters.gsm || roll.gsm == filters.gsm) &&
               (!filters.width || roll.width == filters.width) &&
               (!filters.length || roll.length == filters.length) &&
               (!filters.lotNo || (roll.lotno && roll.lotno.toLowerCase().includes(filters.lotNo))) &&
               (!filters.jobName || (roll.jobname && roll.jobname.toLowerCase().includes(filters.jobName)));
    });

    displayStock(filteredStock);
}

// Clear all filters
function clearAllFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('materialFilter').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('companyFilter').value = '';
    document.getElementById('gsmFilter').value = '';
    document.getElementById('widthFilter').value = '';
    document.getElementById('lengthFilter').value = '';
    document.getElementById('lotNoFilter').value = '';
    document.getElementById('jobNameFilter').value = '';
    displayStock(currentStock);
}

// Sort table function
function sortTable(column) {
    if (currentSortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        sortDirection = 'asc';
    }

    // Update sort icons
    document.querySelectorAll('[id^="sort-"]').forEach(icon => {
        icon.className = 'fas fa-sort';
    });

    const icon = document.getElementById(`sort-${column}`);
    if (icon) {
        icon.className = sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }

    // Sort the current displayed stock
    const tbody = document.getElementById('stockTableBody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    rows.sort((a, b) => {
        let aValue, bValue;

        if (column === 'serial') {
            aValue = parseInt(a.cells[0].textContent);
            bValue = parseInt(b.cells[0].textContent);
        } else if (column === 'rollnumber') {
            aValue = a.cells[1].textContent.replace(/\s*\(Main\)\s*/g, '').trim();
            bValue = b.cells[1].textContent.replace(/\s*\(Main\)\s*/g, '').trim();
        }

        if (sortDirection === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Re-append sorted rows
    if (column === 'serial') {
        // For serial number sorting, don't update the numbers, just reorder
        rows.forEach(row => {
            tbody.appendChild(row);
        });
    } else {
        // For other columns, update serial numbers after sorting
        rows.forEach((row, index) => {
            row.cells[0].textContent = index + 1; // Update serial number
            tbody.appendChild(row);
        });
    }
}

// Utility functions
function populateDropdowns() {
    populateMaterialFilter();
    populateCompanyFilter();
    populateGsmFilter();
    populateWidthFilter();
    populateLengthFilter();
}

function populateMaterialFilter() {
    const select = document.getElementById('materialFilter');
    // Clear existing options except the default "Material" option
    select.innerHTML = '<option value="">Material</option>';

    // Extract unique materials from currentStock
    const materials = [...new Set(currentStock.map(roll => roll.material).filter(material => material))].sort();

    materials.forEach(material => {
        const option = document.createElement('option');
        option.value = material;
        option.textContent = material;
        select.appendChild(option);
    });
}

function populateCompanyFilter() {
    const select = document.getElementById('companyFilter');
    // Clear existing options except the default "Company" option
    select.innerHTML = '<option value="">Company</option>';

    // Extract unique companies from currentStock
    const companies = [...new Set(currentStock.map(roll => roll.papercompany).filter(company => company))].sort();

    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        select.appendChild(option);
    });
}

function populateGsmFilter() {
    const gsmFilter = document.getElementById('gsmFilter');
    const gsms = [...new Set(currentStock.map(roll => roll.gsm).filter(gsm => gsm))].sort((a, b) => a - b);

    gsmFilter.innerHTML = '<option value="">GSM</option>';
    gsms.forEach(gsm => {
        const option = document.createElement('option');
        option.value = gsm;
        option.textContent = gsm;
        gsmFilter.appendChild(option);
    });
}

function populateWidthFilter() {
    const widthFilter = document.getElementById('widthFilter');
    const widths = [...new Set(currentStock.map(roll => roll.width).filter(width => width))].sort((a, b) => a - b);

    widthFilter.innerHTML = '<option value="">Width</option>';
    widths.forEach(width => {
        const option = document.createElement('option');
        option.value = width;
        option.textContent = width;
        widthFilter.appendChild(option);
    });
}

function populateLengthFilter() {
    const lengthFilter = document.getElementById('lengthFilter');
    const lengths = [...new Set(currentStock.map(roll => roll.length).filter(length => length))].sort((a, b) => a - b);

    lengthFilter.innerHTML = '<option value="">Length</option>';
    lengths.forEach(length => {
        const option = document.createElement('option');
        option.value = length;
        option.textContent = length;
        lengthFilter.appendChild(option);
    });
}

function populateMultiSlitDropdown() {
    const select = document.getElementById('multiSlitRollSelect');
    select.innerHTML = '<option value="">Select a roll</option>';

    const stockRolls = currentStock.filter(roll => roll.status === 'Stock');
    stockRolls.forEach(roll => {
        const option = document.createElement('option');
        option.value = roll.rollnumber;
        option.textContent = `${roll.rollnumber} - ${roll.material} - ${roll.papercompany} (${roll.width}mm x ${roll.length}m)`;
        select.appendChild(option);
    });

    // Also populate filter dropdowns
    populateSlitFilters();
}

function populateSlitFilters() {
    // Populate material filter
    const materialFilter = document.getElementById('slitMaterialFilter');
    const materials = [...new Set(currentStock.map(roll => roll.material))];
    materialFilter.innerHTML = '<option value="">All Materials</option>';
    materials.forEach(material => {
        const option = document.createElement('option');
        option.value = material;
        option.textContent = material;
        materialFilter.appendChild(option);
    });

    // Populate company filter
    const companyFilter = document.getElementById('slitCompanyFilter');
    const companies = [...new Set(currentStock.map(roll => roll.papercompany))];
    companyFilter.innerHTML = '<option value="">All Companies</option>';
    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        companyFilter.appendChild(option);
    });
}

function filterSlitRolls() {
    const searchTerm = document.getElementById('rollSearchInput').value.toLowerCase();
    const materialFilter = document.getElementById('slitMaterialFilter').value;
    const companyFilter = document.getElementById('slitCompanyFilter').value;
    const statusFilter = document.getElementById('slitStatusFilter').value;

    const select = document.getElementById('multiSlitRollSelect');
    select.innerHTML = '<option value="">Select a roll</option>';

    let filteredRolls = currentStock.filter(roll => {
        return roll.status === 'Stock' && // Only show Stock rolls for slitting
               (searchTerm === '' || roll.rollnumber.toLowerCase().includes(searchTerm) ||
                roll.material.toLowerCase().includes(searchTerm) ||
                roll.papercompany.toLowerCase().includes(searchTerm)) &&
               (materialFilter === '' || roll.material === materialFilter) &&
               (companyFilter === '' || roll.papercompany === companyFilter) &&
               (statusFilter === '' || roll.status === statusFilter);
    });

    filteredRolls.forEach(roll => {
        const option = document.createElement('option');
        option.value = roll.rollnumber;
        option.textContent = `${roll.rollnumber} - ${roll.material} (${roll.width}mm x ${roll.length}m)`;
        select.appendChild(option);
    });
}

function clearSlitFilters() {
    document.getElementById('rollSearchInput').value = '';
    document.getElementById('slitMaterialFilter').value = '';
    document.getElementById('slitCompanyFilter').value = '';
    document.getElementById('slitStatusFilter').value = '';
    filterSlitRolls();
}

// Multi-slit functions
function handleMultiSlitRollSelection() {
    const selectedRoll = document.getElementById('multiSlitRollSelect').value;
    const container = document.getElementById('multiSlitInputs');

    if (selectedRoll) {
        const roll = currentStock.find(r => r.rollnumber === selectedRoll);
        if (roll) {
            displayOriginalRollDetails(roll);
            setupSlitInputs(roll);
            container.classList.remove('d-none');
        }
    } else {
        container.classList.add('d-none');
    }
}

function displayOriginalRollDetails(roll) {
    const container = document.getElementById('originalRollDetails');
    container.innerHTML = `
        <div class="card">
            <div class="card-body">
                <h6>Roll: ${roll.rollnumber}</h6>
                <p class="mb-1"><strong>Material:</strong> ${roll.material}</p>
                <p class="mb-1"><strong>Dimensions:</strong> ${roll.width}mm x ${roll.length}m</p>
                <p class="mb-0"><strong>Weight:</strong> ${roll.weight}kg</p>
            </div>
        </div>
    `;
}

function setupSlitInputs(roll) {
    const container = document.getElementById('slitInputsContainer');
    container.innerHTML = '';

    // Create first slit input with "Printing" as default status
    const inputGroup = document.createElement('div');
    inputGroup.className = 'slit-input-group';

    inputGroup.innerHTML = `
        <h6>Slit A</h6>
        <div class="row">
            <div class="col-md-2">
                <label class="form-label">Width (mm)</label>
                <input type="number" class="form-control slit-width" value="${roll.width}" placeholder="Width" onchange="validateAndUpdateRemaining()">
            </div>
            <div class="col-md-2">
                <label class="form-label">Length (m)</label>
                <input type="number" class="form-control slit-length" value="${roll.length}" placeholder="Length" onchange="validateAndUpdateRemaining()">
            </div>
            <div class="col-md-2">
                <label class="form-label">Status</label>
                <select class="form-select slit-status" onchange="validateAndUpdateRemaining()">
                    <option value="Printing" selected>Printing</option>
                    <option value="Stock">Stock</option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">Job Name</label>
                <input type="text" class="form-control slit-jobname" placeholder="Job Name">
            </div>
            <div class="col-md-1">
                <label class="form-label">Job No</label>
                <input type="text" class="form-control slit-jobno" placeholder="Job No">
            </div>
            <div class="col-md-2">
                <label class="form-label">Job Size</label>
                <input type="text" class="form-control slit-jobsize" placeholder="Job Size">
            </div>
            <div class="col-md-1 d-flex align-items-end">
                <button type="button" class="btn btn-danger" style="height: 38px; width: 80px; font-size: 12px;" onclick="removeSlitInput(this)">Remove</button>
            </div>
        </div>
        <div class="remaining-display mt-2"></div>
    `;

    container.appendChild(inputGroup);
    updateSlitButtonText(); // Update button text after setup
}

// Calculate remaining dimensions for multi-slit
function calculateRemainingDimensions() {
    const selectedRollNumber = document.getElementById('multiSlitRollSelect').value;
    if (!selectedRollNumber || !currentStock) return { width: 0, length: 0 };

    const originalRoll = currentStock.find(r => r.rollnumber === selectedRollNumber);
    if (!originalRoll) return { width: 0, length: 0 };

    const container = document.getElementById('slitInputsContainer');
    const existingInputs = container.querySelectorAll('.slit-input-group');

    let totalUsedWidth = 0;

    existingInputs.forEach(input => {
        const width = parseFloat(input.querySelector('.slit-width').value) || 0;
        totalUsedWidth += width;
    });

    return {
        width: Math.max(0, originalRoll.width - totalUsedWidth),
        length: originalRoll.length // Length stays same in multi-slit
    };
}

// Validate and update remaining dimensions display
function validateAndUpdateRemaining() {
    const selectedRollNumber = document.getElementById('multiSlitRollSelect').value;
    if (!selectedRollNumber || !currentStock) return;

    const originalRoll = currentStock.find(r => r.rollnumber === selectedRollNumber);
    if (!originalRoll) return;

    const container = document.getElementById('slitInputsContainer');
    const inputs = container.querySelectorAll('.slit-input-group');

    let totalWidth = 0;

    inputs.forEach((input, index) => {
        const width = parseFloat(input.querySelector('.slit-width').value) || 0;
        totalWidth += width;

        // Set last item to Stock status automatically
        if (index === inputs.length - 1) {
            input.querySelector('.slit-status').value = 'Stock';
        }
    });

    // Validation messages
    if (totalWidth > originalRoll.width) {
        showMessage(`Total width (${totalWidth}mm) exceeds original roll width (${originalRoll.width}mm)`, 'error');
    }

    // Update remaining display
    const remainingWidth = Math.max(0, originalRoll.width - totalWidth);

    updateRemainingDisplay(remainingWidth, originalRoll.length);
}

// Update remaining dimensions display
function updateRemainingDisplay(remainingWidth, remainingLength) {
    const container = document.getElementById('slitInputsContainer');
    const remainingDisplays = container.querySelectorAll('.remaining-display');

    remainingDisplays.forEach(display => {
        display.innerHTML = `
            <small class="text-info">
                Remaining: ${remainingWidth}mm × ${remainingLength}m
            </small>
        `;
    });
}

function addSlitInput(roll = null) {
    const container = document.getElementById('slitInputsContainer');
    const count = container.children.length;
    const letter = String.fromCharCode(65 + count); // A, B, C, etc.

    // Get original roll data
    let originalRoll = roll;
    if (!originalRoll) {
        const selectedRollNumber = document.getElementById('multiSlitRollSelect').value;
        if (selectedRollNumber && currentStock) {
            originalRoll = currentStock.find(r => r.rollnumber === selectedRollNumber);
        }
    }

    if (!originalRoll) return;

    // Check if this is not the first input and remaining width is 0 or negative
    if (count > 0) {
        const remaining = calculateRemainingDimensions();
        if (remaining.width <= 0) {
            showMessage('No remaining width available for additional slits', 'warning');
            return;
        }
    }

    // Calculate suggested values
    let suggestedWidth, suggestedLength;

    if (count === 0) {
        // First input: use original values
        suggestedWidth = originalRoll.width;
        suggestedLength = originalRoll.length;
    } else {
        // For subsequent inputs, calculate remaining
        const remaining = calculateRemainingDimensions();
        suggestedWidth = remaining.width;
        suggestedLength = remaining.length;

        // Don't add if no remaining width
        if (suggestedWidth <= 0) {
            showMessage('No remaining width available for additional slits', 'warning');
            return;
        }
    }

    const inputGroup = document.createElement('div');
    inputGroup.className = 'slit-input-group';

    // Determine default status based on slit count
    const defaultStatus = count === 0 ? 'Printing' : 'Stock';
    const statusOptions = count === 0 ?
        '<option value="Printing" selected>Printing</option><option value="Stock">Stock</option>' :
        '<option value="Stock" selected>Stock</option><option value="Printing">Printing</option>';

    inputGroup.innerHTML = `
        <h6>Slit ${letter}</h6>
        <div class="row">
            <div class="col-md-2">
                <label class="form-label">Width (mm)</label>
                <input type="number" class="form-control slit-width" value="${suggestedWidth}" placeholder="Width" onchange="validateAndUpdateRemaining()">
            </div>
            <div class="col-md-2">
                <label class="form-label">Length (m)</label>
                <input type="number" class="form-control slit-length" value="${suggestedLength}" placeholder="Length" onchange="validateAndUpdateRemaining()">
            </div>
            <div class="col-md-2">
                <label class="form-label">Status</label>
                <select class="form-select slit-status" onchange="validateAndUpdateRemaining()">
                    ${statusOptions}
                </select>
            </div>
            <div class="col-md-2">
                <label class="form-label">Job Name</label>
                <input type="text" class="form-control slit-jobname" placeholder="Job Name">
            </div>
            <div class="col-md-1">
                <label class="form-label">Job No</label>
                <input type="text" class="form-control slit-jobno" placeholder="Job No">
            </div>
            <div class="col-md-2">
                <label class="form-label">Job Size</label>
                <input type="text" class="form-control slit-jobsize" placeholder="Job Size">
            </div>
            <div class="col-md-1 d-flex align-items-end">
                <button type="button" class="btn btn-danger" style="height: 38px; width: 80px; font-size: 12px;" onclick="removeSlitInput(this)">Remove</button>
            </div>
        </div>
        <div class="remaining-display mt-2"></div>
    `;

    container.appendChild(inputGroup);
    updateSlitButtonText();
    validateAndUpdateRemaining(); // Update calculations after adding
}

function removeSlitInput(button) {
    button.closest('.slit-input-group').remove();
    updateSlitButtonText();
    validateAndUpdateRemaining(); // Recalculate after removal
}

function updateSlitButtonText() {
    const container = document.getElementById('slitInputsContainer');
    const slitCount = container.children.length;
    const button = document.getElementById('slitProcessBtn');

    if (slitCount <= 1) {
        button.textContent = 'Slit';
    } else {
        button.textContent = 'Process Multi Slit';
    }
}

// Function to go to slit tab and pre-select roll
function goToSlitTab(rollNumber) {
    // Switch to Multi Slit tab
    const slitTab = document.getElementById('multi-slit-tab');
    const slitTabPane = document.getElementById('multi-slit');

    // Remove active class from all tabs and panes
    document.querySelectorAll('.nav-link').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('show', 'active');
    });

    // Activate Multi Slit tab
    slitTab.classList.add('active');
    slitTabPane.classList.add('show', 'active');

    // Pre-select the roll in dropdown
    setTimeout(() => {
        const dropdown = document.getElementById('multiSlitRollSelect');
        if (dropdown) {
            dropdown.value = rollNumber;
            // Trigger the change event to show the slit inputs
            handleMultiSlitRollSelection();
        }
    }, 100);
}

// Process multi slit
async function processMultiSlit() {
    const selectedRollNumber = document.getElementById('multiSlitRollSelect').value;
    if (!selectedRollNumber) return;

    const slitInputs = document.querySelectorAll('#slitInputsContainer .slit-input-group');
    const slits = [];
    const isSingleSlit = slitInputs.length === 1;

    // Get original roll data for single slit calculation
    let originalRoll = null;
    try {
        const response = await fetch('/get_rolls.php');
        const allRolls = await response.json();
        originalRoll = allRolls.find(roll => roll.rollnumber === selectedRollNumber);

        if (!originalRoll) {
            showMessage('Selected roll not found', 'error');
            return;
        }
    } catch (error) {
        console.error('Error fetching roll data:', error);
        showMessage('Error fetching roll data', 'error');
        return;
    }

    slitInputs.forEach((group, index) => {
        const width = group.querySelector('.slit-width').value;
        const length = group.querySelector('.slit-length').value;
        const status = group.querySelector('.slit-status').value;
        const jobname = group.querySelector('.slit-jobname').value;
        const jobno = group.querySelector('.slit-jobno').value;
        const jobsize = group.querySelector('.slit-jobsize').value;

        if (width && length && originalRoll) {
            if (isSingleSlit) {
                // For single slit: Create two rolls automatically (A and B)
                const userWidth = parseInt(width);
                const userLength = parseInt(length);
                const originalWidth = originalRoll.width;
                const originalLength = originalRoll.length;

                // Calculate remaining dimensions
                const remainingWidth = originalWidth - userWidth;
                const remainingLength = originalLength - userLength;

                // First roll (A) - Always "Printing" status for single slit
                slits.push({
                    width: userWidth,
                    length: userLength,
                    status: 'Printing', // Always Printing for A roll in single slit
                    jobname: jobname || '',
                    jobno: jobno || '',
                    jobsize: jobsize || '',
                    suffix: 'A' // Letter suffix without dash for sorting
                });

                // Second roll (B) - Calculate dimensions based on what changed
                let secondWidth, secondLength;

                if (userWidth < originalWidth && userLength < originalLength) {
                    // Both dimensions reduced: Second roll gets remaining dimensions
                    secondWidth = remainingWidth;
                    secondLength = remainingLength;
                } else if (userWidth < originalWidth && userLength === originalLength) {
                    // Only width reduced: Second roll gets remaining width, same length
                    secondWidth = remainingWidth;
                    secondLength = originalLength;
                } else if (userLength < originalLength && userWidth === originalWidth) {
                    // Only length reduced: Second roll gets same width, remaining length
                    secondWidth = originalWidth;
                    secondLength = remainingLength;
                } else {
                    // Same dimensions or other cases: Create second roll with same dimensions
                    secondWidth = userWidth;
                    secondLength = userLength;
                }

                // Only create second roll if dimensions are positive
                if (secondWidth > 0 && secondLength > 0) {
                    slits.push({
                        width: secondWidth,
                        length: secondLength,
                        status: 'Stock', // Always Stock for B roll in single slit
                        jobname: '',
                        jobno: '',
                        jobsize: '',
                        suffix: 'B' // Letter suffix without dash for sorting
                    });
                }
            } else {
                // For multi slit: Width varies, but length stays same as original
                console.log(`Slit ${index}: width=${width}, length=${length}, originalLength=${originalRoll.length}`);
                slits.push({
                    width: parseInt(width),
                    length: parseInt(originalRoll.length), // Use original roll length always
                    status: status,
                    jobname: jobname || '',
                    jobno: jobno || '',
                    jobsize: jobsize || '',
                    suffix: String.fromCharCode(65 + index) // A, B, C, etc.
                });
            }
        }
    });

    if (slits.length === 0) {
        showMessage('Please add at least one slit', 'error');
        return;
    }

    try {
        console.log('Sending slit data:', {
            rollNumber: selectedRollNumber,
            slits: slits,
            isMultiSlit: true
        });

        const response = await fetch('/slit_roll.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                rollNumber: selectedRollNumber,
                slits: slits,
                isMultiSlit: true
            })
        });

        console.log('Response status:', response.status);
        const responseText = await response.text();
        console.log('Response text:', responseText);

        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse JSON:', e);
            throw new Error('Invalid response format');
        }

        if (result.success) {
            const successMessage = isSingleSlit ? 'Single slit completed successfully' : 'Multi slit completed successfully';
            showMessage(successMessage, 'success');
            document.getElementById('multiSlitInputs').classList.add('d-none');
            document.getElementById('multiSlitRollSelect').value = '';
            loadStock();

            // Automatically redirect to View Stock tab for both single and multi slit
            setTimeout(() => {
                // Remove active class from all tabs and panes
                document.querySelectorAll('.nav-link').forEach(tab => tab.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(pane => {
                    pane.classList.remove('show', 'active');
                });

                // Activate View Stock tab
                const viewStockTab = document.getElementById('view-stock-tab');
                const viewStockPane = document.getElementById('view-stock');

                if (viewStockTab && viewStockPane) {
                    viewStockTab.classList.add('active');
                    viewStockPane.classList.add('show', 'active');
                }
            }, 1000); // 1 second delay to allow message to be seen
        } else {
            showMessage(result.message || 'Error processing slit', 'error');
        }
    } catch (error) {
        console.error('Error processing multi slit:', error);
        showMessage('Error processing slit', 'error');
    }
}

// Slitting functions for edit modal
function populateSlitInputs() {
    const container = document.getElementById('slitInputsEdit');
    const roll = currentStock.find(r => r.rollnumber === document.getElementById('editRollNumber').value);
    if (!roll) return;

    container.innerHTML = `
        <div class="slit-input-group">
            <div class="row">
                <div class="col-md-3">
                    <label class="form-label">Width (mm)</label>
                    <input type="number" class="form-control slit-width" value="${roll.width}">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Length (m)</label>
                    <input type="number" class="form-control slit-length" value="${roll.length}">
                </div>
                <div class="col-md-3">
                    <label class="form-label">Status</label>
                    <select class="form-select slit-status">
                        <option value="Stock">Stock</option>
                        <option value="Printing">Printing</option>
                    </select>
                </div>
                <div class="col-md-3 d-flex align-items-end">
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeSlitInputEdit(this)">Remove</button>
                </div>
            </div>
        </div>
    `;

    // Add event listeners to the initial inputs
    const initialInputGroup = container.querySelector('.slit-input-group');
    if (initialInputGroup) {
        initialInputGroup.querySelector('.slit-width').addEventListener('input', calculateAndUpdateRemainingEdit);
        initialInputGroup.querySelector('.slit-length').addEventListener('input', calculateAndUpdateRemainingEdit);
        initialInputGroup.querySelector('.slit-status').addEventListener('change', calculateAndUpdateRemainingEdit);
    }

    calculateAndUpdateRemainingEdit(); // Calculate and update display initially
}

function addSlitInputEdit() {
    const container = document.getElementById('slitInputsEdit');
    const count = container.children.length;

    // Get original roll data
    const originalRollNumber = document.getElementById('editRollNumber').value;
    const originalRoll = currentStock.find(r => r.rollnumber === originalRollNumber);
    if (!originalRoll) return;

    // Calculate suggested values based on remaining
    const inputs = container.querySelectorAll('.slit-input-group');
    let totalUsedWidth = 0;
    inputs.forEach(input => {
        const width = parseFloat(input.querySelector('.slit-width').value) || 0;
        totalUsedWidth += width;
    });

    const suggestedWidth = Math.max(0, originalRoll.width - totalUsedWidth);
    const suggestedLength = originalRoll.length; // Length stays same

    // Don't add if no remaining width
    if (suggestedWidth <= 0 && count > 0) { // Allow adding the first slit even if width is 0 initially
        showMessage('No remaining width available for additional slits', 'warning');
        return;
    }

    const inputGroup = document.createElement('div');
    inputGroup.className = 'slit-input-group mb-3';
    inputGroup.innerHTML = `
        <div class="row">
            <div class="col-md-3">
                <label class="form-label">Width (mm)</label>
                <input type="number" class="form-control slit-width" placeholder="Width" value="${suggestedWidth}" onchange="calculateAndUpdateRemainingEdit()">
            </div>
            <div class="col-md-3">
                <label class="form-label">Length (m)</label>
                <input type="number" class="form-control slit-length" placeholder="Length" value="${suggestedLength}" onchange="calculateAndUpdateRemainingEdit()">
            </div>
            <div class="col-md-3">
                <label class="form-label">Status</label>
                <select class="form-select slit-status" onchange="calculateAndUpdateRemainingEdit()">
                    <option value="Stock">Stock</option>
                    <option value="Printing">Printing</option>
                </select>
            </div>
            <div class="col-md-3 d-flex align-items-end">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeSlitInputEdit(this)">Remove</button>
            </div>
        </div>
    `;

    container.appendChild(inputGroup);

    // Add event listeners to the newly added inputs
    const newWidthInput = inputGroup.querySelector('.slit-width');
    const newLengthInput = inputGroup.querySelector('.slit-length');
    const newStatusSelect = inputGroup.querySelector('.slit-status');

    newWidthInput.addEventListener('input', calculateAndUpdateRemainingEdit);
    newLengthInput.addEventListener('input', calculateAndUpdateRemainingEdit);
    newStatusSelect.addEventListener('change', calculateAndUpdateRemainingEdit);


    calculateAndUpdateRemainingEdit(); // Update display after adding
}

function clearSlitInputs() {
    document.getElementById('slitInputsEdit').innerHTML = '';
    // Also clear the remaining display when inputs are cleared
    const remainingDisplay = document.getElementById('slitRemainingDisplayEdit');
    if (remainingDisplay) {
        remainingDisplay.innerHTML = '';
    }
}

// Calculate and update remaining dimensions for Edit Modal slitting
function calculateAndUpdateRemainingEdit() {
    const originalRollNumber = document.getElementById('editRollNumber').value;
    const originalRoll = currentStock.find(r => r.rollnumber === originalRollNumber);
    if (!originalRoll) return;

    const container = document.getElementById('slitInputsEdit');
    const inputs = container.querySelectorAll('.slit-input-group');

    let totalWidth = 0;

    inputs.forEach(input => {
        const width = parseFloat(input.querySelector('.slit-width').value) || 0;
        totalWidth += width;
    });

    // Update remaining display
    const remainingWidth = Math.max(0, originalRoll.width - totalWidth);
    const remainingLength = originalRoll.length; // Length stays same in this slitting method

    const remainingDisplay = document.getElementById('slitRemainingDisplayEdit');
    if (remainingDisplay) {
         remainingDisplay.innerHTML = `
            <small class="text-info">
                Remaining: ${remainingWidth}mm × ${remainingLength}m
            </small>
        `;
    }

    // Validation message (optional, can also be done on save)
    // if (totalWidth > originalRoll.width) {
    //      showMessage(`Total slit width (${totalWidth}mm) exceeds original roll width (${originalRoll.width}mm)`, 'warning');
    // }
}

// Remove slit input specifically for Edit Modal slitting
function removeSlitInputEdit(button) {
    button.closest('.slit-input-group').remove();
    calculateAndUpdateRemainingEdit(); // Recalculate after removal
}

// Print functions
function printRoll(rollNumber) {
    const roll = currentStock.find(r => r.rollnumber === rollNumber);
    if (!roll) return;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Roll Details - ${rollNumber}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .details { margin: 20px 0; }
                .details table { width: 100%; border-collapse: collapse; }
                .details th, .details td { border: 1px solid #ccc; padding: 10px; text-align: left; }
                .details th { background-color: #f5f5f5; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Shree Label - Roll Details</h1>
                <h2>Roll Number: ${roll.rollnumber}</h2>
            </div>
            <div class="details">
                <table>
                    <tr><th>Material</th><td>${roll.material}</td></tr>
                    <tr><th>Paper Company</th><td>${roll.papercompany}</td></tr>
                    <tr><th>GSM</th><td>${roll.gsm}</td></tr>
                    <tr><th>Width</th><td>${roll.width} mm</td></tr>
                    <tr><th>Length</th><td>${roll.length} m</td></tr>
                    <tr><th>Weight</th><td>${roll.weight} kg</td></tr>
                    <tr><th>Lot Number</th><td>${roll.lotno}</td></tr>
                    <tr><th>Status</th><td>${roll.status}</td></tr>
                    <tr><th>Date Added</th><td>${formatDate(roll.datetime)}</td></tr>
                </table>
            </div>
            <script>window.print(); window.close();</script>
        </body>
        </html>
    `);
}

function printStock() {
    const printWindow = window.open('', '_blank');
    let tableContent = '';

    currentStock.forEach(roll => {
        tableContent += `
            <tr>
                <td>${roll.rollnumber}</td>
                <td>${roll.material}</td>
                <td>${roll.papercompany}</td>
                <td>${roll.gsm}</td>
                <td>${roll.width}</td>
                <td>${roll.length}</td>
                <td>${roll.weight}</td>
                <td>${roll.status}</td>
                <td>${formatDate(roll.datetime)}</td>
            </tr>
        `;
    });

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Stock Report - Shree Label</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                th { background-color: #f5f5f5; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Shree Label - Stock Report</h1>
                <p>Generated on: ${new Date().toLocaleDateString()}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Roll Number</th>
                        <th>Material</th>
                        <th>Company</th>
                        <th>GSM</th>
                        <th>Width</th>
                        <th>Length</th>
                        <th>Weight</th>
                        <th>Status</th>
                        <th>Date Added</th>
                    </tr>
                </thead>
                <tbody>
                    ${tableContent}
                </tbody>
            </table>
            <script>window.print(); window.close();</script>
        </body>
        </html>
    `);
}

// Excel functions
function exportToExcel() {
    const data = currentStock.map(roll => ({
        'Roll Number': roll.rollnumber,
        'Material': roll.material,
        'Paper Company': roll.papercompany,
        'GSM': roll.gsm,
        'Width (mm)': roll.width,
        'Length (m)': roll.length,
        'Weight (kg)': roll.weight,
        'Lot No': roll.lotno,
        'Status': roll.status,
        'Job Name': roll.jobname || '',
        'Job No': roll.jobno || '',
        'Job Size': roll.jobsize || ''
    }));

    const csv = convertToCSV(data);
    downloadCSV(csv, 'stock_export_' + new Date().toISOString().split('T')[0] + '.csv');
}

function convertToCSV(data) {
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    return csvContent;
}

function downloadCSV(csv, filename) {
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function showMessage(message, type) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    toast.style.top = '20px';
    toast.style.right = '20px';
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

// Stock Report Functions
function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const materialFilter = document.getElementById('reportMaterialFilter').value;
    const companyFilter = document.getElementById('reportCompanyFilter').value;
    const statusFilter = document.getElementById('reportStatusFilter').value;
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;

    let filteredStock = currentStock.filter(roll => {
        let matchesMaterial = !materialFilter || roll.material === materialFilter;
        let matchesCompany = !companyFilter || roll.papercompany === companyFilter;
        let matchesStatus = !statusFilter || roll.status === statusFilter;
        let matchesDate = true;

        if (fromDate && toDate) {
            const rollDate = new Date(roll.datetime);
            const start = new Date(fromDate);
            const end = new Date(toDate);
            end.setHours(23, 59, 59, 999);
            matchesDate = rollDate >= start && rollDate <= end;
        }

        return matchesMaterial && matchesCompany && matchesStatus && matchesDate;
    });

    displayReport(reportType, filteredStock);
}

function displayReport(reportType, data) {
    const content = document.getElementById('stockReportContent');

    switch (reportType) {
        case 'overview':
            content.innerHTML = generateOverviewReport(data);
            break;
        case 'material':
            content.innerHTML = generateMaterialReport(data);
            break;
        case 'company':
            content.innerHTML = generateCompanyReport(data);
            break;
        case 'status':
            content.innerHTML = generateStatusReport(data);
            break;
        case 'date':
            content.innerHTML = generateDateReport(data);
            break;
        default:
            content.innerHTML = generateOverviewReport(data);
    }
}

function generateOverviewReport(data) {
    const totalRolls = data.length;
    const totalWeight = data.reduce((sum, roll) => sum + (parseInt(roll.weight) || 0), 0);
    const statusCounts = {};
    const materialCounts = {};
    const companyCounts = {};

    data.forEach(roll => {
        statusCounts[roll.status] = (statusCounts[roll.status] || 0) + 1;
        materialCounts[roll.material] = (materialCounts[roll.material] || 0) + 1;
        companyCounts[roll.papercompany] = (companyCounts[roll.papercompany] || 0) + 1;
    });

    return `
        <div class="row">
            <div class="col-md-12">
                <h5 class="mb-4">Stock Overview</h5>
            </div>
        </div>
        <div class="row">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                        <h3>${totalRolls}</h3>
                        <p class="mb-0">Total Rolls</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body text-center">
                        <h3>${statusCounts['Stock'] || 0}</h3>
                        <p class="mb-0">Stock Rolls</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body text-center">
                        <h3>${statusCounts['Printing'] || 0}</h3>
                        <p class="mb-0">Printing Rolls</p>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body text-center">
                        <h3>${totalWeight}</h3>
                        <p class="mb-0">Total Weight (kg)</p>
                    </div>
                </div>
            </div>
        </div>
        <div class="row mt-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h6>By Material</h6>
                    </div>
                    <div class="card-body">
                        ${Object.entries(materialCounts).map(([material, count]) => `
                            <div class="d-flex justify-content-between mb-2">
                                <span>${material}</span>
                                <span class="badge bg-primary">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h6>By Company</h6>
                    </div>
                    <div class="card-body">
                        ${Object.entries(companyCounts).map(([company, count]) => `
                            <div class="d-flex justify-content-between mb-2">
                                <span>${company}</span>
                                <span class="badge bg-success">${count}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function setQuickDate() {
    const quickSelect = document.getElementById('quickDateSelect').value;
    const fromDate = document.getElementById('fromDate');
    const toDate = document.getElementById('toDate');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    switch (quickSelect) {
        case 'today':
            fromDate.value = todayStr;
            toDate.value = todayStr;
            break;
        case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            fromDate.value = weekStart.toISOString().split('T')[0];
            toDate.value = todayStr;
            break;
        case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            fromDate.value = monthStart.toISOString().split('T')[0];
            toDate.value = todayStr;
            break;
        case 'year':
            const yearStart = new Date(today.getFullYear(), 0, 1);
            fromDate.value = yearStart.toISOString().split('T')[0];
            toDate.value = todayStr;
            break;
    }

    if (quickSelect) {
        generateReport();
    }
}

// Excel Operations Functions
function downloadTemplate() {
    const templateData = [
        {
            'Roll Number': 'SAMPLE001',
            'Material': 'Chromo',
            'Paper Company': 'Camline',
            'GSM': '120',
            'Width (mm)': '1000',
            'Length (m)': '2000',
            'Weight (kg)': '10',
            'Lot No': 'LOT001',
            'Status': 'Stock',
            'Job Name': '',
            'Job No': '',
            'Job Size': ''
        }
    ];

    const csv = convertToCSV(templateData);
    downloadCSV(csv, 'paper_stock_template.csv');
    showMessage('Template downloaded successfully', 'success');
}

function uploadExcel() {
    const fileInput = document.getElementById('excelFile');
    const file = fileInput.files[0];

    if (!file) {
        showMessage('Please select a file to upload', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const csv = e.target.result;
            const lines = csv.split('\n');
            const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

            const importedData = [];
            for (let i = 1; i < lines.length; i++) {
                if (lines[i].trim()) {
                    const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                    const roll = {};
                    headers.forEach((header, index) => {
                        roll[header] = values[index] || '';
                    });
                    if (roll['Roll Number']) {
                        importedData.push(roll);
                    }
                }
            }

            if (importedData.length > 0) {
                processImportedData(importedData);
            } else {
                showMessage('No valid data found in the file', 'error');
            }
        } catch (error) {
            showMessage('Error reading file: ' + error.message, 'error');
        }
    };

    reader.readAsText(file);
}

function processImportedData(data) {
    let successCount = 0;
    let errorCount = 0;

    data.forEach(async (roll, index) => {
        try {
            const rollData = {
                rollNumber: roll['Roll Number'],
                material: roll['Material'] || 'Chromo',
                paperCompany: roll['Paper Company'] || 'Camline',
                gsm: roll['GSM'] || '120',
                width: roll['Width (mm)'] || '1000',
                length: roll['Length (m)'] || '2000',
                weight: roll['Weight (kg)'] || '10',
                lotNo: roll['Lot No'] || '',
                status: roll['Status'] || 'Stock',
                jobName: roll['Job Name'] || '',
                jobNo: roll['Job No'] || '',
                jobSize: roll['Job Size'] || ''
            };

            const response = await fetch('/add_roll.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(rollData)
            });

            const result = await response.json();

            if (result.success) {
                successCount++;
            } else {
                errorCount++;
                console.error(`Error importing row ${index + 1}:`, result.message);
            }

            // If this is the last item, show summary
            if (index === data.length - 1) {
                setTimeout(() => {
                    showMessage(`Import completed: ${successCount} success, ${errorCount} errors`,
                               errorCount > 0 ? 'warning' : 'success');
                    loadStock(); // Reload stock data
                }, 500);
            }
        } catch (error) {
            errorCount++;
            console.error(`Error importing row ${index + 1}:`, error);
        }
    });
}

function backupDatabase() {
    window.open('/backup_database.php', '_blank');
    showMessage('Database backup initiated', 'success');
}

function restoreDatabase() {
    const fileInput = document.getElementById('backupFile');
    const file = fileInput.files[0];

    if (!file) {
        showMessage('Please select a backup file to restore', 'error');
        return;
    }

    if (!confirm('This will replace all current data. Are you sure you want to restore from backup?')) {
        return;
    }

    const formData = new FormData();
    formData.append('backupFile', file);

    fetch('/restore_database.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showMessage('Database restored successfully', 'success');
            loadStock(); // Reload stock data
        } else {
            showMessage('Error restoring database: ' + result.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showMessage('Error restoring database', 'error');
    });
}

// Square meter calculation function
function calculateSquareMeter() {
    const width = parseFloat(document.getElementById('width').value) || 0;
    const length = parseFloat(document.getElementById('length').value) || 0;

    if (width > 0 && length > 0) {
        // Convert width from mm to m, then calculate square meter
        const widthInM = width / 1000;
        const squareMeter = widthInM * length;
        document.getElementById('squareMeter').value = squareMeter.toFixed(1);
    } else {
        document.getElementById('squareMeter').value = '';
    }
}

// Handle password change
async function handlePasswordChange(event) {
    event.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showMessage('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showMessage('New password must be at least 6 characters long', 'error');
        return;
    }

    try {
        const response = await fetch('/change_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                currentPassword: currentPassword,
                newPassword: newPassword
            })
        });

        const result = await response.json();

        if (result.success) {
            showMessage('Password changed successfully', 'success');
            document.getElementById('changePasswordForm').reset();
        } else {
            showMessage(result.message || 'Failed to change password', 'error');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showMessage('Error changing password', 'error');
    }
}

// Initialize square meter calculation on page load
document.addEventListener('DOMContentLoaded', function() {
    // Calculate initial square meter if values are preset
    setTimeout(() => {
        calculateSquareMeter();
    }, 100);
});

// Populate dropdowns on the "Add Roll" tab
async function fetchAndPopulateAddRollDropdowns() {
    console.log('Attempting to fetch materials and companies...'); // Log start of fetch
    const materialSelect = document.getElementById('material');
    const companySelect = document.getElementById('paperCompany');

    // Clear existing options except the default "Select..." option
    materialSelect.innerHTML = '<option value="">Select Material</option>';
    companySelect.innerHTML = '<option value="">Select Company</option>';

    // Define a list of common materials and companies
    const commonMaterials = ['Chromo', 'Art Paper', 'Thermal', 'Film', 'Tag'];
    const commonCompanies = ['Camline', 'JK Paper', 'ITC', 'BILT', 'Orient'];

    let fetchedMaterials = [];
    let fetchedCompanies = [];

    console.log('Attempting to fetch materials and companies from API...'); // Log start of fetch

    try {
        const response = await fetch('/api/get_materials_companies.php');
        console.log('Fetch response status:', response.status); // Log response status

        if (response.ok) {
            const result = await response.json();
            console.log('Fetch response data:', result); // Log response data

            if (result && Array.isArray(result.materials) && Array.isArray(result.companies)) {
                console.log('Successfully fetched materials and companies from API.'); // Log success
                fetchedMaterials = result.materials;
                fetchedCompanies = result.companies;
            } else {
                console.error('Unexpected response format from get_materials_companies.php:', result);
            }
        } else {
             console.error('Fetch failed with status:', response.status);
             // showMessage(`Error fetching materials and companies: Status ${response.status}`, 'error'); // Don't show error for initial load
        }
    } catch (error) {
        console.error('Error fetching materials and companies:', error);
        // showMessage('Error fetching materials and companies: Network or parsing error', 'error'); // Don't show error for initial load
    }

    // Combine common and fetched lists, remove duplicates, and sort
    const allMaterials = [...new Set([...commonMaterials, ...fetchedMaterials])].sort();
    const allCompanies = [...new Set([...commonCompanies, ...fetchedCompanies])].sort();

    // Populate Material dropdown
    allMaterials.forEach(material => {
        if (material !== 'Custom') { // Avoid adding "Custom" if it somehow comes from DB
            const option = document.createElement('option');
            option.value = material;
            option.textContent = material;
            materialSelect.appendChild(option);
        }
    });

    // Populate Company dropdown
    allCompanies.forEach(company => {
         if (company !== 'Custom') { // Avoid adding "Custom" if it somehow comes from DB
            const option = document.createElement('option');
            option.value = company;
            option.textContent = company;
            companySelect.appendChild(option);
         }
    });

    // Add "Custom" option at the end
    const customMaterialOption = document.createElement('option');
    customMaterialOption.value = 'Custom';
    customMaterialOption.textContent = 'Custom';
    materialSelect.appendChild(customMaterialOption);

    const customCompanyOption = document.createElement('option');
    customCompanyOption.value = 'Custom';
    customCompanyOption.textContent = 'Custom';
    companySelect.appendChild(customCompanyOption);

    // Set default selected values if they exist in the combined data
    if (allMaterials.includes('Chromo')) {
        materialSelect.value = 'Chromo';
    } else if (materialSelect.options.length > 1) {
         materialSelect.value = materialSelect.options[1].value; // Select first actual material
    }

    if (allCompanies.includes('Camline')) {
        companySelect.value = 'Camline';
    } else if (companySelect.options.length > 1) {
         companySelect.value = companySelect.options[1].value; // Select first actual company
    }

    console.log('Dropdowns populated with combined data.'); // Log population completion
}

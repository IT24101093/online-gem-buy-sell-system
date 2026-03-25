// add-gem.js

const AUTH_RULES = {
    "GIA": { min: 10, label: "GIA", error: "GIA IDs must be at least 10 digits" },
    "NGJA": { min: 8, label: "SL-NGJA", error: "NGJA IDs require 8+ characters" },
    "GIC": { min: 6, label: "GIC", error: "GIC IDs require at least 6 digits" },
    "EGL": { min: 9, label: "EGL", error: "EGL IDs must be at least 9 characters" },
    "local": { min: 4, label: "Local", error: "Local IDs must be at least 4 characters" }
};

// --- BACKEND API CALL (DEBUGGING VERSION) ---
async function addCertifiedGemToInventory(){
    const authority = document.getElementById('issuingAuth').value;
    const certID = document.getElementById('certID').value.trim();
    const issueDate = document.getElementById('issueDate').value;

    const gemType = document.getElementById('gemType').value;
    const weightCt = parseFloat(document.getElementById('gemWeight').value) || 0;
    const perCarat = parseFloat(document.getElementById('pricePerCarat').value) || 0;
    const estimatedValueLkr = weightCt * perCarat;
    const description = (document.getElementById('gemDescription')?.value || '').trim();

    const requestData = {
        gemType: gemType || 'Unknown',
        category: 'Uncategorized',
        weightCt: weightCt,
        estimatedValueLkr: estimatedValueLkr,
        description: description,
        certificateNo: certID,
        labName: authority,
        issueDate: issueDate,
        reportUrl: null,
        seller: {
            name: document.getElementById('sellerName').value.trim(),
            nic: document.getElementById('sellerNic').value.trim(),
            phone: document.getElementById('sellerPhone').value.trim()
        }
    };

    console.log("STEP 1: Sending JSON data to create Gem...");
    const response = await fetch('/api/inventory/certified', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
    });

    if (!response.ok) {
        console.error("FAILED AT STEP 1. Backend rejected the JSON.");
        throw new Error('Failed to save JSON data.');
    }

    const responseData = await response.json();
    const itemId = responseData.inventoryItemId;
    console.log("STEP 2: Gem created successfully! Database gave us Item ID:", itemId);

    // 3. Upload the Gem Photo
    try {
        const gemFile = document.getElementById('gemPhoto')?.files?.[0];
        if (gemFile && itemId) {
            console.log("STEP 3: Uploading the Gem Photo...");
            const formData = new FormData();
            formData.append('file', gemFile);
            formData.append('isPrimary', true);

            const imgRes = await fetch(`/api/inventory/items/${itemId}/images`, { method: 'POST', body: formData });
            if (!imgRes.ok) console.error("FAILED AT STEP 3: Image endpoint returned an error.");
            else console.log("STEP 3 SUCCESS: Gem Photo uploaded.");
        }
    } catch (e) { console.error("ERROR IN STEP 3:", e); }

    // 4. Upload the Certificate File
    try {
        const certFile = document.getElementById('certFile')?.files?.[0];
        if (certFile && itemId) {
            console.log("STEP 4: Uploading the Certificate File...");
            const certFormData = new FormData();
            certFormData.append('file', certFile);
            certFormData.append('isPrimary', false);

            const certResponse = await fetch(`/api/inventory/items/${itemId}/images`, { method: 'POST', body: certFormData });

            if (certResponse.ok) {
                const certData = await certResponse.json();
                const finalPath = certData.imageUrl || certData.imagePath;
                console.log("STEP 4 SUCCESS: Certificate uploaded. Server saved it at:", finalPath);

                console.log("STEP 5: Telling Java to update the reportUrl column...");
                const putRes = await fetch(`/api/inventory/certified/${itemId}/report-url?reportUrl=${encodeURIComponent(finalPath)}`, {
                    method: 'PUT'
                });

                if (!putRes.ok) console.error("FAILED AT STEP 5: Java rejected the PUT request.");
                else console.log("STEP 5 SUCCESS: Database fully updated!");

            } else {
                console.error("FAILED AT STEP 4: Certificate endpoint returned an error.");
            }
        } else {
            console.log("SKIPPED STEP 4: No certificate file was selected in the HTML.");
        }
    } catch (e) { console.error("ERROR IN STEP 4 or 5:", e); }

    return itemId;
}

document.addEventListener("DOMContentLoaded", () => {
    // Entrance Animation
    gsap.to(".animate-on-load", { opacity: 1, y: 0, stagger: 0.2, duration: 0.8 });

    setupFileInput('certFile', 'preview-cert', 'drop-cert');
    setupFileInput('gemPhoto', 'preview-gem', 'drop-gem');

    document.getElementById('btn-verify').addEventListener('click', startVerification);

    const addInvBtn = document.getElementById('btn-add-inventory');
    if (addInvBtn) addInvBtn.addEventListener('click', openModal);

    const perCaratInput = document.getElementById('pricePerCarat');
    if (perCaratInput) perCaratInput.addEventListener('input', calculateTotal);

    // Theme Logic
    const themeToggle = document.getElementById('theme-toggle');
    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
});

// --- VISUAL ERROR HELPER ---
function showFieldError(inputId, message) {
    const inputField = document.getElementById(inputId);
    inputField.classList.add('input-error');

    let errorMsg = inputField.parentNode.querySelector('.error-text');
    if (!errorMsg) {
        errorMsg = document.createElement('p');
        errorMsg.className = 'error-text text-red-500 text-[10px] mt-1 font-bold italic';
        inputField.parentNode.appendChild(errorMsg);
    }
    errorMsg.textContent = message;

    gsap.fromTo(inputField, { x: -5 }, { x: 0, duration: 0.1, repeat: 3, yoyo: true });

    inputField.addEventListener('input', () => {
        inputField.classList.remove('input-error');
        if (errorMsg) errorMsg.remove();
    }, { once: true });
}

// --- MODAL FUNCTIONS ---
function openModal() {
    document.getElementById('seller-modal').classList.add('active');
    calculateTotal();
}

function closeModal() {
    document.getElementById('seller-modal').classList.remove('active');
}

function calculateTotal() {
    const weight = parseFloat(document.getElementById('gemWeight').value) || 0;
    const perCarat = parseFloat(document.getElementById('pricePerCarat').value) || 0;
    const total = weight * perCarat;
    document.getElementById('totalPrice').value = "Rs. " + total.toLocaleString('en-US', { minimumFractionDigits: 2 });
}

async function submitFinal() {
    const name = document.getElementById('sellerName');
    const phone = document.getElementById('sellerPhone');
    const nic = document.getElementById('sellerNic');

    const nameRegex = /^[A-Za-z\s]+$/;
    const phoneRegex = /^(07[01245678]\d{7})$/;
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;

    let isValid = true;

    if (name.value.trim().length < 3) {
        showFieldError('sellerName', "Name too short");
        isValid = false;
    }
    // 2. Check for characters only (No numbers or symbols)
    else if (!nameRegex.test(name.value.trim())) {
        showFieldError('sellerName', "Name can only contain letters");
        isValid = false;
    }
    if (!phoneRegex.test(phone.value.trim())) {
        showFieldError('sellerPhone', "Invalid SL mobile (e.g. 0771234567)");
        isValid = false;
    }
    if (!nicRegex.test(nic.value.trim())) {
        showFieldError('sellerNic', "Invalid NIC format");
        isValid = false;
    }

    if (!isValid) return;

    // Send data to Backend
    try {
        await addCertifiedGemToInventory();

        // Only run these if the backend call succeeds!
        closeModal();
        const toast = document.getElementById('toast');
        toast.classList.remove('translate-y-20', 'opacity-0');
        setTimeout(() => { window.location.href = 'inventory.html?added=1'; }, 250000000);

    } catch (e) {
        console.error(e);
        alert("Server Error: Could not save to database. Please make sure your Java backend is running.");
    }
}

// --- VERIFICATION LOGIC ---
function startVerification() {
    const authority = document.getElementById('issuingAuth').value;
    const certID = document.getElementById('certID').value.trim();
    const issueDateVal = document.getElementById('issueDate').value;
    const weight = parseFloat(document.getElementById('gemWeight').value);
    const btn = document.getElementById('btn-verify');
    const reportPanel = document.querySelector('.verification-report-panel');
    const actionArea = document.getElementById('action-area');

    if (!authority) { showFieldError('issuingAuth', "Select lab"); return; }
    if (!certID) { showFieldError('certID', "Enter ID"); return; }
    if (!issueDateVal) { showFieldError('issueDate', "Select date"); return; }
    if (isNaN(weight) || weight <= 0) { showFieldError('gemWeight', "Enter weight"); return; }

    // Start UI processing state
    reportPanel.classList.remove('error-glow');
    reportPanel.classList.add('verifying-glow');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';

    // Ensure Action Area is HIDDEN at the start
    actionArea.classList.add('hidden');
    resetChecklist();

    const delay = 700;
    let verificationFailed = false; // Flag to track if any check fails

    // 1. File Integrity Check
    setTimeout(() => {
        const gemFile = document.getElementById('gemPhoto')?.files?.[0];
        const certFile = document.getElementById('certFile')?.files?.[0];

        const isGemOk = gemFile && gemFile.type.startsWith('image/');
        const isCertOk = certFile && (certFile.type.startsWith('image/') || certFile.type === 'application/pdf');

        if (!isGemOk || !isCertOk) {
            verificationFailed = true;
            updateCheckItem('check-file', 'error', 'INVALID');
            if (!isGemOk) failVerification('GEM IMAGE MUST BE JPG/PNG');
            else if (!isCertOk) failVerification('CERTIFICATE MUST BE IMG OR PDF');
        } else {
            updateCheckItem('check-file', 'success', 'FORMAT OK');
        }
    }, delay);

    // 2. ID, Alphanumeric, and Date Validation
    setTimeout(() => {
        const rule = AUTH_RULES[authority];
        const alphanumericRegex = /^[a-zA-Z0-9]+$/;

        const isLengthOk = certID.length >= rule.min;
        const isAlphanumeric = alphanumericRegex.test(certID);

        const selectedDate = new Date(issueDateVal);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isDateValid = issueDateVal && selectedDate <= today;

        // Check ID Logic
        if (!isLengthOk || !isAlphanumeric) {
            verificationFailed = true;
            updateCheckItem('check-id', 'error', 'INVALID');
            if (!isLengthOk) failVerification('ID TOO SHORT');
            else failVerification('CERT ID: LETTERS & NUMBERS ONLY');
        } else {
            updateCheckItem('check-id', 'success', 'ID VALID');
        }

        // Check Date Logic
        if (!isDateValid) {
            verificationFailed = true;
            failVerification('DATE: FUTURE DATES NOT ALLOWED');
        }
    }, delay * 2);

    // 3. Final Metadata & Final Decision
    setTimeout(() => {
        // Update Weight/Carat Row
        updateCheckItem('check-meta', 'success', weight.toFixed(2) + ' cts');

        // Update Authority Row
        if (authority === 'local') {
            updateCheckItem('check-auth', 'warning', 'PRIVATE LAB');
            setStatus('warning', 'CAUTION: LOCAL ORIGIN');
        } else {
            updateCheckItem('check-auth', 'success', 'TRUSTED');
            // If we haven't failed yet, set the main header to Success
            if (!verificationFailed) setStatus('success', 'VERIFIED AUTHENTIC');
        }

        // --- FINAL BUTTON LOGIC ---
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-shield-alt"></i> Verify & Validate';
        reportPanel.classList.remove('verifying-glow');

        // Only show the "Add to Inventory" button if NOTHING failed
        if (!verificationFailed) {
            actionArea.classList.remove('hidden');
        } else {
            actionArea.classList.add('hidden');
            reportPanel.classList.add('error-glow');
        }

    }, delay * 4);
}

function failVerification(msg) {
    setStatus('error', msg);
    const btn = document.getElementById('btn-verify');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-shield-alt"></i> Verify & Validate';
    document.querySelector('.verification-report-panel').classList.add('error-glow');
    gsap.fromTo(".verification-report-panel", { x: -10 }, { x: 0, duration: 0.1, repeat: 5, yoyo: true });
}

function setStatus(type, title) {
    const mainText = document.getElementById('main-status-text');
    const icon = document.getElementById('status-icon-main');
    mainText.textContent = title;

    mainText.className = 'text-3xl font-bold';
    icon.className = 'mt-4 w-12 h-12 rounded-full border-2 flex items-center justify-center';

    if (type === 'success') {
        mainText.classList.add('text-green-500');
        icon.classList.add('border-green-500', 'text-green-500');
        icon.innerHTML = '<i class="fas fa-check"></i>';
    } else if (type === 'warning') {
        mainText.classList.add('text-yellow-500');
        icon.classList.add('border-yellow-500', 'text-yellow-500');
        icon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    } else {
        mainText.classList.add('text-red-500');
        icon.classList.add('border-red-500', 'text-red-500', 'animate-pulse');
        icon.innerHTML = '<i class="fas fa-times"></i>';
    }
}

function updateCheckItem(id, status, label) {
    const el = document.getElementById(id);
    el.className = `status-item status-${status}`;
    el.querySelector('.status-indicator').textContent = label;
}

function resetChecklist() {
    ['check-file', 'check-id', 'check-meta', 'check-auth'].forEach(id => {
        const el = document.getElementById(id);
        el.className = 'status-item';
        el.querySelector('.status-indicator').textContent = 'WAITING';
    });
}

function setupFileInput(inputId, previewId, dropZoneId) {
    const input = document.getElementById(inputId);
    input.addEventListener('change', function() {
        if (this.files && this.files[0]) {
            document.getElementById(previewId).classList.remove('hidden');
        }
    });
}
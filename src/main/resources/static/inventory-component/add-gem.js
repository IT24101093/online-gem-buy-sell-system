// add-gem.js

const AUTH_RULES = {
    "GIA": { min: 10, label: "GIA", error: "GIA IDs must be at least 10 digits" },
    "NGJA": { min: 8, label: "SL-NGJA", error: "NGJA IDs require 8+ characters" },
    "GIC": { min: 6, label: "GIC", error: "GIC IDs require at least 6 digits" },
    "EGL": { min: 9, label: "EGL", error: "EGL IDs must be at least 9 characters" },
    "local": { min: 4, label: "Local", error: "Local IDs must be at least 4 characters" }
};

const INVENTORY_STORAGE_KEY = 'gemvault_inventory';

// --- Inventory Storage Helpers (shared with inventory.js) ---
function loadInventory(){
    try{
        const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
        const arr = raw ? JSON.parse(raw) : [];
        return Array.isArray(arr) ? arr : [];
    }catch{
        return [];
    }
}

function saveInventory(items){
    localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
}

function fileToDataUrl(file){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

async function addCertifiedGemToInventory(){
    const authority = document.getElementById('issuingAuth').value;
    const certID = document.getElementById('certID').value.trim();

    const gemType = document.getElementById('gemType').value;
    const weightCt = parseFloat(document.getElementById('gemWeight').value) || 0;

    const perCarat = parseFloat(document.getElementById('pricePerCarat').value) || 0;
    const estimatedValue = weightCt * perCarat;

    const vendor = {
        name: document.getElementById('sellerName').value.trim(),
        phone: document.getElementById('sellerPhone').value.trim(),
        nic: document.getElementById('sellerNic').value.trim()
    };

    const description = (document.getElementById('gemDescription')?.value || '').trim();

    const gemFile = document.getElementById('gemPhoto')?.files?.[0] || null;
    let imageDataUrl = '';
    if (gemFile && gemFile.type && gemFile.type.startsWith('image/')) {
        imageDataUrl = await fileToDataUrl(gemFile);
    }

    const item = {
        id: 'GV-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,6).toUpperCase(),
        source: 'certified',
        gemType: gemType || 'Unknown',
        weightCt,
        estimatedValue,
        vendor,
        certificate: { id: certID, issuer: authority },
        description,
        imageDataUrl,
        createdAtISO: new Date().toISOString()
    };

    const items = loadInventory();
    items.unshift(item);
    saveInventory(items);
    return item.id;
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
    inputField.classList.add('input-error'); // Add red border
    
    // Create or update error message text
    let errorMsg = inputField.parentNode.querySelector('.error-text');
    if (!errorMsg) {
        errorMsg = document.createElement('p');
        errorMsg.className = 'error-text text-red-500 text-[10px] mt-1 font-bold italic';
        inputField.parentNode.appendChild(errorMsg);
    }
    errorMsg.textContent = message;

    // Shake the input field
    gsap.fromTo(inputField, { x: -5 }, { x: 0, duration: 0.1, repeat: 3, yoyo: true });

    // Remove error when user starts typing
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

    const phoneRegex = /^(07[01245678]\d{7})$/;
    const nicRegex = /^([0-9]{9}[vVxX]|[0-9]{12})$/;

    let isValid = true;

    if (name.value.trim().length < 3) {
        showFieldError('sellerName', "Name too short");
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

    // Save into Inventory (localStorage) after validation succeeds
    try { await addCertifiedGemToInventory(); } catch (e) { console.error(e); }

    closeModal();
    const toast = document.getElementById('toast');
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => { window.location.href = 'inventory.html?added=1'; }, 2500);
}

// --- VERIFICATION LOGIC ---
function startVerification() {
    const authority = document.getElementById('issuingAuth').value;
    const certID = document.getElementById('certID').value.trim();
    const certFile = document.getElementById('certFile').files[0];
    const gemFile = document.getElementById('gemPhoto').files[0];
    const weight = parseFloat(document.getElementById('gemWeight').value);
    const btn = document.getElementById('btn-verify');
    const reportPanel = document.querySelector('.verification-report-panel');

    // Visual cleanup
    if (!authority) { showFieldError('issuingAuth', "Select lab"); return; }
    if (!certID) { showFieldError('certID', "Enter ID"); return; }
    if (isNaN(weight) || weight <= 0) { showFieldError('gemWeight', "Enter weight"); return; }

    reportPanel.classList.remove('error-glow');
    reportPanel.classList.add('verifying-glow');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Processing...';
    document.getElementById('action-area').classList.add('hidden');
    resetChecklist();

    const delay = 700;

    // 1. File Check
    setTimeout(() => {
        const isCertOk = certFile?.type.startsWith('image/') || certFile?.type === 'application/pdf';
        if (!certFile || !isCertOk) {
            updateCheckItem('check-file', 'error', 'INVALID');
            failVerification('FILE REJECTED');
        } else {
            updateCheckItem('check-file', 'success', 'FORMAT OK');
        }
    }, delay);

    // 2. ID Validation
    setTimeout(() => {
        if (btn.disabled === false) return;
        const rule = AUTH_RULES[authority];
        if (certID.length < rule.min) {
            updateCheckItem('check-id', 'error', 'SHORT');
            showFieldError('certID', rule.error);
            failVerification('INVALID ID');
        } else {
            updateCheckItem('check-id', 'success', 'ID VALID');
        }
    }, delay * 2);

    // 3. Success Sequence
    setTimeout(() => {
        if (btn.disabled === false) return;
        updateCheckItem('check-meta', 'success', weight.toFixed(2) + ' cts');
        
        // --- NEW LOGIC FOR LOCAL LAB WARNING ---
        if (authority === 'local') {
            updateCheckItem('check-auth', 'warning', 'PRIVATE LAB');
            setStatus('warning', 'CAUTION: LOCAL ORIGIN');
        } else {
            updateCheckItem('check-auth', 'success', 'TRUSTED');
            setStatus('success', 'VERIFIED AUTHENTIC');
        }

        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-shield-alt"></i> Verify & Validate';
        reportPanel.classList.remove('verifying-glow');
        
        // Show "Add to Inventory" button for BOTH success and warning
        document.getElementById('action-area').classList.remove('hidden');

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
    
    // Reset base classes
    mainText.className = 'text-3xl font-bold';
    icon.className = 'mt-4 w-12 h-12 rounded-full border-2 flex items-center justify-center';

    if (type === 'success') {
        mainText.classList.add('text-green-500');
        icon.classList.add('border-green-500', 'text-green-500');
        icon.innerHTML = '<i class="fas fa-check"></i>';
    } else if (type === 'warning') {
        // --- NEW YELLOW WARNING STATE ---
        mainText.classList.add('text-yellow-500'); 
        icon.classList.add('border-yellow-500', 'text-yellow-500');
        icon.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
    } else {
        // Error state
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
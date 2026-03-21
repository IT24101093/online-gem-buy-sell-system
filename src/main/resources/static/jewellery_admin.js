// =====================================================================
// jewellery_admin.js
// Jewellery Admin – CRUD management for jewellery items.
//
// Data is stored in the database via the backend API (NOT localStorage).
// All browser dialogs (alert / confirm / prompt) have been removed and
// replaced with custom in-page modals & a toast notification.
//
// API endpoints used:
//   GET    /api/admin/jewellery          → list all jewellery items
//   POST   /api/admin/jewellery          → create a new jewellery item
//   DELETE /api/admin/jewellery/{id}     → delete a jewellery item
// =====================================================================

const JEWELLERY_API = '/api/admin/jewellery';

// ── Same demo items shown on the Jewellery User page ──────────────────────
const MOCK_JEWELLERY_ADMIN = [
    { jewelleryId: -1, jewelleryType: 'Ring', metalColour: 'Gold', priceLkr: 145000, gemstoneName: 'Blue Sapphire', imagePath: 'gem-photos/image9.jpg', gemCategories: ['Sapphire', 'Ruby'] },
    { jewelleryId: -2, jewelleryType: 'Pendant', metalColour: 'Platinum', priceLkr: 225000, gemstoneName: 'Colombian Emerald', imagePath: 'gem-photos/image10.jpg', gemCategories: ['Emerald'] },
    { jewelleryId: -3, jewelleryType: 'Necklace', metalColour: 'Gold', priceLkr: 380000, gemstoneName: 'Yellow Sapphire', imagePath: 'gem-photos/image11.jpg', gemCategories: ['Sapphire'] },
    { jewelleryId: -4, jewelleryType: 'Earrings', metalColour: 'Silver', priceLkr: 68000, gemstoneName: 'Pink Sapphire', imagePath: 'gem-photos/image12.jpg', gemCategories: ['Sapphire'] },
    { jewelleryId: -5, jewelleryType: 'Bracelet', metalColour: 'Gold', priceLkr: 195000, gemstoneName: 'Vivid Ruby', imagePath: 'gem-photos/image13.jpg', gemCategories: ['Ruby', 'Spinel'] },
    { jewelleryId: -6, jewelleryType: 'Ring', metalColour: 'Platinum', priceLkr: 520000, gemstoneName: 'Teal Sapphire', imagePath: 'gem-photos/image14.jpg', gemCategories: ['Sapphire'] },
    { jewelleryId: -7, jewelleryType: 'Pendant', metalColour: 'Silver', priceLkr: 95000, gemstoneName: 'Aquamarine', imagePath: 'gem-photos/image15.jpg', gemCategories: ['Aquamarine'] },
    { jewelleryId: -8, jewelleryType: 'Necklace', metalColour: 'Gold', priceLkr: 310000, gemstoneName: 'Padparadscha Sapphire', imagePath: 'gem-photos/image16.jpg', gemCategories: ['Sapphire'] }
];

// ── State ──────────────────────────────────────────────────────────────────
/** ID of the jewellery item pending deletion. Populated by deleteJewellery(). */
let _jwlDeleteId = null;
let editingJewelleryId = null;
let selectedImageName = null;
let currentImagePath = null;

// ── Bootstrap ──────────────────────────────────────────────────────────────
// Load items from the backend as soon as the script runs.
loadJewelleryFromBackend();

// ── Toast notification helper (replaces alert) ────────────────────────────
/**
 * Shows a brief in-page toast at the bottom-right.
 * @param {string} message
 * @param {'info'|'error'} type
 */
function jwlAdminToast(message, type = 'info') {
    const toast = document.getElementById('jwl-admin-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = type === 'error' ? '#dc2626' : '#1e293b';
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ── Backend data loader ───────────────────────────────────────────────────
/**
 * Fetches all jewellery items from the backend and renders the table.
 * Called on page load and after any create/delete operation.
 */
function loadJewelleryFromBackend() {
    fetch(JEWELLERY_API)
        .then(res => {
            if (!res.ok) throw new Error('Failed to load jewellery items');
            return res.json();
        })
        .then(items => {
            const backendItems = Array.isArray(items) ? items : [];
            renderJewelleryTable(backendItems);
        })
        .catch(err => {
            console.error('Error loading jewellery items', err);
            renderJewelleryTable([]);
            jwlAdminToast('Could not load jewellery items from server.', 'error');
        });
}

// ── Modal open / close ─────────────────────────────────────────────────────
function openAddJewelleryModal() {
    // Reset all form fields before opening
    document.getElementById('jwl-type').value = '';
    document.getElementById('jwl-metal').value = '';
    document.getElementById('jwl-price').value = '';
    document.getElementById('jwl-gemstone').value = '';
    document.getElementById('jwl-description').value = '';
    Array.from(document.getElementById('jwl-gem-categories').options)
        .forEach(opt => opt.selected = false);
    document.getElementById('jwl-image-input').value = '';
    document.getElementById('jwl-image-preview').style.display = 'none';
    document.getElementById('jwl-image-preview').src = '';

    const modal = document.getElementById('add-jewellery-modal');
    modal.classList.remove('hidden');
    // Restart the entry animation
    const box = modal.querySelector('div');
    box.classList.remove('animate__zoomIn');
    void box.offsetWidth; // force reflow
    box.classList.add('animate__zoomIn');
}

function closeAddJewelleryModal() {
    document.getElementById('add-jewellery-modal').classList.add('hidden');
}

// Close add-modal when clicking the backdrop
document.addEventListener('click', function (e) {
    const modal = document.getElementById('add-jewellery-modal');
    if (e.target === modal) closeAddJewelleryModal();
});

// ── Image Preview ──────────────────────────────────────────────────────────
function previewJewelleryImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('jwl-image-preview');
    if (!file) {
        preview.style.display = 'none';
        preview.src = '';
        selectedImageName = null;
        return;
    }
    selectedImageName = file.name;

    const reader = new FileReader();
    reader.onload = function (e) {
        preview.src = e.target.result;
        preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
}

// ── Save (Create) Jewellery ────────────────────────────────────────────────
/**
 * Reads all form fields, validates them, then POSTs to the backend API.
 * On success the table is refreshed and the modal is closed.
 */
function saveJewellery() {
    const type = document.getElementById('jwl-type').value.trim();
    const metal = document.getElementById('jwl-metal').value.trim();
    const priceRaw = document.getElementById('jwl-price').value.trim();
    const gemstone = document.getElementById('jwl-gemstone').value.trim();
    const description = document.getElementById('jwl-description').value.trim();

    // Read multi-select gem categories
    const catSelect = document.getElementById('jwl-gem-categories');
    const categories = Array.from(catSelect.selectedOptions).map(o => o.value);

    // ── Validation (custom toast instead of alert) ──
    if (!type) {
        jwlAdminToast('Please select a Jewellery Type.', 'error');
        return;
    }
    if (!metal) {
        jwlAdminToast('Please select a Metal Colour.', 'error');
        return;
    }
    if (categories.length === 0) {
        jwlAdminToast('Please select at least one Gem Category.', 'error');
        return;
    }
    const price = Number(priceRaw);
    if (!priceRaw || Number.isNaN(price) || price <= 0) {
        jwlAdminToast('Please enter a valid price greater than 0.', 'error');
        return;
    }

    // Build the DTO matching the backend's JewelleryDTO shape
    const dto = {
        jewelleryType: type,
        metalColour: metal,
        priceLkr: price,
        gemstoneName: gemstone || null,
        description: description || null,
        gemCategories: categories,
        imagePath: selectedImageName
            ? `gem-photos/${selectedImageName}`
            : currentImagePath
    };

    const method = editingJewelleryId ? 'PUT' : 'POST';

    const url = editingJewelleryId
        ? `${JEWELLERY_API}/${editingJewelleryId}`
        : JEWELLERY_API;

    fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto)
    })
        .then(res => {
            if (!res.ok) throw new Error('Server returned ' + res.status);
            return res.json();
        })
        .then(() => {
            selectedImageName = null;
            editingJewelleryId = null;
            closeAddJewelleryModal();
            loadJewelleryFromBackend();   // refresh table from DB
            jwlAdminToast('Jewellery item added successfully.');
        })
        .catch(err => {
            console.error('Error saving jewellery', err);
            jwlAdminToast('Failed to save jewellery item. Please try again.', 'error');
        });
}

function openEditJewellery(id) {
    editingJewelleryId = id;

    fetch(`${JEWELLERY_API}/${id}`)
        .then(res => res.json())
        .then(item => {

            document.getElementById('jwl-type').value = item.jewelleryType;
            document.getElementById('jwl-metal').value = item.metalColour;
            document.getElementById('jwl-price').value = item.priceLkr;
            document.getElementById('jwl-gemstone').value = item.gemstoneName || '';
            document.getElementById('jwl-description').value = item.description || '';

            //store old image
            currentImagePath = item.imagePath;

            //show image preview
            const preview = document.getElementById('jwl-image-preview');
            if (item.imagePath) {
                preview.src = item.imagePath;
                preview.style.display = 'block';
            }
            // open same modal
            document.getElementById('add-jewellery-modal').classList.remove('hidden');
        })
        .catch(err => {
            console.error(err);
            jwlAdminToast("Failed to load jewellery for editing", "error");
        });
}


// ── Delete Jewellery (custom modal replaces confirm) ──────────────────────
/**
 * Opens the custom Confirm Delete modal for the given jewellery item.
 * @param {number} id  – jewelleryId from the backend
 * @param {string} name – display name (type) shown in the confirmation message
 */
function deleteJewellery(id, name) {
    _jwlDeleteId = id;
    const label = document.getElementById('jwl-delete-label');
    if (label) {
        label.textContent = `"${name}" will be permanently deleted from the database. This cannot be undone.`;
    }
    document.getElementById('jwl-confirm-delete-modal').style.display = 'flex';
    lucide.createIcons(); // ensure trash icon renders inside the modal
}

/** Closes the Confirm Delete modal without deleting. */
function closeJwlDeleteModal() {
    document.getElementById('jwl-confirm-delete-modal').style.display = 'none';
    _jwlDeleteId = null;
}

/** Called when the user clicks "Delete" inside the confirm modal. */
function confirmJwlDelete() {
    const id = _jwlDeleteId;
    closeJwlDeleteModal();

    if (!id) return;

    // ── Guard: mock / demo items have negative IDs and don't exist in the DB ──
    // Sending DELETE /api/admin/jewellery/-1 would return 404 from the backend.
    // Show an informational toast instead and skip the API call.
    if (id < 0) {
        jwlAdminToast('Demo items are for display only and cannot be deleted.', 'error');
        return;
    }

    // Real database items: send DELETE request to the backend
    fetch(`${JEWELLERY_API}/${id}`, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) throw new Error('Server returned ' + res.status);
            loadJewelleryFromBackend();   // refresh table from DB
            jwlAdminToast('Jewellery item deleted successfully.');
        })
        .catch(err => {
            console.error('Error deleting jewellery', err);
            jwlAdminToast('Failed to delete jewellery item. Please try again.', 'error');
        });
}

// Close confirm-delete modal on backdrop click
document.addEventListener('click', function (e) {
    const modal = document.getElementById('jwl-confirm-delete-modal');
    if (e.target === modal) closeJwlDeleteModal();
});

// ── Render Table ───────────────────────────────────────────────────────────
/**
 * Renders the jewellery management table with backend data.
 * @param {Array} items – array of JewelleryDTO objects from the API
 */
function renderJewelleryTable(items) {
    const tbody = document.getElementById('jewellery-table-body');
    const empty = document.getElementById('jewellery-empty');
    const countEl = document.getElementById('jewellery-count');

    countEl.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;

    if (items.length === 0) {
        tbody.innerHTML = '';
        empty.classList.remove('hidden');
        lucide.createIcons();
        return;
    }

    empty.classList.add('hidden');

    tbody.innerHTML = items.map(item => `
        <tr class="border-b last:border-0 hover:bg-slate-50 transition animate__animated animate__fadeIn">
            <!-- Image -->
            <td class="p-4">
                ${item.imagePath
            ? `<img src="${item.imagePath}" alt="${item.jewelleryType}" class="jwl-thumb">`
            : `<div class="jwl-thumb-placeholder"><span>No<br>Image</span></div>`
        }
            </td>

            <!-- Type -->
            <td class="p-4 font-bold text-slate-700">${item.jewelleryType}</td>

            <!-- Metal -->
            <td class="p-4">
                <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                    ${metalIcon(item.metalColour)} ${item.metalColour}
                </span>
            </td>

            <!-- Price -->
            <td class="p-4 font-mono text-green-600 font-bold">
                ${item.priceLkr != null ? 'Rs. ' + Number(item.priceLkr).toLocaleString() : '—'}
            </td>

            <!-- Gem Categories -->
            <td class="p-4">
                ${(item.gemCategories || []).map(c => `<span class="cat-badge">${c}</span>`).join('')}
            </td>

            <!-- Actions -->
            <td class="p-4 flex gap-2">
                <button
                    class="p-2 hover:bg-blue-50 text-blue-500 rounded-lg transition"
                    onclick="openEditJewellery(${item.jewelleryId})"
                    title="Edit">
                    ✏️
                </button>
                <button
                    class="p-2 hover:bg-red-50 text-red-500 rounded-lg transition"
                    onclick="deleteJewellery(${item.jewelleryId}, '${(item.gemstoneName || item.jewelleryType).replace(/'/g, "\\'")}')"
                    title="Delete">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </td>
        </tr>
    `).join('');

    lucide.createIcons();
}

// ── Helper: small coloured dot for metal colour ────────────────────────────
function metalIcon(metal) {
    const colours = {
        'Gold': '#d4af37',
        'Silver': '#a0aec0',
        'Platinum': '#9ca3af'
    };
    const c = colours[metal] || '#cbd5e1';
    return `<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${c};margin-bottom:-1px;"></span>`;
}

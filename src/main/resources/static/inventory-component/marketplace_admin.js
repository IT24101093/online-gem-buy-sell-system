// =====================================================================
// marketplace_admin.js
// Marketplace Admin – gem listing management.
//
// All browser dialog calls (alert / confirm / prompt) have been removed
// and replaced with custom in-page modals & a toast notification.
// =====================================================================

const ADMIN_MARKETPLACE_API_BASE = '/api/admin/marketplace';

// Original demo data kept for UI richness
const demoInventoryItems = [
    { draftId: -501, gemstoneName: "Natural Padparadscha Sapphire", spec: "1.25ct Oval", category: "Sapphire", mainImageUrl: "/gem-photos/image4.jpg" },
    { draftId: -502, gemstoneName: "Vivid Green Tsavorite", spec: "2.10ct Cushion", category: "Garnet" },
    // Blue Ceylon Sapphire restored as a permanent demo inventory item
    { draftId: -503, gemstoneName: "Blue Ceylon Sapphire", spec: "2.50ct Oval", category: "Sapphire" }
];

const demoMarketItems = [
    { listingId: -1, name: "Blue Ceylon Sapphire", category: "Sapphire", price: 1260000, mainImageUrl: "/gem-photos/image1.jpg" },
    { listingId: -2, name: "Ruby", category: "Ruby", price: 840000, mainImageUrl: "/gem-photos/image2.jpg" },
    { listingId: -3, name: "Zambian Emerald", category: "Emerald", price: 1680000, mainImageUrl: "/gem-photos/image3.jpg" },
    { listingId: -4, name: "Padparadscha Sapphire", category: "Sapphire", price: 3600000, mainImageUrl: "/gem-photos/image4.jpg" },
    { listingId: -5, name: "Yellow Sapphire", category: "Sapphire", price: 2100000, mainImageUrl: "/gem-photos/image5.jpg" },
    { listingId: -6, name: "Pink Sapphire", category: "Sapphire", price: 2400000, mainImageUrl: "/gem-photos/image6.jpg" },
    { listingId: -7, name: "Star Sapphire", category: "Sapphire", price: 4500000, mainImageUrl: "/gem-photos/image7.jpg" },
    { listingId: -8, name: "Teal Sapphire", category: "Sapphire", price: 2800000, mainImageUrl: "/gem-photos/image8.jpg" }
];

let inventoryItems = [];
let marketItems = [];

let activeGemId = null;

// ── Toast notification (replaces alert) ────────────────────────────────────
/**
 * Shows a brief toast notification at the bottom-right of the screen.
 * @param {string} message
 * @param {'info'|'error'} type
 */
function admShowToast(message, type = 'info') {
    const toast = document.getElementById('adm-toast');
    if (!toast) return;
    toast.textContent = message;
    toast.style.background = type === 'error' ? '#dc2626' : '#1e293b';
    toast.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.add('hidden'), 3500);
}

// ── Render helpers ─────────────────────────────────────────────────────────
function renderInventory() {
    const container = document.getElementById('inventory-inbox');
    container.innerHTML = inventoryItems.map(item => {

        // 1. Smart URL cleanup for the Inventory images!
        let finalImageSrc = 'https://placehold.co/400x300?text=No+Image';
        let imageUrl = item.mainImageUrl || item.imagePath || item.img;

        if (imageUrl) {
            if (imageUrl.includes('uploads/items/')) {
                finalImageSrc = '/' + imageUrl.substring(imageUrl.indexOf('uploads/items/'));
            } else if (imageUrl.startsWith('/') || imageUrl.startsWith('http')) {
                finalImageSrc = imageUrl;
            } else {
                finalImageSrc = '/uploads/' + imageUrl;
            }
        }

        // 2. Safety fallbacks for database vs demo fields
        const displayName = item.gemstoneName || item.name || 'Unknown Gem';
        const displayCategory = item.category || 'Uncategorized';
        const displaySpec = item.spec || item.description || 'No specs available';
        const modalId = item.draftId || item.id || 0;

        return `
        <div class="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-amber-400 animate__animated animate__fadeInUp hover:shadow-md transition cursor-pointer" onclick="openModal(${modalId})">
            
            <div class="flex gap-4 items-center mb-3">
                <img src="${finalImageSrc}" alt="${displayName}" class="w-16 h-16 object-cover rounded-lg border border-slate-200" onerror="this.onerror=null; this.src='https://placehold.co/400x300?text=No+Image';">
                <div>
                    <p class="text-xs text-amber-600 font-bold uppercase tracking-tighter">${displayCategory}</p>
                    <h4 class="font-bold text-slate-800">${displayName}</h4>
                </div>
            </div>

            <p class="text-sm text-slate-500 line-clamp-2">${displaySpec}</p>
            <button class="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1">
                <i data-lucide="plus-circle" class="w-3 h-3"></i> PREPARE LISTING
            </button>
        </div>
        `;
    }).join('');
    lucide.createIcons();
}
function renderMarketTable() {
    const tbody = document.getElementById('active-listings');
    tbody.innerHTML = marketItems.map(item => {

        // FIX 1: The same smart URL cleanup we used on the user page!
        let finalImageSrc = 'https://placehold.co/400x300?text=No+Image';
        if (item.mainImageUrl) {
            let url = item.mainImageUrl;
            if (url.includes('uploads/items/')) {
                finalImageSrc = '/' + url.substring(url.indexOf('uploads/items/'));
            } else if (url.startsWith('/') || url.startsWith('http')) {
                finalImageSrc = url;
            } else {
                finalImageSrc = '/uploads/' + url;
            }
        }

        // FIX 2: Handle both Database fields AND Demo Item fields!
        const displayName = item.gemstoneName || item.name || 'Unknown Gem';
        const displayCategory = item.category || 'Uncategorized';
        const displayPrice = item.priceLkr || item.price || 0;

        return `
        <tr class="border-b last:border-0 hover:bg-slate-50 transition">
            <td class="p-4">
                <img src="${finalImageSrc}" alt="${displayName}" class="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm" onerror="this.onerror=null; this.src='https://placehold.co/400x300?text=No+Image';">
            </td>
            <td class="p-4 font-bold text-slate-700">${displayName}</td>
            <td class="p-4 text-sm text-slate-500">${displayCategory}</td>
            <td class="p-4 font-mono text-green-600 font-bold">Rs. ${displayPrice.toLocaleString()}</td>
            <td class="p-4 flex gap-3">
                <button class="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition" onclick="openEditPrice(${item.listingId})" title="Edit price"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                <button class="p-2 hover:bg-red-50 text-red-500 rounded-lg transition" onclick="deleteListing(${item.listingId})" title="Delete listing"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
            </td>
        </tr>
        `;
    }).join('');
    lucide.createIcons();
    saveDemoMarketItemsToStorage();
}

function saveDemoMarketItemsToStorage() {
    try {
        const demoItems = marketItems.filter(m => m.listingId < 0);
        window.localStorage.setItem('jayagems_admin_demo_market_items', JSON.stringify(demoItems));
    } catch (e) {
        console.error('Failed to persist admin demo market items', e);
    }
}

// ── Publish (Prepare Listing) modal ──────────────────────────────────────
function openModal(id) {
    activeGemId = id;
    const gem = inventoryItems.find(g => g.draftId === id);
    if (!gem) return;
    document.getElementById('modal-gem-desc').innerText = `Setting market price for: ${gem.gemstoneName} (${gem.spec})`;
    document.getElementById('price-modal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('price-modal').classList.add('hidden');
    const varList = document.getElementById('admin-variant-list');
    if (varList) varList.innerHTML = '';
}

// ── Feature 3: Dynamic carat variant rows in the Prepare Listing modal ──
/**
 * Adds a new carat + price input row to the admin-variant-list container.
 */
function addVariantRow() {
    const container = document.getElementById('admin-variant-list');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'variant-row flex items-center gap-2 animate__animated animate__fadeIn';
    row.innerHTML = `
        <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Carats (e.g.1.5)"
            class="flex-1 p-2 bg-slate-100 rounded-lg text-sm outline-none"
        >
        <input
            type="number"
            step="1"
            min="1"
            placeholder="Price (LKR)"
            class="flex-1 p-2 bg-slate-100 rounded-lg text-sm outline-none"
        >
        <button
            type="button"
            onclick="removeVariantRow(this)"
            class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            title="Remove variant">
            <i data-lucide="x" class="w-3 h-3"></i>
        </button>
    `;
    container.appendChild(row);
    lucide.createIcons();
}

/** Removes the variant row that contains the given remove button. */
function removeVariantRow(btn) {
    const row = btn.closest('div');
    if (row) row.remove();
}

/**
 * Handles the publication of a gemstone from a draft to the active marketplace.
 */
function confirmPublish() {
    const priceInput = document.getElementById('market-price').value;
    if (!priceInput) {
        admShowToast('Please enter a price before publishing.', 'error');
        return;
    }

    // CLEAN THE PRICE: Removes spaces that cause NumberFormatException
    const cleanedPrice = priceInput.toString().replace(/\s+/g, '').replace(/,/g, '');

    if (!activeGemId) return;

    // ... (Keep existing demo logic for activeGemId < 0) ...

    const url = `${ADMIN_MARKETPLACE_API_BASE}/drafts/${activeGemId}/approve?adminPrice=${encodeURIComponent(cleanedPrice)}`;

    fetch(url, { method: 'PUT' })
        .then(async res => {
            if (!res.ok) {
                const errorData = await res.json();
                // This will now show the "Column 'category' cannot be null" error in your console
                console.error('Server Error Details:', errorData);
                throw new Error(errorData.message || 'Server error');
            }
            admShowToast('Gem successfully pushed to Marketplace!');
            loadPendingDrafts();
            loadActiveListings();
            document.getElementById('market-price').value = '';
            closeModal();
        })
        .catch(err => {
            console.error('Error publishing listing:', err);
            admShowToast('An error occurred: ' + err.message, 'error');
        });
}

// ── List loaders ───────────────────────────────────────────────────────────
function loadPendingDrafts() {
    fetch(`${ADMIN_MARKETPLACE_API_BASE}/pending`)
        .then(res => res.json())
        .then(data => {
            const backendItems = Array.isArray(data) ? data : [];
            inventoryItems = backendItems.concat(demoInventoryItems);
            renderInventory();
        })
        .catch(err => {
            console.error('Error loading pending drafts', err);
        });
}

function loadActiveListings() {
    fetch(`${ADMIN_MARKETPLACE_API_BASE}/listings`)
        .then(res => res.json())
        .then(data => {
            const backendItems = Array.isArray(data) ? data : [];

            let persistedDemo = [];
            try {
                const raw = window.localStorage.getItem('jayagems_admin_demo_market_items');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) persistedDemo = parsed;
                }
            } catch (e) {
                console.error('Failed to read admin demo market items from storage', e);
            }

            const byId = {};
            demoMarketItems.forEach(item => { byId[item.listingId] = item; });
            persistedDemo.forEach(item => { byId[item.listingId] = item; });
            const effectiveDemo = Object.values(byId);

            marketItems = effectiveDemo.concat(backendItems);
            renderMarketTable();
        })
        .catch(err => {
            console.error('Error loading active listings', err);
        });
}

// ── Edit Price (custom modal replaces prompt) ──────────────────────────────

/** ID of the listing currently being edited. */
let _editPriceId = null;

/** Opens the custom Edit Price modal for the given listing. */
function openEditPrice(listingId) {
    const item = marketItems.find(m => m.listingId === listingId);
    if (!item) return;

    _editPriceId = listingId;

    // Pre-fill the modal
    document.getElementById('edit-price-label').textContent =
        `Updating price for: ${item.name}`;
    document.getElementById('edit-price-input').value = Number(item.price) || '';
    document.getElementById('edit-price-error').classList.add('hidden');
    document.getElementById('edit-price-modal').classList.remove('hidden');
    // Focus the input for keyboard convenience
    setTimeout(() => document.getElementById('edit-price-input').focus(), 80);
}

/** Closes the Edit Price modal without saving. */
function closeEditPriceModal() {
    document.getElementById('edit-price-modal').classList.add('hidden');
    _editPriceId = null;
}

/** Called when the user clicks "Save Price" inside the modal. */
function submitEditPrice() {
    const input = document.getElementById('edit-price-input');
    const errEl = document.getElementById('edit-price-error');
    const newPrice = Number(input.value);

    if (Number.isNaN(newPrice) || newPrice <= 0) {
        errEl.classList.remove('hidden');
        input.focus();
        return;
    }
    errEl.classList.add('hidden');

    const listingId = _editPriceId;
    closeEditPriceModal();

    // Demo items: update on the frontend only
    if (listingId < 0) {
        const item = marketItems.find(m => m.listingId === listingId);
        if (item) {
            item.price = newPrice;
            renderMarketTable();
        }
        return;
    }

    // Real backend items: PATCH the price via API
    fetch(`${ADMIN_MARKETPLACE_API_BASE}/listings/${listingId}/price?price=${encodeURIComponent(newPrice)}`, {
        method: 'PATCH'
    })
        .then(res => {
            if (!res.ok) {
                admShowToast('Failed to update price. Please try again.', 'error');
                return;
            }
            loadActiveListings();
            admShowToast('Price updated successfully.');
        })
        .catch(err => {
            console.error('Error updating price', err);
            admShowToast('An error occurred while updating the price.', 'error');
        });
}

// Close edit-price modal on backdrop click
document.addEventListener('click', e => {
    if (e.target === document.getElementById('edit-price-modal')) closeEditPriceModal();
});

// ── Delete Listing (custom modal replaces confirm) ─────────────────────────

/** ID of the listing pending deletion. */
let _deleteListingId = null;

/** Opens the custom Confirm Delete modal for the given listing. */
function deleteListing(listingId) {
    const item = marketItems.find(m => m.listingId === listingId);
    if (!item) return;

    _deleteListingId = listingId;
    document.getElementById('confirm-delete-label').textContent =
        `"${item.name}" will be permanently removed from the marketplace. This cannot be undone.`;
    document.getElementById('confirm-delete-modal').classList.remove('hidden');
}

/** Closes the Confirm Delete modal without deleting. */
function closeDeleteModal() {
    document.getElementById('confirm-delete-modal').classList.add('hidden');
    _deleteListingId = null;
}

/** Called when the user confirms deletion inside the modal. */
function confirmDeleteListing() {
    const listingId = _deleteListingId;
    closeDeleteModal();

    // Demo items: delete on the frontend only
    if (listingId < 0) {
        const idx = marketItems.findIndex(m => m.listingId === listingId);
        if (idx !== -1) {
            marketItems.splice(idx, 1);
            renderMarketTable();
        }
        return;
    }

    // Real backend items: DELETE via API
    fetch(`${ADMIN_MARKETPLACE_API_BASE}/listings/${listingId}`, {
        method: 'DELETE'
    })
        .then(res => {
            if (!res.ok) {
                admShowToast('Failed to delete listing. Please try again.', 'error');
                return;
            }
            loadActiveListings();
            admShowToast('Listing deleted successfully.');
        })
        .catch(err => {
            console.error('Error deleting listing', err);
            admShowToast('An error occurred while deleting the listing.', 'error');
        });
}

// Close confirm-delete modal on backdrop click
document.addEventListener('click', e => {
    if (e.target === document.getElementById('confirm-delete-modal')) closeDeleteModal();
});

// ── Bootstrap ─────────────────────────────────────────────────────────────
loadPendingDrafts();
loadActiveListings();
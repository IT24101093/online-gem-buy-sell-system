const ADMIN_MARKETPLACE_API_BASE = '/api/admin/marketplace';

// Original demo data kept for UI richness
const demoInventoryItems = [
    { draftId: -501, gemstoneName: "Natural Padparadscha Sapphire", spec: "1.25ct Oval", category: "Sapphire",mainImageUrl: "/gem-photos/image4.jpg" },
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

function renderInventory() {
    const container = document.getElementById('inventory-inbox');
    container.innerHTML = inventoryItems.map(item => `
        <div class="bg-white p-5 rounded-2xl shadow-sm border-l-4 border-amber-400 animate__animated animate__fadeInUp hover:shadow-md transition cursor-pointer" onclick="openModal(${item.draftId})">
            <p class="text-xs text-amber-600 font-bold uppercase tracking-tighter">${item.category}</p>
            <h4 class="font-bold text-slate-800">${item.gemstoneName}</h4>
            <p class="text-sm text-slate-500">${item.spec}</p>
            <button class="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1">
                <i data-lucide="plus-circle" class="w-3 h-3"></i> PREPARE LISTING
            </button>
        </div>
    `).join('');
    lucide.createIcons();
}

function renderMarketTable() {
    const tbody = document.getElementById('active-listings');
    tbody.innerHTML = marketItems.map(item => {
        return `
        <tr class="border-b last:border-0 hover:bg-slate-50 transition">
            <td class="p-4">
                <img src="${item.mainImageUrl || '/gem-photos/default.jpg'}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-sm" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%23e2e8f0%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%2394a3b8%27 font-family=%27sans-serif%27 font-size=%2714%27%3ENo Image%3C/text%3E%3C/svg%3E';">
            </td>
            <td class="p-4 font-bold text-slate-700">${item.name}</td>
            <td class="p-4 text-sm text-slate-500">${item.category}</td>
            <td class="p-4 font-mono text-green-600 font-bold">Rs. ${item.price.toLocaleString()}</td>
            <td class="p-4 flex gap-3">
                <button class="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition" onclick="openEditPrice(${item.listingId})"><i data-lucide="edit-2" class="w-4 h-4"></i></button>
                <button class="p-2 hover:bg-red-50 text-red-500 rounded-lg transition" onclick="deleteListing(${item.listingId})"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
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

function openModal(id) {
    activeGemId = id;
    const gem = inventoryItems.find(g => g.draftId === id);
    if (!gem) return;
    document.getElementById('modal-gem-desc').innerText = `Setting market price for: ${gem.gemstoneName} (${gem.spec})`;
    document.getElementById('price-modal').classList.remove('hidden');
}

function closeModal() { document.getElementById('price-modal').classList.add('hidden'); }

function confirmPublish() {
    const price = document.getElementById('market-price').value;
    if(!price) return alert("Please enter a price");

    if (!activeGemId) return;

    // Demo drafts (negative ids) are handled purely on the frontend
    if (activeGemId < 0) {
        const gem = inventoryItems.find(g => g.draftId === activeGemId);
        if (!gem) return;

        const numericPrice = Number(price);
        if (Number.isNaN(numericPrice) || numericPrice <= 0) {
            alert('Please enter a valid price');
            return;
        }

        marketItems.unshift({
            listingId: activeGemId,
            name: gem.gemstoneName,
            category: gem.category,
            price: numericPrice,
            mainImageUrl: '/gem-photos/image4.jpg'
        });

        const idx = inventoryItems.findIndex(g => g.draftId === activeGemId);
        if (idx !== -1) {
            inventoryItems.splice(idx, 1);
        }

        renderInventory();
        renderMarketTable();
        document.getElementById('market-price').value = '';
        closeModal();
        return;
    }

    const url = `${ADMIN_MARKETPLACE_API_BASE}/publish/${activeGemId}?price=${encodeURIComponent(price)}`;
    fetch(url, {
        method: 'POST'
    }).then(res => {
        if (!res.ok) {
            alert('Failed to publish listing');
            return;
        }
        return res.text();
    }).then(() => {
        // Refresh both lists from backend
        loadPendingDrafts();
        loadActiveListings();
        document.getElementById('market-price').value = '';
        closeModal();
    }).catch(err => {
        console.error('Error publishing listing', err);
        alert('An error occurred while publishing listing');
    });
}

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

            // Always include original demo items like Teal Sapphire,
            // but also apply any changes saved in localStorage.
            let persistedDemo = [];
            try {
                const raw = window.localStorage.getItem('jayagems_admin_demo_market_items');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (Array.isArray(parsed)) {
                        persistedDemo = parsed;
                    }
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

function openEditPrice(listingId) {
    const item = marketItems.find(m => m.listingId === listingId);
    if (!item) return;

    const current = Number(item.price) || 0;
    const entered = prompt('Enter new price (LKR)', current);
    if (entered === null || entered === '') return;

    const newPrice = Number(entered);
    if (Number.isNaN(newPrice) || newPrice <= 0) {
        alert('Please enter a valid price');
        return;
    }

    // Demo items: update only on frontend
    if (listingId < 0) {
        item.price = newPrice;
        renderMarketTable();
        return;
    }

    fetch(`${ADMIN_MARKETPLACE_API_BASE}/listings/${listingId}/price?price=${encodeURIComponent(newPrice)}`, {
        method: 'PATCH'
    })
        .then(res => {
            if (!res.ok) {
                alert('Failed to update price');
                return;
            }
            loadActiveListings();
        })
        .catch(err => {
            console.error('Error updating price', err);
            alert('An error occurred while updating price');
        });
}

function deleteListing(listingId) {
    const confirmed = confirm('Are you sure you want to delete this listing?');
    if (!confirmed) return;

    // Demo items: delete only on frontend
    if (listingId < 0) {
        const idx = marketItems.findIndex(m => m.listingId === listingId);
        if (idx !== -1) {
            marketItems.splice(idx, 1);
            renderMarketTable();
        }
        return;
    }

    fetch(`${ADMIN_MARKETPLACE_API_BASE}/listings/${listingId}`, {
        method: 'DELETE'
    })
        .then(res => {
            if (!res.ok) {
                alert('Failed to delete listing');
                return;
            }
            loadActiveListings();
        })
        .catch(err => {
            console.error('Error deleting listing', err);
            alert('An error occurred while deleting listing');
        });
}

loadPendingDrafts();
loadActiveListings();
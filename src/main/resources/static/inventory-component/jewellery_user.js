// =====================================================================
// jewellery_user.js
// NEW – User-facing Jewellery Listing Page Logic
//
// Data source priority:
//   1. localStorage key 'jayagems_jewellery_items' (set by jewellery_admin.js)
//   2. Static mock data below (fallback when admin page hasn't been used yet)
// =====================================================================

// ── Static mock data (rich fallback) ──────────────────────────────────
const MOCK_JEWELLERY = [
    {
        id: 1,
        type: 'Ring',
        metal: 'Gold',
        categories: ['Sapphire', 'Ruby'],
        price: 145000,
        gemstone: 'Blue Sapphire',
        imageData: "gem-photos/image9.jpg",         // no uploaded image → placeholder gradient
        description: 'An elegant gold ring crafted to hold vivid sapphires and rubies. Perfect for engagement or anniversary settings.'
    },
    {
        id: 2,
        type: 'Pendant',
        metal: 'Platinum',
        categories: ['Emerald'],
        price: 225000,
        gemstone: 'Colombian Emerald',
        imageData: "gem-photos/image10.jpg",
        description: 'A sleek platinum pendant designed to showcase the deep green brilliance of Colombian emeralds.'
    },
    {
        id: 3,
        type: 'Necklace',
        metal: 'Gold',
        categories: ['Sapphire'],
        price: 380000,
        gemstone: 'Yellow Sapphire',
        imageData: "gem-photos/image11.jpg",
        description: 'A luxurious gold necklace featuring warm yellow sapphires, ideal for formal occasions.'
    },
    {
        id: 4,
        type: 'Earrings',
        metal: 'Silver',
        categories: ['Sapphire'],
        price: 68000,
        gemstone: 'Pink Sapphire',
        imageData: "gem-photos/image12.jpg",
        description: 'Delicate silver drop earrings that pair beautifully with pink sapphire stones.'
    },
    {
        id: 5,
        type: 'Bracelet',
        metal: 'Gold',
        categories: ['Ruby', 'Spinel'],
        price: 195000,
        gemstone: 'Vivid Ruby',
        imageData: "gem-photos/image13.jpg",
        description: 'A statement gold bracelet set with vivid rubies and red spinel, capturing passion and luxury.'
    },
    {
        id: 6,
        type: 'Ring',
        metal: 'Platinum',
        categories: ['Sapphire'],
        price: 520000,
        gemstone: 'Teal sapphire',
        imageData: "gem-photos/image14.jpg",
        description: 'A rare platinum ring that showcases different shades of blue and green depending on lighting.'
    },
    {
        id: 7,
        type: 'Pendant',
        metal: 'Silver',
        categories: ['Aquamarine'],
        price: 95000,
        gemstone: 'Aquamarine',
        imageData: "gem-photos/image15.jpg",
        description: 'A minimalist silver pendant featuring a teardrop aquamarine, evoking the clear waters of tropical oceans.'
    },
    {
        id: 8,
        type: 'Necklace',
        metal: 'Gold',
        categories: ['Sapphire'],
        price: 310000,
        gemstone: 'Padparadscha Sapphire',
        imageData: "gem-photos/image16.jpg",
        description: 'A collector\'s necklace centred on the rarest of sapphires — the sunset-hued Padparadscha from Sri Lanka.'
    }
];

// ── Metal gradient map for placeholder card images ─────────────────────
const METAL_GRADIENTS = {
    Gold: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    Silver: 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)',
    Platinum: 'linear-gradient(135deg, #c9d6df 0%, #52616b 100%)'
};

// Metal icon colour dots (reused from jewellery_admin.js logic)
const METAL_COLOURS = { Gold: '#d4af37', Silver: '#a0aec0', Platinum: '#9ca3af' };

// ── Cart (shared with gem marketplace via sessionStorage) ──────────────
let jwlCart = [];
let allJewellery = [];     // full data set
let displayedJewellery = []; // after filtering

// ── Bootstrap ──────────────────────────────────────────────────────────
loadJewelleryData();
updateJwlCartCount();

// ── Data loading ───────────────────────────────────────────────────────────
/**
 * Loads jewellery items from the backend API (GET /api/jewellery).
 * Maps backend DTO field names to the shape expected by renderJewellery().
 * Falls back to MOCK_JEWELLERY if the server is unreachable or returns nothing.
 */
function loadJewelleryData() {
    fetch('/api/jewellery')
        .then(res => {
            if (!res.ok) throw new Error('API error: ' + res.status);
            return res.json();
        })
        .then(data => {
            const backendItems = Array.isArray(data) ? data : [];

            if (backendItems.length > 0) {
                // Map backend DTO fields → rendering shape expected by renderJewellery()
                allJewellery = backendItems.map(item => ({
                    id: item.jewelleryId,
                    type: item.jewelleryType,
                    metal: item.metalColour,
                    categories: item.gemCategories || [],
                    price: item.priceLkr != null ? Number(item.priceLkr) : 0,
                    gemstone: item.gemstoneName || item.jewelleryType,
                    imageData: item.imagePath || null,
                    description: item.description || `A beautiful ${item.jewelleryType} crafted in ${item.metalColour}.`
                }));
            } else {
                // No items in DB yet → fall back to mock data so the page is never blank
                allJewellery = [...MOCK_JEWELLERY];
            }

            renderJewellery(allJewellery);
        })
        .catch(err => {
            console.error('Failed to load jewellery from backend, using mock data', err);
            // Network error / server down → show mock data so development still works
            allJewellery = [...MOCK_JEWELLERY];
            renderJewellery(allJewellery);
        });
}

// ── Rendering ──────────────────────────────────────────────────────────
function renderJewellery(items) {
    displayedJewellery = items;
    const grid = document.getElementById('jwl-grid');
    const empty = document.getElementById('jwl-empty');

    if (items.length === 0) {
        grid.innerHTML = '';
        empty.classList.remove('hidden');
        return;
    }

    empty.classList.add('hidden');

    grid.innerHTML = items.map((item, i) => {
        // ✨ SMART URL CLEANUP
        let finalImageSrc = null;
        let url = item.imageData || item.imagePath; // <-- Checks both just to be perfectly safe!
        if (url) {
            if (url.includes('uploads/')) {
                finalImageSrc = '/' + url.substring(url.indexOf('uploads/'));
            } else if (url.includes('gem-photos/')) {
                finalImageSrc = '/' + url.substring(url.indexOf('gem-photos/'));
            } else if (url.startsWith('/') || url.startsWith('http')) {
                finalImageSrc = url;
            } else {
                finalImageSrc = '/uploads/' + url;
            }
        }

        return `
        <div class="jwl-user-card group animate__animated animate__fadeInUp" style="animation-delay:${i * 0.07}s">
            
            <div class="relative overflow-hidden bg-slate-100 mb-4 aspect-[4/5] rounded-sm cursor-pointer" onclick="openJwlDetail(${i})">
                ${finalImageSrc
            ? `<img src="${finalImageSrc}" alt="${item.type}" class="w-full h-full object-cover transition duration-1000" onerror="this.onerror=null; this.src='https://placehold.co/400x300?text=No+Image';">`
            : `<div class="w-full h-full flex flex-col items-center justify-center transition duration-1000" style="background:${METAL_GRADIENTS[item.metal] || METAL_GRADIENTS.Gold}">
                           <span class="text-white text-opacity-80 font-serif text-2xl mb-2">${iconForType(item.type)}</span>
                           <span class="text-white text-xs font-bold uppercase tracking-widest opacity-75">${item.type}</span>
                       </div>`
        }
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <button class="bg-white px-8 py-3 font-bold text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-white transition">
                        View Details
                    </button>
                </div>
            </div>

            <p class="text-[10px] uppercase tracking-[0.2em] text-amber-600 font-bold mb-1">${item.type} · ${item.metal}</p>
            <h3 class="font-serif text-lg text-slate-800 mb-1">${item.gemstone}</h3>
            <p class="text-sm text-slate-500 mb-2">
                <span class="metal-dot" style="background:${METAL_COLOURS[item.metal] || '#cbd5e1'}"></span>
                ${item.metal} | ${(item.categories || []).join(', ')}
            </p>
            <p class="font-bold text-blue-900 mb-3">Rs. ${item.price.toLocaleString()}</p>

            <button onclick="addJwlToCart(${i})" class="w-full py-2 bg-blue-900 text-white text-xs font-bold uppercase tracking-widest hover:bg-blue-800 transition">
                Add to Cart
            </button>
        </div>
        `;
    }).join('');
}

// ── Filter ─────────────────────────────────────────────────────────────
function filterJewellery() {
    const query = (document.getElementById('jwl-search')?.value || '').toLowerCase();
    const type = document.getElementById('jwl-type-filter')?.value || 'all';
    const metal = document.getElementById('jwl-metal-filter')?.value || 'all';

    let filtered = allJewellery.filter(item => {
        // Search: match on gemstone name or type
        const matchText = (item.gemstone + ' ' + item.type).toLowerCase().includes(query);
        const matchType = type === 'all' || item.type === type;
        const matchMetal = metal === 'all' || item.metal === metal;
        return matchText && matchType && matchMetal;
    });

    renderJewellery(filtered);
}

// ── Detail Modal ───────────────────────────────────────────────────────
function openJwlDetail(index) {
    const item = displayedJewellery[index];
    const modal = document.getElementById('jwl-detail-modal');
    const content = document.getElementById('jwl-detail-content');

    // ✨ SMART URL CLEANUP
    let finalImageSrc = null;
    let url = item.imageData || item.imagePath; // <-- Checks both just to be perfectly safe!
    if (url) {
        if (url.includes('uploads/')) {
            finalImageSrc = '/' + url.substring(url.indexOf('uploads/'));
        } else if (url.includes('gem-photos/')) {
            finalImageSrc = '/' + url.substring(url.indexOf('gem-photos/'));
        } else if (url.startsWith('/') || url.startsWith('http')) {
            finalImageSrc = url;
        } else {
            finalImageSrc = '/uploads/' + url;
        }
    }

    // ✨ HANDLE DB VS DEMO FIELDS
    const displayType = item.type || item.jewelleryType || 'Jewellery';
    const displayMetal = item.metal || item.metalColour || 'Gold';
    const displayGemstone = item.gemstone || item.gemstoneName || 'Unknown Gem';
    const displayPrice = item.price || item.priceLkr || 0;
    const displayCategories = item.categories || item.gemCategories || [];
    const displayDescription = item.description || 'No description available.';

    content.innerHTML = `
        <div class="flex flex-col md:flex-row gap-8">
            <div class="md:w-1/2 aspect-[4/5] rounded-lg overflow-hidden">
                ${finalImageSrc
        ? `<img src="${finalImageSrc}" alt="${displayType}" class="w-full h-full object-cover" onerror="this.onerror=null; this.src='https://placehold.co/400x300?text=No+Image';">`
        : `<div class="w-full h-full flex flex-col items-center justify-center rounded-lg"
                              style="background:${METAL_GRADIENTS[displayMetal] || METAL_GRADIENTS.Gold}">
                           <span class="text-white font-serif text-5xl mb-3">${iconForType(displayType)}</span>
                           <span class="text-white text-sm font-bold uppercase tracking-widest opacity-80">${displayType}</span>
                       </div>`
    }
            </div>

            <div class="md:w-1/2 flex flex-col gap-5">
                <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-amber-600 font-bold mb-2">${displayType}</p>
                    <h2 class="font-serif text-3xl text-slate-800 mb-2">${displayGemstone}</h2>
                    <p class="font-bold text-2xl text-blue-900">Rs. ${Number(displayPrice).toLocaleString()}</p>
                </div>

                <div class="space-y-3 border-t border-slate-200 pt-5">
                    <div class="flex justify-between">
                        <span class="text-sm font-semibold text-slate-500 uppercase tracking-wide">Metal</span>
                        <span class="font-bold text-slate-800 flex items-center gap-1">
                            <span class="metal-dot" style="background:${METAL_COLOURS[displayMetal] || '#cbd5e1'}"></span>
                            ${displayMetal}
                        </span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-sm font-semibold text-slate-500 uppercase tracking-wide">Jewellery Type</span>
                        <span class="font-bold text-slate-800">${displayType}</span>
                    </div>
                    <div class="flex justify-between items-start">
                        <span class="text-sm font-semibold text-slate-500 uppercase tracking-wide">Suitable Gems</span>
                        <span class="text-right font-bold text-slate-800">${displayCategories.join(', ')}</span>
                    </div>
                </div>

                <div class="border-t border-slate-200 pt-5">
                    <h3 class="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Description</h3>
                    <p class="text-slate-700 leading-relaxed text-sm">${displayDescription}</p>
                </div>

                <div class="flex gap-3 pt-2">
                    <button onclick="addJwlToCart(${index}); closeJwlDetail();"
                        class="flex-1 bg-blue-900 text-white py-3 font-bold text-xs uppercase tracking-widest hover:bg-blue-800 transition">
                        Add to Cart
                    </button>
                    <button onclick="closeJwlDetail()"
                        class="px-6 py-3 border-2 border-slate-300 font-bold text-xs uppercase tracking-widest hover:border-slate-400 transition">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}

function closeJwlDetail() {
    document.getElementById('jwl-detail-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Close detail modal on backdrop click
document.addEventListener('click', e => {
    const modal = document.getElementById('jwl-detail-modal');
    if (e.target === modal) closeJwlDetail();
});

// ── Cart helpers ───────────────────────────────────────────────────────
function addJwlToCart(index) {
    const item = displayedJewellery[index];
    if (!item) return;
    jwlCart.push(item);
    updateJwlCartCount();
    showJwlToast(`${item.gemstone} (${item.type}) added to cart.`);
}

function updateJwlCartCount() {
    const badge = document.getElementById('jwl-cart-count');
    if (badge) badge.textContent = jwlCart.length;
}

function showJwlToast(message) {
    const toast = document.getElementById('jwl-cart-toast');
    const text = document.getElementById('jwl-toast-message');
    if (!toast || !text) return;
    text.textContent = message;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');
    lucide.createIcons();
    setTimeout(() => {
        toast.classList.add('opacity-0', 'pointer-events-none');
        toast.classList.remove('opacity-100');
    }, 3000);
}

// ── Icon helper ───────────────────────────────────────────────────────
function iconForType(type) {
    const map = {
        Ring: '💍',
        Pendant: '✨',
        Necklace: '📿',
        Earrings: '🌸',
        Bracelet: '⭕'
    };
    return map[type] || '💎';
}

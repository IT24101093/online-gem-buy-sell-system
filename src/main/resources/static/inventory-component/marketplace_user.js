const MARKETPLACE_API_BASE = '/api/marketplace';

// Original demo gems (kept for UI richness)
// ── NEW fields added (Feature 2 & 3): origin, caratRange, variants ──
const storeGems = [
    {
        name: "Blue Ceylon Sapphire",
        type: "Sapphire",
        price: 1260000,
        img: "image1.jpg",
        caratWeight: 2.5,
        shape: "Oval",
        color: "Deep Blue",
        origin: "Sri Lanka",           // Feature 2 – country of origin
        description: "A stunning Ceylon sapphire with exceptional clarity and rich blue color. This gemstone exhibits excellent brilliance and is perfect for engagement rings or statement jewelry.",
        // Feature 3 – carat variants (carat value → price)
        variants: [
            { carat: 1.0, price: 680000 },
            { carat: 2.5, price: 1260000 },
            { carat: 4.0, price: 2100000 }
        ]
    },
    {
        name: "Ruby",
        type: "Ruby",
        price: 840000,
        img: "image2.jpg",
        caratWeight: 1.8,
        shape: "Heart",
        color: "Vivid Red",
        origin: "Myanmar",
        description: "A romantic heart-cut ruby with intense red color and excellent fire. This gemstone symbolizes passion and love, making it an ideal choice for special occasions.",
        variants: [
            { carat: 0.8, price: 420000 },
            { carat: 1.8, price: 840000 },
            { carat: 3.0, price: 1650000 }
        ]
    },
    {
        name: "Zambian Emerald",
        type: "Emerald",
        price: 1680000,
        img: "image3.jpg",
        caratWeight: 3.2,
        shape: "Cushion",
        color: "Rich Green",
        origin: "Zambia",
        description: "A magnificent Zambian emerald known for its deep green color and natural inclusions that add character. This gemstone represents growth and renewal.",
        variants: [
            { carat: 1.5, price: 850000 },
            { carat: 3.2, price: 1680000 },
            { carat: 5.0, price: 3100000 }
        ]
    },
    {
        name: "Padparadscha Sapphire",
        type: "Sapphire",
        price: 3600000,
        img: "image4.jpg",
        caratWeight: 2.0,
        shape: "Cushion",
        color: "Peach-Pink",
        origin: "Sri Lanka",
        description: "An exquisite Padparadscha sapphire displaying the rare and beautiful combination of pink and orange hues. This highly sought-after gemstone from Sri Lanka is one of the rarest sapphire varieties, perfect for collectors and connoisseurs.",
        variants: [
            { carat: 1.0, price: 1800000 },
            { carat: 2.0, price: 3600000 },
            { carat: 3.5, price: 6200000 }
        ]
    },
    {
        name: "Yellow Sapphire",
        type: "Sapphire",
        price: 2100000,
        img: "image5.jpg",
        caratWeight: 2.8,
        shape: "Round",
        color: "Golden Yellow",
        origin: "Sri Lanka",
        description: "A vibrant yellow sapphire with brilliant golden hues that radiate warmth and positivity. This gemstone is believed to bring prosperity and wisdom, making it a popular choice for both jewelry and spiritual purposes.",
        variants: [
            { carat: 1.2, price: 900000 },
            { carat: 2.8, price: 2100000 },
            { carat: 4.5, price: 3800000 }
        ]
    },
    {
        name: "Pink Sapphire",
        type: "Sapphire",
        price: 2400000,
        img: "image6.jpg",
        caratWeight: 2.3,
        shape: "Princess Cut",
        color: "Soft Pink",
        origin: "Madagascar",
        description: "A delicate pink sapphire with a romantic and elegant appearance. This gemstone combines the durability of sapphire with the feminine charm of pink, perfect for engagement rings and special occasion jewelry.",
        variants: [
            { carat: 1.0, price: 1100000 },
            { carat: 2.3, price: 2400000 },
            { carat: 3.8, price: 4200000 }
        ]
    },
    {
        name: "Star Sapphire",
        type: "Sapphire",
        price: 4500000,
        img: "image7.jpg",
        caratWeight: 3.0,
        shape: "Cabochon",
        color: "Deep Blue with Asterism",
        origin: "Sri Lanka",
        description: "A rare star sapphire displaying a distinct six-rayed star that shimmers across the surface under direct light. This mystical gemstone is highly prized by collectors and is believed to offer protection and inner clarity to its wearer.",
        variants: [
            { carat: 1.5, price: 2200000 },
            { carat: 3.0, price: 4500000 },
            { carat: 5.5, price: 8800000 }
        ]
    },
    {
        name: "Teal Sapphire",
        type: "Sapphire",
        price: 2800000,
        img: "image8.jpg",
        caratWeight: 2.6,
        shape: "Emerald Cut",
        color: "Teal Blue-Green",
        origin: "Tanzania",
        description: "A stunning teal sapphire displaying the unique blend of blue and green tones. This rare color variation creates a mesmerizing effect that captures both ocean depths and tropical waters, perfect for those seeking something truly distinctive.",
        variants: [
            { carat: 1.2, price: 1300000 },
            { carat: 2.6, price: 2800000 },
            { carat: 4.0, price: 4600000 }
        ]
    }
];

// Will hold backend + demo gems together
let allGems = [];
let currentDisplayedGems = [];
let cart = [];

function updateCartCount() {
    const badge = document.getElementById('cart-count');
    if (badge) {
        badge.textContent = cart.length;
    }
}

function showCartToast(message) {
    const toast = document.getElementById('cart-toast');
    const text = document.getElementById('cart-toast-message');
    if (!toast || !text) return;

    text.textContent = message;
    toast.classList.remove('opacity-0', 'pointer-events-none');
    toast.classList.add('opacity-100');
    lucide.createIcons(); // Ensure icons are rendered

    setTimeout(() => {
        toast.classList.add('opacity-0', 'pointer-events-none');
        toast.classList.remove('opacity-100');
    }, 3000);
}

function toImageUrl(gem) {
    if (gem.mainImageUrl) {
        let url = gem.mainImageUrl;

        // FIX: If the backend accidentally combined both folders, clean it up!
        // This takes "/gem-88photos/uploads/items/..." and fixes it to just "/uploads/items/..."
        if (url.includes('uploads/items/')) {
            return '/' + url.substring(url.indexOf('uploads/items/'));
        }

        if (url.startsWith('/') || url.startsWith('http')) {
            return url;
        } else {
            return '/uploads/' + url;
        }
    }

    // Handle the local demo gems
    if (gem.img) {
        return gem.img.startsWith('/gem-photos/') ? gem.img : `/gem-photos/${gem.img}`;
    }

    // Reliable fallback
    return 'https://placehold.co/400x300?text=No+Image';
}
function displayGems(items) {
    currentDisplayedGems = items;
    const grid = document.getElementById('gem-market');
    grid.innerHTML = items.map((gem, i) => `
        <div class="gem-card group animate__animated animate__fadeInUp" style="animation-delay: ${i * 0.1}s">
            <div class="relative overflow-hidden bg-slate-100 mb-4 aspect-[4/5] rounded-sm">
               <img src="${toImageUrl(gem)}" class="w-full h-full object-cover transition duration-1000" alt="${gem.name}" onerror="this.onerror=null; this.src='https://placehold.co/400x300?text=No+Image';">
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <button onclick="openGemDetails(${i})" class="bg-white px-8 py-3 font-bold text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-white transition">View Details</button>
                </div>
            </div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-amber-600 font-bold mb-1">${gem.category || gem.type || ''}</p>
            <h3 class="font-serif text-lg text-slate-800 mb-2">${gem.name}</h3>
            <p class="font-bold text-blue-900">Rs. ${gem.price.toLocaleString()}</p>
        </div>
    `).join('');
}

function addToCart(index) {
    const gem = currentDisplayedGems[index];
    if (!gem) return;
    cart.push(gem);
    updateCartCount();
    showCartToast(`${gem.name} was added to your cart.`);
}

function openGemDetails(index) {
    const gem = currentDisplayedGems[index];
    const modal = document.getElementById('gem-details-modal');
    const modalContent = document.getElementById('gem-details-content');

    // Resolve color display: backend returns uppercase enum (e.g. "BLUE"),
    // demo storeGems use descriptive strings (e.g. "Deep Blue").
    const displayColor = gem.color || gem.colorTone || '';
    const displayWeight = gem.caratWeight ? gem.caratWeight.toFixed(2) : '0.00';
    const displayDescription = gem.description || 'No description available.';

    // ── Feature 3: Carat Variants ─────────────────────────────────────────
    // Build variant radio buttons if the gem has a variants array.
    const variants = gem.variants || [];
    let variantsHTML = '';
    if (variants.length > 0) {
        const radios = variants.map((v, vi) => `
            <label class="flex items-center gap-3 p-3 border border-slate-200 rounded-xl cursor-pointer hover:border-amber-400 transition has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50">
                <input
                    type="radio"
                    name="carat-variant-${index}"
                    value="${vi}"
                    data-price="${v.price}"
                    data-carat="${v.carat}"
                    ${vi === 0 ? 'checked' : ''}
                    onchange="updateVariantPrice(this, ${index})"
                    class="accent-amber-500"
                >
                <span class="text-sm font-bold text-slate-700">${v.carat.toFixed(2)} ct</span>
                <span class="ml-auto text-sm font-bold text-blue-900">Rs. ${v.price.toLocaleString()}</span>
            </label>
        `).join('');

        variantsHTML = `
            <div class="border-t border-slate-200 pt-6">
                <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Available Carat Options</h3>
                <div class="space-y-2">${radios}</div>
            </div>
        `;
    }
    // ─────────────────────────────────────────────────────────────────────

    modalContent.innerHTML = `
        <div class="flex flex-col md:flex-row gap-8">
            <div class="md:w-1/2">
                <img src="${toImageUrl(gem)}" alt="${gem.name}" class="w-full rounded-lg shadow-lg">
            </div>
            <div class="md:w-1/2 flex flex-col gap-6">
                <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-amber-600 font-bold mb-2">${gem.category || gem.type || ''}</p>
                    <h2 class="font-serif text-3xl text-slate-800 mb-4">${gem.name}</h2>
                    <!-- Feature 3: price span is dynamically updatable -->
                    <p id="gem-detail-price" class="font-bold text-2xl text-blue-900 mb-6">Rs. ${gem.price.toLocaleString()}</p>
                </div>
                
                <div class="space-y-4 border-t border-slate-200 pt-6">
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-semibold text-slate-600 uppercase tracking-wide">Carat Weight</span>
                        <span class="text-lg font-bold text-slate-800">${displayWeight} ct</span>
                    </div>
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-semibold text-slate-600 uppercase tracking-wide">Category</span>
                        <span class="text-lg font-bold text-slate-800">${gem.category || gem.type || '-'}</span>
                    </div>
                    ${gem.shape ? `
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-semibold text-slate-600 uppercase tracking-wide">Shape</span>
                        <span class="text-lg font-bold text-slate-800">${gem.shape}</span>
                    </div>` : ''}
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-semibold text-slate-600 uppercase tracking-wide">Color</span>
                        <span class="text-lg font-bold text-slate-800">${displayColor || '-'}</span>
                    </div>
                    ${gem.origin ? `
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-semibold text-slate-600 uppercase tracking-wide">Origin</span>
                        <span class="text-lg font-bold text-slate-800">${gem.origin}</span>
                    </div>` : ''}
                </div>
                
                <!-- Feature 3: carat variant radios -->
                ${variantsHTML}

                <div class="border-t border-slate-200 pt-6">
                    <h3 class="text-sm font-semibold text-slate-600 uppercase tracking-wide mb-3">Description</h3>
                    <p class="text-slate-700 leading-relaxed">${displayDescription}</p>
                </div>
                
                <div class="flex gap-4 pt-4">
                    <button onclick="addToCart(${index})" class="flex-1 bg-blue-900 text-white px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-blue-800 transition">
                        Add to Cart
                    </button>
                    <button onclick="closeGemDetails()" class="px-6 py-3 border-2 border-slate-300 font-bold uppercase tracking-widest text-xs hover:border-slate-400 transition">
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

// ── Feature 3: Update displayed price when a carat variant radio changes ──
function updateVariantPrice(radio, gemIndex) {
    const priceEl = document.getElementById('gem-detail-price');
    if (!priceEl) return;
    const newPrice = Number(radio.dataset.price);
    if (!Number.isNaN(newPrice)) {
        priceEl.textContent = `Rs. ${newPrice.toLocaleString()}`;
    }
}

function closeGemDetails() {
    const modal = document.getElementById('gem-details-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function filterGems() {
    const query = document.getElementById('user-search').value.toLowerCase();
    const priceFilter = document.getElementById('price-filter')?.value || 'all';
    const colorFilter = document.getElementById('color-filter')?.value || 'all';
    // Feature 2 – new filters
    const caratFilter = document.getElementById('carat-filter')?.value || 'all';
    const originFilter = document.getElementById('origin-filter')?.value || 'all';

    let filtered = allGems.filter(g =>
        (g.name || '').toLowerCase().includes(query)
    );

    // Price range filter (in LKR)
    filtered = filtered.filter(gem => {
        const p = Number(gem.price);
        switch (priceFilter) {
            case 'under_1m': return p < 1_000_000;
            case '1m_2m': return p >= 1_000_000 && p <= 2_000_000;
            case '2m_3m': return p > 2_000_000 && p <= 3_000_000;
            case 'above_3m': return p > 3_000_000;
            default: return true;
        }
    });

    // Colour filter
    // gem.color  = descriptive string from storeGems  e.g. "Deep Blue", "Vivid Red"
    // gem.colorTone = uppercase enum from backend API  e.g. "BLUE", "YELLOW"
    // We normalise both to lowercase for matching.
    filtered = filtered.filter(gem => {
        if (colorFilter === 'all') return true;
        const colorText = ((gem.color || '') + ' ' + (gem.colorTone || '')).toLowerCase().trim();
        switch (colorFilter) {
            case 'blue': return colorText.includes('blue');
            case 'yellow': return colorText.includes('yellow') || colorText.includes('gold');
            case 'pink': return colorText.includes('pink') || colorText.includes('peach');
            case 'green': return colorText.includes('green') || colorText.includes('teal');
            default: return true;
        }
    });

    // ── Feature 2: Carat Range filter ────────────────────────────────────
    filtered = filtered.filter(gem => {
        if (caratFilter === 'all') return true;
        const ct = Number(gem.caratWeight) || 0;
        switch (caratFilter) {
            case 'lt1': return ct < 1;
            case '1to2': return ct >= 1 && ct <= 2;
            case '2to5': return ct > 2 && ct <= 5;
            case 'gt5': return ct > 5;
            default: return true;
        }
    });

    // ── Feature 2: Country of Origin filter ──────────────────────────────
    filtered = filtered.filter(gem => {
        if (originFilter === 'all') return true;
        const gemOrigin = (gem.origin || '').trim();
        return gemOrigin === originFilter;
    });

    displayGems(filtered);
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('gem-details-modal');
    if (event.target === modal) {
        closeGemDetails();
    }
}

async function loadGemsFromBackend() {
    try {
        const res = await fetch(`${MARKETPLACE_API_BASE}/listings`);
        if (!res.ok) {
            console.error('Failed to load marketplace listings', res.status);
            allGems = getDemoGemsForUser();
            filterGems();
            return;
        }
        const data = await res.json();
        const backendGems = Array.isArray(data) ? data : [];
        allGems = backendGems.concat(getDemoGemsForUser());
        filterGems();
    } catch (e) {
        console.error('Error loading marketplace listings', e);
        allGems = getDemoGemsForUser();
        filterGems();
    }
}

function getDemoGemsForUser() {
    try {
        const raw = window.localStorage.getItem('jayagems_admin_demo_market_items');
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // Build a lookup of storeGems by name so we can use them as the base.
                const storeByName = {};
                storeGems.forEach(g => { storeByName[g.name] = g; });

                // Merge: use the storeGem as the base, then overlay fields from the
                // admin-saved item. This preserves 'color', 'shape', 'description' etc.
                // that the admin localStorage entry may not have stored.
                const byName = {};
                storeGems.forEach(g => { byName[g.name] = { ...g }; });
                parsed.forEach(g => {
                    if (byName[g.name]) {
                        // Overlay only the fields present in the admin item
                        byName[g.name] = { ...byName[g.name], ...g };
                    } else {
                        byName[g.name] = g;
                    }
                });
                return Object.values(byName);
            }
        }
    } catch (e) {
        console.error('Failed to read admin demo gems for user', e);
    }
    return [...storeGems];
}

loadGemsFromBackend();
updateCartCount();

// =====================================================================
// Feature 4 – Gem Suggestion Modal Logic
// =====================================================================

/** Open the suggestion modal and reset it to a clean state. */
function openSuggestionModal() {
    const modal = document.getElementById('suggestion-modal');
    // Reset form
    document.getElementById('sug-jewellery-type').value = 'all';
    document.getElementById('sug-color').value = 'all';
    document.getElementById('sug-budget').value = 'all';
    document.getElementById('sug-image-input').value = '';
    const preview = document.getElementById('sug-image-preview');
    preview.classList.add('hidden');
    preview.src = '';
    // Clear previous results
    document.getElementById('suggestion-results').innerHTML = '';
    document.getElementById('suggestion-results-header').classList.add('hidden');
    document.getElementById('suggestion-no-results').classList.add('hidden');

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}

/** Close the suggestion modal. */
function closeSuggestionModal() {
    document.getElementById('suggestion-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

/** Handle jewellery image upload preview (UI only, no upload to server). */
function previewSuggestionImage(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('sug-image-preview');
    if (!file) {
        preview.classList.add('hidden');
        preview.src = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        preview.src = e.target.result;
        preview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

/**
 * Suggest gems by calling POST /api/marketplace/gems/suggest.
 * Request body: { jewelleryType, preferredColor, budgetRange }
 * Falls back to client-side filtering against allGems if the API is unreachable.
 */
function suggestGems() {
    const jewelleryType = document.getElementById('sug-jewellery-type').value;
    const colorPref = document.getElementById('sug-color').value;
    const budgetPref = document.getElementById('sug-budget').value;

    const resultsEl = document.getElementById('suggestion-results');
    const headerEl = document.getElementById('suggestion-results-header');
    const noResultsEl = document.getElementById('suggestion-no-results');
    const countEl = document.getElementById('suggestion-results-count');

    // Show a loading state while awaiting the backend
    headerEl.classList.add('hidden');
    noResultsEl.classList.add('hidden');
    resultsEl.innerHTML = '<p class="text-slate-400 text-sm text-center py-6">Finding gems for you…</p>';

    // ── Call the backend suggestion API ──────────────────────────────────────
    fetch(`${MARKETPLACE_API_BASE}/gems/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jewelleryType: jewelleryType !== 'all' ? jewelleryType : null,
            preferredColor: colorPref !== 'all' ? colorPref : null,
            budgetRange: budgetPref !== 'all' ? budgetPref : null
        })
    })
        .then(res => {
            if (!res.ok) throw new Error('API error: ' + res.status);
            return res.json();
        })
        .then(data => {
            // API succeeded – render results returned by the backend
            const suggestions = Array.isArray(data) ? data : [];
            renderSuggestionResults(suggestions);
        })
        .catch(err => {
            // API unavailable – fall back to client-side filtering so the UI still works
            console.warn('Suggestion API unavailable, falling back to client-side filter:', err);
            const suggestions = _clientSideSuggest(colorPref, budgetPref);
            renderSuggestionResults(suggestions);
        });
}

/**
 * Renders the gem suggestion results panel.
 * Accepts an array of gem objects (either GemListingDTO from backend or local storeGems shape).
 */
function renderSuggestionResults(suggestions) {
    const resultsEl = document.getElementById('suggestion-results');
    const headerEl = document.getElementById('suggestion-results-header');
    const noResultsEl = document.getElementById('suggestion-no-results');
    const countEl = document.getElementById('suggestion-results-count');

    headerEl.classList.remove('hidden');
    noResultsEl.classList.add('hidden');

    if (suggestions.length === 0) {
        resultsEl.innerHTML = '';
        noResultsEl.classList.remove('hidden');
        headerEl.classList.add('hidden');
        return;
    }

    countEl.textContent = `${suggestions.length} gemstone${suggestions.length !== 1 ? 's' : ''} recommended for you`;

    // Render using same gem card template as the main marketplace
    resultsEl.innerHTML = suggestions.map((gem, i) => `
        <div class="gem-card group animate__animated animate__fadeInUp" style="animation-delay: ${i * 0.05}s">
            <div class="relative overflow-hidden bg-slate-100 mb-4 aspect-[4/5] rounded-sm">
                <img src="${toImageUrl(gem)}" class="w-full h-full object-cover transition duration-1000" alt="${gem.name}">
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                    <!-- Suggestion cards: add to cart directly -->
                    <button
                        onclick="addToCartByGem('${gem.name.replace(/'/g, "\\'")}'); closeSuggestionModal();"
                        class="bg-white px-6 py-2 font-bold text-xs uppercase tracking-widest hover:bg-amber-500 hover:text-white transition">
                        Add to Cart
                    </button>
                </div>
            </div>
            <p class="text-[10px] uppercase tracking-[0.2em] text-amber-600 font-bold mb-1">${gem.category || gem.type || ''}</p>
            <h3 class="font-serif text-lg text-slate-800 mb-1">${gem.name}</h3>
            ${gem.origin ? `<p class="text-[10px] text-slate-400 mb-1 uppercase tracking-wide">${gem.origin}</p>` : ''}
            <p class="font-bold text-blue-900">Rs. ${gem.price.toLocaleString()}</p>
        </div>
    `).join('');
}

/**
 * Client-side suggestion fallback (used only when the backend API is unreachable).
 * Filters the in-memory allGems array by colour and budget.
 */
function _clientSideSuggest(colorPref, budgetPref) {
    return allGems.filter(gem => {
        // Colour matching
        if (colorPref && colorPref !== 'all') {
            const colorText = ((gem.color || '') + ' ' + (gem.colorTone || '')).toLowerCase();
            let colourMatch = false;
            switch (colorPref) {
                case 'blue': colourMatch = colorText.includes('blue'); break;
                case 'yellow': colourMatch = colorText.includes('yellow') || colorText.includes('gold'); break;
                case 'pink': colourMatch = colorText.includes('pink') || colorText.includes('peach'); break;
                case 'green': colourMatch = colorText.includes('green') || colorText.includes('teal'); break;
                case 'red': colourMatch = colorText.includes('red') || colorText.includes('vivid'); break;
                default: colourMatch = true;
            }
            if (!colourMatch) return false;
        }
        // Budget matching
        if (budgetPref && budgetPref !== 'all') {
            const p = Number(gem.price);
            switch (budgetPref) {
                case 'under_1m': if (p >= 1_000_000) return false; break;
                case '1m_2m': if (p < 1_000_000 || p > 2_000_000) return false; break;
                case '2m_3m': if (p <= 2_000_000 || p > 3_000_000) return false; break;
                case 'above_3m': if (p <= 3_000_000) return false; break;
            }
        }
        return true;
    });
}

/** Add a gem to cart by name (used from suggestion results). */
function addToCartByGem(gemName) {
    const gem = allGems.find(g => g.name === gemName);
    if (!gem) return;
    cart.push(gem);
    updateCartCount();
    showCartToast(`${gem.name} was added to your cart.`);
}

// Close suggestion modal when clicking the backdrop
document.addEventListener('click', function (e) {
    const suggModal = document.getElementById('suggestion-modal');
    if (e.target === suggModal) closeSuggestionModal();
});
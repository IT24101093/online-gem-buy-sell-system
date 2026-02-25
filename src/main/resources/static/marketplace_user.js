const MARKETPLACE_API_BASE = '/api/marketplace';

// Original demo gems (kept for UI richness)
const storeGems = [
    {
        name: "Blue Ceylon Sapphire",
        type: "Sapphire",
        price: 1260000,
        img: "image1.jpg",
        caratWeight: 2.5,
        shape: "Oval",
        color: "Deep Blue",
        description: "A stunning Ceylon sapphire with exceptional clarity and rich blue color. This gemstone exhibits excellent brilliance and is perfect for engagement rings or statement jewelry."
    },
    {
        name: "Ruby",
        type: "Ruby",
        price: 840000,
        img: "image2.jpg",
        caratWeight: 1.8,
        shape: "Heart",
        color: "Vivid Red",
        description: "A romantic heart-cut ruby with intense red color and excellent fire. This gemstone symbolizes passion and love, making it an ideal choice for special occasions."
    },
    {
        name: "Zambian Emerald",
        type: "Emerald",
        price: 1680000,
        img: "image3.jpg",
        caratWeight: 3.2,
        shape: "Cushion",
        color: "Rich Green",
        description: "A magnificent Zambian emerald known for its deep green color and natural inclusions that add character. This gemstone represents growth and renewal."
    },
    {
        name: "Padparadscha Sapphire",
        type: "Sapphire",
        price: 3600000,
        img: "image4.jpg",
        caratWeight: 2.0,
        shape: "Cushion",
        color: "Peach-Pink",
        description: "An exquisite Padparadscha sapphire displaying the rare and beautiful combination of pink and orange hues. This highly sought-after gemstone from Sri Lanka is one of the rarest sapphire varieties, perfect for collectors and connoisseurs."
    },
    {
        name: "Yellow Sapphire",
        type: "Sapphire",
        price: 2100000,
        img: "image5.jpg",
        caratWeight: 2.8,
        shape: "Round",
        color: "Golden Yellow",
        description: "A vibrant yellow sapphire with brilliant golden hues that radiate warmth and positivity. This gemstone is believed to bring prosperity and wisdom, making it a popular choice for both jewelry and spiritual purposes."
    },
    {
        name: "Pink Sapphire",
        type: "Sapphire",
        price: 2400000,
        img: "image6.jpg",
        caratWeight: 2.3,
        shape: "Princess Cut",
        color: "Soft Pink",
        description: "A delicate pink sapphire with a romantic and elegant appearance. This gemstone combines the durability of sapphire with the feminine charm of pink, perfect for engagement rings and special occasion jewelry."
    },
    {
        name: "Star Sapphire",
        type: "Sapphire",
        price: 4500000,
        img: "image7.jpg",
        caratWeight: 3.0,
        shape: "Cabochon",
        color: "Deep Blue with Asterism",
        description: "A rare star sapphire displaying a distinct six-rayed star that shimmers across the surface under direct light. This mystical gemstone is highly prized by collectors and is believed to offer protection and inner clarity to its wearer."
    },
    {
        name: "Teal Sapphire",
        type: "Sapphire",
        price: 2800000,
        img: "image8.jpg",
        caratWeight: 2.6,
        shape: "Emerald Cut",
        color: "Teal Blue-Green",
        description: "A stunning teal sapphire displaying the unique blend of blue and green tones. This rare color variation creates a mesmerizing effect that captures both ocean depths and tropical waters, perfect for those seeking something truly distinctive."
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
        return gem.mainImageUrl;
    }
    if (gem.img) {
        return gem.img.startsWith('/gem-photos/') ? gem.img : `/gem-photos/${gem.img}`;
    }
    return '/gem-photos/image4.jpg';
}

function displayGems(items) {
    currentDisplayedGems = items;
    const grid = document.getElementById('gem-market');
    grid.innerHTML = items.map((gem, i) => `
        <div class="gem-card group animate__animated animate__fadeInUp" style="animation-delay: ${i * 0.1}s">
            <div class="relative overflow-hidden bg-slate-100 mb-4 aspect-[4/5] rounded-sm">
                <img src="${toImageUrl(gem)}" class="w-full h-full object-cover transition duration-1000" alt="${gem.name}">
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

    modalContent.innerHTML = `
        <div class="flex flex-col md:flex-row gap-8">
            <div class="md:w-1/2">
                <img src="${toImageUrl(gem)}" alt="${gem.name}" class="w-full rounded-lg shadow-lg">
            </div>
            <div class="md:w-1/2 flex flex-col gap-6">
                <div>
                    <p class="text-xs uppercase tracking-[0.2em] text-amber-600 font-bold mb-2">${gem.category || gem.type || ''}</p>
                    <h2 class="font-serif text-3xl text-slate-800 mb-4">${gem.name}</h2>
                    <p class="font-bold text-2xl text-blue-900 mb-6">Rs. ${gem.price.toLocaleString()}</p>
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
                </div>
                
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

function closeGemDetails() {
    const modal = document.getElementById('gem-details-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function filterGems() {
    const query = document.getElementById('user-search').value.toLowerCase();
    const priceFilter = document.getElementById('price-filter')?.value || 'all';
    const colorFilter = document.getElementById('color-filter')?.value || 'all';

    let filtered = allGems.filter(g =>
        (g.name || '').toLowerCase().includes(query)
    );

    // Price range filter (in LKR)
    filtered = filtered.filter(gem => {
        const p = Number(gem.price);
        switch (priceFilter) {
            case 'under_1m':
                return p < 1_000_000;
            case '1m_2m':
                return p >= 1_000_000 && p <= 2_000_000;
            case '2m_3m':
                return p > 2_000_000 && p <= 3_000_000;
            case 'above_3m':
                return p > 3_000_000;
            default:
                return true;
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
            case 'blue':
                return colorText.includes('blue');
            case 'yellow':
                return colorText.includes('yellow') || colorText.includes('gold');
            case 'pink':
                return colorText.includes('pink') || colorText.includes('peach');
            case 'green':
                return colorText.includes('green') || colorText.includes('teal');
            default:
                return true;
        }
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
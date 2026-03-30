(() => {
    const API_BASE = 'http://localhost:8080/api/marketplace/drafts';
    const listEl = document.getElementById('draftsList');
    const emptyEl = document.getElementById('emptyState');
    const themeBtn = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // --- DARK MODE LOGIC (Matches Inventory) ---
    function setTheme(mode){
        if (mode === 'light') {
            html.classList.remove('dark');
            localStorage.setItem('theme','light');
        } else {
            html.classList.add('dark');
            localStorage.setItem('theme','dark');
        }
    }
    const savedTheme = localStorage.getItem('theme');
    setTheme(savedTheme === 'light' ? 'light' : 'dark');
    themeBtn?.addEventListener('click', () => setTheme(html.classList.contains('dark') ? 'light' : 'dark'));

    // --- FETCH DRAFTS ---
    async function loadDrafts() {
        try {
            const response = await fetch(API_BASE);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();
            return data.filter(item => item.status === 'PENDING');
        } catch (error) {
            console.error("Error fetching drafts:", error);
            Swal.fire('Error', 'Could not load drafts from server.', 'error');
            return [];
        }
    }

    // --- RENDER THE UI ---
    function render(drafts) {
        listEl.innerHTML = '';

        if (drafts.length === 0) {
            emptyEl.classList.remove('hidden');
            return;
        }
        emptyEl.classList.add('hidden');

        drafts.forEach(draft => {
            const card = document.createElement('div');
            card.className = 'card p-6 flex flex-col justify-between'; // Using your custom .card class!

            const suggestedPrice = Number(draft.suggestedPriceLkr || 0).toLocaleString('en-LK', { style: 'currency', currency: 'LKR', maximumFractionDigits: 0 });

            card.innerHTML = `
        <div>
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-xl font-bold">${draft.gemstoneName}</h3>
            <span class="bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wide">Pending</span>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold mb-4">${draft.category || 'Uncategorized'}</p>
          
          <div class="bg-slate-900/5 dark:bg-white/5 p-4 rounded-xl mb-4 border border-slate-200 dark:border-slate-700/50">
            <div class="flex justify-between mb-1">
              <span class="text-xs text-slate-500 dark:text-slate-400">Inventory ID</span>
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300">#${draft.inventoryItemId}</span>
            </div>
            <div class="mt-2">
              <p class="text-xs text-slate-500 dark:text-slate-400 mb-1">Suggested Price:</p>
              <p class="text-lg font-bold text-emerald-600 dark:text-emerald-400">${suggestedPrice}</p>
            </div>
          </div>
        </div>

        <div class="mt-2 pt-4 border-t border-slate-200 dark:border-slate-700/50">
          <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Set Final Admin Price (LKR)</label>
          <input type="number" id="price-${draft.draftId}" 
            class="w-full bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-white" 
            placeholder="e.g. 50000" value="${draft.suggestedPriceLkr}">
          
          <button class="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition shadow-lg shadow-emerald-500/30" 
            onclick="approveDraft(${draft.draftId})">
            <i class="fas fa-check mr-2"></i> Approve & Publish
          </button>
        </div>
      `;
            listEl.appendChild(card);
        });
    }

    // --- APPROVE DRAFT ---
    window.approveDraft = async function(draftId) {
        const priceInput = document.getElementById(`price-${draftId}`).value;

        if (!priceInput || priceInput <= 0) {
            Swal.fire('Invalid Price', 'Please enter a valid final selling price.', 'warning');
            return;
        }

        Swal.fire({
            icon: 'success',
            title: 'Approved!',
            text: `Draft #${draftId} approved with a price of Rs. ${priceInput}. (Backend update coming next!)`,
            background: html.classList.contains('dark') ? '#1e293b' : '#fff',
            color: html.classList.contains('dark') ? '#f8fafc' : '#0f172a'
        });

        document.getElementById(`price-${draftId}`).closest('.card').remove();
        if(listEl.children.length === 0) emptyEl.classList.remove('hidden');
    };

    // --- INITIALIZE ---
    async function init() {
        const drafts = await loadDrafts();
        render(drafts);
    }

    init();
})();
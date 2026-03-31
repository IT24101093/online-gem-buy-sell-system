(() => {
  // --- CONFIGURATION ---
  // Ensure this matches your Spring Boot Controller's GET endpoint for the inventory list
  const API_BASE = 'http://localhost:8080/api/inventory/items';
  const MARKET_KEY  = 'gemvault_marketplace_queue';

  let currentInventory = []; // Store fetched items for local filtering

  const listEl = document.getElementById('list');
  const emptyEl = document.getElementById('emptyState');
  const searchInput = document.getElementById('searchInput');
  const sourceFilter = document.getElementById('sourceFilter');
  const statTotal = document.getElementById('statTotal');
  const statCertified = document.getElementById('statCertified');
  const statAnalysis = document.getElementById('statAnalysis');
  const themeBtn = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // --- THEME HANDLING ---
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

  // --- 1. FETCH FROM BOTH BACKEND CONTROLLERS ---
  async function loadInventory(){
    try {
      // 1. Setup the URLs for both workflows
      const certifiedUrl = 'http://localhost:8080/api/inventory/certified/all';

      // 👉 Change this URL to match your exact Smart Analysis GET endpoint from Postman
      const analysisUrl = 'http://localhost:8080/api/inventory/analysis/all';

      // 2. Fetch both at the exact same time
      const [certResponse, analysisResponse] = await Promise.all([
        fetch(certifiedUrl).catch(() => null), // Catch prevents one failure from breaking the other
        fetch(analysisUrl).catch(() => null)
      ]);

      let combinedInventory = [];

      // 3. Add Certified gems to the list if successful
      if (certResponse && certResponse.ok) {
        const certData = await certResponse.json();
        if (Array.isArray(certData)) {
          combinedInventory = combinedInventory.concat(certData);
        }
      }

      // 4. Add Analysis gems to the list if successful
      if (analysisResponse && analysisResponse.ok) {
        const analysisData = await analysisResponse.json();
        if (Array.isArray(analysisData)) {
          combinedInventory = combinedInventory.concat(analysisData);
        }
      }

      // 5. Return the combined list so the UI can draw them all!
      return combinedInventory;

    } catch (error) {
      console.error("Error fetching inventory:", error);
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to load database', showConfirmButton: false, timer: 3000 });
      return [];
    }
  }

  // --- DELETE FROM BACKEND ---
  async function deleteItem(id) {
    try {
      // This calls your @DeleteMapping in the Controller
      // which now sets status to 'REMOVED' instead of deleting the row
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error("Failed to soft-delete");

      return true;
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Could not remove item', 'error');
      return false;
    }
  }

  // --- FORMATTERS ---
  function fmtMoney(v){
    const n = Number(v) || 0;
    return n.toLocaleString('en-LK', { style:'currency', currency:'LKR', maximumFractionDigits: 0 });
  }

  function fmtCt(v){
    const n = Number(v) || 0;
    return n.toFixed(2) + ' ct';
  }

  function escapeHtml(str){
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[s]));
  }

  function badgeForSource(source){
    // Backend enum will likely be "CERTIFIED" or "ANALYSIS"
    const src = String(source).toLowerCase();
    if (src === 'certified') return '<span class="badge"><i class="fas fa-certificate text-emerald-500"></i> Certified</span>';
    return '<span class="badge"><i class="fas fa-microscope text-indigo-500"></i> Analysis</span>';
  }

  // --- FILTERING & STATS ---
  function updateStats(items){
    const total = items.length;
    const cert = items.filter(x => String(x.source).toLowerCase() === 'certified').length;
    const ana  = items.filter(x => String(x.source).toLowerCase() === 'analysis').length;
    statTotal.textContent = total;
    statCertified.textContent = cert;
    statAnalysis.textContent = ana;
  }

  function matches(item, q){
    if (!q) return true;
    const s = q.toLowerCase();
    const hay = [
      item.inventoryCode,
      item.gemType,
      item.category,
      item.sellerName
    ].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(s);
  }

  function applyFilters(items){
    const q = searchInput.value.trim();
    const src = sourceFilter.value.toLowerCase();
    return items.filter(it => (src === 'all' ? true : String(it.source).toLowerCase() === src))
        .filter(it => matches(it, q));
  }

  // --- RENDER UI ---
  function render(items){
    // 1. Filter out any items that have been soft-deleted before drawing
    const activeItems = items.filter(it => it.status !== 'REMOVED');

    listEl.innerHTML = '';
    updateStats(activeItems); // Update stats based only on what's visible

    // FIX 1: Check activeItems instead of items
    if (!activeItems.length){
      emptyEl.classList.remove('hidden');
      return;
    }
    emptyEl.classList.add('hidden');

    // FIX 2: Loop through activeItems instead of items
    for (const it of activeItems) {
      const id = it.inventoryItemId;
      const code = escapeHtml(it.inventoryCode);
      const name = escapeHtml(it.gemType);
      const seller = it.sellerName ? `<div class="text-sm text-slate-600 dark:text-slate-400">Seller: <span class="font-semibold">${escapeHtml(it.sellerName)}</span></div>` : '';


      // 1. Color-coded Status & Action Area Logic
      let actionAreaHtml = '';
      let statusDisplayHtml = '';

      switch (it.status) {
        case 'REMOVED':
          statusDisplayHtml = `<span class="font-bold text-red-500">Removed</span>`;
          actionAreaHtml = `
          <div class="flex items-center bg-red-500/10 text-red-600 border border-red-500/20 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
              <i class="fas fa-trash-alt mr-1"></i> Deleted
          </div>`;
          break;
        case 'PENDING_MARKET':
          statusDisplayHtml = `<span class="font-bold text-amber-500">Awaiting Admin</span>`;
          actionAreaHtml = `
                <div class="flex items-center bg-amber-500/10 text-amber-600 border border-amber-500/20 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                    <i class="fas fa-history mr-1"></i> Pushed
                </div>`;
          break;
        case 'PUBLISHED':
          statusDisplayHtml = `<span class="font-bold text-emerald-500">Live in Shop</span>`;
          actionAreaHtml = `
                <div class="flex items-center bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
                    <i class="fas fa-globe mr-1"></i> Live
                </div>`;
          break;
        case 'SOLD':
          statusDisplayHtml = `<span class="font-bold text-slate-500">Sold</span>`;
          actionAreaHtml = `<div class="text-xs font-bold text-slate-400 uppercase">Archived</div>`;
          break;
        default: // IN_STOCK
          statusDisplayHtml = `<span class="font-bold text-blue-500">In Stock</span>`;
          actionAreaHtml = `
                <button class="icon-btn text-emerald-600" title="Push to Marketplace" data-action="publish" data-id="${id}">
                    <i class="fas fa-upload"></i>
                </button>`;
      }

      // 2. Hide Delete Button if the item is not "IN_STOCK"
      const deleteBtnHtml = (it.status === 'IN_STOCK') ? `
        <button class="icon-btn text-red-500 hover:text-red-700 hover:bg-red-50" title="Delete" data-action="delete" data-id="${id}">
            <i class="fas fa-trash"></i>
        </button>` : '';

      const imgUrl = it.primaryImageUrl ? `http://localhost:8080${it.primaryImageUrl}` : 'https://placehold.co/400x300?text=No+Image';

      const card = document.createElement('div');
      card.className = 'card p-0 overflow-hidden';

      card.innerHTML = `
        <div class="h-48 w-full bg-slate-200 dark:bg-slate-800 relative">
          <img src="${imgUrl}" alt="${name}" class="w-full h-full object-cover" onerror="this.src='https://placehold.co/400x300?text=No+Image'">
          <div class="absolute top-3 left-3 flex flex-wrap gap-2">
            ${badgeForSource(it.source)}
            <span class="badge"><i class="fas fa-hashtag"></i> ${code}</span>
          </div>
        </div>

        <div class="p-5">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-xl font-extrabold mb-1">${name}</h3>
              <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">${it.category || 'N/A'}</div>
            </div>

            <div class="flex gap-2 items-center">
              ${actionAreaHtml}
              <button class="icon-btn" title="View Details" data-action="details" data-id="${id}">
                <i class="fas fa-eye"></i>
              </button>
              ${deleteBtnHtml}
            </div>
          </div>

          <div class="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <div>
              <div class="text-xs text-slate-500 dark:text-slate-400">Weight</div>
              <div class="text-lg font-bold">${fmtCt(it.weightCt)}</div>
            </div>
            <div>
              <div class="text-xs text-slate-500 dark:text-slate-400">Est. Value</div>
              <div class="text-lg font-bold">${fmtMoney(it.estimatedValueLkr)}</div>
            </div>
          </div>

          <div class="mt-4 space-y-1">
            ${seller}
            <div class="text-sm text-slate-600 dark:text-slate-400">Status: ${statusDisplayHtml}</div>
          </div>
        </div>
    `;
      listEl.appendChild(card);
    }
  }

  // --- ACTIONS ---
  async function showDetails(item){
    const html = `
      <div class="text-left space-y-2 text-sm">
        <div><span class="opacity-70">Item Code:</span> <b>${escapeHtml(item.inventoryCode)}</b></div>
        <div><span class="opacity-70">Type:</span> <b>${escapeHtml(item.gemType)}</b></div>
        <div><span class="opacity-70">Category:</span> <b>${escapeHtml(item.category || 'None')}</b></div>
        <div><span class="opacity-70">Source:</span> <b>${escapeHtml(item.source)}</b></div>
        <div><span class="opacity-70">Weight:</span> <b>${fmtCt(item.weightCt)}</b></div>
        <div><span class="opacity-70">Est. Value:</span> <b>${fmtMoney(item.estimatedValueLkr)}</b></div>
        ${item.sellerName ? `<div><span class="opacity-70">Seller:</span> <b>${escapeHtml(item.sellerName)}</b></div>` : ''}
        <div><span class="opacity-70">Status:</span> <b>${escapeHtml(item.status)}</b></div>
        <hr class="my-2 border-slate-200">
        <div><span class="opacity-70">Description:</span> <br><span class="italic">${escapeHtml(item.description || 'No description provided.')}</span></div>
      </div>
    `;
    await Swal.fire({ title: 'Gem Details', html, icon: 'info', showCloseButton: true, confirmButtonText: 'Close' });
  }

  async function publishItem(item) {
    const result = await Swal.fire({
      title: 'Push to Marketplace?',
      text: "This will send the gem details to the admin for pricing.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, push it!'
    });

    if (!result.isConfirmed) return;

    try {
      // 1. Create the Marketplace Draft payload
      // These names must match DraftRequestDto.java exactly
      const draftPayload = {
        inventoryItemId: item.inventoryItemId,
        gemstoneName: item.gemType,
        category: item.category || 'Uncategorized',
        descriptionSnapshot: item.description || '',
        suggestedPriceLkr: item.estimatedValueLkr
      };

      // 2. POST to Marketplace Drafts
      // Targets @PostMapping in MarketplaceController.java
      const draftResponse = await fetch('http://localhost:8080/api/marketplace/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draftPayload)
      });

      if (!draftResponse.ok) {
        const errorMsg = await draftResponse.text();
        console.error("Marketplace Draft Error:", errorMsg);
        throw new Error("Failed to create marketplace draft: " + errorMsg);
      }

      // 3. Update the Inventory Status to PENDING_MARKET
      // Matches @PutMapping("/{itemId}/status") in InventoryItemController.java
      const statusUrl = `http://localhost:8080/api/inventory/items/${item.inventoryItemId}/status?status=PENDING_MARKET`;

      const statusResponse = await fetch(statusUrl, {
        method: 'PUT'
      });

      if (statusResponse.ok) {
        await Swal.fire({
          title: 'Success!',
          text: 'Gem pushed and status updated to Pushed.',
          icon: 'success',
          confirmButtonColor: '#059669'
        });

        refresh(); // Refresh the UI to show the new status badge
      } else {
        const errorMsg = await statusResponse.text();
        console.error("Inventory Status Error:", errorMsg);
        throw new Error("Draft created, but failed to update inventory status.");
      }

    } catch (error) {
      console.error("Error during publish process:", error);
      Swal.fire('Error', error.message || 'Something went wrong during the push process.', 'error');
    }
  }

  // --- EVENT LISTENERS ---
  function bindEvents(){
    searchInput.addEventListener('input', () => render(applyFilters(currentInventory)));
    sourceFilter.addEventListener('change', () => render(applyFilters(currentInventory)));

    listEl.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const id = parseInt(btn.getAttribute('data-id'));
      const action = btn.getAttribute('data-action');
      const item = currentInventory.find(x => x.inventoryItemId === id);
      if (!item) return;

      if (action === 'delete') {
        const ok = await Swal.fire({
          title: 'Remove item?',
          text: 'This item will be moved to history and removed from your active inventory.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Remove',
          confirmButtonColor: '#ef4444'
        });
        if (ok.isConfirmed){
          const success = await deleteItem(id);
          if (success) refresh();
        }
      } else if (action === 'details'){
        await showDetails(item);
      } else if (action === 'publish'){
        await publishItem(item);
      }
    });
  }

  // --- INITIALIZE ---
  async function refresh(){
    currentInventory = await loadInventory();
    render(applyFilters(currentInventory));
  }

  function showAddedToastIfNeeded(){
    const params = new URLSearchParams(window.location.search);
    if (params.get('added') === '1'){
      Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: 'Saved to Database', showConfirmButton: false, timer: 1800 });
      params.delete('added');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }

  bindEvents();
  refresh();
  showAddedToastIfNeeded();
})();
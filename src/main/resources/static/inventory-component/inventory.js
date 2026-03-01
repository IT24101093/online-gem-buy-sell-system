

(() => {
  const STORAGE_KEY = 'gemvault_inventory';
  const MARKET_KEY  = 'gemvault_marketplace_queue';

  const listEl = document.getElementById('list');
  const emptyEl = document.getElementById('emptyState');

  const searchInput = document.getElementById('searchInput');
  const sourceFilter = document.getElementById('sourceFilter');

  const statTotal = document.getElementById('statTotal');
  const statCertified = document.getElementById('statCertified');
  const statAnalysis = document.getElementById('statAnalysis');

  const themeBtn = document.getElementById('theme-toggle');
  const html = document.documentElement;

  function setTheme(mode){
    if (mode === 'light') {
      html.classList.remove('dark');
      localStorage.setItem('theme','light');
    } else {
      html.classList.add('dark');
      localStorage.setItem('theme','dark');
    }
  }
  // default dark
  const savedTheme = localStorage.getItem('theme');
  setTheme(savedTheme === 'light' ? 'light' : 'dark');
  themeBtn?.addEventListener('click', () => setTheme(html.classList.contains('dark') ? 'light' : 'dark'));

  function loadInventory(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    }catch{
      return [];
    }
  }

  function saveInventory(items){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function upsertItem(item){
    const items = loadInventory();
    const idx = items.findIndex(x => x.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.unshift(item);
    saveInventory(items);
  }

  function removeItem(id){
    const items = loadInventory().filter(x => x.id !== id);
    saveInventory(items);
  }

  function queueMarketplace(dto){
    let q = [];
    try { q = JSON.parse(localStorage.getItem(MARKET_KEY) || '[]'); } catch { q = []; }
    if (!Array.isArray(q)) q = [];
    q.unshift(dto);
    localStorage.setItem(MARKET_KEY, JSON.stringify(q));
  }

  // Expose minimal helper so other pages can do:
  // window.GemVaultInventory.addItem({...}) then redirect to inventory.html
  window.GemVaultInventory = {
    addItem: (data) => {
      const item = normalizeItem(data);
      upsertItem(item);
      return item.id;
    }
  };

  function normalizeItem(data){
    const now = new Date().toISOString();
    const id = data.id || ('GV-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,6).toUpperCase());
    return {
      id,
      source: data.source || 'analysis',
      gemType: data.gemType || 'Unknown',
      weightCt: Number(data.weightCt ?? 0) || 0,
      estimatedValue: Number(data.estimatedValue ?? 0) || 0,
      cut: data.cut || data.cutShape || null,
      dimensions: data.dimensions || null,
      vendor: data.vendor || null,
      certificate: data.certificate || null,
      description: data.description || null,
      imageDataUrl: data.imageDataUrl || null,

      // Marketplace push state
      pushedToMarketplace: Boolean(data.pushedToMarketplace),
      pushedAtISO: data.pushedAtISO || null,

      createdAtISO: data.createdAtISO || now
    };
  }function fmtMoney(v){
    const n = Number(v) || 0;
    return n.toLocaleString('en-LK', { style:'currency', currency:'LKR', maximumFractionDigits: 0 });
  }

  function fmtCt(v){
    const n = Number(v) || 0;
    return n.toFixed(2) + ' ct';
  }

  function updateStats(items){
    const total = items.length;
    const cert = items.filter(x => x.source === 'certified').length;
    const ana  = items.filter(x => x.source === 'analysis').length;
    statTotal.textContent = total;
    statCertified.textContent = cert;
    statAnalysis.textContent = ana;
  }

  function matches(item, q){
    if (!q) return true;
    const s = q.toLowerCase();
    const hay = [
      item.id,
      item.gemType,
      item.vendor?.name,
      item.vendor?.nic,
      item.vendor?.phone,
      item.certificate?.id,
      item.certificate?.issuer
    ].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(s);
  }

  function applyFilters(items){
    const q = searchInput.value.trim();
    const src = sourceFilter.value;
    return items.filter(it => (src === 'all' ? true : it.source === src))
                .filter(it => matches(it, q));
  }

  function badgeForSource(source){
    if (source === 'certified') return '<span class="badge"><i class="fas fa-certificate"></i> Certified</span>';
    return '<span class="badge"><i class="fas fa-microscope"></i> Smart Analysis</span>';
  }

  function render(items){
    listEl.innerHTML = '';
    updateStats(items);

    if (!items.length){
      emptyEl.classList.remove('hidden');
      return;
    }
    emptyEl.classList.add('hidden');

    for (const it of items){
      const created = new Date(it.createdAtISO).toLocaleString();
      const cut = it.cut ? `<span class="badge"><i class="fas fa-gem"></i> ${it.cut}</span>` : '';
      const vendor = it.vendor?.name ? `<div class="text-sm text-slate-600 dark:text-slate-400">Vendor: <span class="font-semibold">${escapeHtml(it.vendor.name)}</span></div>` : '';
      const cert = it.certificate?.id ? `<div class="text-sm text-slate-600 dark:text-slate-400">Cert ID: <span class="font-semibold">${escapeHtml(it.certificate.id)}</span></div>` : '';
      const dims = it.dimensions ? `<div class="text-sm text-slate-600 dark:text-slate-400">Size: <span class="font-semibold">${it.dimensions.l}×${it.dimensions.w}×${it.dimensions.d} mm</span></div>` : '';

      const card = document.createElement('div');
      card.className = 'card p-6';
      card.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div>
            <div class="flex flex-wrap gap-2 mb-2">
              ${badgeForSource(it.source)}
              ${cut}
              <span class="badge"><i class="fas fa-hashtag"></i> ${escapeHtml(it.id)}</span>
            </div>
            <h3 class="text-xl font-extrabold mb-1">${escapeHtml(it.gemType)}</h3>
            <div class="text-sm text-slate-600 dark:text-slate-400">Added: ${escapeHtml(created)}</div>
          </div>

          <div class="flex gap-2">
            <button class="icon-btn ${it.pushedToMarketplace ? 'opacity-50 pointer-events-none' : ''}" title="${it.pushedToMarketplace ? 'Already pushed to Marketplace' : 'Publish to Marketplace'}" data-action="publish" data-id="${escapeHtml(it.id)}" ${it.pushedToMarketplace ? 'disabled aria-disabled="true"' : ''}>
              <i class="fas fa-upload"></i>
            </button>
            <button class="icon-btn" title="View Details" data-action="details" data-id="${escapeHtml(it.id)}">
              <i class="fas fa-eye"></i>
            </button>
            <button class="icon-btn" title="Delete" data-action="delete" data-id="${escapeHtml(it.id)}">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-3">
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Weight</div>
            <div class="text-lg font-bold">${fmtCt(it.weightCt)}</div>
          </div>
          <div>
            <div class="text-xs text-slate-500 dark:text-slate-400">Estimated Value</div>
            <div class="text-lg font-bold">${fmtMoney(it.estimatedValue)}</div>
          </div>
        </div>

        <div class="mt-4 space-y-1">
          ${vendor}
          ${cert}
          ${dims}
        </div>
      `;
      listEl.appendChild(card);
    }
  }

  async function showDetails(item){
    const html = `
      <div class="text-left space-y-2">
        <div><span class="opacity-70">ID:</span> <b>${escapeHtml(item.id)}</b></div>
        <div><span class="opacity-70">Type:</span> <b>${escapeHtml(item.gemType)}</b></div>
        <div><span class="opacity-70">Source:</span> <b>${escapeHtml(item.source)}</b></div>
        <div><span class="opacity-70">Weight:</span> <b>${fmtCt(item.weightCt)}</b></div>
        <div><span class="opacity-70">Value:</span> <b>${fmtMoney(item.estimatedValue)}</b></div>
        ${item.cut ? `<div><span class="opacity-70">Cut:</span> <b>${escapeHtml(item.cut)}</b></div>` : ''}
        ${item.dimensions ? `<div><span class="opacity-70">Dimensions:</span> <b>${item.dimensions.l}×${item.dimensions.w}×${item.dimensions.d} mm</b></div>` : ''}
        ${item.vendor?.name ? `<div><span class="opacity-70">Vendor:</span> <b>${escapeHtml(item.vendor.name)}</b></div>` : ''}
        ${item.vendor?.nic ? `<div><span class="opacity-70">NIC:</span> <b>${escapeHtml(item.vendor.nic)}</b></div>` : ''}
        ${item.vendor?.phone ? `<div><span class="opacity-70">Phone:</span> <b>${escapeHtml(item.vendor.phone)}</b></div>` : ''}
        ${item.certificate?.id ? `<div><span class="opacity-70">Certificate ID:</span> <b>${escapeHtml(item.certificate.id)}</b></div>` : ''}
        ${item.certificate?.issuer ? `<div><span class="opacity-70">Issuer:</span> <b>${escapeHtml(item.certificate.issuer)}</b></div>` : ''}
      </div>
    `;
    await Swal.fire({
      title: 'Gem Details',
      html,
      icon: 'info',
      showCloseButton: true,
      confirmButtonText: 'Close'
    });
  }

  async function publishItem(item){
    // Prevent double-push
    if (item.pushedToMarketplace) {
      await Swal.fire({
        title: 'Already pushed',
        text: 'This gem has already been pushed to Marketplace Admin.',
        icon: 'info',
        confirmButtonText: 'Close'
      });
      return;
    }

    // Workflow: Inventory only pushes the gem to Marketplace Admin.
    // Price editing happens in the Marketplace component (other member).
    const ok = await Swal.fire({
      title: 'Push to Marketplace?',
      text: 'This will send the gem to the marketplace admin page, where you can set/change the selling price.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Push',
      cancelButtonText: 'Cancel',
      showCloseButton: true
    });

    if (!ok.isConfirmed) return;

    // DTO to marketplace (common package idea)
    // NOTE: suggestedPrice is your current estimated value; marketplace admin can override it.
    const marketplaceDTO = {
      inventoryId: item.id,
      gemType: item.gemType,
      source: item.source,
      weightCt: item.weightCt,
      cut: item.cut,
      suggestedPrice: Number(item.estimatedValue || 0),
      certificate: item.certificate || null,
      vendor: item.vendor || null,
      description: item.description || null,
      imageDataUrl: item.imageDataUrl || null,
      createdAtISO: new Date().toISOString()
    };

    queueMarketplace(marketplaceDTO);

    // Mark as pushed in inventory so it can't be pushed again
    item.pushedToMarketplace = true;
    item.pushedAtISO = new Date().toISOString();
    upsertItem(item);

    const next = await Swal.fire({
      title: 'Pushed',
      text: 'Gem was sent to Marketplace Admin. You can close or go to Marketplace Admin now.',
      icon: 'success',
      showCancelButton: true,
      confirmButtonText: 'Go to Marketplace Admin',
      cancelButtonText: 'Close',
      showCloseButton: true
    });

    if (next.isConfirmed) {
      // Adjust this filename to whatever your teammate uses.
      window.location.href = 'marketplace-admin.html';
    }
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, s => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[s]));
  }

  function bindEvents(){
    searchInput.addEventListener('input', refresh);
    sourceFilter.addEventListener('change', refresh);

    listEl.addEventListener('click', async (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const id = btn.getAttribute('data-id');
      const action = btn.getAttribute('data-action');
      const items = loadInventory();
      const item = items.find(x => x.id === id);
      if (!item) return;

      if (action === 'delete'){
        const ok = await Swal.fire({
          title: 'Delete item?',
          text: 'This will remove it from inventory.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Delete',
          confirmButtonColor: '#ef4444'
        });
        if (ok.isConfirmed){
          removeItem(id);
          refresh();
        }
      } else if (action === 'details'){
        await showDetails(item);
      } else if (action === 'publish'){
        await publishItem(item);
        refresh();
      }
    });
  }

  function refresh(){
    const items = loadInventory();
    const filtered = applyFilters(items);
    render(filtered);
  }

  // If another page redirects here after adding, it can pass ?added=1
  function showAddedToastIfNeeded(){
    const params = new URLSearchParams(window.location.search);
    if (params.get('added') === '1'){
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Added to inventory',
        showConfirmButton: false,
        timer: 1800,
        timerProgressBar: true
      });
      params.delete('added');
      const clean = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', clean);
    }
  }

  bindEvents();
  refresh();
  showAddedToastIfNeeded();
})();

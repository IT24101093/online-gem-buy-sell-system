


// ------------------------------
// Inventory localStorage (shared with inventory/add-gem)
// ------------------------------
const INVENTORY_STORAGE_KEY = "gemvault_inventory";

function loadInventory() {
  try {
    const raw = localStorage.getItem(INVENTORY_STORAGE_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveInventory(items) {
  localStorage.setItem(INVENTORY_STORAGE_KEY, JSON.stringify(items));
}

function addToInventory(item) {
  const items = loadInventory();
  items.unshift(item);
  saveInventory(items);
}



// ------------------------------
// Vendor validation helpers (Sri Lanka-friendly)
// ------------------------------
function normalizeNic(nic) {
  return String(nic || "").trim().toUpperCase().replace(/\s+/g, "");
}
function isValidSriLankaNIC(nic) {
  const x = normalizeNic(nic);
  // Old NIC: 9 digits + V/X  (e.g., 123456789V)
  // New NIC: 12 digits       (e.g., 200012345678)
  return /^\d{9}[VX]$/.test(x) || /^\d{12}$/.test(x);
}
function normalizePhone(phone) {
  // Keep digits and leading +
  let p = String(phone || "").trim().replace(/[^\d+]/g, "");
  // Convert 0094... to +94...
  if (p.startsWith("0094")) p = "+94" + p.slice(4);
  // Convert 94XXXXXXXXX to +94XXXXXXXXX (if user forgets +)
  if (/^94\d{9}$/.test(p)) p = "+".concat(p);
  return p;
}
function isValidSriLankaPhone(phone) {
  const p = normalizePhone(phone);
  // Accept:
  // 0XXXXXXXXX (10 digits starting 0)
  // +94XXXXXXXXX (9 digits after +94)
  return /^0\d{9}$/.test(p) || /^\+94\d{9}$/.test(p);
}
function isReasonableName(name) {
  const n = String(name || "").trim();
  if (n.length < 3) return false;
  // allow letters, spaces, dots, hyphen (basic)
  return /^[A-Za-z.\- ]+$/.test(n);
}

// ===============================
// 0) Backend endpoints (edit later)
// ===============================
const API_BASE = ""; // e.g. "http://localhost:8080"
const ENDPOINTS = {
  analyze: "/api/gem/analyze",
  // identify endpoint optional; current UI already simulates identify in simulateOpenCV()
};

// If backend isn't running, keep the UI usable (demo-only).
const DEMO_FALLBACK = true;

// ===============================
// 1) Small reference data (demo)
// (In real backend, these come from MySQL)
// ===============================
const GEM_DB = {
  Diamond: { sg: 3.52, base: 2000 },
  Ruby: { sg: 4.00, base: 800 },
  Sapphire: { sg: 4.00, base: 500 },
  Emerald: { sg: 2.72, base: 700 },
  Quartz: { sg: 2.65, base: 100 },
  Topaz: { sg: 3.50, base: 600 },
};

const SHAPE_FACTOR = {
  Round: 0.0018,
  Oval: 0.0020,
  Emerald: 0.0024,
  Pear: 0.00175,
  Marquise: 0.0016,
};

const YIELD = {
  Emerald: 0.60,
  Oval: 0.45,
  Round: 0.35,
};

// Multipliers (demo). Backend should store these in DB.
const MULT = {
  color: { Vivid: 1.5, Medium: 1.0, Light: 0.8 },
  clarity: { IF: 1.5, VVS: 1.3, VS: 1.1, SI: 0.9, I: 0.7 },
  cut: { "Excellent": 1.2, "Very Good": 1.1, Good: 1.0, Fair: 0.8 },
};

// ===============================
// 2) State
// ===============================
const currentAnalysisResult = {
  type: null, // detected stone type
  imageDataUrl: "", // uploaded image (data URL)
  predictedRoughWeight: null,
  sgUsed: null,
  cuts: null,
  recommendedCut: null,
  warnings: [],
};

function populateGemTypeDropdown() {
  const select = $("confirmedGemType");
  if (!select) return;

  const currentValue = select.value;
  const gemTypes = Object.keys(GEM_DB);

  select.innerHTML = '<option value="">Select gem type</option>';
  gemTypes.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    select.appendChild(option);
  });

  if (currentValue && gemTypes.includes(currentValue)) {
    select.value = currentValue;
  }
}

function getConfirmedGemType() {
  const confirmed = $("confirmedGemType")?.value || "";
  return confirmed || currentAnalysisResult.type || "";
}

let selectedCut = null;

// ===============================
// 3) Helpers
// ===============================
const $ = (id) => document.getElementById(id);

function setText(id, txt) {
  const el = $(id);
  if (el) el.textContent = txt;
}

function setOptimizationEnabled(enabled) {
  const w = $("optimizationWidget");
  if (!w) return;
  if (enabled) {
    w.classList.remove("opacity-50", "blur-sm");
  } else {
    w.classList.add("opacity-50", "blur-sm");
  }
}


function show(el, yes) {
  if (!el) return;
  el.classList.toggle("hidden", !yes);
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function fmtCt(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-- ct";
  return n.toFixed(2) + " ct";
}

function fmtMoney(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "--";
  // Display in Sri Lankan Rupees (LKR)
  return "LKR " + n.toLocaleString("en-LK", { maximumFractionDigits: 0 });
}


function buildAutoDescription({ gemType, roughShape, grades, dimensions, predictedRoughWeight, selectedCut, cutRow }) {
  const parts = [];
  if (gemType) parts.push(`${gemType} (Smart Analysis)`);
  if (dimensions && (dimensions.l || dimensions.w || dimensions.d)) {
    const l = dimensions.l ?? "--";
    const w = dimensions.w ?? "--";
    const d = dimensions.d ?? "--";
    parts.push(`Rough size: ${l}×${w}×${d} mm`);
  }
  if (roughShape) parts.push(`Rough shape: ${roughShape}`);
  if (grades) {
    if (grades.color) parts.push(`Color: ${grades.color}`);
    if (grades.clarity) parts.push(`Clarity: ${grades.clarity}`);
    if (grades.cut) parts.push(`Cut grade: ${grades.cut}`);
  }
  if (predictedRoughWeight != null && !Number.isNaN(Number(predictedRoughWeight))) {
    parts.push(`Predicted rough weight: ${Number(predictedRoughWeight).toFixed(2)} ct`);
  }
  if (selectedCut) parts.push(`Selected cut: ${selectedCut}`);
  if (cutRow) {
    if (cutRow.cutWeight != null) parts.push(`Est. finished weight: ${Number(cutRow.cutWeight).toFixed(2)} ct`);
    if (cutRow.predictedValue != null) parts.push(`Est. value: Rs. ${Number(cutRow.predictedValue).toLocaleString("en-LK", { maximumFractionDigits: 0 })}`);
  }
  return parts.join(" • ");
}


function setWarnings(list) {
  const box = $("weightWarning");
  if (!box) return;
  if (!list || list.length === 0) {
    box.innerHTML = "";
    show(box, false);
    return;
  }
  box.innerHTML = list.map((w) => `<div>• ${w}</div>`).join("");
  show(box, true);
}

function setRecommendation(text) {
  const el = $("recommendationText");
  if (!el) return;
  if (!text) {
    el.textContent = "";
    show(el, false);
    return;
  }
  el.textContent = text;
  show(el, true);
}

function clearRecommendedBadges() {
  ["Round", "Emerald", "Oval"].forEach((c) => {
    const b = $("badge" + c);
    if (b) show(b, false);
  });
}

function markRecommended(cut) {
  clearRecommendedBadges();
  const b = $("badge" + cut);
  if (b) show(b, true);
}

// ===============================
// 4) Theme toggle (ORIGINAL behavior)
// ===============================
(function initThemeToggle() {
  const root = document.documentElement;
  const btn = $("themeToggle");
  if (!btn) return;

  const saved = localStorage.getItem("theme");
  if (saved === "light") root.classList.remove("dark");
  else root.classList.add("dark");

  btn.innerHTML = root.classList.contains("dark")
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';

  btn.addEventListener("click", () => {
    root.classList.toggle("dark");
    localStorage.setItem("theme", root.classList.contains("dark") ? "dark" : "light");
    btn.innerHTML = root.classList.contains("dark")
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  });
})();

// ===============================
// 5) "More cuts" toggle (Oval)
// ===============================
(function initMoreCutsToggle() {
  const btn = $("toggleMoreCuts");
  const box = $("moreCutsContainer");
  if (!btn || !box) return;

  btn.addEventListener("click", () => {
    const open = box.classList.contains("hidden");
    show(box, open);
    btn.innerHTML = open
      ? '<i class="fa-solid fa-layer-group"></i> Hide Oval option'
      : '<i class="fa-solid fa-layer-group"></i> Show Oval option';
  });
})();

// ===============================
// 6) Manual weight toggle
// ===============================
(function initManualWeight() {
  const t = $("toggleManualWeight");
  const box = $("manualWeightContainer");
  const input = $("manualWeightInput");
  if (!t || !box) return;

  t.addEventListener("change", () => {
    show(box, t.checked);
    if (!t.checked && input) input.value = "";
    setWarnings([]);
  });
})();

// ===============================
// 7) Cut selection (Round/Emerald/Oval)
// ===============================
function resetCutUI() {
  ["Round", "Emerald", "Oval"].forEach((c) => {
    $("card" + c)?.classList.remove("ring-2", "ring-green-500");
    $("check" + c)?.classList.add("hidden");
  });
}

function selectCut(cutName) {
  selectedCut = cutName;
  resetCutUI();
  $("card" + cutName)?.classList.add("ring-2", "ring-green-500");
  $("check" + cutName)?.classList.remove("hidden");
}
window.selectCut = selectCut;

// ===============================
// 8) Image upload scan simulation (ORIGINAL)
// ===============================
function simulateOpenCV(input) {
  if (!input.files[0]) return;

  const file = input.files[0];

  // Validate image file
  if (!file.type.startsWith("image/")) {
    Swal.fire({
      icon: "error",
      title: "Invalid File Format",
      text: "Please upload a valid image file (JPG/PNG/WEBP).",
      background: "#1e293b",
      color: "#fff",
      confirmButtonColor: "#ef4444",
    });
    input.value = "";
    return;
  }

  const placeholder = $("opencv-placeholder");
  const result = $("opencv-result");
  const imagePreview = $("uploadedImagePreview");
  const panel2 = $("dimensionPanel");

  // Loading
  placeholder.innerHTML =
    '<i class="fa-solid fa-circle-notch fa-spin text-2xl text-purple-500"></i>' +
    '<p class="text-xs text-purple-300 mt-2">Scanning Structural Integrity...</p>';
  result.classList.add("hidden");

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.src = e.target.result;
    currentAnalysisResult.imageDataUrl = String(e.target.result || "");
  };
  reader.readAsDataURL(file);

  setTimeout(() => {
    const types = Object.keys(GEM_DB);
    const detected = types[Math.floor(Math.random() * types.length)];

    placeholder.innerHTML =
      '<i class="fa-solid fa-camera text-2xl text-purple-500 mb-2"></i>' +
      '<p class="text-xs text-slate-400">Upload Rough Stone Image</p>';
    placeholder.classList.add("hidden");

    result.classList.remove("hidden");
    setText("detectedType", detected);
    setText("confidenceScore", "98.4%");

    panel2.classList.remove("opacity-50", "pointer-events-none");

    // store
    currentAnalysisResult.type = detected;
    const confirmedGemType = $("confirmedGemType");
    if (confirmedGemType) confirmedGemType.value = detected;

    // clear previous analysis outputs
    setText("roughWeightDisplay", "0.00");
    setText("sgDisplay", "--");
    setText("valRoundWt", "-- ct");
    setText("valRoundPrice", "--");
    setText("valEmeraldWt", "-- ct");
    setText("valEmeraldPrice", "--");
    setText("valOvalWt", "-- ct");
    setText("valOvalPrice", "--");
    setRecommendation("");
    clearRecommendedBadges();
    setWarnings([]);
    selectedCut = null;
    resetCutUI();
    setOptimizationEnabled(false);
  }, 2000);
}
window.simulateOpenCV = simulateOpenCV;

// ===============================
// 9) Run analysis (backend first; demo fallback if needed)
// ===============================
async function callBackendAnalyze(payload) {
  const res = await fetch(API_BASE + ENDPOINTS.analyze, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Backend analyze failed");
  return await res.json();
}

function localAnalyze(payload) {
  const { stoneType, dimensionsMm, roughShape, manualWeightCt, grades, requestedCuts } = payload;

  const gem = GEM_DB[stoneType] || null;
  const sg = gem?.sg ?? 0;
  const shapeFactor = SHAPE_FACTOR[roughShape] ?? 0;

  const L = dimensionsMm.length, W = dimensionsMm.width, D = dimensionsMm.depth;
  const predictedRoughWeight = (L * W * D) * sg * shapeFactor;

  const warnings = [];

  if (manualWeightCt != null && predictedRoughWeight > 0) {
    const diffRatio = Math.abs(manualWeightCt - predictedRoughWeight) / predictedRoughWeight;
    if (diffRatio >= 0.15) warnings.push("Weight seems inconsistent with dimensions. Please double-check.");
  }

  // price
  const base = gem?.base ?? 0;
  const qm = (MULT.color[grades.color] ?? 1) * (MULT.clarity[grades.clarity] ?? 1) * (MULT.cut[grades.cut] ?? 1);

  const cuts = [];
  let best = null;

  for (const shape of requestedCuts) {
    const y = YIELD[shape] ?? 0;
    const finalWeight = predictedRoughWeight * y;
    const predictedValue = Math.round(finalWeight * base * qm);

    const row = { shape, finalWeight, predictedValue, recommended: false };
    cuts.push(row);
    if (!best || predictedValue > best.predictedValue) best = row;
  }

  if (best) best.recommended = true;

  return {
    predictedRoughWeight,
    sgUsed: sg,
    warnings,
    cuts,
    recommendedCut: best?.shape ?? null,
    recommendationReason: best ? `Recommended: ${best.shape} because predicted value is highest.` : "",
  };
}

function validateInputs() {
  if (!currentAnalysisResult.type) return "Please upload an image first (Step 1).";
  if (!getConfirmedGemType()) return "Confirm the gem type before running the analysis.";

  const L = num($("inputL")?.value);
  const W = num($("inputW")?.value);
  const D = num($("inputD")?.value);
  if (L == null || W == null || D == null || L <= 0 || W <= 0 || D <= 0)
    return "Enter valid L, W, D values (must be > 0).";

  const roughShape = $("roughShapeSelect")?.value || "";
  if (!roughShape) return "Select Rough Shape (for shape factor).";

  const color = $("colorGradeSelect")?.value || "";
  const clarity = $("clarityGradeSelect")?.value || "";
  const cut = $("cutGradeSelect")?.value || "";
  if (!color || !clarity || !cut) return "Select Color, Clarity, and Cut grades.";

  const manualEnabled = $("toggleManualWeight")?.checked;
  if (manualEnabled) {
    const mw = num($("manualWeightInput")?.value);
    if (mw == null || mw <= 0) return "Enter a valid manual weight (ct).";
  }
  return null;
}

async function runSmartAnalysis() {
  const err = validateInputs();
  if (err) {
    Swal.fire({ icon: "warning", title: "Check inputs", text: err, background: "#1e293b", color: "#fff" });
    return;
  }

  const payload = {
    stoneType: getConfirmedGemType(),
    dimensionsMm: {
      length: Number($("inputL").value),
      width: Number($("inputW").value),
      depth: Number($("inputD").value),
    },
    roughShape: $("roughShapeSelect").value,
    manualWeightCt: $("toggleManualWeight").checked ? Number($("manualWeightInput").value) : null,
    grades: {
      color: $("colorGradeSelect").value,
      clarity: $("clarityGradeSelect").value,
      cut: $("cutGradeSelect").value,
    },
    requestedCuts: ["Emerald", "Oval", "Round"],
  };

  setRecommendation("Analyzing...");
  setWarnings([]);

  let result;
  try {
    result = await callBackendAnalyze(payload);
  } catch (e) {
    if (!DEMO_FALLBACK) {
      setRecommendation("");
      Swal.fire({
        icon: "error",
        title: "Backend not connected",
        text: "Start Spring Boot backend (or enable demo fallback).",
        background: "#1e293b",
        color: "#fff",
      });
      return;
    }
    result = localAnalyze(payload);
  }

  // Render
  currentAnalysisResult.predictedRoughWeight = result.predictedRoughWeight;
  currentAnalysisResult.sgUsed = result.sgUsed;
  currentAnalysisResult.cuts = result.cuts;
  currentAnalysisResult.recommendedCut = result.recommendedCut;
  currentAnalysisResult.warnings = result.warnings || [];

  setText("roughWeightDisplay", Number(result.predictedRoughWeight).toFixed(2));
  setText("sgDisplay", result.sgUsed != null ? String(result.sgUsed) : "--");

  // per cut
  const map = {};
  (result.cuts || []).forEach((c) => (map[c.shape] = c));
  if (map.Round) { setText("valRoundWt", fmtCt(map.Round.finalWeight)); setText("valRoundPrice", fmtMoney(map.Round.predictedValue)); }
  if (map.Emerald) { setText("valEmeraldWt", fmtCt(map.Emerald.finalWeight)); setText("valEmeraldPrice", fmtMoney(map.Emerald.predictedValue)); }
  if (map.Oval) { setText("valOvalWt", fmtCt(map.Oval.finalWeight)); setText("valOvalPrice", fmtMoney(map.Oval.predictedValue)); }

  setWarnings(result.warnings || []);
  setRecommendation(result.recommendationReason || "");
  markRecommended(result.recommendedCut);
  setOptimizationEnabled(true);

  // Auto-select recommended cut (user can change)
  if (result.recommendedCut) selectCut(result.recommendedCut);

  Swal.fire({
    icon: "success",
    title: "Analysis Complete",
    text: "Review the cut options and select your preferred cut.",
    background: "#1e293b",
    color: "#fff",
    confirmButtonColor: "#22c55e",
  });
}
window.runSmartAnalysis = runSmartAnalysis;

// ===============================
// 10) Add to inventory popup (keeps original UX)
// ===============================
async function triggerVendorPopup() {
  if (!currentAnalysisResult.cuts) {
    Swal.fire({ icon: "info", title: "Run analysis first", text: "Please run analysis before adding to inventory.", background: "#1e293b", color: "#fff" });
    return;
  }
  if (!selectedCut) {
    Swal.fire({ icon: "info", title: "Select a cut", text: "Please select Round / Emerald / Oval.", background: "#1e293b", color: "#fff" });
    return;
  }

  const { value: formValues } = await Swal.fire({
    title: "Vendor Details",
    html:
      `<input id="swalVendorName" class="swal2-input" placeholder="Vendor name">` +
      `<input id="swalVendorNic" class="swal2-input" placeholder="NIC / ID">` +
      `<input id="swalVendorPhone" class="swal2-input" placeholder="Phone number">`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Add to Inventory",
    background: "#1e293b",
    color: "#fff",
    preConfirm: () => {
      const vendorName = document.getElementById("swalVendorName").value.trim();
      const vendorNicRaw = document.getElementById("swalVendorNic").value.trim();
      const vendorPhoneRaw = document.getElementById("swalVendorPhone").value.trim();

      if (!vendorName || !vendorNicRaw || !vendorPhoneRaw) {
        Swal.showValidationMessage("Please fill all vendor fields.");
        return false;
      }
      if (!isReasonableName(vendorName)) {
        Swal.showValidationMessage("Please enter a valid vendor name (letters and spaces, min 3 characters).");
        return false;
      }
      const vendorNic = normalizeNic(vendorNicRaw);
      if (!isValidSriLankaNIC(vendorNic)) {
        Swal.showValidationMessage("Invalid NIC. Use 9 digits + V/X (old) or 12 digits (new).");
        return false;
      }
      const vendorPhone = normalizePhone(vendorPhoneRaw);
      if (!isValidSriLankaPhone(vendorPhone)) {
        Swal.showValidationMessage("Invalid phone. Use 0XXXXXXXXX or +94XXXXXXXXX.");
        return false;
      }
      return { vendorName, vendorNic, vendorPhone };
    },
  });

  if (!formValues) return;

  // ✅ Build inventory item + auto-generate description, then save into localStorage
  const cutRow = (currentAnalysisResult.cuts || []).find((c) => c.shape === selectedCut) || null;

  const L = num("inputL");
  const W = num("inputW");
  const D = num("inputD");

  const roughShape = $("roughShapeSelect")?.value || "";
  const grades = {
    color: $("colorGradeSelect")?.value || "",
    clarity: $("clarityGradeSelect")?.value || "",
    cut: $("cutGradeSelect")?.value || "",
  };

  const item = {
    id: "GV-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
    source: "analysis",
    gemType: getConfirmedGemType() || "Unknown",
    weightCt: Number(cutRow?.cutWeight ?? currentAnalysisResult.predictedRoughWeight ?? 0) || 0,
    estimatedValue: Number(cutRow?.predictedValue ?? 0) || 0,
    cut: selectedCut || null,
    dimensions: { l: L || null, w: W || null, d: D || null },
    vendor: { name: formValues.vendorName, nic: formValues.vendorNic, phone: formValues.vendorPhone },
    certificate: null,
    description: buildAutoDescription({
      gemType: getConfirmedGemType() || "",
      roughShape,
      grades,
      dimensions: { l: L || null, w: W || null, d: D || null },
      predictedRoughWeight: currentAnalysisResult.predictedRoughWeight,
      selectedCut,
      cutRow,
    }),
    imageDataUrl: currentAnalysisResult.imageDataUrl || "",
    createdAtISO: new Date().toISOString(),
  };

  addToInventory(item);

  Swal.fire({
    icon: "success",
    title: "Added to Inventory",
    text: "Gem saved successfully.",
    background: "#1e293b",
    color: "#fff",
    confirmButtonColor: "#22c55e",
  }).then(() => {
    window.location.href = "inventory.html?added=1";
  });
}
window.triggerVendorPopup = triggerVendorPopup;

// Init
populateGemTypeDropdown();
initAutoRecalc();
setOptimizationEnabled(false);

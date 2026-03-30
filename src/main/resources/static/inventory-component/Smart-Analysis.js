// ===============================
// 1) Vendor validation helpers (Sri Lanka-friendly)
// ===============================
function normalizeNic(nic) {
  return String(nic || "").trim().toUpperCase().replace(/\s+/g, "");
}
function isValidSriLankaNIC(nic) {
  const x = normalizeNic(nic);
  return /^\d{9}[VX]$/.test(x) || /^\d{12}$/.test(x);
}
function normalizePhone(phone) {
  let p = String(phone || "").trim().replace(/[^\d+]/g, "");
  if (p.startsWith("0094")) p = "+94" + p.slice(4);
  if (/^94\d{9}$/.test(p)) p = "+".concat(p);
  return p;
}
function isValidSriLankaPhone(phone) {
  const p = normalizePhone(phone);
  return /^0\d{9}$/.test(p) || /^\+94\d{9}$/.test(p);
}
function isReasonableName(name) {
  const n = String(name || "").trim();
  if (n.length < 3) return false;
  return /^[A-Za-z.\- ]+$/.test(n);
}

// ===============================
// 2) Backend Endpoints (Spring Boot)
// ===============================
const API_BASE = "http://localhost:8080";
const ENDPOINTS = {
  detect: "/api/inventory/analysis/detect",
  run: "/api/inventory/analysis/run",
  save: "/api/inventory/analysis/save"
};

// ===============================
// 3) State & UI Helpers
// ===============================
const currentAnalysisResult = {
  type: null,
  imageDataUrl: "",
  predictedRoughWeight: null,
  sgUsed: null,
  cuts: [],
  recommendedCut: null,
  warnings: [],
};

const GEM_TYPES = ["Diamond", "Ruby", "Sapphire", "Emerald", "Quartz", "Topaz", "Spinel", "Garnet", "Tourmaline", "Amethyst", "Citrine"];

function populateGemTypeDropdown() {
  const select = document.getElementById("confirmedGemType");
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = '<option value="">Select gem type</option>';

  GEM_TYPES.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    select.appendChild(option);
  });

  if (currentValue && GEM_TYPES.includes(currentValue)) {
    select.value = currentValue;
  }
}

function getConfirmedGemType() {
  const confirmed = document.getElementById("confirmedGemType")?.value || "";
  return confirmed || currentAnalysisResult.type || "";
}

let selectedCut = null;

const $ = (id) => document.getElementById(id);

function setText(id, txt) {
  const el = $(id);
  if (el) el.textContent = txt;
}

function setOptimizationEnabled(enabled) {
  const w = $("optimizationWidget");
  if (!w) return;
  if (enabled) {
    w.classList.remove("opacity-50", "blur-sm", "pointer-events-none");
  } else {
    w.classList.add("opacity-50", "blur-sm", "pointer-events-none");
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
  return "LKR " + n.toLocaleString("en-LK", { maximumFractionDigits: 0 });
}

function buildAutoDescription({ gemType, roughShape, grades, dimensions, predictedRoughWeight, selectedCut }) {
  const parts = [];
  if (gemType) parts.push(`${gemType} (Smart Analysis)`);
  if (dimensions && (dimensions.l || dimensions.w || dimensions.d)) {
    parts.push(`Rough size: ${dimensions.l ?? "--"}×${dimensions.w ?? "--"}×${dimensions.d ?? "--"} mm`);
  }
  if (roughShape) parts.push(`Rough shape: ${roughShape}`);
  if (grades) {
    if (grades.color) parts.push(`Color: ${grades.color}`);
    if (grades.clarity) parts.push(`Clarity: ${grades.clarity}`);
    if (grades.cut) parts.push(`Cut grade: ${grades.cut}`);
  }
  if (predictedRoughWeight != null) parts.push(`Predicted rough weight: ${Number(predictedRoughWeight).toFixed(2)} ct`);
  if (selectedCut) parts.push(`Selected cut: ${selectedCut}`);

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
// 4) UI Toggles 
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
// 5) REAL OpenCV / FastAPI Detection
// ===============================
async function simulateOpenCV(input) {
  if (!input.files[0]) return;
  const file = input.files[0];

  if (!file.type.startsWith("image/")) {
    Swal.fire({ icon: "error", title: "Invalid File Format", text: "Please upload an image.", background: "#1e293b", color: "#fff" });
    input.value = "";
    return;
  }

  const placeholder = $("opencv-placeholder");
  const result = $("opencv-result");
  const imagePreview = $("uploadedImagePreview");
  const panel2 = $("dimensionPanel");

  // Show Loading state on image
  placeholder.innerHTML =
      '<i class="fa-solid fa-circle-notch fa-spin text-2xl text-purple-500"></i>' +
      '<p class="text-xs text-purple-300 mt-2">Scanning Image with AI...</p>';
  placeholder.classList.remove("hidden");
  result.classList.add("hidden");

  // Load preview immediately
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.src = e.target.result;
    currentAnalysisResult.imageDataUrl = String(e.target.result || "");
  };
  reader.readAsDataURL(file);

  // Prepare FormData for the backend (CHANGE "file" IF POSTMAN USES A DIFFERENT KEY)
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(API_BASE + ENDPOINTS.detect, {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("Failed to detect gem type");

    // Maps to SmartAnalysisDetectResponseDto.java
    const data = await response.json();

    // Update UI with real AI data
    placeholder.classList.add("hidden");
    result.classList.remove("hidden");

    setText("detectedType", data.detectedGemType);
    setText("confidenceScore", data.confidenceScore + "%");
    panel2.classList.remove("opacity-50", "pointer-events-none");

    currentAnalysisResult.type = data.detectedGemType;
    const confirmedGemType = $("confirmedGemType");
    if (confirmedGemType) {
      // Add it to dropdown if it's new
      if (!Array.from(confirmedGemType.options).some(opt => opt.value === data.detectedGemType)) {
        const opt = document.createElement('option');
        opt.value = data.detectedGemType;
        opt.innerHTML = data.detectedGemType;
        confirmedGemType.appendChild(opt);
      }
      confirmedGemType.value = data.detectedGemType;
    }

    // Reset subsequent states
    setText("roughWeightDisplay", "0.00");
    setText("sgDisplay", "--");
    setText("valRoundWt", "-- ct"); setText("valRoundPrice", "--");
    setText("valEmeraldWt", "-- ct"); setText("valEmeraldPrice", "--");
    setText("valOvalWt", "-- ct"); setText("valOvalPrice", "--");
    setRecommendation("");
    clearRecommendedBadges();
    setWarnings([]);
    selectedCut = null;
    resetCutUI();
    setOptimizationEnabled(false);

  } catch (error) {
    placeholder.innerHTML = `<p class="text-xs text-red-500 mt-2">Error: ${error.message}</p>`;
  }
}
window.simulateOpenCV = simulateOpenCV;

// ===============================
// 6) RUN ANALYSIS
// ===============================
async function runSmartAnalysis() {
  const L = num($("inputL")?.value);
  const W = num($("inputW")?.value);
  const D = num($("inputD")?.value);
  const shape = $("roughShapeSelect")?.value;

  if (!currentAnalysisResult.type) {
    Swal.fire({ icon: "warning", title: "Missing Image", text: "Please upload an image first.", background: "#1e293b", color: "#fff" });
    return;
  }
  if (!L || !W || !D || !shape) {
    Swal.fire({ icon: "warning", title: "Missing Data", text: "Please enter all dimensions and shape.", background: "#1e293b", color: "#fff" });
    return;
  }

  const manualOn = $("toggleManualWeight")?.checked || false;
  const manualCt = manualOn ? num($("manualWeightInput")?.value) : null;

  const requestDto = {
    detectedGemType: currentAnalysisResult.type || "",
    confidenceScore: (parseFloat($("confidenceScore")?.innerText) || 0.98) * 100,
    confirmedGemType: getConfirmedGemType(),
    lengthMm: L,
    widthMm: W,
    depthMm: D,
    roughShape: shape,
    manualWeightOn: manualOn,
    manualWeightCt: manualCt,
    colorGrade: $("colorGradeSelect")?.value || "",
    clarityGrade: $("clarityGradeSelect")?.value || "",
    cutGrade: $("cutGradeSelect")?.value || ""
  };
  currentAnalysisResult.confidenceScore = requestDto.confidenceScore;

  Swal.fire({
    title: 'Analyzing Data...',
    text: 'Calculating optimal cuts...',
    allowOutsideClick: false,
    background: "#1e293b", color: "#fff",
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    const response = await fetch(API_BASE + ENDPOINTS.run, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestDto)
    });

    if (!response.ok) throw new Error("Failed to analyze gem.");

    const data = await response.json();
    Swal.close();

    currentAnalysisResult.predictedRoughWeight = data.finalWeightCt;
    currentAnalysisResult.cuts = data.cutOptions;

    setText("roughWeightDisplay", fmtCt(data.finalWeightCt));
    setText("sgDisplay", `SG: ${data.specificGravityUsed}`);

    if (data.warningTriggered) {
      setWarnings([data.warningMessage]);
    } else {
      setWarnings([]);
    }

    if(data.cutOptions) {
      data.cutOptions.forEach(cut => {
        if (cut.cutShape === "Round") {
          setText("valRoundWt", fmtCt(cut.yieldCt));
          setText("valRoundPrice", fmtMoney(cut.cutValueLkr));
        } else if (cut.cutShape === "Emerald") {
          setText("valEmeraldWt", fmtCt(cut.yieldCt));
          setText("valEmeraldPrice", fmtMoney(cut.cutValueLkr));
        } else if (cut.cutShape === "Oval") {
          setText("valOvalWt", fmtCt(cut.yieldCt));
          setText("valOvalPrice", fmtMoney(cut.cutValueLkr));
        }
      });
    }

    if (data.recommendedCut) {
      markRecommended(data.recommendedCut);
      setRecommendation(`Optimal Yield: ${data.recommendedCut} cut provides the highest return.`);
      selectCut(data.recommendedCut);
    }

    setOptimizationEnabled(true);
    Swal.fire({ icon: "success", title: "Analysis Complete", background: "#1e293b", color: "#fff", timer: 1000, showConfirmButton: false });

  } catch (error) {
    Swal.fire({ icon: "error", title: "Analysis Failed", text: error.message, background: "#1e293b", color: "#fff" });
  }
}
window.runSmartAnalysis = runSmartAnalysis;

// ===============================
// 7) SAVE TO INVENTORY
// ===============================
async function triggerVendorPopup() {
  console.log("My Analysis Result:", currentAnalysisResult);
  if (!currentAnalysisResult.cuts || currentAnalysisResult.cuts.length === 0) {
    Swal.fire({ icon: "info", title: "Run analysis first", background: "#1e293b", color: "#fff" });
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
    background: "#1e293b", color: "#fff",
    preConfirm: () => {
      const vendorName = document.getElementById("swalVendorName").value.trim();
      const vendorNicRaw = document.getElementById("swalVendorNic").value.trim();
      const vendorPhoneRaw = document.getElementById("swalVendorPhone").value.trim();

      if (!vendorName || !vendorNicRaw || !vendorPhoneRaw) {
        Swal.showValidationMessage("Please fill all vendor fields.");
        return false;
      }
      if (!isReasonableName(vendorName)) {
        Swal.showValidationMessage("Please enter a valid vendor name.");
        return false;
      }
      const vendorNic = normalizeNic(vendorNicRaw);
      if (!isValidSriLankaNIC(vendorNic)) {
        Swal.showValidationMessage("Invalid NIC. Use 9 digits + V/X or 12 digits.");
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

  const autoDesc = buildAutoDescription({
    gemType: getConfirmedGemType(),
    roughShape: $("roughShapeSelect")?.value,
    grades: {
      color: $("colorGradeSelect")?.value,
      clarity: $("clarityGradeSelect")?.value,
      cut: $("cutGradeSelect")?.value
    },
    dimensions: { l: num($("inputL").value), w: num($("inputW").value), d: num($("inputD").value) },
    predictedRoughWeight: currentAnalysisResult.predictedRoughWeight,
    selectedCut: selectedCut
  });

  const saveRequestDto = {
    seller: {
      name: formValues.vendorName,
      nic: formValues.vendorNic,
      phone: formValues.vendorPhone
    },
    category: "ROUGH",
    description: autoDesc,
    selectedCutShape: selectedCut,
    analysis: {
      detectedGemType: currentAnalysisResult.type || "",
      confirmedGemType: getConfirmedGemType(),
      confidenceScore: currentAnalysisResult.confidenceScore || 0,
      lengthMm: num($("inputL").value),
      widthMm: num($("inputW").value),
      depthMm: num($("inputD").value),
      roughShape: $("roughShapeSelect")?.value,
      manualWeightOn: $("toggleManualWeight").checked,
      manualWeightCt: num($("manualWeightInput").value),
      colorGrade: $("colorGradeSelect")?.value,
      clarityGrade: $("clarityGradeSelect")?.value,
      cutGrade: $("cutGradeSelect")?.value
    }
  };

  Swal.fire({
    title: 'Saving to Server...',
    allowOutsideClick: false,
    background: "#1e293b", color: "#fff",
    didOpen: () => { Swal.showLoading(); }
  });

  try {
    // === STEP 1: SAVE THE DATA ===
    const saveResponse = await fetch(API_BASE + ENDPOINTS.save, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saveRequestDto)
    });

    if (!saveResponse.ok) throw new Error("Server failed to save the record.");

    const savedData = await saveResponse.json();

    // === STEP 2: UPLOAD THE IMAGE ===
    // ⚠️ Check your HTML: Make sure the ID of your <input type="file"> is exactly "imageInput"
    // If it is different (e.g., "uploadImage"), change "imageInput" below to match it!
    const fileInput = document.getElementById("analysisFile");

    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const formData = new FormData();

      // "file" is the standard parameter name Spring Boot expects.
      formData.append("file", fileInput.files[0]);

      try {
        const imageResponse = await fetch(`${API_BASE}/api/inventory/items/${savedData.inventoryItemId}/images`, {
          method: "POST",
          body: formData
          // Note: DO NOT add { "Content-Type": "multipart/form-data" } here.
          // The browser automatically sets the correct boundaries!
        });

        if (!imageResponse.ok) {
          console.error("Data was saved, but the image upload failed. Check the server logs.");
        }
      } catch (imgError) {
        console.error("Network error while uploading image:", imgError);
      }
    }

    // === STEP 3: SHOW SUCCESS AND RELOAD ===
    Swal.fire({
      icon: "success",
      title: "Saved Successfully",
      text: `Inventory Code: ${savedData.inventoryCode}`,
      background: "#1e293b",
      color: "#fff",
      confirmButtonColor: "#10b981",
    }).then(() => {
      // Reload the page to reset the form
      window.location.reload();
    });

  } catch (error) {
    Swal.fire({ icon: "error", title: "Save Failed", text: error.message, background: "#1e293b", color: "#fff" });
  }
}
window.triggerVendorPopup = triggerVendorPopup;

// ===============================
// Init on load
// ===============================
populateGemTypeDropdown();
setOptimizationEnabled(false);
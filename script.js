/**
 * FarmSmart - Smart Crop Farming Management & Decision Support System
 * Core Application Logic, Calculations, State Management, and Charts
 */

// Application State Structure
let appState = {
    profile: {
        name: "John Kipkorir",
        phone: "+254712345678",
        county: "Uasin Gishu",
        subCounty: "Moiben",
        ward: "Karuna/Meibeki",
        village: "Chepkemel"
    },
    activeSeason: "Long Rains 2026",
    seasons: ["Long Rains 2026", "Short Rains 2026", "Long Rains 2027"],
    farms: [
        { id: "farm_1", name: "Riverside Plot A", size: 4.5, altitude: 2100, soilType: "Clay Loam", drainage: "Well Drained", irrigation: "Rainfed Only", mainCrops: "Maize, Beans" },
        { id: "farm_2", name: "Hilltop Field B", size: 3.0, altitude: 2250, soilType: "Volcanic Ash", drainage: "Well Drained", irrigation: "Supplemental Irrigation", mainCrops: "Potatoes, Wheat" }
    ],
    activities: [
        { id: "act_1", date: "2026-03-02", farmId: "farm_1", season: "Long Rains 2026", category: "Land Preparation", area: 4.5, materials: "Diesel, Tractor Hire", labour: 4000, totalCost: 12000, remarks: "Primary ploughing completed" },
        { id: "act_2", date: "2026-03-15", farmId: "farm_1", season: "Long Rains 2026", category: "Planting", area: 4.5, materials: "Certified H614 Maize Seed", labour: 3500, totalCost: 14500, remarks: "Planted with DAP basal fertilizer" },
        { id: "act_3", date: "2026-04-10", farmId: "farm_1", season: "Long Rains 2026", category: "Fertilizer Application", area: 4.5, materials: "CAN Top dress", labour: 2000, totalCost: 11000, remarks: "First top dressing applied" }
    ],
    budgets: [
        { id: "bud_1", category: "Land Preparation", desc: "Tractor ploughing 4.5 acres", qty: 4.5, price: 2500, total: 11250 },
        { id: "bud_2", category: "Seeds", desc: "Certified Hybrid Maize (H614) 10kg bags", qty: 4, price: 3800, total: 15200 },
        { id: "bud_3", category: "Fertilizers", desc: "DAP Fertilizer 50kg bags", qty: 5, price: 6200, total: 31000 },
        { id: "bud_4", category: "Fertilizers", desc: "CAN Fertilizer 50kg bags", qty: 4, price: 4500, total: 18000 },
        { id: "bud_5", category: "Labour", desc: "Planting & Weeding casual labour", qty: 1, price: 12000, total: 12000 }
    ],
    harvests: [
        { id: "har_1", date: "2026-09-20", farmId: "farm_1", crop: "Maize", area: 4.5, actualYield: 13500, sold: 10000, stored: 3200, losses: 300 }
    ],
    storageRecords: [
        { id: "str_1", date: "2026-09-22", facility: "Metallic Silo 30 bags", qtyStored: 3200, moisture: 13.5, packaging: "Purdue bags / Hermetic", treatment: "Actellic Super Dust", remaining: 3200 }
    ],
    weedRecords: [
        { id: "weed_1", date: "2026-04-05", farmId: "farm_1", method: "Chemical & Hand", product: "Selective Broadleaf Herbicide", area: 4.5, cost: 3500, remarks: "Post-emergence weeding" }
    ],
    pestRecords: [
        { id: "pest_1", date: "2026-04-20", farmId: "farm_1", pest: "Fall Armyworm (Spodoptera frugiperda)", method: "Chemical Control", product: "Emamectin Benzoate", cost: 2800, remarks: "Spot spraying conducted" }
    ],
    soilTests: []
};

// Certified Varieties Reference DB (KALRO / KEPHIS Guidelines)
const varietyDatabase = {
    "Maize": [
        { variety: "H614D / H628", category: "High Altitude Certified Hybrid", altitude: "1800 - 2400m", rainfall: "High (1000-1500mm)", maturity: "160-180 days", yield: "30 - 40 bags/acre", source: "KALRO Kitale / KEPHIS" },
        { variety: "DK 8031 / Pannar 779", category: "Medium Altitude Hybrid", altitude: "1200 - 1800m", rainfall: "Moderate (800-1200mm)", maturity: "130-140 days", yield: "28 - 35 bags/acre", source: "Commercial Seed Producers" },
        { variety: "DH04 / WH 505", category: "Dryland / Drought Tolerant Composite", altitude: "Below 1200m", rainfall: "Low (450-750mm)", maturity: "105-120 days", yield: "15 - 22 bags/acre", source: "KALRO Katumani" }
    ],
    "Beans": [
        { variety: "GLP 2 (Rosecoco) / GLP 585 (Wairimu)", category: "Certified Climbing / Bush Bean", altitude: "1000 - 2100m", rainfall: "Moderate", maturity: "75-90 days", yield: "8 - 12 bags/acre", source: "KALRO Thika" },
        { variety: "Nyota / KAT B1", category: "Drought Tolerant Bean", altitude: "Below 1600m", rainfall: "Low to Moderate", maturity: "65-75 days", yield: "7 - 10 bags/acre", source: "KALRO Katumani" }
    ],
    "Potatoes": [
        { variety: "Shangi", category: "Early Maturing Commercial Potato", altitude: "1800 - 2800m", rainfall: "High", maturity: "90 days", yield: "90 - 120 bags/acre (50kg)", source: "KALRO Tigoni" },
        { variety: "Dutch Robijn / Asante", category: "Late Blight Tolerant", altitude: "1700 - 2600m", rainfall: "Moderate-High", maturity: "110 days", yield: "100 - 130 bags/acre", source: "KEPHIS Certified" }
    ]
};

// Chart instances
let costChartInstance = null;
let yieldChartInstance = null;
let profitChartInstance = null;

document.addEventListener("DOMContentLoaded", () => {
    loadStateFromLocalStorage();
    initializeAppUI();
    setupEventListeners();
    renderAllModules();
    updateDashboardCharts();
});

// Load / Save LocalStorage
function loadStateFromLocalStorage() {
    const saved = localStorage.getItem("farmsmart_app_state");
    if (saved) {
        try {
            appState = JSON.parse(saved);
        } catch (e) {
            console.error("Error loading saved state, using default demo data.", e);
        }
    }
}

function saveStateToLocalStorage() {
    localStorage.setItem("farmsmart_app_state", JSON.stringify(appState));
}

// Navigation & UI setup
function initializeAppUI() {
    // Populate Season dropdowns
    populateSeasonDropdowns();
    
    // Set profile fields
    document.getElementById("profName").value = appState.profile.name || "";
    document.getElementById("profPhone").value = appState.profile.phone || "";
    document.getElementById("profCounty").value = appState.profile.county || "";
    document.getElementById("profSubCounty").value = appState.profile.subCounty || "";
    document.getElementById("profWard").value = appState.profile.ward || "";
    document.getElementById("profVillage").value = appState.profile.village || "";

    updateHeaderDisplay();
}

function populateSeasonDropdowns() {
    const activeSel = document.getElementById("activeSeasonSelect");
    activeSel.innerHTML = "";
    appState.seasons.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s;
        opt.textContent = s;
        if (s === appState.activeSeason) opt.selected = true;
        activeSel.appendChild(opt);
    });

    // Populate season checkboxes for comparison
    const chkContainer = document.getElementById("seasonCheckboxes");
    if (chkContainer) {
        chkContainer.innerHTML = "";
        appState.seasons.forEach(s => {
            const label = document.createElement("label");
            label.style.marginRight = "15px";
            label.innerHTML = `<input type="checkbox" value="${s}" checked> ${s}`;
            chkContainer.appendChild(label);
        });
    }
}

function updateHeaderDisplay() {
    if (appState.farms.length > 0) {
        document.getElementById("currentFarmNameHeader").textContent = `${appState.farms[0].name} (${appState.farms[0].size} Acres)`;
    } else {
        document.getElementById("currentFarmNameHeader").textContent = "No Farm Registered";
    }
    document.getElementById("repGenDate").textContent = "Generated on: " + new Date().toLocaleDateString();
}

function setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll(".sidebar-nav li").forEach(item => {
        item.addEventListener("click", (e) => {
            document.querySelectorAll(".sidebar-nav li").forEach(i => i.classList.remove("active"));
            document.querySelectorAll(".app-section").forEach(s => s.classList.remove("active"));
            
            item.classList.add("active");
            const target = item.getAttribute("data-target");
            const targetSec = document.getElementById(`sec-${target}`);
            if (targetSec) {
                targetSec.classList.add("active");
                document.getElementById("pageTitle").textContent = item.textContent.trim();
            }
            if (window.innerWidth <= 992) {
                document.getElementById("sidebar").classList.remove("mobile-open");
            }
        });
    });

    // Sidebar Toggle for mobile
    document.getElementById("sidebarToggle").addEventListener("click", () => {
        document.getElementById("sidebar").classList.toggle("mobile-open");
    });

    // Active Season Change
    document.getElementById("activeSeasonSelect").addEventListener("change", (e) => {
        appState.activeSeason = e.target.value;
        saveStateToLocalStorage();
        renderAllModules();
    });

    // Global Add Quick Record Button
    document.getElementById("globalAddBtn").addEventListener("click", () => {
        openActivityModal();
    });

    // Profile Form Save
    document.getElementById("profileForm").addEventListener("submit", (e) => {
        e.preventDefault();
        appState.profile = {
            name: document.getElementById("profName").value,
            phone: document.getElementById("profPhone").value,
            county: document.getElementById("profCounty").value,
            subCounty: document.getElementById("profSubCounty").value,
            ward: document.getElementById("profWard").value,
            village: document.getElementById("profVillage").value
        };
        saveStateToLocalStorage();
        alert("Farmer profile saved successfully!");
    });

    // Farm Modal
    document.getElementById("openAddFarmModal").addEventListener("click", () => openFarmModal());
    document.getElementById("closeFarmModal").addEventListener("click", () => closeModals());
    document.getElementById("farmForm").addEventListener("submit", handleSaveFarm);

    // Activity Modal
    document.getElementById("openAddOpModal").addEventListener("click", () => openActivityModal());
    document.getElementById("closeActivityModal").addEventListener("click", () => closeModals());
    document.getElementById("activityForm").addEventListener("submit", handleSaveActivity);

    // Budget Item Modal
    document.getElementById("openAddBudgetItemModal").addEventListener("click", () => {
        document.getElementById("budgetItemModal").classList.add("active");
    });
    document.getElementById("closeBudgetItemModal").addEventListener("click", () => closeModals());
    document.getElementById("budgetItemForm").addEventListener("submit", handleSaveBudgetItem);

    // Calculators & Forms
    document.getElementById("cropRecForm").addEventListener("submit", handleCropRecommendation);
    document.getElementById("seedCalcForm").addEventListener("submit", handleSeedCalculation);
    document.getElementById("fertForm").addEventListener("submit", handleFertilizerCalculation);
    document.getElementById("soilForm").addEventListener("submit", handleSoilAnalysis);

    // Report Actions
    document.getElementById("printReportBtn").addEventListener("click", () => window.print());
    document.getElementById("exportCsvBtn").addEventListener("click", exportRecordsCSV);
    document.getElementById("exportJsonBtn").addEventListener("click", exportProjectJSON);
    document.getElementById("restoreJsonBtn").addEventListener("click", restoreProjectJSON);
    document.getElementById("resetDataBtn").addEventListener("click", resetToDemoData);
    
    // Season comparison
    const compBtn = document.getElementById("compareSeasonsBtn");
    if (compBtn) compBtn.addEventListener("click", renderSeasonComparison);
}

// Render All Modules
function renderAllModules() {
    renderFarmsTable();
    renderOperationsTable();
    renderBudgetTable();
    renderHarvestTable();
    renderStorageTable();
    renderWeedTable();
    renderPestTable();
    renderChronologicalRecords();
    renderProfitLoss();
    updateDashboardStats();
    updateDashboardCharts();
    populateFarmSelects();
    renderReportPreview();
}

function populateFarmSelects() {
    const selects = ["recFarmSelect", "soilFarmSelect", "actFarmSelect"];
    selects.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = "";
            appState.farms.forEach(f => {
                const opt = document.createElement("option");
                opt.value = f.id;
                opt.textContent = `${f.name} (${f.size} acres)`;
                el.appendChild(opt);
            });
        }
    });
}

// --- 3. FARM MANAGEMENT ---
function openFarmModal(farm = null) {
    const modal = document.getElementById("farmModal");
    const title = document.getElementById("farmModalTitle");
    if (farm) {
        title.textContent = "Edit Farm Parcel";
        document.getElementById("farmId").value = farm.id;
        document.getElementById("fName").value = farm.name;
        document.getElementById("fSize").value = farm.size;
        document.getElementById("fAltitude").value = farm.altitude;
        document.getElementById("fSoilType").value = farm.soilType;
        document.getElementById("fDrainage").value = farm.drainage;
        document.getElementById("fIrrigation").value = farm.irrigation;
        document.getElementById("fMainCrops").value = farm.mainCrops;
    } else {
        title.textContent = "Add New Farm";
        document.getElementById("farmId").value = "";
        document.getElementById("farmForm").reset();
    }
    modal.classList.add("active");
}

function handleSaveFarm(e) {
    e.preventDefault();
    const id = document.getElementById("farmId").value;
    const farmData = {
        id: id || "farm_" + Date.now(),
        name: document.getElementById("fName").value,
        size: parseFloat(document.getElementById("fSize").value),
        altitude: parseInt(document.getElementById("fAltitude").value) || 2000,
        soilType: document.getElementById("fSoilType").value,
        drainage: document.getElementById("fDrainage").value,
        irrigation: document.getElementById("fIrrigation").value,
        mainCrops: document.getElementById("fMainCrops").value
    };

    if (id) {
        const idx = appState.farms.findIndex(f => f.id === id);
        if (idx !== -1) appState.farms[idx] = farmData;
    } else {
        appState.farms.push(farmData);
    }

    saveStateToLocalStorage();
    closeModals();
    renderAllModules();
}

function renderFarmsTable() {
    const tbody = document.querySelector("#farmsTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    appState.farms.forEach(f => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${f.name}</strong></td>
            <td>${f.size} Acres</td>
            <td>${f.altitude} m</td>
            <td>${f.soilType}</td>
            <td>${f.drainage}</td>
            <td>${f.irrigation}</td>
            <td>${f.mainCrops}</td>
            <td>
                <button class="btn btn-primary btn-sm" onclick="editFarm('${f.id}')"><i class="fa-solid fa-pen"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteFarm('${f.id}')"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.editFarm = function(id) {
    const farm = appState.farms.find(f => f.id === id);
    if (farm) openFarmModal(farm);
}

window.deleteFarm = function(id) {
    if (confirm("Are you sure you want to delete this farm?")) {
        appState.farms = appState.farms.filter(f => f.id !== id);
        saveStateToLocalStorage();
        renderAllModules();
    }
}

// --- 4. CROP & SEED SELECTION MODULE ---
function handleCropRecommendation(e) {
    e.preventDefault();
    const cropType = document.getElementById("recCropType").value;
    const container = document.getElementById("cropRecResultsContainer");
    const resultsCard = document.getElementById("cropRecResultsCard");
    
    const varieties = varietyDatabase[cropType] || [
        { variety: `${cropType} Standard Certified Variety`, category: "Certified Quality Seed", altitude: "Adaptable", rainfall: "Moderate", maturity: "90-120 days", yield: "15 - 25 bags/acre", source: "KEPHIS Standards" }
    ];

    let html = `<p><strong>Recommended Varieties for ${cropType} based on KALRO / KEPHIS standards:</strong></p>`;
    html += `<div class="table-responsive mt-2"><table class="data-table"><thead><tr><th>Variety</th><th>Category</th><th>Altitude Range</th><th>Rainfall</th><th>Maturity</th><th>Expected Yield</th><th>Source</th></tr></thead><tbody>`;
    
    varieties.forEach(v => {
        html += `<tr>
            <td><strong>${v.variety}</strong></td>
            <td><span class="badge bg-green">${v.category}</span></td>
            <td>${v.altitude}</td>
            <td>${v.rainfall}</td>
            <td>${v.maturity}</td>
            <td><strong>${v.yield}</strong></td>
            <td>${v.source}</td>
        </tr>`;
    });
    html += `</tbody></table></div>`;

    container.innerHTML = html;
    resultsCard.style.display = "block";
}

// --- 5. SEED RATE & SPACING CALCULATOR ---
function handleSeedCalculation(e) {
    e.preventDefault();
    const areaAcres = parseFloat(document.getElementById("scArea").value);
    const rowSpaceCm = parseFloat(document.getElementById("scRowSpace").value);
    const plantSpaceCm = parseFloat(document.getElementById("scPlantSpace").value);
    const seedsPerStation = parseInt(document.getElementById("scSeedsPerStation").value);
    const germRate = parseFloat(document.getElementById("scGermRate").value) / 100;
    const estRate = parseFloat(document.getElementById("scEstRate").value) / 100;
    const weight1000 = parseFloat(document.getElementById("scSeedWeight1000").value) || 350;

    // Formulas
    const areaM2 = areaAcres * 4046.8564224;
    const rowSpaceM = rowSpaceCm / 100;
    const plantSpaceM = plantSpaceCm / 100;
    const plantingStations = areaM2 / (rowSpaceM * plantSpaceM);
    const theoreticalSeeds = plantingStations * seedsPerStation;
    const adjustedSeeds = theoreticalSeeds / (germRate * estRate);
    const seedMassKg = (adjustedSeeds * weight1000) / 1000000;
    const seedPerAcreKg = seedMassKg / areaAcres;

    const container = document.getElementById("seedCalcResultsContainer");
    const resCard = document.getElementById("seedCalcResultsCard");

    container.innerHTML = `
        <div class="result-item-box"><h4>Farm Area</h4><p>${areaAcres} Acres (${areaM2.toFixed(1)} m²)</p></div>
        <div class="result-item-box"><h4>Planting Stations</h4><p>${Math.round(plantingStations).toLocaleString()}</p></div>
        <div class="result-item-box"><h4>Theoretical Plant Pop.</h4><p>${Math.round(theoreticalSeeds).toLocaleString()} plants</p></div>
        <div class="result-item-box"><h4>Adjusted Est. Population</h4><p>${Math.round(theoreticalSeeds * germRate * estRate).toLocaleString()} plants</p></div>
        <div class="result-item-box"><h4>Total Seeds Required</h4><p>${Math.round(adjustedSeeds).toLocaleString()} seeds</p></div>
        <div class="result-item-box"><h4>Total Seed Mass</h4><p><strong>${seedMassKg.toFixed(2)} kg</strong> (${seedPerAcreKg.toFixed(2)} kg/acre)</p></div>
    `;
    resCard.style.display = "block";
}

// --- 6. SOIL TEST RESULTS & RECOMMENDATION ---
function handleSoilAnalysis(e) {
    e.preventDefault();
    const ph = parseFloat(document.getElementById("soilPh").value) || 6.2;
    const oc = parseFloat(document.getElementById("soilOc").value) || 2.1;
    const n = parseFloat(document.getElementById("soilN").value) || 0.16;
    const p = parseFloat(document.getElementById("soilP").value) || 14.0;
    const k = parseFloat(document.getElementById("soilK").value) || 0.5;
    const texture = document.getElementById("soilTexture").value;

    let interpretations = [];
    
    if (ph < 5.5) {
        interpretations.p = { status: "Strongly Acidic", action: "Apply agricultural lime at 2 tons per acre to raise pH and neutralize toxic aluminum." };
    } else if (ph > 7.5) {
        interpretations.p = { status: "Alkaline", action: "Apply organic manure or elemental sulphur to improve nutrient availability." };
    } else {
        interpretations.p = { status: "Optimal (Favorable)", action: "Maintain pH with regular compost incorporation." };
    }

    if (p < 10) {
        interpretations.p_status = { status: "Deficient in Phosphorus", action: "Apply DAP or TSP fertilizer during planting at 50kg per acre." };
    } else {
        interpretations.p_status = { status: "Adequate Phosphorus", action: "Standard maintenance fertilization recommended." };
    }

    const container = document.getElementById("soilInterpretationContainer");
    document.getElementById("soilAnalysisResults").style.display = "block";

    container.innerHTML = `
        <div class="table-responsive">
            <table class="data-table">
                <thead><tr><th>Parameter</th><th>Result Value</th><th>Interpretation</th><th>Agronomic Action</th></tr></thead>
                <tbody>
                    <tr><td><strong>Soil pH</strong></td><td>${ph}</td><td><span class="badge bg-blue">${interpretations.p.status}</span></td><td>${interpretations.p.action}</td></tr>
                    <tr><td><strong>Organic Carbon</strong></td><td>${oc}%</td><td>${oc < 2.0 ? 'Low Organic Matter' : 'Good Organic Carbon'}</td><td>${oc < 2.0 ? 'Incorporate farmyard manure (5-10 tons/acre)' : 'Maintain cover cropping'}</td></tr>
                    <tr><td><strong>Available Phosphorus</strong></td><td>${p} ppm</td><td><span class="badge bg-green">${interpretations.p_status.status}</span></td><td>${interpretations.p_status.action}</td></tr>
                    <tr><td><strong>Exchangeable Potassium</strong></td><td>${k} me%</td><td>${k < 0.3 ? 'Potassium Deficient' : 'Adequate Potassium'}</td><td>${k < 0.3 ? 'Apply Muriate of Potash (MOP)' : 'Standard crop management'}</td></tr>
                    <tr><td><strong>Soil Texture</strong></td><td>${texture}</td><td>Optimal drainage profile</td><td>Ensure proper contour tillage to prevent soil erosion.</td></tr>
                </tbody>
            </table>
        </div>
    `;
}

// --- 7. FERTILIZER PLANNER ---
function handleFertilizerCalculation(e) {
    e.preventDefault();
    const acreage = parseFloat(document.getElementById("fertAcreage").value);
    const fertType = document.getElementById("fertType").value;
    const ratePerAcre = parseFloat(document.getElementById("fertRate").value);
    const priceBag = parseFloat(document.getElementById("fertPriceBag").value);

    const totalKg = acreage * ratePerAcre;
    const bagsRequired = Math.ceil(totalKg / 50);
    const totalCost = bagsRequired * priceBag;

    const container = document.getElementById("fertResultsContainer");
    document.getElementById("fertResultsCard").style.display = "block";

    container.innerHTML = `
        <div class="results-grid">
            <div class="result-item-box"><h4>Total Fertilizer Required</h4><p>${totalKg.toFixed(1)} kg</p></div>
            <div class="result-item-box"><h4>50kg Bags Required</h4><p>${bagsRequired} Bags</p></div>
            <div class="result-item-box"><h4>Total Estimated Cost</h4><p><strong>KES ${totalCost.toLocaleString()}</strong></p></div>
        </div>
        <div class="mt-3">
            <p><strong>Application Schedule Recommendation:</strong></p>
            <p>Apply ${fertType === 'CAN' || fertType === 'Urea' ? 'as top dressing when plants are 30-45 cm high with adequate soil moisture.' : 'at planting time in planting furrows, ensuring fertilizer is separated from seeds by a 5cm soil layer.'}</p>
        </div>
    `;
}

// --- 8 & 10. FARM OPERATIONS & ACTIVITY LOG ---
function openActivityModal() {
    document.getElementById("activityModal").classList.add("active");
}

function handleSaveActivity(e) {
    e.preventDefault();
    const actData = {
        id: "act_" + Date.now(),
        date: document.getElementById("actDate").value,
        farmId: document.getElementById("actFarmSelect").value,
        season: appState.activeSeason,
        category: document.getElementById("actCategory").value,
        area: parseFloat(document.getElementById("actArea").value),
        materials: document.getElementById("actMaterials").value,
        labour: parseFloat(document.getElementById("actLabourCost").value) || 0,
        totalCost: parseFloat(document.getElementById("actTotalCost").value) || 0,
        remarks: document.getElementById("actRemarks").value
    };

    appState.activities.push(actData);
    saveStateToLocalStorage();
    closeModals();
    renderAllModules();
}

function renderOperationsTable() {
    const tbody = document.querySelector("#operationsTable tbody");
    const dashTbody = document.querySelector("#dashboardOperationsTable tbody");
    if (!tbody) return;
    
    tbody.innerHTML = "";
    if (dashTbody) dashTbody.innerHTML = "";

    appState.activities.filter(a => a.season === appState.activeSeason).forEach((a, idx) => {
        const farm = appState.farms.find(f => f.id === a.farmId);
        const farmName = farm ? farm.name : "General Farm";
        
        const rowHTML = `
            <td>${a.date}</td>
            <td>${farmName}</td>
            <td><span class="badge bg-blue">${a.category}</span></td>
            <td>${a.area} Acres</td>
            <td>KES ${a.labour.toLocaleString()}</td>
            <td>${a.materials || '-'}</td>
            <td><strong>KES ${a.totalCost.toLocaleString()}</strong></td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteActivity('${a.id}')"><i class="fa-solid fa-trash"></i></button></td>
        `;
        
        const tr = document.createElement("tr");
        tr.innerHTML = rowHTML;
        tbody.appendChild(tr);

        if (dashTbody && idx < 5) {
            const dashTr = document.createElement("tr");
            dashTr.innerHTML = `<td>${a.date}</td><td>${farmName}</td><td>${a.category}</td><td>KES ${a.totalCost.toLocaleString()}</td>`;
            dashTbody.appendChild(dashTr);
        }
    });
}

window.deleteActivity = function(id) {
    appState.activities = appState.activities.filter(a => a.id !== id);
    saveStateToLocalStorage();
    renderAllModules();
}

// --- 11. BUDGET & EXPENSES ---
function handleSaveBudgetItem(e) {
    e.preventDefault();
    const item = {
        id: "bud_" + Date.now(),
        category: document.getElementById("biCategory").value,
        desc: document.getElementById("biDesc").value,
        qty: parseFloat(document.getElementById("biQty").value),
        price: parseFloat(document.getElementById("biPrice").value),
        total: parseFloat(document.getElementById("biQty").value) * parseFloat(document.getElementById("biPrice").value)
    };
    appState.budgets.push(item);
    saveStateToLocalStorage();
    closeModals();
    renderAllModules();
}

function renderBudgetTable() {
    const tbody = document.querySelector("#budgetTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    let totalProdCost = 0;
    appState.budgets.forEach(b => {
        totalProdCost += b.total;
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${b.category}</td>
            <td>${b.desc}</td>
            <td>${b.qty}</td>
            <td>KES ${b.price.toLocaleString()}</td>
            <td><strong>KES ${b.total.toLocaleString()}</strong></td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteBudget('${b.id}')"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });

    const totalAcreage = appState.farms.reduce((acc, f) => acc + f.size, 0) || 1;
    document.getElementById("budTotalCost").textContent = "KES " + totalProdCost.toLocaleString();
    document.getElementById("budCostPerAcre").textContent = "KES " + Math.round(totalProdCost / totalAcreage).toLocaleString();
    document.getElementById("budExpectedRev").textContent = "KES " + (totalProdCost * 1.6).toLocaleString(); // Estimated 60% gross margin
}

window.deleteBudget = function(id) {
    appState.budgets = appState.budgets.filter(b => b.id !== id);
    saveStateToLocalStorage();
    renderAllModules();
}

// --- 12. HARVEST & STORAGE ---
function renderHarvestTable() {
    const tbody = document.querySelector("#harvestTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    appState.harvests.forEach(h => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${h.date}</td>
            <td>${h.crop}</td>
            <td>${h.area} Acres</td>
            <td><strong>${h.actualYield.toLocaleString()} kg</strong></td>
            <td>${h.sold.toLocaleString()} kg</td>
            <td>${h.stored.toLocaleString()} kg</td>
            <td>${h.losses.toLocaleString()} kg</td>
            <td><button class="btn btn-danger btn-sm" onclick="deleteHarvest('${h.id}')"><i class="fa-solid fa-trash"></i></button></td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteHarvest = function(id) {
    appState.harvests = appState.harvests.filter(h => h.id !== id);
    saveStateToLocalStorage();
    renderAllModules();
}

function renderStorageTable() {
    const tbody = document.querySelector("#storageTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    appState.storageRecords.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${s.date}</td>
            <td>${s.facility}</td>
            <td><strong>${s.qtyStored.toLocaleString()} kg</strong></td>
            <td>${s.moisture}%</td>
            <td>${s.packaging}</td>
            <td>${s.treatment}</td>
            <td>${s.remaining.toLocaleString()} kg</td>
        `;
        tbody.appendChild(tr);
    });
}

function renderWeedTable() {
    const tbody = document.querySelector("#weedTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    appState.weedRecords.forEach(w => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${w.date}</td><td>Farm A</td><td>${w.method}</td><td>${w.product}</td><td>${w.area} Acres</td><td>KES ${w.cost.toLocaleString()}</td><td>-</td>`;
        tbody.appendChild(tr);
    });
}

function renderPestTable() {
    const tbody = document.querySelector("#pestTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    appState.pestRecords.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${p.date}</td><td>Maize / Farm A</td><td>${p.pest}</td><td>${p.method}</td><td>${p.product}</td><td>KES ${p.cost.toLocaleString()}</td><td>-</td>`;
        tbody.appendChild(tr);
    });
}

function renderChronologicalRecords() {
    const tbody = document.querySelector("#chronologicalTable tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    appState.activities.forEach(a => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td>${a.date}</td><td>${a.season}</td><td>Farm A</td><td>${a.category}</td><td>${a.materials || a.remarks || '-'}</td><td>KES ${a.totalCost.toLocaleString()}</td>`;
        tbody.appendChild(tr);
    });
}

// --- 15. PROFIT & LOSS ANALYSIS ENGINE ---
function renderProfitLoss() {
    const container = document.getElementById("pnlContainer");
    if (!container) return;

    const totalCost = appState.budgets.reduce((acc, b) => acc + b.total, 0);
    const totalYieldKg = appState.harvests.reduce((acc, h) => acc + h.actualYield, 0) || 13500;
    const sellingPricePerKg = 45; // KES 45 per kg maize average
    const grossRevenue = totalYieldKg * sellingPricePerKg;
    const netProfit = grossRevenue - totalCost;
    const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
    const costPerKg = totalCost / totalYieldKg;
    const breakEvenYield = totalCost / sellingPricePerKg;

    container.innerHTML = `
        <div class="result-item-box"><h4>Total Production Cost</h4><p>KES ${totalCost.toLocaleString()}</p></div>
        <div class="result-item-box"><h4>Total Harvested Yield</h4><p>${totalYieldKg.toLocaleString()} kg</p></div>
        <div class="result-item-box"><h4>Gross Revenue (@ KES 45/kg)</h4><p>KES ${grossRevenue.toLocaleString()}</p></div>
        <div class="result-item-box" style="background: ${netProfit >= 0 ? 'var(--accent-light)' : '#f8d7da'};">
            <h4>Net Profit / Loss</h4>
            <p style="color: ${netProfit >= 0 ? 'var(--primary)' : 'var(--danger)'};">KES ${netProfit.toLocaleString()}</p>
        </div>
        <div class="result-item-box"><h4>Return on Investment (ROI)</h4><p>${roi.toFixed(1)}%</p></div>
        <div class="result-item-box"><h4>Cost per Kilogram Produced</h4><p>KES ${costPerKg.toFixed(2)}</p></div>
        <div class="result-item-box"><h4>Break-Even Yield</h4><p>${Math.round(breakEvenYield).toLocaleString()} kg</p></div>
    `;
}

// --- 16. MULTI-SEASON COMPARISON ---
function renderSeasonComparison() {
    const container = document.getElementById("seasonComparisonResults");
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Performance Metric</th>
                    <th>Long Rains 2026 (Active)</th>
                    <th>Short Rains 2025</th>
                </tr>
            </thead>
            <tbody>
                <tr><td><strong>Total Production Cost</strong></td><td>KES 77,450</td><td>KES 64,200</td></tr>
                <tr><td><strong>Total Yield (kg)</strong></td><td>13,500 kg</td><td>11,200 kg</td></tr>
                <tr><td><strong>Yield per Acre</strong></td><td>3,000 kg/acre</td><td>2,488 kg/acre</td></tr>
                <tr><td><strong>Gross Revenue</strong></td><td>KES 607,500</td><td>KES 470,400</td></tr>
                <tr><td><strong>Net Profit</strong></td><td><span class="badge bg-green">KES 530,050</span></td><td><span class="badge bg-green">KES 406,200</span></td></tr>
                <tr><td><strong>ROI (%)</strong></td><td>684.4%</td><td>632.7%</td></tr>
            </tbody>
        </table>
    `;
}

// --- DASHBOARD CHARTS ---
function updateDashboardStats() {
    document.getElementById("statTotalFarms").textContent = appState.farms.length;
    const totalAcreage = appState.farms.reduce((acc, f) => acc + f.size, 0);
    document.getElementById("statTotalAcreage").textContent = totalAcreage.toFixed(1);
    
    const totalExp = appState.budgets.reduce((acc, b) => acc + b.total, 0);
    document.getElementById("statTotalExpenses").textContent = "KES " + totalExp.toLocaleString();
    
    const yieldKg = appState.harvests.reduce((acc, h) => acc + h.actualYield, 0) || 13500;
    const netProfit = (yieldKg * 45) - totalExp;
    document.getElementById("statNetProfit").textContent = "KES " + netProfit.toLocaleString();
}

function updateDashboardCharts() {
    // 1. Cost Distribution Chart
    const ctxCost = document.getElementById("chartCostDistribution");
    if (ctxCost) {
        if (costChartInstance) costChartInstance.destroy();
        costChartInstance = new Chart(ctxCost, {
            type: 'doughnut',
            data: {
                labels: ['Land Prep', 'Seeds', 'Fertilizers', 'Labour', 'Crop Protection'],
                datasets: [{
                    data: [12000, 15200, 49000, 12000, 6300],
                    backgroundColor: ['#2d6a4f', '#52b788', '#74c69d', '#95d5b2', '#1b4332']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // 2. Expected vs Actual Yield Chart
    const ctxYield = document.getElementById("chartYieldComparison");
    if (ctxYield) {
        if (yieldChartInstance) yieldChartInstance.destroy();
        yieldChartInstance = new Chart(ctxYield, {
            type: 'bar',
            data: {
                labels: ['Maize (Riverside A)', 'Beans (Plot B)'],
                datasets: [
                    { label: 'Expected Yield (kg)', data: [12000, 2500], backgroundColor: '#74c69d' },
                    { label: 'Actual Yield (kg)', data: [13500, 2800], backgroundColor: '#2d6a4f' }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    // 3. Seasonal Profitability Chart
    const ctxProfit = document.getElementById("chartSeasonalProfit");
    if (ctxProfit) {
        if (profitChartInstance) profitChartInstance.destroy();
        profitChartInstance = new Chart(ctxProfit, {
            type: 'line',
            data: {
                labels: ['Short Rains 2025', 'Long Rains 2026 (Active)'],
                datasets: [{
                    label: 'Net Profit (KES)',
                    data: [406200, 530050],
                    borderColor: '#2d6a4f',
                    backgroundColor: 'rgba(82, 183, 136, 0.2)',
                    fill: true,
                    tension: 0.2
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }
}

// --- REPORTS & EXPORTS ---
function renderReportPreview() {
    const container = document.getElementById("repBodyContent");
    if (!container) return;
    
    container.innerHTML = `
        <h3>1. Farmer & Farm Details</h3>
        <p><strong>Farmer Name:</strong> ${appState.profile.name} | <strong>Phone:</strong> ${appState.profile.phone}</p>
        <p><strong>Location:</strong> ${appState.profile.county} County, ${appState.profile.subCounty} Sub-County, ${appState.profile.ward} Ward</p>
        <p><strong>Registered Farms:</strong> ${appState.farms.length} Farm(s) | Total Acreage: ${appState.farms.reduce((a,b)=>a+b.size,0)} Acres</p>
        <hr class="mt-2 mb-2">
        <h3>2. Active Season Performance (${appState.activeSeason})</h3>
        <p><strong>Total Expenditure:</strong> KES ${appState.budgets.reduce((a,b)=>a+b.total,0).toLocaleString()}</p>
        <p><strong>Total Harvested Yield:</strong> ${appState.harvests.reduce((a,b)=>a+b.actualYield,0).toLocaleString()} kg</p>
        <p><strong>Estimated Net Profit:</strong> KES 530,050 (ROI: 684.4%)</p>
        <hr class="mt-2 mb-2">
        <h3>3. Agronomic Recommendations</h3>
        <p>• Certified seeds recommended: H614D Hybrid Maize for high altitude conditions.</p>
        <p>• Soil nutrient management: Apply DAP at planting and CAN for top dressing.</p>
    `;
}

function exportRecordsCSV() {
    let csvContent = "data:text/csv;charset=utf-8,Date,Category,Description,Cost\n";
    appState.activities.forEach(a => {
        csvContent += `${a.date},${a.category},"${a.materials || ''}",${a.totalCost}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "farmsmart_activities_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportProjectJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "farmsmart_project_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function restoreProjectJSON(e) {
    const fileInput = document.getElementById("restoreJsonInput");
    if (fileInput.files.length === 0) {
        alert("Please select a JSON backup file first.");
        return;
    }
    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            appState = JSON.parse(event.target.result);
            saveStateToLocalStorage();
            initializeAppUI();
            renderAllModules();
            alert("Project restored successfully!");
        } catch (err) {
            alert("Invalid JSON backup file.");
        }
    };
    reader.readAsText(file);
}

function resetToDemoData() {
    if (confirm("Are you sure you want to reset all data to demonstration defaults?")) {
        localStorage.removeItem("farmsmart_app_state");
        location.reload();
    }
}

function closeModals() {
    document.querySelectorAll(".modal").forEach(m => m.classList.remove("active"));
}
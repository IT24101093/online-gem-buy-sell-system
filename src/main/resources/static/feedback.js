// ===============================
// CONFIG
// ===============================
const API_BASE = "http://localhost:8080/api";

let currentUser = JSON.parse(localStorage.getItem("loggedUser")) || null;
let selectedOrderId = null;
let starValue = 0;
let emojiValue = 0;

// ===============================
// ELEMENTS
// ===============================
const profileIcon = document.querySelector('.profile-img');
const loginModal = document.getElementById('loginModal');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const profilePopup = document.getElementById('profilePopup');
const profileUsername = document.getElementById('profileUsername');
const logoutBtn = document.getElementById('logoutBtn');

const pendingFeedbackContainer = document.getElementById('pendingFeedbackContainer');
const pendingFeedbackList = document.getElementById('pendingFeedbackList');

const feedbackGrid = document.getElementById('feedbackGrid');
const improvementGrid = document.getElementById('improvementGrid');

const modal = document.getElementById('feedbackModal');
const modalOrder = document.getElementById('modal-order');
const modalSubmitBtn = document.getElementById('modalSubmitBtn');

// ===============================
// LOGIN SYSTEM (FIXED)
// ===============================
profileIcon.addEventListener('click', () => {
    if (!currentUser) {
        loginModal.style.display = 'flex';
    } else {
        profileUsername.innerText = currentUser.username;
        profilePopup.style.display = 'flex';
    }
});

loginSubmitBtn.addEventListener('click', async () => {
    const username = loginUsername.value;
    const password = loginPassword.value;

    const res = await fetch(`${API_BASE}/login`, { // remove 'auth'
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });
    if (res.ok) {
        currentUser = await res.json();
        localStorage.setItem("loggedUser", JSON.stringify(currentUser));
        loginModal.style.display = "none";
        initDashboard();
    } else {
        alert("Invalid login");
    }
});

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem("loggedUser");
    currentUser = null;
    location.reload();
});

// ===============================
// INIT DASHBOARD
// ===============================
function initDashboard() {
    if (!currentUser) {
        document.getElementById('adminTabs').style.display = "none";
        pendingFeedbackContainer.style.display = "none";
        loadAllFeedback();
        return;
    }

    if (currentUser.role === "ADMIN") {
        document.getElementById('adminTabs').style.display = "flex";
        pendingFeedbackContainer.style.display = "none";
        loadAllFeedback();
        loadImprovements();
        loadAnalytics();
    } else {
        document.getElementById('adminTabs').style.display = "none";
        pendingFeedbackContainer.style.display = "flex";
        loadAllFeedback();
        loadPendingFeedback();
    }
}

// ===============================
// LOAD FEEDBACK
// ===============================
async function loadAllFeedback() {
    feedbackGrid.innerHTML = "";
    const res = await fetch(`${API_BASE}/feedback`);
    const data = await res.json();

    data.forEach(f => {
        const card = document.createElement("div");
        card.className = "feedback-card";
        card.innerHTML = `
            <p class="order-id">${f.orderCode}</p>
            <h4>${f.customerName}</h4>
            <p>${f.comment || ""}</p>
            <div class="rating">
                <span>${"⭐".repeat(f.rating)}</span>
            </div>
        `;
        feedbackGrid.appendChild(card);
    });
}

// ===============================
// LOAD IMPROVEMENTS (ADMIN)
// ===============================
async function loadImprovements() {
    improvementGrid.innerHTML = "";
    const res = await fetch(`${API_BASE}/feedback/improvements`);
    const data = await res.json();

    data.forEach(f => {
        const card = document.createElement("div");
        card.className = "feedback-card";
        card.innerHTML = `
            <p class="order-id">${f.orderCode}</p>
            <h4>${f.customerName}</h4>
            <p>${f.improvement}</p>
        `;
        improvementGrid.appendChild(card);
    });
}

// ===============================
// LOAD ANALYTICS
// ===============================
async function loadAnalytics() {
    const res = await fetch(`${API_BASE}/feedback/analytics`);
    const stats = await res.json();

    document.querySelector("#analytics .analytics").innerHTML = `
        <div style="flex:1; background:rgba(255,255,255,0.15);
            border-radius:15px; padding:15px; color:white;">
            <h4>Feedback Summary</h4>
            <p>Total Feedbacks: ${stats.total}</p>
            <p>Average Rating: ${stats.avg}</p>
            <p>Good: ${stats.good} | Medium: ${stats.medium} | Bad: ${stats.bad}</p>
        </div>

        <div style="flex:1; background:rgba(255,255,255,0.15);
            border-radius:15px; padding:15px; color:white;">
            <h4>AI Recommendations</h4>
            <ul>
                ${stats.suggestions.map(s => `<li>${s}</li>`).join("")}
            </ul>
        </div>
    `;
}

// ===============================
// LOAD PENDING FEEDBACK (USER)
// ===============================
async function loadPendingFeedback() {
    pendingFeedbackList.innerHTML = "";

    const res = await fetch(`${API_BASE}/orders/pending/${currentUser.id}`);
    const orders = await res.json();

    if (orders.length === 0) {
        pendingFeedbackList.innerHTML = "<p>No Pending Feedback</p>";
        return;
    }

    orders.forEach(order => {
        const div = document.createElement("div");
        div.className = "mini-item";
        div.innerHTML = `
            <p class="order-id">${order.orderCode}</p>
            <button class="btn primary">Give Feedback</button>
        `;

        div.querySelector("button").addEventListener("click", () => {
            selectedOrderId = order.id;
            modalOrder.innerText = "Order ID: " + order.orderCode;
            modal.style.display = "flex";
        });

        pendingFeedbackList.appendChild(div);
    });
}

// ===============================
// SUBMIT FEEDBACK
// ===============================
modalSubmitBtn.addEventListener("click", async () => {

    const comment = document.getElementById("modal-comment").value;
    const improvement = document.getElementById("modal-improvement").value;

    if (!starValue) {
        alert("Select rating");
        return;
    }

    await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            orderId: selectedOrderId,
            rating: starValue,
            comment,
            improvement
        })
    });

    alert("Feedback submitted!");
    modal.style.display = "none";

    loadAllFeedback();
    loadPendingFeedback();
});

// ===============================
initDashboard();
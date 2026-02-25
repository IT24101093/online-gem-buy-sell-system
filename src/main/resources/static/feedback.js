const users = [
  { username: "Admin", password: "admin", role: "admin" },
  { username: "user1", password: "user1", role: "user" },
  { username: "user2", password: "user2", role: "user" },
  { username: "user3", password: "user3", role: "user" },
  { username: "user4", password: "user4", role: "user" },
  { username: "user5", password: "user5", role: "user" },
  { username: "user6", password: "user6", role: "user" }
];

let currentUser = null;


const profileIcon = document.querySelector(".profile-img");
const loginModal = document.getElementById("loginModal");
const loginClose = document.getElementById("loginClose");
const loginSubmitBtn = document.getElementById("loginSubmitBtn");
const loginUsername = document.getElementById("loginUsername");
const loginPassword = document.getElementById("loginPassword");

const profilePopup = document.getElementById("profilePopup");
const profileClose = document.getElementById("profileClose");
const profileUsername = document.getElementById("profileUsername");
const logoutBtn = document.getElementById("logoutBtn");

const tabs = document.querySelectorAll(".tab-btn");
const contents = document.querySelectorAll(".tab-content");

const modal = document.getElementById("feedbackModal");
const closeBtn = modal.querySelector(".close");
const modalOrder = document.getElementById("modal-order");
const modalSubmitBtn = document.getElementById("modalSubmitBtn");
const stars = modal.querySelectorAll(".stars i");
const emojis = modal.querySelectorAll(".emojis span");

let starValue = 0;
let emojiValue = 0;

const pendingFeedbackContainer = document.getElementById("pendingFeedbackContainer");
const pendingFeedbackList = document.getElementById("pendingFeedbackList");


// Profile / Login

profileIcon.addEventListener("click", () => {
  if (!currentUser) {
    loginModal.style.display = "flex";
  } else {
    profileUsername.innerText = currentUser.username;
    profilePopup.style.display = "flex";
  }
});

loginClose.addEventListener("click", () => (loginModal.style.display = "none"));
profileClose.addEventListener("click", () => (profilePopup.style.display = "none"));

loginSubmitBtn.addEventListener("click", () => {
  const uname = loginUsername.value.trim();
  const pwd = loginPassword.value.trim();

  const user = users.find(
    (u) => u.username === uname && u.password === pwd
  );

  if (user) {
    currentUser = user;
    loginModal.style.display = "none";
    loginUsername.value = "";
    loginPassword.value = "";
    initDashboard();
  } else {
    alert("Invalid username or password!");
  }
});

logoutBtn.addEventListener("click", () => {
  currentUser = null;
  profilePopup.style.display = "none";
  initDashboard();
});


// Initialize Dashboard

function initDashboard() {
  if (!currentUser) {
    document.getElementById("adminTabs").style.display = "none";
    pendingFeedbackContainer.style.display = "none";
    populateFeedbackGrid();
  } else if (currentUser.role === "admin") {
    document.getElementById("adminTabs").style.display = "flex";
    pendingFeedbackContainer.style.display = "none";
    populateFeedbackGrid();
    populateImprovementGrid();
    populateAnalytics();
  } else {
    document.getElementById("adminTabs").style.display = "none";
    pendingFeedbackContainer.style.display = "block";
    populateFeedbackGrid();
    populatePendingFeedback();
  }
}


// Tabs

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");

    const target = tab.dataset.tab;
    contents.forEach((c) => c.classList.remove("active"));
    document.getElementById(target).classList.add("active");
  });
});


// Populate Sections

function populateFeedbackGrid() {
  const feedbackGrid = document.getElementById("feedbackGrid");
  feedbackGrid.innerHTML = "";

  for (let i = 1; i <= 8; i++) {
    const card = document.createElement("div");
    card.className = "feedback-card";

    card.innerHTML = `
      <p class="order-id">Order #100${i}</p>
      <h4>User${i}</h4>
      <p>Testing ${i}</p>
      <div class="rating">
        <span>${"⭐".repeat(5 - (i % 5))}</span>
        <span class="emoji">😄</span>
      </div>
    `;

    feedbackGrid.appendChild(card);
  }
}

function populateImprovementGrid() {
  const grid = document.getElementById("improvementGrid");
  grid.innerHTML = "";

  for (let i = 1; i <= 4; i++) {
    const card = document.createElement("div");
    card.className = "feedback-card";
    card.innerHTML = `
      <h4>Improvement ${i}</h4>
      <p>Suggestion ${i}</p>
    `;
    grid.appendChild(card);
  }
}

function populateAnalytics() {
  const summary = document.getElementById("analyticsSummary");
  summary.innerHTML = `
    <h4>Feedback Summary</h4>
    <p>Total Feedbacks: 8</p>
    <p>Good: 5 | Medium: 2 | Bad: 1</p>
  `;

  const ai = document.getElementById("aiSuggestions");
  ai.innerHTML = `
    <h4>AI Suggestions</h4>
    <ul>
      <li>Improve delivery speed</li>
      <li>Enhance product quality</li>
    </ul>
  `;
}

function populatePendingFeedback() {
  pendingFeedbackList.innerHTML = "";

  for (let i = 5; i <= 6; i++) {
    const div = document.createElement("div");
    div.className = "mini-item";

    div.innerHTML = `
      <p class="order-id">Order #100${i}</p>
      <button class="btn primary give-feedback-btn">Give Feedback</button>
    `;

    pendingFeedbackList.appendChild(div);
  }

  document.querySelectorAll(".give-feedback-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const orderId =
        btn.parentElement.querySelector(".order-id").innerText;
      modalOrder.innerText = "Order ID: " + orderId;
      modal.style.display = "flex";
    });
  });
}


// Feedback Modal Logic

stars.forEach((star) => {
  star.addEventListener("click", () => {
    starValue = parseInt(star.dataset.value);
    stars.forEach((s) => s.classList.remove("selected"));
    for (let i = 0; i < starValue; i++) {
      stars[i].classList.add("selected");
    }
  });
});

emojis.forEach((emoji) => {
  emoji.addEventListener("click", () => {
    emojiValue = parseInt(emoji.dataset.value);
    emojis.forEach((e) => e.classList.remove("selected"));
    emoji.classList.add("selected");
  });
});

closeBtn.addEventListener("click", () => (modal.style.display = "none"));

modalSubmitBtn.addEventListener("click", () => {
  if (starValue === 0 || emojiValue === 0) {
    alert("Please select star & emoji rating!");
    return;
  }

  alert("Feedback submitted successfully!");
  modal.style.display = "none";
  starValue = 0;
  emojiValue = 0;
});

// Initialize on load
initDashboard();

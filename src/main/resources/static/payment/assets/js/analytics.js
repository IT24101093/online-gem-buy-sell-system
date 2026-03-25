const money = (n) => `LKR ${Number(n || 0).toFixed(2)}`;

async function loadAnalytics() {
    // Secure part
    if (localStorage.getItem("userRole") !== "ADMIN") {
        window.location.href = "admin_login.html";
        return;
    }

    try {
       const response = await fetch(`http://localhost:8080/api/payments/analytics/monthly?month=3&year=2026`);
        if (!response.ok) throw new Error("Offline");

        const data = await response.json();

        document.getElementById('incomeVal').textContent = money(data.income);
        document.getElementById('lossVal').textContent = money(data.loss);
        document.getElementById('balanceVal').textContent = money(data.balance);

        document.getElementById('tabIncome').textContent = money(data.income);
        document.getElementById('tabLoss').textContent = money(data.loss);
        document.getElementById('tabBalance').textContent = money(data.balance);

    } catch (error) {
        document.getElementById('incomeVal').textContent = "Server Offline";
    }
}

document.addEventListener("DOMContentLoaded", loadAnalytics);
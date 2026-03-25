const money = (n) => `LKR ${Number(n || 0).toFixed(2)}`;

async function loadAnalytics() {
    // 1. ආරක්ෂක පරීක්ෂාව (Admin ද නැද්ද යන්න)
    if (localStorage.getItem("userRole") !== "ADMIN") {
        window.location.href = "admin_login.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/payments/report?month=3&year=2026`);
        if (!response.ok) throw new Error("Offline");

        const data = await response.json();

        // UI යාවත්කාලීන කිරීම
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
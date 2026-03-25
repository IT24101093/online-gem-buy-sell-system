const money = (n) => `LKR ${Number(n || 0).toFixed(2)}`;

async function loadAnalytics() {
    try {
        // Backend API එකෙන් දත්ත ඉල්ලා සිටීම
        const response = await fetch(`http://localhost:8080/api/payments/report?month=3&year=2026`);

        if (!response.ok) throw new Error("Offline");

        const data = await response.json();

        // දත්ත සාර්ථකව ලැබුනේ නම් ඒවා පෙන්වන්න
        document.getElementById('incomeVal').textContent = money(data.income);
        document.getElementById('lossVal').textContent = money(data.loss);
        document.getElementById('balanceVal').textContent = money(data.balance);

        document.getElementById('tabIncome').textContent = money(data.income);
        document.getElementById('tabLoss').textContent = money(data.loss);
        document.getElementById('tabBalance').textContent = money(data.balance);

    } catch (error) {
        // රූපයේ ඇති පරිදි දත්ත නොමැති නම් "Server Offline" ලෙස පෙන්වන්න
        document.getElementById('incomeVal').textContent = "Server Offline";
        console.log("Analytics Error: Server is likely offline.");
    }
}

document.addEventListener("DOMContentLoaded", loadAnalytics);
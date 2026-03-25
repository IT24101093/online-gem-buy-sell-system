// Currency Formatting function
const money = (n) => `LKR ${Number(n || 0).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

function renderBalanceChart(gemValue, cashValue, liabilities) {
    const canvas = document.getElementById('balanceChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (window.myChart) { window.myChart.destroy(); }

    window.myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Gem Inventory', 'Cash at Bank', 'Liabilities'],
            datasets: [{
                data: [gemValue, cashValue, liabilities],
                backgroundColor: ['#c9a23a', '#2ecc71', '#e74c3c'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#fff' } }
            }
        }
    });
}

// The function of get the main records
async function loadAnalytics() {
    // Admin Check
    if (localStorage.getItem("userRole") !== "ADMIN") {
        window.location.href = "admin_login.html";
        return;
    }

    let currentIncome = 0;
    let currentLoss = 0;

    try {
        // Get the financial data
        const response = await fetch(`http://localhost:8080/api/payments/analytics/monthly?month=3&year=2026`);
        if (!response.ok) throw new Error("Offline");

        const data = await response.json();
        currentIncome = data.income || 0;
        currentLoss = data.loss || 0;

        // Cards Update
        document.getElementById('incomeVal').textContent = money(currentIncome);
        document.getElementById('lossVal').textContent = money(currentLoss);
        document.getElementById('balanceVal').textContent = money(data.balance);

        // Table Update
        if(document.getElementById('tabIncome')) document.getElementById('tabIncome').textContent = money(currentIncome);
        if(document.getElementById('tabLoss')) document.getElementById('tabLoss').textContent = money(currentLoss);
        if(document.getElementById('tabBalance')) document.getElementById('tabBalance').textContent = money(data.balance);

        // Module Sync
        await syncModules(currentIncome, currentLoss);

    } catch (error) {
        console.error("Main Load Error:", error);
        document.getElementById('incomeVal').textContent = "Server Offline";
    }
}

// combined another dep with function
async function syncModules(income, loss) {
    try {
        // Get the Showcase and Ordering details
        const gemRes = await fetch('http://localhost:8080/api/inventory/total-value').catch(() => ({json: () => ({totalValue: 7500000})}));
        const orderRes = await fetch('http://localhost:8080/api/orders/pending-payments').catch(() => ({json: () => ({totalPending: 0})}));

        const gemData = await gemRes.json();
        const orderData = await orderRes.json();

        const stockValue = gemData.totalValue || 7500000;
        const pendingPay = orderData.totalPending || 0;
        const totalAssets = stockValue + income;

        // Update the Balance Sheet
        if(document.getElementById('assetGems')) document.getElementById('assetGems').textContent = money(stockValue);
        if(document.getElementById('assetCash')) document.getElementById('assetCash').textContent = money(income);
        if(document.getElementById('liabilityOrders')) document.getElementById('liabilityOrders').textContent = money(pendingPay);
        if(document.getElementById('totalAssets')) document.getElementById('totalAssets').textContent = money(totalAssets);

        // create a chart
        renderBalanceChart(stockValue, income, pendingPay);

    } catch (err) {
        console.warn("Integration Error:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadAnalytics);
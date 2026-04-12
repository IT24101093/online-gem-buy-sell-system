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
                legend: { position: 'bottom', labels: { color: '#000000' } }
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
        // 1. Get the current date dynamically
        const now = new Date();
        const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed (0=Jan, 3=April)
        const currentYear = now.getFullYear();

        // 2. Update the UI text to show the correct period
        if(document.getElementById('displayMonth')) {
            const monthName = now.toLocaleString('default', { month: 'long' });
            document.getElementById('displayMonth').textContent = `${monthName} ${currentYear}`;
        }

        // 3. Fetch data for the REAL current month
        const response = await fetch(`http://localhost:8080/api/payments/analytics/monthly?month=${currentMonth}&year=${currentYear}`);

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
        // 1. Fetch from your specific Asset/Liability Tables
        const assetRes = await fetch('http://localhost:8080/api/corporate/assets')
            .catch(() => ({ json: () => ({ gemInventoryValue: 7500000, bankBalance: income }) }));

        const liabilityRes = await fetch('http://localhost:8080/api/corporate/liabilities')
            .catch(() => ({ json: () => ({ totalLiabilities: 0 }) }));

        const assetData = await assetRes.json();
        const liabilityData = await liabilityRes.json();

        // 2. Map the data to your UI variables
        const stockValue = assetData.gemInventoryValue || 0;
        const currentCash = assetData.bankBalance || income; // Use live income if bank is 0
        const totalDebt = liabilityData.totalLiabilities || 0;

        const totalAssets = stockValue + currentCash;

        // 3. Update the UI Text
        if(document.getElementById('assetGems')) document.getElementById('assetGems').textContent = money(stockValue);
        if(document.getElementById('assetCash')) document.getElementById('assetCash').textContent = money(currentCash);
        if(document.getElementById('liabilityOrders')) document.getElementById('liabilityOrders').textContent = money(totalDebt);
        if(document.getElementById('totalAssets')) document.getElementById('totalAssets').textContent = money(totalAssets);

        // 4. Update the Chart
        // Gold: Gems | Green: Bank Cash | Red: Liabilities (COD/Debts)
        renderBalanceChart(stockValue, currentCash, totalDebt);

    } catch (err) {
        console.warn("Integration Error:", err);
    }
}

document.addEventListener("DOMContentLoaded", loadAnalytics);
// order-details.js - LIVE DATABASE VERSION
const API_URL = 'http://localhost:8080/api/orders/all';

document.addEventListener('DOMContentLoaded', () => {
    // Load the board immediately
    loadAndDisplayOrders();

    // Auto-refresh the board every 3 seconds to catch Admin updates live!
    setInterval(loadAndDisplayOrders, 3000);
});

async function loadAndDisplayOrders() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Could not connect to database");

        const javaOrders = await response.json();

        // Clear the current columns so we don't duplicate items
        document.getElementById('list-processing').innerHTML = '';
        document.getElementById('list-packed').innerHTML = '';
        document.getElementById('list-delivered').innerHTML = '';

        let counts = { processing: 0, packed: 0, delivered: 0 };

        javaOrders.forEach(o => {
            // Map Java Status (CONFIRMED/PACKED/DELIVERED) to UI Column IDs
            // In Java, the initial status is 'CONFIRMED', which we show as 'processing'
            let statusKey = o.orderStatus.toLowerCase();
            if (statusKey === 'confirmed') statusKey = 'processing';

            if (counts[statusKey] !== undefined) {
                counts[statusKey]++;

                const displayId = "#GEM-" + String(o.orderId).padStart(3, '0');
                const customerName = o.customer ? o.customer.firstName : "Guest";
                const gemType = o.inventoryItem ? o.inventoryItem.gemType : "Premium Gem";
                const price = o.totalAmountLkr ? o.totalAmountLkr.toLocaleString() : "0";

                // Logic to add the button ONLY if the status is delivered
                const actionButton = statusKey === 'delivered'
                    ? `<button class="btn-action" 
                        onclick="window.location.href='feedback.html?id=${o.orderId}'"
                        style="margin-top: 10px; padding: 8px 12px; cursor: pointer; background: #00ff87; border: none; border-radius: 5px; color: #1a1a2e; font-weight: bold; width: 100%;">
                        Leave Feedback
                       </button>`
                    : '';

                // Create the Gem Card HTML
                const cardHTML = `
                    <div class="gem-card">
                        <div class="gem-info">
                            <h4>${displayId}</h4>
                            <p style="color: #8892b0; font-size: 0.85rem;">For: ${customerName}</p>
                            <p>${gemType}</p>
                            <div class="gem-price">LKR ${price}</div>
                            ${actionButton}
                        </div>
                    </div>
                `;

                document.getElementById(`list-${statusKey}`).innerHTML += cardHTML;
            }
        });

        // Update the numbers at the top of the columns
        document.getElementById('count-processing').innerText = counts.processing;
        document.getElementById('count-packed').innerText = counts.packed;
        document.getElementById('count-delivered').innerText = counts.delivered;

    } catch (error) {
        console.error("Board Sync Error:", error);
        // Optional: Show a small error message in the UI if the backend is down
    }
}

// Theme toggle logic
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
        toggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
    }
}
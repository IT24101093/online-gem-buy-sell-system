document.addEventListener('DOMContentLoaded', () => {
    // Load the board immediately
    loadAndDisplayOrders();

    // Auto-refresh the board every 5 seconds (2 seconds is a bit fast for the server)
    setInterval(loadAndDisplayOrders, 5000);
});

async function loadAndDisplayOrders() {
    try {
        // Fetch the real orders from the database
        const response = await fetch('http://localhost:8080/api/orders');
        const dbOrders = await response.json();

        // Clear the current columns
        document.getElementById('list-processing').innerHTML = '';
        document.getElementById('list-packed').innerHTML = '';
        document.getElementById('list-delivered').innerHTML = '';

        let counts = { processing: 0, packed: 0, delivered: 0 };

        dbOrders.forEach(order => {
            /* CRITICAL FIX:
               Your Java OrderResponseDTO uses 'status', not 'orderStatus'.
               Also 'CONFIRMED' in Java maps to 'processing' in your UI.
            */
            let rawStatus = (order.status || 'CONFIRMED').toUpperCase();
            let uiStatus = 'processing'; // Default

            if (rawStatus === 'PACKED') uiStatus = 'packed';
            if (rawStatus === 'DELIVERED') uiStatus = 'delivered';

            if (counts[uiStatus] !== undefined) {
                counts[uiStatus]++;

                const actionButton = uiStatus === 'delivered'
                    ? `<button class="btn-action" style="margin-top: 10px; padding: 8px 12px; background: #00ff87; border: none; border-radius: 5px; color: #1a1a2e; font-weight: bold; width: 100%;">Order Received</button>`
                    : `<div style="color: #00ff87; font-size: 0.8rem; margin-top: 10px;"><i class="fas fa-history"></i> In Progress...</div>`;

                const cardHTML = `
                    <div class="order-item">
                        <div class="order-info">
                            <div class="order-id">#GEM-${order.orderId}</div>
                            <p style="color: #fff; margin: 5px 0;">Customer: ${order.customerName}</p>
                            <p style="color: #8892b0; font-size: 0.85rem;">Items: ${order.gemsList || 'Gemstone'}</p>
                            <p style="color: #8892b0; font-size: 0.85rem;">Date: ${order.date}</p>
                            <div class="gem-price">LKR ${order.amount.toLocaleString()}</div>
                            ${actionButton}
                        </div>
                    </div>
                `;

                // Append to the correct column based on the mapped status
                document.getElementById(`list-${uiStatus}`).innerHTML += cardHTML;
            }
        });

        // Update the numbers at the top of the columns
        document.getElementById('count-processing').innerText = counts.processing;
        document.getElementById('count-packed').innerText = counts.packed;
        document.getElementById('count-delivered').innerText = counts.delivered;

    } catch (error) {
        console.error("Failed to load orders from database:", error);
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const toggle = document.querySelector('.theme-toggle');
    toggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
}
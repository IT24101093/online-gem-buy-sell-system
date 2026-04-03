document.addEventListener('DOMContentLoaded', () => {
    // Load the board once immediately.
    // Auto-refresh has been REMOVED as requested.
    loadAndDisplayOrders();
});

async function loadAndDisplayOrders() {
    try {
        // Fetch the real orders from the database (Logic Untouched)
        const response = await fetch('http://localhost:8080/api/orders');
        const dbOrders = await response.json();

        // Clear the current columns
        document.getElementById('list-processing').innerHTML = '';
        document.getElementById('list-packed').innerHTML = '';
        document.getElementById('list-delivered').innerHTML = '';

        let counts = { processing: 0, packed: 0, delivered: 0 };

        dbOrders.forEach(order => {
            let rawStatus = (order.status || 'CONFIRMED').toUpperCase();
            let uiStatus = 'processing'; // Default

            if (rawStatus === 'PACKED') uiStatus = 'packed';
            if (rawStatus === 'DELIVERED') uiStatus = 'delivered';

            if (counts[uiStatus] !== undefined) {
                counts[uiStatus]++;

                // NEW: Little Feedback Button (only for delivered items)
                const actionButton = uiStatus === 'delivered'
                    ? `<button class="btn-action-small" onclick="goToFeedback(${order.orderId})">
                           <i data-lucide="star" class="icon-small"></i> Feedback
                       </button>`
                    : '';

                // LUXURY CARD TEMPLATE (Button sits nicely next to the price)
                const cardHTML = `
                    <div class="order-card animate__animated animate__fadeIn">
                        <div class="order-id">Order ID: #${order.orderId}</div>
                        
                        <p class="order-detail-text"><strong>Customer:</strong> ${order.customerName}</p>
                        <p class="order-detail-text"><strong>Items:</strong> ${order.gemsList || 'Gemstone'}</p>
                        <p class="order-detail-text"><strong>Date:</strong> ${order.date}</p>
                        
                        <div class="gem-price" style="display: flex; justify-content: space-between; align-items: center;">
                            <span>LKR ${order.amount.toLocaleString()}</span>
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

        // Re-initialize any dynamic Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

    } catch (error) {
        console.error("Failed to load orders from database:", error);
    }
}

// Redirects the user to the feedback page
function goToFeedback(orderId) {
    // I am passing the orderId in the URL so your feedback page knows which order is being reviewed!
    window.location.href = `feedback.html?orderId=${orderId}`;
}
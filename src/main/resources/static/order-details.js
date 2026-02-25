document.addEventListener('DOMContentLoaded', () => {
    // Load the board immediately
    loadAndDisplayOrders();
    
    // Auto-refresh the board every 2 seconds to catch Admin updates live!
    setInterval(loadAndDisplayOrders, 2000);
});

function loadAndDisplayOrders() {
    // Read the exact same data the Admin Dashboard uses
    const storedOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');

    // Clear the current columns so we don't duplicate items
    document.getElementById('list-processing').innerHTML = '';
    document.getElementById('list-packed').innerHTML = '';
    document.getElementById('list-delivered').innerHTML = '';

    let counts = { processing: 0, packed: 0, delivered: 0 };

    storedOrders.forEach(order => {
        // Only process orders that have a valid status
        if (counts[order.status] !== undefined) {
            counts[order.status]++;

            // Logic to add the button ONLY if the status is delivered
            // Redirects to feedback.html and passes the order ID in the URL
            const actionButton = order.status === 'delivered' 
                ? `<button class="btn-action" 
                    style="margin-top: 10px; padding: 8px 12px; cursor: pointer; background: #00ff87; border: none; border-radius: 5px; color: #1a1a2e; font-weight: bold; width: 100%;" 
                    onclick="window.location.href='feedback.html?orderId=${order.id}'">
                    Review Order
                   </button>` 
                : '';

            // Create HTML card for the order
            const cardHTML = `
                <div class="gem-card">
                    <div class="gem-info">
                        <h4>${order.id}</h4>
                        <p style="color: #8892b0; font-size: 0.85rem;">For: ${order.name}</p>
                        <p>${order.gems}</p>
                        <div class="gem-price">${order.amount}</div>
                        ${actionButton}
                    </div>
                </div>
            `;

            // Inject into the correct column based on the Admin's status
            if (order.status === 'processing') {
                document.getElementById('list-processing').innerHTML += cardHTML;
            } else if (order.status === 'packed') {
                document.getElementById('list-packed').innerHTML += cardHTML;
            } else if (order.status === 'delivered') {
                document.getElementById('list-delivered').innerHTML += cardHTML;
            }
        }
    });

    // Update the numbers at the top of the columns
    document.getElementById('count-processing').innerText = counts.processing;
    document.getElementById('count-packed').innerText = counts.packed;
    document.getElementById('count-delivered').innerText = counts.delivered;
}

// NEW: Theme toggle logic to match Admin dashboard
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const toggle = document.querySelector('.theme-toggle');
    toggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
}
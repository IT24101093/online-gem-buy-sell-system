const API_BASE_URL = 'http://localhost:8080/api/orders';
let orders = [];

const statusMap = {
    'CONFIRMED': 'Processing',
    'PACKED': 'Packed',
    'DELIVERED': 'Delivered'
};

async function loadOrdersFromBackend() {
    try {
        const response = await fetch(`${API_BASE_URL}/all`);
        const javaOrders = await response.json();

        orders = javaOrders.map(o => ({
            id: o.orderId,
            displayId: "#GEM-" + String(o.orderId).padStart(3, '0'),
            name: o.customer ? o.customer.firstName + " " + o.customer.lastName : "Unknown",
            status: o.orderStatus,
            gems: o.inventoryItem ? o.inventoryItem.gemType : "Gem",
            amount: "LKR " + (o.totalAmountLkr ? o.totalAmountLkr.toLocaleString() : "0"),
            date: o.createdAt ? o.createdAt.split('T')[0] : "N/A"
        }));

        updateStats();
        renderOrders();
    } catch (error) {
        console.error("Backend Error:", error);
    }
}

function renderOrders() {
    const ordersGrid = document.getElementById('ordersGrid');
    if(!ordersGrid) return;

    ordersGrid.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-id">${order.displayId}</div>
                <span class="status-badge status-${order.status.toLowerCase()}">${statusMap[order.status]}</span>
            </div>
            <div class="order-details">
                <p><strong>Customer:</strong> ${order.name}</p>
                <p><strong>Item:</strong> ${order.gems}</p>
                <p><strong>Total:</strong> <span style="color: #00ff87;">${order.amount}</span></p>
            </div>
            <div class="order-actions" style="display: flex; gap: 10px; margin-top: 15px;">
                <button class="btn btn-status" style="flex: 2;" onclick="changeStatus(${order.id}, '${order.status}')">Next Status</button>
                <button class="btn btn-delete" style="flex: 1; background: #ff4d4d; color: white; border: none; border-radius: 8px; cursor: pointer;" onclick="confirmDeleteAction(${order.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// DELETE LOGIC
function confirmDeleteAction(orderId) {
    const modal = document.getElementById('deleteModal');
    const confirmBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.getElementById('cancelDelete');

    modal.style.display = 'flex';

    confirmBtn.onclick = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/${orderId}`, { method: 'DELETE' });
            if (response.ok) {
                modal.style.display = 'none';
                loadOrdersFromBackend(); // Refresh list
            }
        } catch (error) {
            alert("Error deleting order");
        }
    };

    cancelBtn.onclick = () => { modal.style.display = 'none'; };
}

async function changeStatus(orderId, currentStatus) {
    let nextStatus = currentStatus === 'CONFIRMED' ? 'PACKED' : (currentStatus === 'PACKED' ? 'DELIVERED' : null);
    if (!nextStatus) return;

    await fetch(`${API_BASE_URL}/${orderId}/status?status=${nextStatus}`, { method: 'PUT' });
    loadOrdersFromBackend();
}

function updateStats() {
    if(document.getElementById('totalOrders')) document.getElementById('totalOrders').textContent = orders.length;
}

document.addEventListener('DOMContentLoaded', loadOrdersFromBackend);
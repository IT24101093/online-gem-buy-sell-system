const API_BASE_URL = "http://localhost:8080/api/orders";

// 1. Data will now be stored here after fetching from Java
let orders = [];

const statusMap = {
    'CONFIRMED': 'Processing', // Mapping your Java status to your UI text
    'PACKED': 'Packed',
    'DELIVERED': 'Delivered'
};

function getStatusClass(status) {
    return `status-${status.toLowerCase()}`;
}

// 2. FETCH ALL ORDERS FROM DATABASE
async function fetchOrders() {
    try {
        const response = await fetch(API_BASE_URL);
        // This maps to your List<OrderResponseDTO> in Java
        orders = await response.json();
        renderOrders();
        updateStats();
    } catch (error) {
        console.error("Error loading orders:", error);
        showNotification("Failed to connect to backend", "error");
    }
}

function updateStats() {
    const stats = orders.reduce((acc, order) => {
        acc.total++;
        const s = order.status.toLowerCase();
        if (acc[s] !== undefined) acc[s]++;
        return acc;
    }, { total: 0, confirmed: 0, packed: 0, delivered: 0 });

    document.getElementById('totalOrders').textContent = stats.total;
    document.getElementById('processingOrders').textContent = stats.confirmed;
    document.getElementById('packedOrders').textContent = stats.packed;
    document.getElementById('deliveredOrders').textContent = stats.delivered;
}

function createOrderCard(order) {
    // Note: order.orderId and order.customerName come from your OrderResponseDTO.java
    return `
        <div class="order-card" data-order-id="${order.orderId}">
            <div class="order-header">
                <div class="order-id">#GEM-${order.orderId}</div>
                <div class="status-badge ${getStatusClass(order.status)}">${statusMap[order.status] || order.status}</div>
            </div>
            <div class="order-details">
                <div class="detail-item">
                    <div class="detail-label">Customer</div>
                    <div class="detail-value">${order.customerName}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Gems Ordered</div>
                    <div class="detail-value">${order.gemsList || 'Gemstone Package'}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Amount</div>
                    <div class="detail-value">LKR ${order.amount}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date</div>
                    <div class="detail-value">${order.date}</div>
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-status" onclick="updateStatus(${order.orderId}, '${order.status}')">
                    ${order.status === 'DELIVERED' ? '✅ Completed' : 'Next Status'}
                </button>
                <button class="btn btn-delete" onclick="deleteOrder(${order.orderId})">🗑️ Delete</button>
            </div>
        </div>
    `;
}

function renderOrders() {
    const ordersGrid = document.getElementById('ordersGrid');
    ordersGrid.innerHTML = orders.map(createOrderCard).join('');
}

// 3. UPDATE STATUS IN DATABASE
async function updateStatus(orderId, currentStatus) {
    const statuses = ['CONFIRMED', 'PACKED', 'DELIVERED'];
    const currentIndex = statuses.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === statuses.length - 1) return;

    const nextStatus = statuses[currentIndex + 1];

    try {
        const response = await fetch(`${API_BASE_URL}/${orderId}/status?status=${nextStatus}`, {
            method: 'PUT'
        });

        if (response.ok) {
            showNotification(`Order #${orderId} updated to ${nextStatus}`, 'success');
            fetchOrders(); // Refresh data from server
        }
    } catch (error) {
        showNotification("Update failed", "error");
    }
}

// --- KEEP YOUR EXISTING API_BASE_URL, orders, etc. ABOVE ---

let orderIdToDelete = null; // Store ID for the custom modal

// 1. OPEN MODAL (REPLACES UGLY CONFIRM)
function deleteOrder(orderId) {
    orderIdToDelete = orderId;
    document.getElementById('deleteOrderIdText').textContent = `#GEM-${orderId}`;
    document.getElementById('deleteModal').style.display = 'flex';

    // Attach the actual delete call to the confirm button
    document.getElementById('confirmDeleteBtn').onclick = finalDeleteAction;
}

// 2. CLOSE MODAL
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
    orderIdToDelete = null;
}

// 3. ACTUAL API CALL
async function finalDeleteAction() {
    if (!orderIdToDelete) return;

    try {
        const response = await fetch(`${API_BASE_URL}/${orderIdToDelete}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showNotification(`Order #${orderIdToDelete} deleted`, 'success');
            closeDeleteModal();
            fetchOrders();
        }
    } catch (error) {
        showNotification("Delete failed", "error");
        closeDeleteModal();
    }
}

// --- KEEP ALL YOUR OTHER FUNCTIONS (showNotification, toggleTheme, etc.) EXACTLY THE SAME ---

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 30px;
        padding: 15px 25px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 1001;
        transform: translateX(400px);
        transition: all 0.4s ease;
        background: ${type === 'success' ? 'rgba(40, 167, 69, 0.95)' : 'rgba(220, 53, 69, 0.95)'};
        backdrop-filter: blur(10px);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 400);
    }, 3000);
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const toggle = document.querySelector('.theme-toggle');
    toggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
}

// 5. Initialize by calling the Backend
document.addEventListener('DOMContentLoaded', () => {
    fetchOrders();
});
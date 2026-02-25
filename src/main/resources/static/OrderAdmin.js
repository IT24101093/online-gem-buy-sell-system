// Dummy orders data
let orders = [
    {
        id: "#GEM-001",
        name: "Nimal Perera",
        phone: "+94 77 123 4567",
        address: "145/7, Main Street, Negombo, Western Province",
        status: "processing",
        gems: "5x Ruby, 3x Sapphire",
        amount: "₹45,000",
        date: "2026-02-20"
    },
    {
        id: "#GEM-002",
        name: "Saman Kumara",
        phone: "+94 71 234 5678",
        address: "23A, Beach Road, Negombo",
        status: "packed",
        gems: "10x Emerald, 2x Diamond",
        amount: "₹1,20,000",
        date: "2026-02-19"
    },
    {
        id: "#GEM-003",
        name: "Priya Fernando",
        phone: "+94 77 345 6789",
        address: "78, Poruthota Road, Negombo",
        status: "processing",
        gems: "8x Topaz, 4x Amethyst",
        amount: "₹32,500",
        date: "2026-02-19"
    },
    {
        id: "#GEM-004",
        name: "Ravi Silva",
        phone: "+94 72 456 7890",
        address: "12, Lewis Place, Negombo",
        status: "delivered",
        gems: "6x Garnet, 1x Opal",
        amount: "₹28,750",
        date: "2026-02-18"
    },
    {
        id: "#GEM-005",
        name: "Lakmini Wickramasinghe",
        phone: "+94 76 567 8901",
        address: "56/3, Cemetery Road, Negombo",
        status: "packed",
        gems: "12x Aquamarine",
        amount: "₹78,000",
        date: "2026-02-18"
    },
    {
        id: "#GEM-006",
        name: "Chamal Jayasinghe",
        phone: "+94 77 678 9012",
        address: "89, Shalika Street, Negombo",
        status: "processing",
        gems: "3x Diamond, 7x Ruby",
        amount: "₹95,000",
        date: "2026-02-17"
    }
];

// --- NEW: LOCALSTORAGE FUNCTIONS ---
function loadOrdersFromStorage() {
    const storedOrders = localStorage.getItem('adminOrders');
    if (storedOrders) {
        orders = JSON.parse(storedOrders);
    } else {
        localStorage.setItem('adminOrders', JSON.stringify(orders));
    }
}

function saveOrdersToStorage() {
    localStorage.setItem('adminOrders', JSON.stringify(orders));
}
// ------------------------------------

const statusMap = {
    'processing': 'Processing',
    'packed': 'Packed',
    'delivered': 'Delivered'
};

function getStatusClass(status) {
    return `status-${status}`;
}

function updateStats() {
    const stats = orders.reduce((acc, order) => {
        acc.total++;
        if (acc[order.status] !== undefined) {
            acc[order.status]++;
        }
        return acc;
    }, { total: 0, processing: 0, packed: 0, delivered: 0 });

    document.getElementById('totalOrders').textContent = stats.total;
    document.getElementById('processingOrders').textContent = stats.processing;
    document.getElementById('packedOrders').textContent = stats.packed;
    document.getElementById('deliveredOrders').textContent = stats.delivered;
}

function createOrderCard(order) {
    return `
        <div class="order-card" data-order-id="${order.id}">
            <div class="order-header">
                <div class="order-id">${order.id}</div>
                <div class="status-badge ${getStatusClass(order.status)}">${statusMap[order.status] || order.status}</div>
            </div>
            <div class="order-details">
                <div class="detail-item">
                    <div class="detail-label">Customer</div>
                    <div class="detail-value">${order.name}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Phone</div>
                    <div class="detail-value">${order.phone}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Address</div>
                    <div class="detail-value">${order.address}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Gems Ordered</div>
                    <div class="detail-value">${order.gems}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Amount</div>
                    <div class="detail-value">${order.amount}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Date</div>
                    <div class="detail-value">${order.date}</div>
                </div>
            </div>
            <div class="order-actions">
                <button class="btn btn-status" onclick="updateStatus('${order.id}')">
                    ${order.status === 'delivered' ? '✅ Completed' : 'Next Status'}
                </button>
                <button class="btn btn-delete" onclick="deleteOrder('${order.id}')">🗑️ Delete</button>
            </div>
        </div>
    `;
}

function renderOrders() {
    const ordersGrid = document.getElementById('ordersGrid');
    ordersGrid.innerHTML = orders.map(createOrderCard).join('');
}

function updateStatus(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const statuses = ['processing', 'packed', 'delivered'];
    const currentIndex = statuses.indexOf(order.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    order.status = nextStatus;
    
    // NEW: Save the updated status to browser storage
    saveOrdersToStorage();

    // Update UI
    renderOrders();
    updateStats();
    
    // Show notification
    showNotification(`Order ${orderId} updated to ${statusMap[nextStatus]}`, 'success');
}

function deleteOrder(orderId) {
    document.getElementById('deleteMessage').textContent = `Delete order ${orderId}? This action cannot be undone.`;
    document.getElementById('deleteModal').style.display = 'flex';

    const confirmBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.getElementById('cancelDelete');

    confirmBtn.onclick = function() {
        const index = orders.findIndex(o => o.id === orderId);
        if (index > -1) {
            orders.splice(index, 1);
            
            // NEW: Save the deletion to browser storage
            saveOrdersToStorage();
            
            renderOrders();
            updateStats();
            showNotification(`Order ${orderId} deleted successfully`, 'deleted');
        }
        document.getElementById('deleteModal').style.display = 'none';
    }

    cancelBtn.onclick = function() {
        document.getElementById('deleteModal').style.display = 'none';
    }
}

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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // NEW: Load the live orders when the page opens
    loadOrdersFromStorage();
    
    updateStats();
    renderOrders();
});

// Auto refresh simulation
setInterval(() => {
    if (Math.random() > 0.7) {
        showNotification('New order received!', 'success');
    }
}, 15000);
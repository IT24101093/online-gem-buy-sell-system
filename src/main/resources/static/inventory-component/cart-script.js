// Database of items using .jpg to match your uploaded files
const cartItems = [
    { id: 1, name: "Natural Royal Ruby", price: 150000, type: "Precious", img: "image1.png" },
    { id: 2, name: "Blue Velvet Sapphire", price: 220000, type: "Precious", img: "image2.jpg" },
    { id: 3, name: "Imperial Topaz", price: 120000, type: "Semi-Precious", img: "image3.jpg" },
    { id: 4, name: "Purple Amethyst", price: 90000, type: "Semi-Precious", img: "image5.jpg" }
];

// Initial render on page load
document.addEventListener("DOMContentLoaded", () => {
    renderCart("all");
});

function filterItems(category, element) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    element.classList.add('active');
    renderCart(category);
}

function renderCart(filter = "all") {
    const list = document.getElementById('cart-list');
    list.innerHTML = "";
    let totalPrice = 0;

    const filteredItems = filter === "all" ? cartItems : cartItems.filter(item => item.type === filter);

    filteredItems.forEach((item, index) => {
        totalPrice += item.price;
        // Added animation delay based on index for the cascading entrance effect
        list.innerHTML += `
            <div class="cart-item" style="animation-delay: ${index * 0.1}s">
                <img src="${item.img}" class="item-img" alt="${item.name}" onerror="this.src='https://via.placeholder.com/200'">
                <div class="item-info">
                    <small>${item.type}</small>
                    <h3>${item.name}</h3>
                    <p>LKR ${item.price.toLocaleString()}</p>
                </div>
            </div>
        `;
    });

    document.getElementById('total-display').innerText = `LKR ${totalPrice.toLocaleString()}`;
}

// RESTORED: This makes your "View Order Details" button work again!
function goToDetails() {
    window.location.href = 'order-details.html';
}

function openFeedback() {
    document.getElementById('feedback-modal').style.display = 'flex';
}

function submitFeedback() {
    document.getElementById('feedback-modal').style.display = 'none';
    
    const toast = document.getElementById('toast');
    toast.style.top = '100px'; // Adjusted slightly for the new theme layout

    // Save cart items to local storage so the checkout page can read the price
    localStorage.setItem('orderItems', JSON.stringify(cartItems));

    setTimeout(() => {
        window.location.href = 'order.html';
    }, 1500);
}

// NEW: Theme toggle logic to match Admin dashboard
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const toggle = document.querySelector('.theme-toggle');
    toggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
}
async function askBotForDiscount(currentPrice) {
    const res = await fetch('http://localhost:8080/api/orders/negotiate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ price: currentPrice })
    });
    const data = await res.json();
    document.getElementById('total-display').innerText = `LKR ${data.newPrice}`;
    alert(data.reply);
}


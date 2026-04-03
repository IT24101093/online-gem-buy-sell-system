// Changed to 'let' so we can modify the array when deleting items
let cartItems = [
    { id: 1, name: "Natural Royal Ruby", price: 150000, type: "Precious", img: "image1.jpg" },
    { id: 2, name: "Blue Velvet Sapphire", price: 220000, type: "Precious", img: "image2.jpg" },
    { id: 3, name: "Imperial Topaz", price: 120000, type: "Semi-Precious", img: "image3.jpg" },
    { id: 4, name: "Purple Amethyst", price: 90000, type: "Semi-Precious", img: "image5.jpg" }
];

document.addEventListener("DOMContentLoaded", () => {
    renderCart("all");
});

function renderCart(filter = "all") {
    const list = document.getElementById('cart-list');
    list.innerHTML = "";
    let totalPrice = 0;

    const filteredItems = filter === "all" ? cartItems : cartItems.filter(item => item.type === filter);

    // Show empty message if no items are left
    if(filteredItems.length === 0) {
        list.innerHTML = `<p style="padding: 2rem; color: #64748b; font-weight: 600;">Your cart is empty.</p>`;
    }

    filteredItems.forEach((item) => {
        totalPrice += item.price;
        // Clean semantic HTML injection with checkbox added
        list.innerHTML += `
            <div class="cart-item animate__animated animate__fadeInUp">
                <div class="item-details">
                    <input type="checkbox" class="item-checkbox" data-id="${item.id}">
                    
                    <img src="${item.img}" alt="${item.name}" class="item-img" onerror="this.src='https://placehold.co/100x100?text=No+Image'">
                    <div>
                        <p class="item-type">${item.type}</p>
                        <h4 class="item-title">${item.name}</h4>
                    </div>
                </div>
                <div class="item-price">
                    LKR ${item.price.toLocaleString()}
                </div>
            </div>
        `;
    });

    document.getElementById('total-display').innerText = `LKR ${totalPrice.toLocaleString()}`;

    // Re-initialize Lucide icons in case any are added dynamically
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function goToDetails() {
    window.location.href = 'order-details.html';
}

function openFeedback() {
    // Reveal Modal via CSS class
    const modal = document.getElementById('feedback-modal');
    modal.classList.remove('hidden');
}

function submitFeedback() {
    // Hide Modal via CSS class
    const modal = document.getElementById('feedback-modal');
    modal.classList.add('hidden');

    // Animate Toast via CSS class
    const toast = document.getElementById('toast');
    toast.classList.add('show');

    // Save CURRENT items to pass to order.html / order.js (deleted items won't be passed!)
    localStorage.setItem('orderItems', JSON.stringify(cartItems));

    setTimeout(() => {
        window.location.href = 'order.html';
    }, 1500);
}

// Function to delete selected items
// --- Custom Deletion Logic ---

let itemsToDelete = []; // Temporarily store the IDs to delete

// 1. Triggered when the "Delete Selected" button is clicked
function deleteSelected() {
    const checkedBoxes = document.querySelectorAll('.item-checkbox:checked');

    if (checkedBoxes.length === 0) {
        // Show our custom Alert Modal instead of the ugly browser alert
        document.getElementById('alert-modal').classList.remove('hidden');
        return;
    }

    // Grab IDs and prep the custom Confirm Modal
    itemsToDelete = Array.from(checkedBoxes).map(box => parseInt(box.getAttribute('data-id')));
    document.getElementById('confirm-message').innerText = `Are you sure you want to remove ${checkedBoxes.length} item(s) from your cart?`;
    document.getElementById('confirm-modal').classList.remove('hidden');
}

// 2. Close the Alert Modal
function closeAlertModal() {
    document.getElementById('alert-modal').classList.add('hidden');
}

// 3. Close the Confirm Modal without deleting
function closeConfirmModal() {
    document.getElementById('confirm-modal').classList.add('hidden');
    itemsToDelete = []; // Clear the temporary list
}

// 4. Actually delete the items if they click "Yes, Delete"
function executeDelete() {
    // Filter the cartItems array to KEEP only the items that were NOT selected
    cartItems = cartItems.filter(item => !itemsToDelete.includes(item.id));

    // Re-render the cart
    renderCart("all");

    // Close the modal
    closeConfirmModal();
}
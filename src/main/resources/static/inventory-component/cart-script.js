// 1. DECLARE GLOBALLY AT THE TOP
let cartItems = [];

async function fetchRealCart() {
    const myCartId = localStorage.getItem('myCartId');
    console.log("Fetching cart for ID:", myCartId); // DEBUG

    if (!myCartId) {
        renderCart('all');
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/cart/${myCartId}`);
        if (response.ok) {
            const dbItems = await response.json();
            console.log("Raw Data from Backend:", dbItems); // DEBUG: Check imageUrl content here

            cartItems = dbItems.map(item => {
                let finalImgPath = "";
                let rawUrl = item.imageUrl || "";

                // 1. Clean up potential database slashes
                if (rawUrl.startsWith('/')) {
                    rawUrl = rawUrl.substring(1);
                }

                if (rawUrl) {
                    // CASE A: It is a Gem (Uploads folder)
                    // Check if the path contains 'uploads/'
                    if (rawUrl.includes('uploads/')) {
                        // Remove 'gem-photos/' if it exists as a prefix to avoid /gem-photos/uploads/
                        const cleanUploadPath = rawUrl.replace('gem-photos/', '');
                        finalImgPath = `http://localhost:8080/${cleanUploadPath}`;
                    }

                    // CASE B: It is Jewelry (Static gem-photos folder)
                    else {
                        // If the DB already has 'gem-photos/ring.jpg', remove the prefix first
                        const fileNameOnly = rawUrl.replace('gem-photos/', '');
                        // Then add it back once to ensure it's http://localhost:8080/gem-photos/ring.jpg
                        finalImgPath = `http://localhost:8080/gem-photos/${fileNameOnly}`;
                    }
                } else {
                    // CASE C: Fallback for missing images
                    finalImgPath = "https://placehold.co/150x150?text=No+Image";
                }

                console.log(`Mapping ${item.gemName}: Final URL -> ${finalImgPath}`);

                return {
                    id: item.cartItemId,
                    listingId: item.listingId,
                    jewelleryId: item.jewelleryId, // Ensure your DTO sends this!
                    name: item.gemName,
                    price: item.unitPriceLkr,
                    // If listingId is null, it's Jewelry; otherwise, it's a Gem
                    type: item.listingId ? "Gem" : "Jewellery",
                    img: finalImgPath,
                    quantity: 1
                };
            });
            renderCart('all');
            if (typeof updateOrderSummary === "function") updateOrderSummary();
        }
    } catch (error) {
        console.error("Error fetching cart:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderCart("all");
});

function renderCart(filter = "all") {
    const list = document.getElementById('cart-list');
    list.innerHTML = "";
    let totalPrice = 0;

    // Filter items based on type
    const filteredItems = filter === "all" ? cartItems : cartItems.filter(item => item.type === filter);

    // Show empty message if no items are left
    if (filteredItems.length === 0) {
        list.innerHTML = `<p style="padding: 2rem; color: #64748b; font-weight: 600;">Your cart is empty.</p>`;
        document.getElementById('total-display').innerText = `LKR 0`;
        return;
    }

    filteredItems.forEach((item) => {
        // Ensure price is a number (BigDecimal from Java sometimes arrives as a string)
        const itemPrice = Number(item.price) || 0;
        totalPrice += itemPrice;

        // Clean semantic HTML injection
        list.innerHTML += `
            <div class="cart-item animate__animated animate__fadeInUp">
                <div class="item-details">
                    <input type="checkbox" class="item-checkbox" data-id="${item.id}">
                    
                    <img src="${item.img}" 
                         alt="${item.name}" 
                         class="item-img" 
                         onerror="this.src='https://placehold.co/100x100?text=No+Image'">
                    
                    <div>
                        <p class="item-type">${item.type}</p>
                        <h4 class="item-title">${item.name}</h4>
                    </div>
                </div>
                <div class="item-price">
                    LKR ${itemPrice.toLocaleString()}
                </div>
            </div>
        `;
    });

    // Update the total price display
    document.getElementById('total-display').innerText = `LKR ${totalPrice.toLocaleString()}`;

    // Re-initialize Lucide icons if you're using them for checkboxes or UI
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
// 4. Actually delete the items from the DATABASE and the UI
// 4. Actually delete the items from the DATABASE and the UI
async function executeDelete() {
    try {
        // Step A: Send DELETE requests to your Spring Boot backend for every selected ID
        const deletePromises = itemsToDelete.map(id =>
            fetch(`http://localhost:8080/api/cart/items/${id}`, {
                method: 'DELETE'
            })
        );

        // Wait for all database deletions to finish
        const results = await Promise.all(deletePromises);

        if (results.every(res => res.ok)) {
            console.log("Successfully removed from Database.");

            // Step B: Update the local array to match the new database state
            cartItems = cartItems.filter(item => !itemsToDelete.includes(item.id));

            // Step C: If the cart is now empty, clear the ID from the browser
            // This ensures your backend logic to delete the 'Cart' header works next time
            if (cartItems.length === 0) {
                localStorage.removeItem('myCartId');
            }

            // Step D: Re-render the UI
            renderCart("all");
            if (typeof updateOrderSummary === "function") updateOrderSummary();
        } else {
            alert("Failed to delete some items from the server.");
        }

    } catch (error) {
        console.error("Error during deletion:", error);
    } finally {
        closeConfirmModal();
    }
}




// 5. Run this function automatically as soon as the Cart Page loads!
document.addEventListener("DOMContentLoaded", () => {
    fetchRealCart();
});
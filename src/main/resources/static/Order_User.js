let timerInterval;
let currentOrderDetails = {}; // Temporarily holds order info to send to Admin

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = message;
    toast.style.top = '20px';
    setTimeout(() => {
        toast.style.top = '-100px';
    }, 3000);
}

document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const age = document.getElementById('custAge').value;
    const nic = document.getElementById('custNIC').value;
    const phone = document.getElementById('custPhone').value;
    const name = document.getElementById('custName').value;
    const address = document.getElementById('custAddress').value;

    if (isNaN(age) || age <= 0) {
        showToast("Age must be a valid number.");
        return;
    }
    if (nic.length !== 12 || isNaN(nic)) {
        showToast("NIC must be exactly 12 numbers.");
        return;
    }
    if (phone.length !== 10 || isNaN(phone)) {
        showToast("Contact must be 10 numbers.");
        return;
    }

    // Generate Order ID automatically
    const orderId = "#GEM-" + Math.floor(1000 + Math.random() * 9000);

    // Save details to our temporary object
    currentOrderDetails = {
        id: orderId,
        name: name,
        phone: "+94 " + phone,
        address: address,
        status: "processing", // Sends to the 'Processing' column in Admin
        gems: "Pending Items", 
        amount: "Pending LKR",
        date: new Date().toISOString().split('T')[0] // Today's Date
    };

    // If we have cart data from the previous page, attach it to the order
    const storedCart = JSON.parse(localStorage.getItem('orderItems') || '[]');
    if(storedCart.length > 0) {
        const total = storedCart.reduce((sum, item) => sum + item.price, 0);
        currentOrderDetails.amount = `LKR ${total.toLocaleString()}`;
        currentOrderDetails.gems = storedCart.map(i => i.name).join(', ');
    }

    // Show details in the confirm popup
    document.getElementById('summary-details').innerHTML = `
        <p style="text-align:left;">
        <strong>Order ID:</strong> ${orderId}<br>
        <strong>Name:</strong> ${name}<br>
        <strong>Address:</strong> ${address}</p>
    `;

    document.getElementById('confirm-modal').style.display = 'flex';
    startTimer(120); // 2 minute timer
});

function startTimer(duration) {
    let timer = duration, min, sec;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        min = Math.floor(timer / 60);
        sec = timer % 60;
        document.getElementById('timer').textContent = `${min < 10 ? '0'+min : min}:${sec < 10 ? '0'+sec : sec}`;
        if (--timer < 0) {
            clearInterval(timerInterval);
            closePopup();
            showToast("Session expired. Please try again.");
        }
    }, 1000);
}

function closePopup() {
    document.getElementById('confirm-modal').style.display = 'none';
    clearInterval(timerInterval);
}

function finalRedirect() {
    // 1. Stop timer and hide confirm popup
    clearInterval(timerInterval);
    document.getElementById('confirm-modal').style.display = 'none';
    
    // 2. Show loading message
    showToast("Processing Secure Connection...");
    
    // 3. Put the Order ID into the new payment modal
    document.getElementById('display-order-id').innerText = currentOrderDetails.id;
    
    // 4. Show the payment modal after 1.5 seconds
    setTimeout(() => {
        document.getElementById('payment-modal').style.display = 'flex';
    }, 1500);
}

// NEW FUNCTION: Handles the click on "Pay Now"
function proceedToPayment() {
    // 1. Save this order so the Admin Dashboard can see it
    let existingOrders = JSON.parse(localStorage.getItem('adminOrders') || '[]');
    existingOrders.push(currentOrderDetails);
    localStorage.setItem('adminOrders', JSON.stringify(existingOrders));

    // 2. Clear out the user's cart now that the order is placed
    localStorage.removeItem('orderItems');

    // 3. Show redirect message
    showToast("Redirecting to Payment Gateway...");
    
    // 4. Redirect to a Dummy Payment Gateway or Success Page
    setTimeout(() => {
        // You can change this URL to an actual payment gateway later (like Stripe/PayHere)
        window.location.href = "OrderCart.html";
    }, 1500);
}

// NEW: Theme toggle logic to match Admin/Cart dashboard
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const toggle = document.querySelector('.theme-toggle');
    toggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
}
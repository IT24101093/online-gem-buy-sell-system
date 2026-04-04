let timerInterval;
let currentOrderDetails = {}; 
let calculatedTotal = 0; 

function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = message;
    toast.style.top = '20px';
    setTimeout(() => {
        toast.style.top = '-100px';
    }, 3000);
}

// Dynamically populate the secondary dropdown based on Local vs International
function updateCouriers() {
    const region = document.getElementById('shippingMethod').value;
    const courierGroup = document.getElementById('courierGroup');
    const courierSelect = document.getElementById('courierService');
    
    courierSelect.innerHTML = '<option value="" disabled selected>Select a courier...</option>';
    
    if (region === 'local') {
        const localOptions = ['Koombiyo', 'Domex', 'Pronto'];
        localOptions.forEach(opt => {
            courierSelect.innerHTML += `<option value="${opt}">${opt}</option>`;
        });
        courierGroup.style.display = 'block';
    } else if (region === 'international') {
        const intlOptions = ['DHL Express', 'FedEx'];
        intlOptions.forEach(opt => {
            courierSelect.innerHTML += `<option value="${opt}">${opt}</option>`;
        });
        courierGroup.style.display = 'block';
    } else {
        courierGroup.style.display = 'none';
    }
    
    resetCalculation();
}

function resetCalculation() {
    document.getElementById('fee-breakdown').style.display = 'none';
    document.getElementById('btn-calculate').style.display = 'block';
    document.getElementById('btn-confirm-submit').style.display = 'none';
}

function calculateFee() {
    const age = document.getElementById('custAge').value;
    const nic = document.getElementById('custNIC').value;
    const phone = document.getElementById('custPhone').value;
    const name = document.getElementById('custName').value;
    const address = document.getElementById('custAddress').value;
    const shippingMethod = document.getElementById('shippingMethod').value;
    const courierService = document.getElementById('courierService').value;

    // Validate inputs
    if (!name || !address) { showToast("Please fill in your name and address."); return; }
    if (isNaN(age) || age <= 0) { showToast("Age must be a valid number."); return; }

    // ✅ FIXED NIC VALIDATION
    if (!/^[0-9]{11}[vVxX]$/.test(nic)) { 
        showToast("NIC must be 11 digits + last letter (V or X)."); 
        return; 
    }

    if (phone.length !== 10 || isNaN(phone)) { showToast("Contact must be 10 numbers."); return; }
    if (!shippingMethod) { showToast("Please select a shipping region."); return; }
    if (!courierService) { showToast("Please select a specific courier service."); return; }

    const storedCart = JSON.parse(localStorage.getItem('orderItems') || '[]');
    const cartTotal = storedCart.reduce((sum, item) => sum + item.price, 0);
    const finalCartTotal = cartTotal > 0 ? cartTotal : 0; 

    const shippingCost = (shippingMethod === 'local') ? 500 : 5000;
    
    const isInsured = document.getElementById('addInsurance').checked;
    const insuranceFee = isInsured ? (finalCartTotal * 0.02) : 0;
    
    calculatedTotal = finalCartTotal + shippingCost + insuranceFee;

    document.getElementById('calc-subtotal').innerText = `LKR ${finalCartTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('calc-shipping').innerText = `LKR ${shippingCost.toLocaleString()}`;
    
    if (isInsured) {
        document.getElementById('insurance-row').style.display = 'flex';
        document.getElementById('calc-insurance').innerText = `LKR ${insuranceFee.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    } else {
        document.getElementById('insurance-row').style.display = 'none';
    }
    
    document.getElementById('calc-total').innerText = `LKR ${calculatedTotal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    document.getElementById('fee-breakdown').style.display = 'block';
    document.getElementById('btn-calculate').style.display = 'none';
    document.getElementById('btn-confirm-submit').style.display = 'block';
}

document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('custName').value;
    const phone = document.getElementById('custPhone').value;
    const address = document.getElementById('custAddress').value;
    
    const courierSelect = document.getElementById('courierService');
    const courierText = courierSelect.options[courierSelect.selectedIndex].text;
    const isInsured = document.getElementById('addInsurance').checked;

    const orderId = "#GEM-" + Math.floor(1000 + Math.random() * 9000);

    currentOrderDetails = {
        id: orderId,
        name: name,
        phone: "+94 " + phone,
        address: address,
        status: "processing", 
        gems: "Pending Items", 
        amount: `LKR ${calculatedTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}`, 
        date: new Date().toISOString().split('T')[0] 
    };

    const storedCart = JSON.parse(localStorage.getItem('orderItems') || '[]');
    if(storedCart.length > 0) {
        currentOrderDetails.gems = storedCart.map(i => i.name).join(', ');
    }

    document.getElementById('summary-details').innerHTML = `
        <p style="text-align:left;">
        <strong>Order ID:</strong> ${orderId}<br>
        <strong>Name:</strong> ${name}<br>
        <strong>Delivery:</strong> ${courierText} ${isInsured ? '(Insured)' : ''}<br>
        <strong>Total to Pay:</strong> LKR ${calculatedTotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
    `;

    document.getElementById('confirm-modal').style.display = 'flex';
    startTimer(120); 
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
    clearInterval(timerInterval);
    document.getElementById('confirm-modal').style.display = 'none';
    showToast("Processing Secure Connection...");
    document.getElementById('display-order-id').innerText = currentOrderDetails.id;
    
    setTimeout(() => {
        document.getElementById('payment-modal').style.display = 'flex';
    }, 1500);
}

async function proceedToPayment() {
    // 1. UI Protection: Disable button to prevent double-submissions during DB operations
    const payButton = document.getElementById('btn-proceed');
    if (payButton) payButton.disabled = true;

    // 2. Get Form Values
    const fullName = document.getElementById('custName').value;
    const ageValue = document.getElementById('custAge').value;
    const nic = document.getElementById('custNIC').value.trim();
    const phone = document.getElementById('custPhone').value;
    const address = document.getElementById('custAddress').value;

    // 3. Process Name Parts
    const nameParts = fullName.trim().split(" ");
    const firstName = nameParts[0] || "Unknown";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Unknown";

    // 4. Get Cart Data from LocalStorage
    const savedCartId = localStorage.getItem('myCartId');
    const cartItems = JSON.parse(localStorage.getItem('orderItems') || '[]');

    // Use the first item ID as the 'primary' inventoryId for the Order record
    const purchasedItem = cartItems.length > 0 ? cartItems[0] : null;
    const gemId = purchasedItem ? purchasedItem.id : 0;

    // 5. Build Payload (Validations are assumed to be done before calling this)
    const payload = {
        customerDTO: {
            firstName: firstName,
            lastName: lastName,
            deliveryAddress: address,
            nic: nic,
            age: parseInt(ageValue) || 0,
            contactNo: phone
        },
        orderDTO: {
            inventoryId: gemId,
            deliveryServiceId: 1,
            cartId: savedCartId ? parseInt(savedCartId) : null
        }
    };

    showToast("Processing payment...");

    try {
        const response = await fetch('http://localhost:8080/api/orders/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // SUCCESS: The backend has moved items to order_item and deleted the cart

            // 6. Clear Local Storage
            localStorage.removeItem('orderItems');
            localStorage.removeItem('myCartId');

            showToast("Payment successful! Order Saved.");

            // Redirect to success page
            setTimeout(() => {
                window.location.href = "payment-success.html";
            }, 1500);

        } else {
            // Re-enable button if server returns an error (e.g., 400 or 500)
            if (payButton) payButton.disabled = false;

            const errorData = await response.json();
            const firstError = Object.values(errorData)[0];
            showToast("Error: " + (firstError || "Failed to process order."));
        }
    } catch (error) {
        // Re-enable button if there is a network error
        if (payButton) payButton.disabled = false;
        console.error("Network error:", error);
        showToast("Error connecting to server.");
    }
}
function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const toggle = document.querySelector('.theme-toggle');
    toggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
}
let timerInterval;
let currentOrderDetails = {};

// 1. Toast Notification Logic
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    if (toast && toastMsg) {
        toastMsg.innerText = message;
        toast.style.top = '20px';
        setTimeout(() => {
            toast.style.top = '-100px';
        }, 3000);
    }
}

// 2. Shipping Dropdown Logic
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
}

// 3. THIS FIXES THE CALCULATE BUTTON
function calculateFee() {
    const form = document.getElementById('orderForm');

    // Check if the form is valid (all required fields filled)
    if (!form.checkValidity()) {
        form.reportValidity(); // Shows "Please fill out this field" to user
        return;
    }

    const name = document.getElementById('custName').value;
    const age = document.getElementById('custAge').value;
    const address = document.getElementById('custAddress').value;
    const nic = document.getElementById('custNIC').value;
    const phone = document.getElementById('custPhone').value;

    // Prepare data for Backend DTO
    currentOrderDetails = {
        customerDTO: {
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' ') || "Customer",
            deliveryAddress: address,
            contactNo: phone,
            nic: nic,
            age: parseInt(age)
        },
        orderDTO: {
            inventoryId: 1,
            deliveryServiceId: 1
        }
    };

    // Populate Summary Modal
    document.getElementById('summary-details').innerHTML = `
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Age:</strong> ${age}</p>
        <p><strong>Address:</strong> ${address}</p>
        <p><strong>NIC:</strong> ${nic}</p>
    `;

    // Show the Modal
    document.getElementById('confirm-modal').style.display = 'flex';
    startTimer(120);
}

// 4. Timer & Modal Control
function startTimer(duration) {
    let timer = duration, min, sec;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        min = parseInt(timer / 60, 10);
        sec = parseInt(timer % 60, 10);
        document.getElementById('timer').textContent = `${min < 10 ? '0' + min : min}:${sec < 10 ? '0' + sec : sec}`;
        if (--timer < 0) {
            clearInterval(timerInterval);
            closePopup();
            showToast("Session expired.");
        }
    }, 1000);
}

function closePopup() {
    document.getElementById('confirm-modal').style.display = 'none';
    clearInterval(timerInterval);
}

function finalRedirect() {
    document.getElementById('confirm-modal').style.display = 'none';
    document.getElementById('display-order-id').innerText = "PENDING...";
    document.getElementById('payment-modal').style.display = 'flex';
}

// 5. Backend Connection
async function proceedToPayment() {
    showToast("Processing with Database...");

    try {
        const response = await fetch('http://localhost:8080/api/orders/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentOrderDetails)
        });

        if (response.ok) {
            const data = await response.json();
            showToast("Order #" + data.orderId + " Created!");

            // Clean up cart
            localStorage.removeItem('orderItems');

            setTimeout(() => {
                // UPDATED: Pass the orderId as a URL parameter (?id=...)
                window.location.href = `payment-success.html?id=${data.orderId}`;
            }, 2000);
        } else {
            const errorData = await response.json();
            // Displays your Java validation error
            showToast("Error: " + (errorData.age || "Invalid Details"));
            document.getElementById('payment-modal').style.display = 'none';
        }
    } catch (error) {
        showToast("Backend Offline! Check IntelliJ.");
    }
}

function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const toggle = document.querySelector('.theme-toggle');
    if (toggle) {
        toggle.textContent = document.body.classList.contains('light-mode') ? '☀️' : '🌙';
    }
}

// 6. Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Stop form from doing a default refresh
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.onsubmit = (e) => e.preventDefault();
    }
});


// 5. DELETE FROM DATABASE
async function deleteOrder(orderId) {
    const displayId = "#GEM-" + String(orderId).padStart(3, '0');

    // Using your existing Modal logic
    const modal = document.getElementById('deleteModal');
    if(modal) {
        document.getElementById('deleteMessage').textContent = `Delete order ${displayId}? This will remove it from MySQL permanently.`;
        modal.style.display = 'flex';
    }

    // Set the confirm button action
    document.getElementById('confirmDelete').onclick = async function() {
        try {
            const response = await fetch(`${API_BASE_URL}/${orderId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showNotification(`Order ${displayId} deleted successfully`, 'success');
                // Refresh the list immediately from the database
                loadOrdersFromBackend();
            } else {
                showNotification("Could not delete. Check Backend logs.", "error");
            }
        } catch (error) {
            console.error("Delete Error:", error);
            showNotification("Server Error during deletion.", "error");
        }

        if(modal) modal.style.display = 'none';
    }

    // Set the cancel button action
    document.getElementById('cancelDelete').onclick = () => {
        if(modal) modal.style.display = 'none';
    };
}


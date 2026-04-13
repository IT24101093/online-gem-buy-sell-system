const money = (n) => `LKR ${Number(n).toFixed(2)}`;
const byId = (id) => document.getElementById(id);

function setErr(id, msg){
    const el = byId(id);
    if (el) el.textContent = msg || "";
}

function onlyDigits(s){ return (s || "").replace(/\D/g, ""); }

// Luhn algorithm for card validation
function isValidCardLuhn(cardNumber){
    const digits = onlyDigits(cardNumber);
    if (digits.length < 13) return false;

    let sum = 0;
    let shouldDouble = false;

    for (let i = digits.length - 1; i >= 0; i--){
        let d = parseInt(digits[i], 10);
        if (shouldDouble){
            d *= 2;
            if (d > 9) d -= 9;
        }
        sum += d;
        shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
}

function qualityMultiplier(grade){
    if (grade === "A") return 2.50;
    if (grade === "B") return 1.50;
    return 1.00;
}

// ---------- Checkout Page Logic ----------
// ---------- Checkout Page Logic ----------
function initCheckout(){
    // --- 1. LOAD DATA FROM LOCAL STORAGE ---
    const orderId = localStorage.getItem('currentOrderId');
    const baseTotal = parseFloat(localStorage.getItem('currentOrderTotal')) || 0;

    // --- 2. POPULATE THE UI ---
    if (orderId) {
        // You can display the order ID somewhere if you add an element for it
        console.log("Processing Payment for Order:", orderId);
        console.log("Loaded Total Amount:", baseTotal); // Let's check if it loads correctly!

        // Update the summary amounts in form.html
        const sumBase = document.getElementById('sumBase');
        const sumTotal = document.getElementById('sumTotal');
        const goPayBtn = document.getElementById('goPay');

        if (sumBase) sumBase.textContent = money(baseTotal);
        if (sumTotal) sumTotal.textContent = money(baseTotal);

        // Enable the proceed button now that we have real data
        if (goPayBtn) {
            goPayBtn.setAttribute('aria-disabled', 'false');
        }
    }


    const btnCalc = byId("btnCalculate");
    const btnReset = byId("btnReset");
    if (!btnCalc || !btnReset) return;

    const goPay = byId("goPay");
    const promoInput = byId("promo");

    btnCalc.addEventListener("click", () => {

        // 1. Get the base price AND the real Order ID from your database!
        let base = parseFloat(localStorage.getItem('currentOrderTotal')) || 0;
        let realOrderId = localStorage.getItem('currentOrderId') || 1; // Fallback to 1 if missing

        // User inputs
        const promo = (promoInput.value || "").trim().toUpperCase();
        const cert = byId("addonCert") ? byId("addonCert").checked : false;

        // Calculate Add-ons & Fixed Tax
        const addons = cert ? 1500 : 0;
        const tax = 500; // 🟢 Your fixed tax amount!

        // Promo logic
        let promoDiscount = 0;
        const promoMsg = byId("promoMsg");

        if (promo === "GEM10"){
            promoDiscount = base * 0.10;
            if(promoMsg) promoMsg.innerHTML = `<span style="color: var(--success);">Promo applied! 10% off.</span>`;
        } else if (promo !== "") {
            if(promoMsg) promoMsg.innerHTML = `<span style="color: var(--danger);">Invalid promo code.</span>`;
        } else {
            if(promoMsg) promoMsg.textContent = "Try: GEM10 (10% off subtotal)";
        }

        // Final Math: Base + Addons + Tax - Discount
        const total = Math.max(0, base + addons + tax - promoDiscount);

        // Update UI Summary
        byId("sumBase").textContent = money(base);
        byId("sumAddons").textContent = money(addons);

        // 🟢 Update Tax UI (Make sure you added the HTML row for this!)
        if (byId("sumTax")) {
            byId("sumTax").textContent = money(tax);
        }

        byId("sumDisc").textContent = `- ${money(promoDiscount)}`;
        byId("sumTotal").textContent = money(total);

        byId("calcNotice").innerHTML = `Calculated successfully. <b>Total payable: ${money(total)}</b>`;

        // 🟢 Save the REAL Order ID and REAL calculations to pass to the Payment Page
        localStorage.setItem("checkoutData", JSON.stringify({
            orderId: parseInt(realOrderId), // Real ID from DB!
            base: base,
            addons: addons,
            shipping: 0,
            tax: tax, // Real Tax!
            discount: promoDiscount,
            totalDiscount: promoDiscount,
            total: total,
            createdAt: new Date().toISOString()
        }));

        if (goPay){
            goPay.setAttribute("aria-disabled", "false");
            goPay.classList.remove("disabled");
        }
    });

    btnReset.addEventListener("click", () => {
        localStorage.removeItem("checkoutData");
        location.reload();
    });
    
    // Auto-calculate on page load so the summary populates immediately
    btnCalc.click();
}

// ---------- Payment Page Logic ----------
function initPayment(){
    const btnPay = byId("btnPayNow");
    if (!btnPay) return; // not on payment page

    const previewOrderId = byId("pOrderId");
    const previewAmount = byId("pAmount");
    const previewStatus = byId("pStatus");

    const dataRaw = localStorage.getItem("checkoutData");
    const data = dataRaw ? JSON.parse(dataRaw) : null;

    if (data){
        previewOrderId.textContent = data.orderId;
        previewAmount.textContent = money(data.total);
    } else {
        previewOrderId.textContent = "ORD-—";
        previewAmount.textContent = money(0);
        byId("payNotice").textContent = "No checkout found. Please calculate total on Checkout page first.";
    }

    // Format card number input nicely
    const cardNumber = byId("cardNumber");
    if (cardNumber){
        cardNumber.addEventListener("input", () => {
            const digits = onlyDigits(cardNumber.value).slice(0, 16);
            cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
        });
    }

    btnPay.addEventListener("click", async () => {
        btnPay.innerHTML = '<span class="spinner"></span> Processing...';
        btnPay.disabled = true;

        // 1. Read values from the form
        const method = document.querySelector('input[name="method"]:checked')?.value || "CARD";
        const number = (byId("cardNumber").value || "").trim();
        const email = (byId("email").value || "").trim();
        const phone = (byId("phone").value || "").trim();

        // 1. Retrieve the real Order ID AND Total we saved during the Order step
       // const realOrderId = parseInt(localStorage.getItem('currentOrderId'));
        //const realOrderTotal = parseFloat(localStorage.getItem('currentOrderTotal')) || 0;

        // Make sure we are pulling the saved calculations from the Checkout step
        const dataRaw = localStorage.getItem("checkoutData");
        const data = dataRaw ? JSON.parse(dataRaw) : {};

        // 2. Prepare the payload
        const payload = {
            orderId: parseInt(data.orderId),
            subtotalLkr: data.base || 0,
            addonsLkr: data.addons || 0,          // 🟢 Now captures your LKR 1500 add-on!
            shippingLkr: data.shipping || 0,
            taxLkr: data.tax || 0,                // 🟢 Now captures your LKR 500 tax!
            discountLkr: data.discount || 0,
            totalAmountLkr: data.total || 0,      // 🟢 The true grand total!
            method: method,
            paymentMethod: method,
            gatewayName: method === "CARD" ? "Stripe" : "Cash On Delivery",
            gatewayReference: "REF-" + Date.now(),
            cardNumber: method === "CARD" ? onlyDigits(number) : null
        };



// Quick safety check
        if (!payload.orderId) {
            console.error("Missing Order ID!");
            setErr("cardErr", "Invalid Order Session. Please go back to checkout.");
            return;
        }

        try {
            // 3. Send request to Java Backend
            const response = await fetch("http://localhost:8080/api/payments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorMsg = await response.text();
                throw new Error(errorMsg || "Payment failed at server");
            }

            // 4. Get the REAL transaction from the DB and save it for the Receipt
            const savedTxn = await response.json();
            localStorage.setItem("lastPayment", JSON.stringify(savedTxn));

            byId("payNotice").innerHTML = `<span style="color:green">Success! Saved to Database.</span>`;

            setTimeout(() => {
                window.location.href = "receipt.html";
            }, 1000);

        } catch (error) {
            console.error("Payment Error:", error);
            byId("payNotice").innerHTML = `<span style="color:red">Error: ${error.message}</span>`;
            btnPay.disabled = false;
            btnPay.textContent = "Pay Now";
        }
    });
}

// Name on Card:(Only strings)
const cardNameInput = byId("cardName");
if (cardNameInput) {
    cardNameInput.addEventListener("input", () => {
        cardNameInput.value = cardNameInput.value.replace(/[^a-zA-Z\s]/g, "");
    });
}

// Expiry (MM/YY): (Only integers and /)
const expiryInput = byId("expiry");
if (expiryInput) {
    expiryInput.addEventListener("input", () => {

        let v = expiryInput.value.replace(/[^\d/]/g, "");

        // autofill / command
        if (v.length === 2 && !v.includes("/")) {
            v = v + "/";
        }
        expiryInput.value = v.slice(0, 5);
    });
}

// Phone Number:(Only integers)
const phoneInput = byId("phone");
if (phoneInput) {
    phoneInput.addEventListener("input", () => {
        phoneInput.value = phoneInput.value.replace(/\D/g, "");
    });
}

// ---------- Receipt Page Logic ----------
function initReceipt(){
    const rTitle = byId("rTitle");
    if (!rTitle) return;

    const raw = localStorage.getItem("lastPayment");
    if (!raw){
        byId("rBadge").textContent = "—";
        return;
    }

    const txn = JSON.parse(raw);

    // Accept both SUCCESS (Card) and PENDING (Cash) as positive results
    const ok = txn.status === "SUCCESS" || txn.status === "PENDING";

    // Update main text based on status and method
    byId("rTitle").textContent = ok ? "Order Placed!" : "Payment Failed";
    byId("rSub").textContent = (txn.method === "CASH")
        ? "Please have your cash ready upon delivery."
        : "Thank you. Your transaction is recorded.";

    byId("rBadge").textContent = txn.status;
    byId("rPaymentId").textContent = txn.paymentId;
    byId("rOrderId").textContent = txn.orderId;
    byId("rMethod").textContent = txn.method;

    // FIX: Use totalAmountLkr to match your updated Java Backend entity
    // We check for both just in case, but totalAmountLkr is the primary field now.
    const finalAmount = txn.totalAmountLkr || txn.amount || 0;
    byId("rAmount").textContent = money(finalAmount);

    byId("rTime").textContent = new Date(txn.createdAt).toLocaleString();

    // The button logic for your print-based PDF
    const btn = byId("downloadBtn"); // Ensure this matches the ID in your HTML
    if (btn) {
        btn.onclick = () => window.print();
    }
}

// ---------- Boot ----------
initCheckout();
initPayment();
initReceipt();
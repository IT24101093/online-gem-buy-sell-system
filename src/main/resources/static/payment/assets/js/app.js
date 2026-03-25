// ---------- Helpers ----------
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
    if (grade === "A") return 1.25;
    if (grade === "B") return 1.10;
    return 1.00;
}

// ---------- Checkout Page Logic ----------
function initCheckout(){
    const btnCalc = byId("btnCalculate");
    const btnReset = byId("btnReset");
    if (!btnCalc || !btnReset) return; // not on checkout

    const goPay = byId("goPay");

    btnCalc.addEventListener("click", () => {
        // Read values
        const gemName = (byId("gemName").value || "").trim();
        const weight = parseFloat(byId("weightCarats").value);
        const ppc = parseFloat(byId("pricePerCarat").value);
        const grade = byId("qualityGrade").value;
        const taxRatePct = parseFloat(byId("taxRate").value);
        const shipping = parseFloat(byId("shippingFee").value);
        const discount = parseFloat(byId("discount").value);
        const promo = (byId("promo").value || "").trim().toUpperCase();
        const cert = byId("addonCert").checked;
        const ins = byId("addonIns").checked;

        // Clear errors
        ["errGemName","errWeight","errPpc","errTax","errShip","errDiscount"].forEach(k => setErr(k,""));

        // Validations
        let ok = true;

        if (!gemName || gemName.length < 2){
            setErr("errGemName", "Enter a valid gem name (min 2 letters).");
            ok = false;
        }
        if (!(weight > 0) || weight > 100){
            setErr("errWeight", "Weight must be > 0 and realistic (≤ 100 carats).");
            ok = false;
        }
        if (!(ppc > 0) || ppc > 100000000){
            setErr("errPpc", "Price per carat must be > 0.");
            ok = false;
        }
        if (!(taxRatePct >= 0) || taxRatePct > 25){
            setErr("errTax", "Tax must be between 0% and 25%.");
            ok = false;
        }
        if (!(shipping >= 0)){
            setErr("errShip", "Shipping cannot be negative.");
            ok = false;
        }
        if (!(discount >= 0)){
            setErr("errDiscount", "Discount cannot be negative.");
            ok = false;
        }

        if (!ok){
            byId("calcNotice").textContent = "Fix validation errors to calculate total.";
            if (goPay){
                goPay.setAttribute("aria-disabled", "true");
                goPay.classList.add("disabled");
            }
            return;
        }

        const mul = qualityMultiplier(grade);
        const base = ppc * weight;

        const addons =
            (cert ? 2500 : 0) +
            (ins ? 1500 : 0);

        // Promo example: GEM10 gives 10% off base only (not addons)
        let promoDiscount = 0;
        if (promo === "GEM10"){
            promoDiscount = base * 0.10;
        }

        const preTax = base * mul + addons + shipping;
        const tax = preTax * (taxRatePct / 100);

        // Total discount combines manual discount + promo discount
        const totalDiscount = Math.min(preTax + tax, (discount || 0) + promoDiscount);

        const total = Math.max(0, preTax + tax - totalDiscount);

        // Update summary UI
        byId("sumBase").textContent = money(base);
        byId("sumMul").textContent = `× ${mul.toFixed(2)}`;
        byId("sumAddons").textContent = money(addons);
        byId("sumShip").textContent = money(shipping);
        byId("sumTax").textContent = money(tax);
        byId("sumDisc").textContent = `- ${money(totalDiscount)}`;
        byId("sumTotal").textContent = money(total);

        byId("calcNotice").innerHTML = `Calculated successfully. <b>Total payable: ${money(total)}</b>`;

        // Save "order" for payment page (Progress 1: browser storage)
        const orderId = `ORD-${String(Math.floor(Math.random() * 90000) + 10000)}`;
        localStorage.setItem("checkoutData", JSON.stringify({
            orderId,
            gemName,
            weight,
            ppc,
            grade,
            mul,
            base,
            addons,
            shipping,
            taxRatePct,
            tax,
            discount,
            promo,
            promoDiscount,
            totalDiscount,
            total,
            createdAt: new Date().toISOString()
        }));

        // Enable proceed
        if (goPay){
            goPay.setAttribute("aria-disabled", "false");
            goPay.classList.remove("disabled");
        }
    });

    btnReset.addEventListener("click", () => {
        localStorage.removeItem("checkoutData");
        location.reload();
    });
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
        // Clear errors
        ["errCardName","errCardNumber","errExpiry","errCvv","errEmail","errPhone"].forEach(k => setErr(k,""));

        // Read values
        const method = document.querySelector('input[name="method"]:checked')?.value || "CARD";

        if (method === "CASH") {
            // Skip card validations
            // Only validate email/phone (if you want)
        } else {
            // Existing card validations
        }
        const name = (byId("cardName").value || "").trim();
        const number = (byId("cardNumber").value || "").trim();
        const expiry = (byId("expiry").value || "").trim();
        const cvv = (byId("cvv").value || "").trim();
        const email = (byId("email").value || "").trim();
        const phone = (byId("phone").value || "").trim();

        let ok = true;

        // If CARD, validate card fields strongly
        if (method === "CARD"){
            if (!name || name.length < 3){
                setErr("errCardName", "Enter card name (min 3 characters).");
                ok = false;
            }
            if (!isValidCardLuhn(number)){
                setErr("errCardNumber", "Invalid card number (failed Luhn check).");
                ok = false;
            }
            // expiry MM/YY basic
            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)){
                setErr("errExpiry", "Expiry must be MM/YY (e.g., 08/28).");
                ok = false;
            }
            if (!/^\d{3,4}$/.test(cvv)){
                setErr("errCvv", "CVV must be 3 or 4 digits.");
                ok = false;
            }
        }

        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
            setErr("errEmail", "Enter a valid email address.");
            ok = false;
        }

        // Phone validation (Sri Lanka style: 10 digits)
        if (!/^\d{10}$/.test(phone)){
            setErr("errPhone", "Validation failed: Phone number must be at least 10 digits.");
            ok = false;
        }

        if (!data){
            ok = false;
            byId("payNotice").textContent = "Please calculate your total on Checkout page first.";
        }

        if (!ok){
            previewStatus.textContent = "FAILED";
            return;
        }

        // Simulated gateway response
        const paymentId = `PAY-2026-${String(Math.floor(Math.random() * 900000) + 100000)}`;
        const status = "SUCCESS";

        const txn = {
            paymentId,
            orderId: data.orderId,
            amount: data.total,
            method,
            status,
            email,
            phone,
            createdAt: new Date().toISOString()
        };

        localStorage.setItem("lastPayment", JSON.stringify(txn));

        previewStatus.textContent = status;
        byId("payNotice").innerHTML = `Payment <b>${status}</b>. Saving to database...`;

        try {
            const response = await fetch("http://localhost:8080/api/payments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    orderId: parseInt(data.orderId.replace(/\D/g, "")),
                    subtotalLkr: data.base,
                    addonsLkr: data.addons,
                    shippingLkr: data.shipping,
                    taxLkr: data.tax,
                    discountLkr: data.totalDiscount,
                    totalAmountLkr: data.total,
                    method: method,
                    status: status
                })
            });


            byId("payNotice").innerHTML = `Payment <b>${status}</b>. Saved to database.`;

            // MOVE redirect INSIDE success
            setTimeout(() => {
                window.location.href = "receipt.html";
            }, 1000);

        } catch (error) {
            console.log("DB Error:", error);
            byId("payNotice").innerHTML = `Payment saved locally but DB failed.`;
        }
    });
}

// ---------- Receipt Page Logic ----------
function initReceipt(){
    const rTitle = byId("rTitle");
    if (!rTitle) return; // not on receipt page

    const raw = localStorage.getItem("lastPayment");
    if (!raw){
        byId("rBadge").textContent = "—";
        return;
    }

    const txn = JSON.parse(raw);
    const ok = txn.status === "SUCCESS";

    byId("rTitle").textContent = ok ? "Payment Successful" : "Payment Failed";
    byId("rSub").textContent = ok ? "Thank you. Your transaction is recorded." : "Please retry your payment.";
    byId("rBadge").textContent = txn.status;

    byId("rPaymentId").textContent = txn.paymentId;
    byId("rOrderId").textContent = txn.orderId;
    byId("rMethod").textContent = txn.method;
    byId("rAmount").textContent = money(txn.amount);
    byId("rTime").textContent = new Date(txn.createdAt).toLocaleString();

    const btn = byId("btnDownload");
    btn?.addEventListener("click", () => {
        alert(
            `INVOICE (Mock)\n\nPayment ID: ${txn.paymentId}\nOrder ID: ${txn.orderId}\nAmount: ${money(txn.amount)}\nStatus: ${txn.status}`
        );
    });
}

// ---------- Boot ----------
initCheckout();
initPayment();
initReceipt();
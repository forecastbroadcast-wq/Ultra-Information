let selectedBook = "";
let selectedAmount = 0;

// Your Paystack PUBLIC KEY
const PAYSTACK_PUBLIC_KEY =
    "pk_live_952e2367041f2dcf97bc43be4f29de307bf1abad";

function openPayment(book, amount) {
    selectedBook = book;
    selectedAmount = amount;

    document.getElementById("paymentTitle").textContent = book;
    document.getElementById("paymentPrice").textContent = `KSh ${amount}`;

    document.getElementById("paymentModal").classList.remove("hidden");
}

function closePayment() {
    document.getElementById("paymentModal").classList.add("hidden");
}

function startPaystack() {
    const name = document.getElementById("customerName").value.trim();
    const email = document.getElementById("customerEmail").value.trim();

    // Check customer name
    if (!name) {
        alert("Please enter your name.");
        return;
    }

    // Check email
    if (!email) {
        alert("Please enter your email address.");
        return;
    }

    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    // Check Paystack key
    if (
        !PAYSTACK_PUBLIC_KEY ||
        PAYSTACK_PUBLIC_KEY.includes("REPLACE")
    ) {
        alert("Paystack is not configured yet.");
        return;
    }

    // Check that a product has been selected
    if (!selectedBook || !selectedAmount) {
        alert("Please select a book first.");
        return;
    }

    // Make sure Paystack has loaded
    if (typeof PaystackPop === "undefined") {
        alert(
            "Paystack could not load. Please check your internet connection and try again."
        );
        return;
    }

    // Create Paystack checkout
    const popup = new PaystackPop();

    popup.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,

        email: email,

        // Paystack expects the amount in the smallest currency unit.
        // KSh 100 = 10,000 cents
        amount: selectedAmount * 100,

        currency: "KES",

        metadata: {
            custom_fields: [
                {
                    display_name: "Customer Name",
                    variable_name: "customer_name",
                    value: name
                },
                {
                    display_name: "Product",
                    variable_name: "product",
                    value: selectedBook
                }
            ]
        },

        onSuccess: function (transaction) {

            /*
             * IMPORTANT:
             *
             * This does NOT mean the customer should immediately
             * receive the PDF.
             *
             * The transaction should first be verified on a
             * secure backend/server.
             */

            const reference = transaction.reference;

            window.location.href =
                `success.html?reference=${encodeURIComponent(reference)}`;
        },

        onCancel: function () {
            alert("Payment was cancelled.");
        }
    });
}


// Close the payment modal when clicking outside it
document.addEventListener("click", function (event) {

    const modal = document.getElementById("paymentModal");

    if (!modal) {
        return;
    }

    if (event.target === modal) {
        closePayment();
    }
});

let selectedBook = "";
let selectedAmount = 0;

// Replace this with your Paystack PUBLIC KEY before going live.
const PAYSTACK_PUBLIC_KEY = "pk_live_952e2367041f2dcf97bc43be4f29de307bf1abad";

function openPayment(book, amount){
  selectedBook = book;
  selectedAmount = amount;
  document.getElementById("paymentTitle").textContent = book;
  document.getElementById("paymentPrice").textContent = `KSh ${amount}`;
  document.getElementById("paymentModal").classList.remove("hidden");
}

function closePayment(){
  document.getElementById("paymentModal").classList.add("hidden");
}

function startPaystack(){
  const name = document.getElementById("customerName").value.trim();
  const email = document.getElementById("customerEmail").value.trim();

  if(!name || !email){
    alert("Please enter your name and email.");
    return;
  }

  if(PAYSTACK_PUBLIC_KEY.includes("REPLACE")){
    alert("Paystack is not configured yet. Add your Paystack public key in script.js.");
    return;
  }

  const popup = new PaystackPop();
  popup.newTransaction({
    key: PAYSTACK_PUBLIC_KEY,
    email: email,
    amount: selectedAmount * 100,
    currency: "KES",
    metadata: {
      custom_fields: [
        {display_name:"Customer Name", variable_name:"customer_name", value:name},
        {display_name:"Product", variable_name:"product", value:selectedBook}
      ]
    },
    onSuccess: function(transaction){
      // IMPORTANT: Do not unlock a paid PDF here.
      // The transaction must be verified by a server/backend first.
      window.location.href =
        `success.html?reference=${encodeURIComponent(transaction.reference)}`;
    },
    onCancel: function(){
      alert("Payment cancelled.");
    }
  });
}

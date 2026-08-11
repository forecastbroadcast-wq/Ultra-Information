export async function onRequestPost(context) {
    try {
        const body = await context.request.json();

        const reference = body.reference;

        if (!reference) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Payment reference is required."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // Paystack secret key stored securely in Cloudflare
        const secretKey = context.env.PAYSTACK_SECRET_KEY;

        if (!secretKey) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Payment verification is not configured."
                }),
                {
                    status: 500,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // Ask Paystack to verify the transaction
        const response = await fetch(
            `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    "Content-Type": "application/json"
                }
            }
        );

        const data = await response.json();

        // Paystack request itself failed
        if (!response.ok || !data.status) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Unable to verify payment."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        const transaction = data.data;

        // Expected price: KSh 100
        const expectedAmount = 10000;

        // Verify payment status
        if (transaction.status !== "success") {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Payment was not successful."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // Verify amount
        if (transaction.amount !== expectedAmount) {
            return new Response(
                JSON.stringify({
                    success: false,
                    message: "Incorrect payment amount."
                }),
                {
                    status: 400,
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
        }

        // Payment is valid
        return new Response(
            JSON.stringify({
                success: true,
                message: "Payment verified successfully.",
                reference: transaction.reference,
                email: transaction.customer.email
            }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (error) {

        return new Response(
            JSON.stringify({
                success: false,
                message: "Server error while verifying payment."
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}

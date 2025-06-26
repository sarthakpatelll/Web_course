document.getElementById('payButton').addEventListener('click', async function() {
  try {
    // Create order
    const response = await fetch('/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const order = await response.json();
    
    // Razorpay options
    const options = {
      key: process.env.RAZORPAY_KEY_ID, // Will be replaced by your actual key
      amount: order.amount,
      currency: order.currency,
      name: "Premium Access",
      description: "Join our exclusive community",
      order_id: order.id,
      handler: async function(response) {
        // Verify payment
        const verificationResponse = await fetch('/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature
          })
        });
        
        const verificationResult = await verificationResponse.json();
        
        if (verificationResult.success) {
          // Show success message and Telegram link
          document.getElementById('telegramLink').href = verificationResult.telegramLink;
          document.getElementById('successMessage').classList.remove('hidden');
          document.querySelector('.card').classList.add('hidden');
        } else {
          alert('Payment verification failed. Please contact support.');
        }
      },
      theme: {
        color: '#4361ee'
      }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
    
  } catch (error) {
    console.error('Error:', error);
    alert('An error occurred. Please try again.');
  }
});
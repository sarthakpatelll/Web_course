document.getElementById('payButton').addEventListener('click', async function() {
  try {
    // First get Razorpay key from server
    const keyResponse = await fetch('http://localhost:3000/get-razorpay-key');
    if (!keyResponse.ok) throw new Error('Failed to get Razorpay key');
    const { key } = await keyResponse.json();

    // Create order
    const orderResponse = await fetch('http://localhost:3000/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!orderResponse.ok) throw new Error('Failed to create order');
    const order = await orderResponse.json();
    
    // Razorpay options
    const options = {
      key: key, // Use key from server
      amount: order.amount,
      currency: order.currency,
      name: "Apna Collage Courses",
      description: "Access to premium Telegram group",
      order_id: order.id,
      handler: async function(response) {
        try {
          // Verify payment
          const verificationResponse = await fetch('http://localhost:3000/verify-payment', {
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
        } catch (error) {
          console.error('Verification error:', error);
          alert('Error verifying payment. Please check console.');
        }
      },
      theme: {
        color: '#4361ee'
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal closed');
        }
      }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
    
  } catch (error) {
    console.error('Payment error:', error);
    alert('Error: ' + error.message);
  }
});
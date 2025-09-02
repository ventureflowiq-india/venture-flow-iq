// Razorpay Payment Service
// This service handles all Razorpay payment operations

class RazorpayService {
  constructor() {
    // These should be moved to environment variables in production
    this.keyId = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_your_key_id';
    this.keySecret = process.env.REACT_APP_RAZORPAY_KEY_SECRET || 'your_key_secret';
    this.webhookSecret = process.env.REACT_APP_RAZORPAY_WEBHOOK_SECRET || 'your_webhook_secret';
    
    // Load Razorpay script
    this.loadRazorpayScript();
  }

  loadRazorpayScript() {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  // Create a Razorpay order
  async createOrder(amount, currency = 'INR', receipt = null) {
    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paise
          currency,
          receipt: receipt || `receipt_${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  // Create a Razorpay subscription
  async createSubscription(planId, customerId) {
    try {
      const response = await fetch('/api/razorpay/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          plan_id: planId,
          customer_id: customerId,
          total_count: 12, // For yearly subscriptions
          quantity: 1
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Razorpay subscription:', error);
      throw error;
    }
  }

  // Open Razorpay checkout
  async openCheckout(options) {
    try {
      await this.loadRazorpayScript();
      
      const razorpay = new window.Razorpay({
        key: this.keyId,
        amount: options.amount,
        currency: options.currency || 'INR',
        name: 'VentureFlow IQ',
        description: options.description || 'Plan Subscription',
        order_id: options.order_id,
        prefill: {
          name: options.customer_name || '',
          email: options.customer_email || '',
          contact: options.customer_phone || ''
        },
        theme: {
          color: '#2563eb'
        },
        handler: async (response) => {
          try {
            // Verify payment on your backend
            const verificationResponse = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verificationResponse.ok) {
              const result = await verificationResponse.json();
              if (options.onSuccess) {
                options.onSuccess(result);
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            if (options.onError) {
              options.onError(error);
            }
          }
        },
        modal: {
          ondismiss: () => {
            if (options.onDismiss) {
              options.onDismiss();
            }
          }
        }
      });

      razorpay.open();
    } catch (error) {
      console.error('Error opening Razorpay checkout:', error);
      throw error;
    }
  }

  // Open Razorpay subscription checkout
  async openSubscriptionCheckout(options) {
    try {
      await this.loadRazorpayScript();
      
      const razorpay = new window.Razorpay({
        key: this.keyId,
        subscription_id: options.subscription_id,
        name: 'VentureFlow IQ',
        description: options.description || 'Plan Subscription',
        prefill: {
          name: options.customer_name || '',
          email: options.customer_email || '',
          contact: options.customer_phone || ''
        },
        theme: {
          color: '#2563eb'
        },
        handler: async (response) => {
          try {
            // Verify subscription on your backend
            const verificationResponse = await fetch('/api/razorpay/verify-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verificationResponse.ok) {
              const result = await verificationResponse.json();
              if (options.onSuccess) {
                options.onSuccess(result);
              }
            } else {
              throw new Error('Subscription verification failed');
            }
          } catch (error) {
            console.error('Subscription verification error:', error);
            if (options.onError) {
              options.onError(error);
            }
          }
        },
        modal: {
          ondismiss: () => {
            if (options.onDismiss) {
              options.onDismiss();
            }
          }
        }
      });

      razorpay.open();
    } catch (error) {
      console.error('Error opening Razorpay subscription checkout:', error);
      throw error;
    }
  }

  // Cancel a subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('/api/razorpay/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription_id: subscriptionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      return await response.json();
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw error;
    }
  }

  // Get subscription details
  async getSubscriptionDetails(subscriptionId) {
    try {
      const response = await fetch(`/api/razorpay/subscription/${subscriptionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get subscription details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting subscription details:', error);
      throw error;
    }
  }

  // Get payment history
  async getPaymentHistory(userId) {
    try {
      const response = await fetch(`/api/razorpay/payments/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get payment history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const razorpayService = new RazorpayService();
export default razorpayService;

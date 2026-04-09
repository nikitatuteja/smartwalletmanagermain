import os
import razorpay

def get_razorpay_client():
    key_id = os.environ.get('RAZORPAY_KEY_ID')
    key_secret = os.environ.get('RAZORPAY_KEY_SECRET')
    if not key_id or not key_secret:
        raise Exception("Razorpay API keys not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file.")
    return razorpay.Client(auth=(key_id, key_secret))

def create_razorpay_order(amount, currency="INR"):
    """
    amount is passed in standard format (e.g., rupees).
    Razorpay expects it in paisa (amount * 100).
    """
    client = get_razorpay_client()
    data = {
        "amount": int(amount * 100),
        "currency": currency,
        "payment_capture": "1" # Auto-capture
    }
    return client.order.create(data=data)

def verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    client = get_razorpay_client()
    params_dict = {
        'razorpay_order_id': razorpay_order_id,
        'razorpay_payment_id': razorpay_payment_id,
        'razorpay_signature': razorpay_signature
    }
    return client.utility.verify_payment_signature(params_dict)

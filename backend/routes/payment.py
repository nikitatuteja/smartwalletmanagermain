from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import os

# We will need the path added to recognize services if it's treated as module
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.payment_service import create_razorpay_order, verify_razorpay_signature
from extensions import db
from models import Due, Transaction

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/create-order', methods=['POST'])
@jwt_required()
def create_order():
    data = request.get_json()
    amount = data.get('amount')

    if not amount or float(amount) <= 0:
        return jsonify({"success": False, "error": "Invalid amount"}), 400

    try:
        order = create_razorpay_order(float(amount))
        return jsonify({
            "success": True,
            "order_id": order['id'],
            "amount": order['amount'],
            "currency": order['currency'],
            "key_id": os.environ.get('RAZORPAY_KEY_ID')
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@payment_bp.route('/verify', methods=['POST'])
@jwt_required()
def verify_payment():
    data = request.get_json()
    current_user_id = get_jwt_identity()

    order_id = data.get('razorpay_order_id')
    payment_id = data.get('razorpay_payment_id')
    signature = data.get('razorpay_signature')
    
    # Optional metadata indicating what this payment was for
    due_id = data.get('due_id')
    amount = data.get('amount')
    notes = data.get('notes', 'Payment via Razorpay')

    try:
        verify_razorpay_signature(order_id, payment_id, signature)
        
        # Payment is successful. Now process business logic.
        
        if due_id:
            # Updating a due as paid
            due = Due.query.filter_by(id=due_id, user_id=current_user_id).first()
            if due:
                due.is_paid = True
        elif amount:
            # Just recording a fresh expense payment
            new_transaction = Transaction(
                user_id=current_user_id,
                amount=float(amount),
                type='Expense',
                category='Other', # Ideally mapped from frontend request
                payment_method='UPI',
                notes=notes
            )
            db.session.add(new_transaction)
            
        db.session.commit()
        
        return jsonify({"success": True}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": f"Payment verification failed: {str(e)}"}), 400

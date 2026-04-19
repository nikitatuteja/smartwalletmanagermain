from flask import Blueprint, request, jsonify
from extensions import db
from models import Transaction, Card
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

transactions_bp = Blueprint('transactions', __name__)

INCOME_CATEGORIES = ["Salary", "Freelance", "Bonus", "Investment Return", "Business Income", "Cashback", "Refund", "Gift Received", "Other Income"]
EXPENSE_CATEGORIES = ["Food", "Fuel", "Rent", "Shopping", "Utilities", "Entertainment", "Travel", "Healthcare", "Education", "Subscription", "EMI / Loan", "Other Expense"]

@transactions_bp.route('/', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_transactions():
    current_user_id = get_jwt_identity()
    try:
        query = Transaction.query.filter_by(user_id=current_user_id)
        
        t_type = request.args.get('type')
        category = request.args.get('category')
        
        if t_type:
            query = query.filter_by(type=t_type)
        if category:
            query = query.filter_by(category=category)
            
        transactions = query.order_by(Transaction.date.desc(), Transaction.created_at.desc()).all()
        
        return jsonify({
            "success": True,
            "data": [t.to_dict() for t in transactions]
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": "Database unavailable"}), 400

@transactions_bp.route('/', methods=['POST'], strict_slashes=False)
@jwt_required()
def add_transaction():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    amount = data.get('amount')
    t_type = str(data.get('type')).strip() if data.get('type') else None
    category = str(data.get('category')).strip() if data.get('category') else None
    date_str = data.get('date')
    payment_method = data.get('payment_method')
    notes = data.get('notes')
    card_id = data.get('card_id')

    if amount is None or amount <= 0:
        return jsonify({"success": False, "error": "Valid positive amount is required"}), 400
    if t_type not in ["Income", "Expense"]:
        return jsonify({"success": False, "error": "Type must be 'Income' or 'Expense'"}), 400
    if t_type == "Income" and category not in INCOME_CATEGORIES:
        return jsonify({"success": False, "error": f"Invalid category: '{category}' for type '{t_type}'"}), 400
    if t_type == "Expense" and category not in EXPENSE_CATEGORIES:
        return jsonify({"success": False, "error": f"Invalid category: '{category}' for type '{t_type}'"}), 400
    if not date_str:
        return jsonify({"success": False, "error": "Date is required"}), 400
    if payment_method not in ["Cash", "UPI", "Card"]:
        return jsonify({"success": False, "error": "Payment method must be 'Cash', 'UPI', or 'Card'"}), 400

    try:
        t_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"success": False, "error": "Invalid date format. Use YYYY-MM-DD"}), 400

    if card_id:
        card = Card.query.filter_by(id=card_id, user_id=current_user_id).first()
        if not card:
            return jsonify({"success": False, "error": "Card not found or access denied"}), 404

    try:
        new_transaction = Transaction(
            user_id=current_user_id,
            amount=amount,
            type=t_type,
            category=category,
            date=t_date,
            payment_method=payment_method,
            notes=notes,
            card_id=card_id
        )
        db.session.add(new_transaction)
        db.session.commit()
        return jsonify({
            "success": True,
            "data": new_transaction.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Database error: unable to process transaction data. Please ensure payload is valid."}), 400

@transactions_bp.route('/<int:id>', methods=['PUT'], strict_slashes=False)
@jwt_required()
def update_transaction(id):
    current_user_id = get_jwt_identity()
    t = Transaction.query.filter_by(id=id, user_id=current_user_id).first()
    if not t:
        return jsonify({"success": False, "error": "Transaction not found"}), 404
        
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No data to update"}), 400
        
    amount = data.get('amount')
    t_type = str(data.get('type')).strip() if data.get('type') else None
    category = str(data.get('category')).strip() if data.get('category') else None
    date_str = data.get('date')
    payment_method = data.get('payment_method')
    notes = data.get('notes')
    card_id = data.get('card_id')
    
    if amount is not None:
        if amount <= 0:
            return jsonify({"success": False, "error": "Valid positive amount is required"}), 400
        t.amount = amount
        
    if t_type:
        if t_type not in ["Income", "Expense"]:
            return jsonify({"success": False, "error": "Type must be 'Income' or 'Expense'"}), 400
        t.type = t_type
        
    if category:
        t_type_check = t.type
        if t_type == "Income" and category not in INCOME_CATEGORIES:
            return jsonify({"success": False, "error": f"Invalid category: '{category}' for type '{t_type_check}'"}), 400
        if t_type == "Expense" and category not in EXPENSE_CATEGORIES:
            return jsonify({"success": False, "error": f"Invalid category: '{category}' for type '{t_type_check}'"}), 400
        t.category = category
        
    if date_str:
        try:
            t.date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"success": False, "error": "Invalid date format. Use YYYY-MM-DD"}), 400
            
    if payment_method:
        if payment_method not in ["Cash", "UPI", "Card"]:
            return jsonify({"success": False, "error": "Payment method must be 'Cash', 'UPI', or 'Card'"}), 400
        t.payment_method = payment_method
        
    if 'notes' in data:
        t.notes = notes
        
    if 'card_id' in data:
        if card_id:
            card = Card.query.filter_by(id=card_id, user_id=current_user_id).first()
            if not card:
                return jsonify({"success": False, "error": "Card not found or access denied"}), 404
        t.card_id = card_id
        
    try:
        db.session.commit()
        return jsonify({"success": True, "data": t.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Database error: unable to process transaction update. Please ensure payload is valid."}), 400

@transactions_bp.route('/<int:id>', methods=['DELETE'], strict_slashes=False)
@jwt_required()
def delete_transaction(id):
    current_user_id = get_jwt_identity()
    t = Transaction.query.filter_by(id=id, user_id=current_user_id).first()
    if not t:
        return jsonify({"success": False, "error": "Transaction not found"}), 404
        
    try:
        db.session.delete(t)
        db.session.commit()
        return jsonify({"success": True, "message": "Transaction deleted"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Database error: unable to delete transaction."}), 400


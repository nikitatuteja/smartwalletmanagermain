from flask import Blueprint, jsonify
from extensions import db
from models import Transaction
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import json

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/insights', methods=['GET'])
@jwt_required()
def get_insights():
    current_user_id = get_jwt_identity()
    
    try:
        # Get last 30 days of transactions
        transactions = Transaction.query.filter_by(user_id=current_user_id).order_by(Transaction.date.desc()).limit(100).all()
        
        if not transactions:
            return jsonify({
                "success": True,
                "data": {
                    "insights": ["Start adding transactions to see AI-powered financial insights!", "Track your daily expenses to get a better overview of your spending."]
                }
            }), 200

        # Basic rule-based "AI" insights
        total_expense = sum(t.amount for t in transactions if t.type == 'Expense')
        categories = {}
        for t in transactions:
            if t.type == 'Expense':
                categories[t.category] = categories.get(t.category, 0) + t.amount
        
        top_category = max(categories, key=categories.get) if categories else None
        
        insights = []
        if total_expense > 0:
            insights.append(f"Your total spending recently is ₹{total_expense:,.2f}.")
        if top_category:
            insights.append(f"You spend the most on {top_category} (₹{categories[top_category]:,.2f}).")
        
        if len(transactions) > 5:
            insights.append("Your spending pattern seems consistent. Consider setting a budget for better control.")
        
        return jsonify({
            "success": True,
            "data": {
                "insights": insights
            }
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": "Unable to generate AI insights."}), 400

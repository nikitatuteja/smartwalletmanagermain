from flask import Blueprint, jsonify
from extensions import db
from models import Transaction, Card, Due
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
import calendar

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_dashboard():
    current_user_id = get_jwt_identity()
    today = datetime.utcnow().date()
    
    # Get current month start and end dates
    start_date = today.replace(day=1)
    last_day = calendar.monthrange(today.year, today.month)[1]
    end_date = today.replace(day=last_day)

    # Query transactions for current month
    transactions = Transaction.query.filter(
        Transaction.user_id == current_user_id,
        Transaction.date >= start_date,
        Transaction.date <= end_date
    ).all()

    total_income = sum(t.amount for t in transactions if t.type == 'Income')
    total_expense = sum(t.amount for t in transactions if t.type == 'Expense')
    net_balance = total_income - total_expense

    # Count total cards
    total_cards = Card.query.filter_by(user_id=current_user_id).count()

    # Count upcoming and overdue dues
    upcoming_dues = Due.query.filter(
        Due.user_id == current_user_id,
        Due.is_paid == False,
        Due.due_date >= today
    ).count()

    overdue_dues = Due.query.filter(
        Due.user_id == current_user_id,
        Due.is_paid == False,
        Due.due_date < today
    ).count()

    # Calculate transaction count
    transaction_count = len(transactions)
    
    # Calculate top expense category
    expense_category_totals = {}
    for t in transactions:
        if t.type == 'Expense':
            expense_category_totals[t.category] = expense_category_totals.get(t.category, 0) + float(t.amount)
            
    top_category = max(expense_category_totals, key=expense_category_totals.get) if expense_category_totals else None

    return jsonify({
        "success": True,
        "data": {
            "total_income": float(total_income),
            "total_expense": float(total_expense),
            "net_balance": float(net_balance),
            "total_cards": total_cards,
            "upcoming_dues": upcoming_dues,
            "overdue_dues": overdue_dues,
            "current_month": today.strftime("%B %Y"),
            "transaction_count": transaction_count,
            "top_category": top_category
        }
    }), 200

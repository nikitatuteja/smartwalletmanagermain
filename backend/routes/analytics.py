from flask import Blueprint, jsonify
from extensions import db
from models import Transaction
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta
from sqlalchemy import func
import calendar

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/', methods=['GET'])
@jwt_required()
def get_analytics():
    current_user_id = get_jwt_identity()
    today = datetime.utcnow().date()
    
    # 1. Pie Chart: Category-wise expenses (Current Month)
    start_of_month = today.replace(day=1)
    category_data = db.session.query(
        Transaction.category,
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == current_user_id,
        Transaction.type == 'Expense',
        Transaction.date >= start_of_month
    ).group_by(Transaction.category).all()

    pie_chart = [{"name": c, "value": float(t)} for c, t in category_data]

    # 2. Line Chart: Monthly expenses (Last 6 Months)
    # Using a simpler query for SQLite compatibility
    six_months_ago = (today - timedelta(days=180)).replace(day=1)
    # Note: strftime is SQLite specific
    monthly_expenses = db.session.query(
        func.strftime('%Y-%m', Transaction.date).label('month'),
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == current_user_id,
        Transaction.type == 'Expense',
        Transaction.date >= six_months_ago
    ).group_by('month').order_by('month').all()

    line_chart = [{"month": m, "expenses": float(t)} for m, t in monthly_expenses]

    # 3. Bar Chart: Income vs Expenses (Last 6 Months)
    income_vs_expenses = db.session.query(
        func.strftime('%Y-%m', Transaction.date).label('month'),
        Transaction.type,
        func.sum(Transaction.amount).label('total')
    ).filter(
        Transaction.user_id == current_user_id,
        Transaction.date >= six_months_ago
    ).group_by('month', Transaction.type).order_by('month').all()

    # Format bar chart data
    bar_data_map = {}
    for m, t_type, total in income_vs_expenses:
        if m not in bar_data_map:
            bar_data_map[m] = {"month": m, "income": 0, "expense": 0}
        if t_type == 'Income':
            bar_data_map[m]["income"] = float(total)
        else:
            bar_data_map[m]["expense"] = float(total)
    
    bar_chart = list(bar_data_map.values())

    return jsonify({
        "success": True,
        "data": {
            "pie_chart": pie_chart,
            "line_chart": line_chart,
            "bar_chart": bar_chart
        }
    }), 200

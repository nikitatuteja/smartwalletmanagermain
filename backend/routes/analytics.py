import calendar
from flask import Blueprint, jsonify
from extensions import db
from models import Transaction
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/', methods=['GET'])
@jwt_required()
def get_analytics():
    current_user_id = get_jwt_identity()
    today = datetime.utcnow().date()
    
    start_of_month = today.replace(day=1)
    six_months_ago = (today - timedelta(days=180)).replace(day=1)
    
    # Fetch all recent transactions
    transactions = Transaction.query.filter(
        Transaction.user_id == current_user_id,
        Transaction.date >= six_months_ago
    ).all()

    # 1. Pie Chart: Category-wise expenses (Current Month)
    pie_data_map = {}
    for t in transactions:
        if t.type == 'Expense' and t.date >= start_of_month:
            pie_data_map[t.category] = pie_data_map.get(t.category, 0) + float(t.amount)

    pie_chart = [{"name": c, "value": v} for c, v in pie_data_map.items()]

    # Maps for Monthly logic
    bar_data_map = {}
    line_data_map = {}

    for t in transactions:
        month_str = t.date.strftime('%Y-%m')

        if month_str not in bar_data_map:
            bar_data_map[month_str] = {"month": month_str, "income": 0.0, "expense": 0.0}
        
        amt = float(t.amount)
        if t.type == 'Income':
            bar_data_map[month_str]["income"] += amt
        else:
            bar_data_map[month_str]["expense"] += amt
            # For line chart, we only care about expenses
            line_data_map[month_str] = line_data_map.get(month_str, 0.0) + amt

    # Convert maps to sorted lists
    sorted_months = sorted(bar_data_map.keys())
    
    line_chart = [{"month": m, "expenses": line_data_map.get(m, 0.0)} for m in sorted_months]
    bar_chart = [bar_data_map[m] for m in sorted_months]

    return jsonify({
        "success": True,
        "data": {
            "pie_chart": pie_chart,
            "line_chart": line_chart,
            "bar_chart": bar_chart
        }
    }), 200

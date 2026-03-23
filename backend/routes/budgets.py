from flask import Blueprint, jsonify, request
from extensions import db
from models import Budget
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

budgets_bp = Blueprint('budgets', __name__)

@budgets_bp.route('/', methods=['GET'])
@jwt_required()
def get_budgets():
    current_user_id = get_jwt_identity()
    month = request.args.get('month', datetime.utcnow().strftime("%Y-%m"))
    budgets = Budget.query.filter_by(user_id=current_user_id, month=month).all()
    return jsonify({
        "success": True,
        "data": [b.to_dict() for b in budgets]
    }), 200

@budgets_bp.route('/', methods=['POST'])
@jwt_required()
def add_budget():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    category = data.get('category')
    amount = data.get('amount')
    month = data.get('month', datetime.utcnow().strftime("%Y-%m"))

    if not category or not amount:
        return jsonify({"success": False, "error": "Missing category or amount"}), 400

    existing = Budget.query.filter_by(user_id=current_user_id, category=category, month=month).first()
    if existing:
        existing.amount = amount
        db.session.commit()
        return jsonify({"success": True, "data": existing.to_dict()}), 200

    new_budget = Budget(user_id=current_user_id, category=category, amount=amount, month=month)
    db.session.add(new_budget)
    db.session.commit()
    return jsonify({"success": True, "data": new_budget.to_dict()}), 201

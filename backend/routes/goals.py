from flask import Blueprint, request, jsonify
from extensions import db
from models import Goal
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

goals_bp = Blueprint('goals', __name__)

@goals_bp.route('/', methods=['GET'])
@jwt_required()
def get_goals():
    current_user_id = get_jwt_identity()
    goals = Goal.query.filter_by(user_id=current_user_id).all()
    return jsonify({
        "success": True,
        "data": [g.to_dict() for g in goals]
    }), 200

@goals_bp.route('/', methods=['POST'])
@jwt_required()
def add_goal():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    name = data.get('name')
    target_amount = data.get('target_amount')
    current_amount = data.get('current_amount', 0.0)
    deadline_str = data.get('deadline')

    if not name or not target_amount:
        return jsonify({"success": False, "error": "Missing name or target_amount"}), 400
    
    deadline = None
    if deadline_str:
        try:
            deadline = datetime.strptime(deadline_str, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"success": False, "error": "Invalid date format. Use YYYY-MM-DD"}), 400

    new_goal = Goal(
        user_id=current_user_id,
        name=name,
        target_amount=target_amount,
        current_amount=current_amount,
        deadline=deadline
    )
    db.session.add(new_goal)
    db.session.commit()
    return jsonify({
        "success": True,
        "data": new_goal.to_dict()
    }), 201

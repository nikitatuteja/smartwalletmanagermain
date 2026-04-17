from flask import Blueprint, request, jsonify
from extensions import db
from models import Due
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

dues_bp = Blueprint('dues', __name__)

@dues_bp.route('/', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_dues():
    current_user_id = get_jwt_identity()
    dues = Due.query.filter_by(user_id=current_user_id).order_by(Due.due_date.asc()).all()
    return jsonify({
        "success": True,
        "data": [d.to_dict() for d in dues]
    }), 200

@dues_bp.route('/', methods=['POST'], strict_slashes=False)
@jwt_required()
def add_due():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    amount = data.get('amount')
    due_date_str = data.get('due_date')
    card_id = data.get('card_id')

    if not amount or not due_date_str or not card_id:
        return jsonify({"success": False, "error": "Missing required fields"}), 400
    
    try:
        due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"success": False, "error": "Invalid date format. Use YYYY-MM-DD"}), 400

    new_due = Due(
        user_id=current_user_id,
        amount=amount,
        due_date=due_date,
        card_id=card_id
    )
    db.session.add(new_due)
    db.session.commit()
    return jsonify({
        "success": True,
        "data": new_due.to_dict()
    }), 201

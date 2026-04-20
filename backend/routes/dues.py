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

    try:
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
    except Exception as e:
        db.session.rollback()
        raise e

@dues_bp.route('/<int:id>', methods=['PUT'], strict_slashes=False)
@jwt_required()
def update_due(id):
    current_user_id = get_jwt_identity()
    due = Due.query.filter_by(id=id, user_id=current_user_id).first()
    if not due:
        return jsonify({"success": False, "error": "Due not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    if 'is_paid' in data:
        due.is_paid = data['is_paid']

    if 'amount' in data:
        due.amount = data['amount']

    if 'due_date' in data:
        try:
            due.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"success": False, "error": "Invalid date format. Use YYYY-MM-DD"}), 400

    if 'card_id' in data:
        due.card_id = data['card_id']

    try:
        db.session.commit()
        return jsonify({"success": True, "data": due.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        raise e

@dues_bp.route('/<int:id>', methods=['DELETE'], strict_slashes=False)
@jwt_required()
def delete_due(id):
    current_user_id = get_jwt_identity()
    due = Due.query.filter_by(id=id, user_id=current_user_id).first()
    
    if not due:
        return jsonify({"success": False, "error": "Due not found"}), 404
        
    try:
        db.session.delete(due)
        db.session.commit()
        return jsonify({"success": True, "message": "Due deleted successfully"}), 200
    except Exception as e:
        db.session.rollback()
        raise e

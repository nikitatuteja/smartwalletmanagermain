from flask import Blueprint, request, jsonify
from extensions import db
from models import Card
from flask_jwt_extended import jwt_required, get_jwt_identity

cards_bp = Blueprint('cards', __name__)

@cards_bp.route('/', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_cards():
    current_user_id = get_jwt_identity()
    cards = Card.query.filter_by(user_id=current_user_id).all()
    return jsonify({
        "success": True,
        "data": [c.to_dict() for c in cards]
    }), 200

@cards_bp.route('/', methods=['POST'], strict_slashes=False)
@jwt_required()
def add_card():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    nickname = data.get('nickname')
    last_four = data.get('last_four')
    card_type = data.get('card_type')
    
    # New fields
    bank_name = data.get('bank_name')
    network = data.get('network')
    card_name = data.get('card_name')
    card_holder = data.get('card_holder')
    expiry_month = data.get('expiry_month')
    expiry_year = data.get('expiry_year')
    billing_date = data.get('billing_date')
    credit_limit = data.get('credit_limit')
    available_limit = data.get('available_limit')
    status = data.get('status', 'Active')
    color_theme = data.get('color_theme', 'Blue')

    if not nickname or not last_four or not card_type:
        return jsonify({"success": False, "error": "Missing required fields"}), 400
    
    if len(last_four) != 4 or not last_four.isdigit():
        return jsonify({"success": False, "error": "Last four digits must be 4 digits"}), 400

    new_card = Card(
        user_id=current_user_id,
        nickname=nickname,
        last_four=last_four,
        card_type=card_type,
        bank_name=bank_name,
        network=network,
        card_name=card_name,
        card_holder=card_holder,
        expiry_month=expiry_month,
        expiry_year=expiry_year,
        billing_date=int(billing_date) if billing_date else None,
        credit_limit=float(credit_limit) if credit_limit else None,
        available_limit=float(available_limit) if available_limit else None,
        status=status,
        color_theme=color_theme
    )
    db.session.add(new_card)
    db.session.commit()
    return jsonify({
        "success": True,
        "data": new_card.to_dict()
    }), 201

@cards_bp.route('/<int:card_id>', methods=['DELETE'], strict_slashes=False)
@jwt_required()
def delete_card(card_id):
    current_user_id = get_jwt_identity()
    card = Card.query.filter_by(id=card_id, user_id=current_user_id).first()
    
    if not card:
        return jsonify({"success": False, "error": "Card not found"}), 404
        
    db.session.delete(card)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "Card deleted successfully"
    }), 200

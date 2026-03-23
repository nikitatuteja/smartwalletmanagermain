from flask import Blueprint, request, jsonify
from extensions import db
from models import Card
from flask_jwt_extended import jwt_required, get_jwt_identity

cards_bp = Blueprint('cards', __name__)

@cards_bp.route('/', methods=['GET'])
@jwt_required()
def get_cards():
    current_user_id = get_jwt_identity()
    cards = Card.query.filter_by(user_id=current_user_id).all()
    return jsonify({
        "success": True,
        "data": [c.to_dict() for c in cards]
    }), 200

@cards_bp.route('/', methods=['POST'])
@jwt_required()
def add_card():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"success": False, "error": "No data provided"}), 400

    nickname = data.get('nickname')
    last_four = data.get('last_four')
    card_type = data.get('card_type')

    if not nickname or not last_four or not card_type:
        return jsonify({"success": False, "error": "Missing required fields"}), 400
    
    if len(last_four) != 4 or not last_four.isdigit():
        return jsonify({"success": False, "error": "Last four digits must be 4 digits"}), 400

    new_card = Card(
        user_id=current_user_id,
        nickname=nickname,
        last_four=last_four,
        card_type=card_type
    )
    db.session.add(new_card)
    db.session.commit()
    return jsonify({
        "success": True,
        "data": new_card.to_dict()
    }), 201

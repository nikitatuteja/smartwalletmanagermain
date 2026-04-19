from flask import Blueprint, request, jsonify
from extensions import db
from models import Card
from flask_jwt_extended import jwt_required, get_jwt_identity

cards_bp = Blueprint('cards', __name__)

@cards_bp.route('/', methods=['GET'], strict_slashes=False)
@jwt_required()
def get_cards():
    try:
        current_user_id = get_jwt_identity()
        cards = Card.query.filter_by(user_id=current_user_id).all()
        return jsonify({
            "success": True,
            "data": [c.to_dict() for c in cards]
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": "Unable to fetch cards data."}), 400

@cards_bp.route('/', methods=['POST'], strict_slashes=False)
@jwt_required()
def add_card():
    try:
        current_user_id = get_jwt_identity()
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No data provided"}), 400

        # Safely extract fields, accounting for potential payload mismatches
        nickname = data.get('nickname')
        last_four = data.get('last_four') or data.get('last4digits')
        card_type = data.get('card_type')
        
        bank_name = data.get('bank_name')
        network = data.get('network')
        card_name = data.get('card_name') or data.get('card_variant')
        card_holder = data.get('card_holder') or data.get('card_holder_name')
        expiry_month = data.get('expiry_month') or data.get('exp_month')
        expiry_year = data.get('expiry_year') or data.get('exp_year')
        billing_date = data.get('billing_date') or data.get('billing_day')
        credit_limit = data.get('credit_limit')
        available_limit = data.get('available_limit')
        status = data.get('status')
        color_theme = data.get('color_theme') or data.get('theme')

        # Null / Empty String fix
        nickname = str(nickname).strip() if nickname else ""
        last_four = str(last_four).strip() if last_four else ""
        card_type = str(card_type).strip() if card_type else "Credit"

        if not nickname:
            return jsonify({"success": False, "error": "Nickname required"}), 400
        if not last_four:
            return jsonify({"success": False, "error": "Last 4 digits required"}), 400

        if len(last_four) != 4 or not last_four.isdigit():
            return jsonify({"success": False, "error": "Please enter valid last 4 digits"}), 400

        # Safe converter functions
        def safe_int(val):
            if val is None or str(val).strip() == "": return None
            try: return int(float(val))
            except (ValueError, TypeError): return None

        def safe_float(val):
            if val is None or str(val).strip() == "": return None
            try: return float(val)
            except (ValueError, TypeError): return None

        def safe_str(val):
            if val is None or str(val).strip() == "": return None
            return str(val).strip()

        new_card = Card(
            user_id=current_user_id,
            nickname=nickname,
            last_four=last_four,
            card_type=card_type,
            bank_name=safe_str(bank_name),
            network=safe_str(network),
            card_name=safe_str(card_name),
            card_holder=safe_str(card_holder),
            expiry_month=safe_str(expiry_month),
            expiry_year=safe_str(expiry_year),
            billing_date=safe_int(billing_date),
            credit_limit=safe_float(credit_limit),
            available_limit=safe_float(available_limit),
            status=safe_str(status) or 'Active',
            color_theme=safe_str(color_theme) or 'Blue'
        )
        
        db.session.add(new_card)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "data": new_card.to_dict()
        }), 201

    except Exception as e:
        db.session.rollback()
        # Logging error
        print(f"[ERROR] Failed to save card: {str(e)}")
        return jsonify({"success": False, "error": "Unable to save card. Database constraints violated or invalid payload."}), 400

@cards_bp.route('/<int:card_id>', methods=['DELETE'], strict_slashes=False)
@jwt_required()
def delete_card(card_id):
    current_user_id = get_jwt_identity()
    card = Card.query.filter_by(id=card_id, user_id=current_user_id).first()
    
    if not card:
        return jsonify({"success": False, "error": "Card not found"}), 404
        
    try:
        db.session.delete(card)
        db.session.commit()
        
        return jsonify({
            "success": True,
            "message": "Card deleted successfully"
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Unable to delete card due to database dependencies."}), 400

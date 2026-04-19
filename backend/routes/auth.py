from flask import Blueprint, request, jsonify
from extensions import db
from models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    display_name = data.get('display_name')

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email address already exists"}), 409

    try:
        new_user = User(email=email, display_name=display_name)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()

        access_token = create_access_token(identity=str(new_user.id))
        return jsonify(access_token=access_token, user=new_user.to_dict(), success=True), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": "Email address already exists or invalid data"}), 400

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if user and user.check_password(password):
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token, user=user.to_dict(), success=True)
    
    return jsonify({"error": "Invalid credentials"}), 401



# =========================
# GET CURRENT USER (UNCHANGED)
# =========================
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    return jsonify({
        "success": True,
        "user": user.to_dict()
    }), 200
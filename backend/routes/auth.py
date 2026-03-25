from flask import Blueprint, request, jsonify
from extensions import db
from models import User
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from utils.otp import generate_otp
from utils.email_service import send_otp_email
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

# =========================
# REGISTER (UNCHANGED)
# =========================
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"success": False, "error": "Missing email or password"}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"success": False, "error": "Email already registered"}), 409
    
    new_user = User(
        email=data['email'], 
        display_name=data.get('display_name', data['email'].split('@')[0])
    )
    new_user.set_password(data['password'])
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        "success": True,
        "message": "User registered successfully"
    }), 201


# =========================
# LOGIN (UPDATED WITH OTP)
# =========================
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"success": False, "error": "Missing email or password"}), 400
    
    user = User.query.filter_by(email=data['email']).first()

    if not user or not user.check_password(data['password']):
        return jsonify({"success": False, "error": "Invalid email or password"}), 401

    # ✅ Generate OTP
    otp = generate_otp()
    user.otp = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=5)

    db.session.commit()

    # ✅ Send OTP Email
    send_otp_email(user.email, otp)

    return jsonify({
        "success": True,
        "message": "OTP sent to email"
    }), 200


# =========================
# VERIFY OTP (NEW)
# =========================
@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    data = request.get_json()

    if not data or not data.get('email') or not data.get('otp'):
        return jsonify({"success": False, "error": "Missing email or OTP"}), 400

    user = User.query.filter_by(email=data['email']).first()

    if not user:
        return jsonify({"success": False, "error": "User not found"}), 404

    if user.otp != data['otp']:
        return jsonify({"success": False, "error": "Invalid OTP"}), 400

    if not user.otp_expiry or user.otp_expiry < datetime.utcnow():
        return jsonify({"success": False, "error": "OTP expired"}), 400

    # ✅ Generate JWT token
    access_token = create_access_token(identity=str(user.id))

    # ✅ Clear OTP after success
    user.otp = None
    user.otp_expiry = None
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "user": user.to_dict()
    }), 200


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
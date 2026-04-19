import os
import traceback
from flask import Flask, jsonify, request
from werkzeug.exceptions import HTTPException
from config import Config
from extensions import db, jwt, bcrypt, cors
from routes.auth import auth_bp
from routes.cards import cards_bp
from routes.transactions import transactions_bp
from routes.dues import dues_bp
from routes.dashboard import dashboard_bp
from routes.budgets import budgets_bp
from routes.goals import goals_bp
from routes.ai import ai_bp
from routes.analytics import analytics_bp

def create_app(config_class=Config):
    # Initialize Flask app as a purely API backend
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    # Enable CORS for all routes by default for Render deployment
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(cards_bp, url_prefix='/api/cards')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(dues_bp, url_prefix='/api/dues')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(budgets_bp, url_prefix='/api/budgets')
    app.register_blueprint(goals_bp, url_prefix='/api/goals')
    app.register_blueprint(ai_bp, url_prefix='/api/ai')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')

    # Global Error Handlers for API
    @app.errorhandler(Exception)
    def handle_exception(e):
        if isinstance(e, HTTPException):
            return jsonify({"success": False, "error": e.description}), e.code
        
        # Log unexpected errors in development
        if app.debug:
            app.logger.error(f"Server Error: {traceback.format_exc()}")
            
        return jsonify({"success": False, "error": "A server processing error occurred. Please verify your data and try again."}), 400

    # Custom JWTExtended error handlers
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"success": False, "error": "Authentication token is missing"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        app.logger.error(f"JWT Invalid Token Error: {error}")
        return jsonify({"success": False, "error": f"Authentication token is invalid: {str(error)}"}), 401
    
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "error": "Authentication token has expired"}), 401

    # Health Check
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "ok",
            "message": "FinTrack API is running gracefully"
        }), 200


    # Create Database Tables & Seeding
    with app.app_context():
        try:
            db.create_all()
            
            # Seed test users
            from models import User
            
            test_users = [
                {"email": "admin@test.com", "password": "AdminPassword123", "role": "admin", "display_name": "Admin User"},
                {"email": "user@test.com", "password": "UserPassword123", "role": "user", "display_name": "Standard User"}
            ]
            
            for user_data in test_users:
                if not User.query.filter_by(email=user_data["email"]).first():
                    user = User(
                        email=user_data["email"],
                        role=user_data["role"],
                        display_name=user_data["display_name"]
                    )
                    user.set_password(user_data["password"])
                    db.session.add(user)
            
            db.session.commit()
        except Exception as e:
            app.logger.error(f"Database initialization failed: {e}")

    return app

# Expose global app object for WSGI deployment 
# Can be run via: gunicorn app:app
app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=app.config.get('DEBUG', False))
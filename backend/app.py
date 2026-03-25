import os
from flask import Flask, jsonify, send_from_directory
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
    # Set static folder to frontend build directory
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
    app.config.from_object(config_class)

    # Initialize Extensions
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGINS']}})

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

    # Serve Frontend
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve(path):
        if path != "" and os.path.exists(app.static_folder + '/' + path):
            return send_from_directory(app.static_folder, path)
        else:
            # Check if frontend is built
            if not os.path.exists(os.path.join(app.static_folder, 'index.html')):
                return jsonify({
                    "status": "error",
                    "message": "Frontend not found. Please build the frontend using 'npm run build' in the frontend folder, or visit the development server at http://localhost:5173"
                }), 404
            return send_from_directory(app.static_folder, 'index.html')

    # Health Check
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "ok",
            "message": "Smart Wallet API is running"
        }), 200

    # ✅ ADDITION: TEST EMAIL ROUTE
    from utils.email_service import send_otp_email

    @app.route('/test-email')
    def test_email():
        send_otp_email("nikita23tuteja@gmail.com", "123456")
        return "Email sent"

    # Create Database Tables
    with app.app_context():
        db.create_all()

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=8000, debug=app.config['DEBUG'])
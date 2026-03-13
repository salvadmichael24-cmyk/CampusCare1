from flask import Flask, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_mail import Mail
from flask_cors import CORS
from config import Config
import os

# Create extensions
login_manager = LoginManager()
db = SQLAlchemy()
mail = Mail()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    print("=" * 50)
    print("CREATING FLASK APP")
    print("=" * 50)
    
    # Initialize CORS FIRST - before other extensions
    CORS(app, origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://10.234.144.150:3000"], supports_credentials=True)
    print("? CORS initialized")
    
    # Add route to serve uploaded files
    @app.route('/static/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    print("? Static file serving configured")
    
    # Initialize extensions
    db.init_app(app)
    print("? Database initialized")
    
    login_manager.init_app(app)
    print("? Login manager initialized")
    
    mail.init_app(app)
    print("? Mail initialized")
    
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    
    # Import models here to avoid circular imports
    from app.models import models
    print("? Models imported")
    
    @login_manager.user_loader
    def load_user(user_id):
        return models.User.query.get(int(user_id))
    
    # Register blueprints
    from app.controllers import auth, main, admin, api
    app.register_blueprint(auth.bp)
    app.register_blueprint(main.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(api.bp)
    print("? Blueprints registered")
    
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    print(f"? Upload folder created at: {app.config['UPLOAD_FOLDER']}")
    
    # Test database connection
    with app.app_context():
        try:
            # Try to query the database
            from app.models.models import User
            user_count = User.query.count()
            print(f"? Database connection successful! Found {user_count} users")
        except Exception as e:
            print(f"? Database connection error: {e}")
    
    print("=" * 50)
    print("APP CREATION COMPLETE")
    print("=" * 50)
    
    return app

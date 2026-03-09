from flask import Flask
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
    
    # Initialize CORS - this handles everything automatically
    CORS(app, 
         origins=["http://localhost:3000", "http://10.109.20.150:3000", "http://127.0.0.1:3000"],
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization", "X-Requested-With", "Accept"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    # Initialize extensions
    db.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)
    
    login_manager.login_view = 'auth.login'
    login_manager.login_message = 'Please log in to access this page.'
    
    # Import models here to avoid circular imports
    from app.models import models
    
    @login_manager.user_loader
    def load_user(user_id):
        return models.User.query.get(int(user_id))
    
    # Register blueprints
    from app.controllers import auth, main, admin, api
    app.register_blueprint(auth.bp)
    app.register_blueprint(main.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(api.bp)
    
    # Create upload folder if it doesn't exist
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Create database tables
    with app.app_context():
        db.create_all()
        print("✅ Database tables created/verified")
    
    return app
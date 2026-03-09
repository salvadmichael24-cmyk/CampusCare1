import os
import sys

# Add the current directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.models.models import User
from app import db
from werkzeug.security import generate_password_hash

def setup_database():
    """Initialize database and create admin user"""
    print("🚀 Setting up CampusCare database...")
    
    # Create app
    app = create_app()
    
    # Push an application context
    with app.app_context():
        # Create upload folder if it doesn't exist
        upload_folder = os.path.join('app', 'static', 'uploads')
        os.makedirs(upload_folder, exist_ok=True)
        print(f"✅ Created upload folder: {upload_folder}")
        
        # Create database tables
        db.create_all()
        print("✅ Database tables created")
        
        # Check if admin already exists
        admin = User.query.filter_by(role='admin').first()
        if not admin:
            # Create admin user
            admin = User(
                username='admin',
                email='admin@campuscare.edu',
                first_name='Admin',
                last_name='User',
                role='admin',
                password_hash=generate_password_hash('admin123')
            )
            db.session.add(admin)
            db.session.commit()
            print("✅ Admin user created successfully!")
            print("\n📝 Login Credentials:")
            print("   Username: admin")
            print("   Password: admin123")
        else:
            print("✅ Admin user already exists")
        
        # Create a test regular user
        test_user = User.query.filter_by(username='testuser').first()
        if not test_user:
            test_user = User(
                username='testuser',
                email='test@campuscare.edu',
                first_name='Test',
                last_name='User',
                department='BSIT',
                role='user',
                password_hash=generate_password_hash('test123')
            )
            db.session.add(test_user)
            db.session.commit()
            print("✅ Test user created: testuser / test123")
        
        # Show database location
        db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
        print(f"\n📁 Database location: {db_path}")
        
        # Count users
        user_count = User.query.count()
        print(f"👥 Total users in database: {user_count}")

if __name__ == '__main__':
    setup_database()
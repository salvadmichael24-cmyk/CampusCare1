from app import create_app
from app.models.models import User
from werkzeug.security import check_password_hash

app = create_app()
with app.app_context():
    user = User.query.filter_by(username='admin').first()
    if user:
        print(f"✅ Admin user found:")
        print(f"   Username: {user.username}")
        print(f"   Email: {user.email}")
        print(f"   Role: {user.role}")
        print(f"   Password hash: {user.password_hash[:50]}...")
        # Check password
        if check_password_hash(user.password_hash, 'admin123'):
            print("✅ Password 'admin123' is CORRECT")
        else:
            print("❌ Password 'admin123' is INCORRECT")
    else:
        print("❌ Admin user NOT found in database")
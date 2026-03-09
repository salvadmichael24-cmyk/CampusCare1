from app import create_app, db
from app.models.models import User

print("Creating app...")
app = create_app()

print("Testing database connection...")
with app.app_context():
    try:
        users = User.query.all()
        print(f"✅ Database works! Found {len(users)} users")
    except Exception as e:
        print(f"❌ Database error: {e}")

print("Done!")
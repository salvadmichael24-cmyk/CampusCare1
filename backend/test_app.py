from app import create_app, db
from app.models.models import User

print("=" * 50)
print("TESTING FLASK APPLICATION")
print("=" * 50)

# Create the app
app = create_app()
print("✅ App created successfully")

# Test database connection
with app.app_context():
    print("\n--- Database Test ---")
    try:
        # Check if we can query
        users = User.query.all()
        print(f"✅ Database query successful!")
        print(f"📊 Found {len(users)} users in database")
        
        # List all users
        for user in users:
            print(f"   - {user.username} (Role: {user.role})")
            
    except Exception as e:
        print(f"❌ Database error: {e}")
    
    # Check tables
    try:
        from sqlalchemy import inspect
        inspector = inspect(db.engine)
        tables = inspector.get_table_names()
        print(f"\n📋 Tables in database: {tables}")
    except Exception as e:
        print(f"❌ Error getting tables: {e}")

print("\n✅ Test complete!")
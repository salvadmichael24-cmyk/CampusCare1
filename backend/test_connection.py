from app import create_app, db
from app.models.models import User

app = create_app()

with app.app_context():
    print("=" * 50)
    print("TESTING DATABASE CONNECTION")
    print("=" * 50)
    
    # Test 1: Check if we can connect to the database
    try:
        # Try a simple query
        users = User.query.all()
        print(f"✅ Database connection successful!")
        print(f"✅ Found {len(users)} users in database")
        
        # List all users
        for user in users:
            print(f"   - {user.username} (Role: {user.role}, Active: {user.is_active})")
            
    except Exception as e:
        print(f"❌ Database query failed: {e}")
    
    # Test 2: Check if we can create a test query
    try:
        from sqlalchemy import text
        result = db.session.execute(text("SELECT name FROM sqlite_master WHERE type='table';"))
        tables = [row[0] for row in result]
        print(f"\n✅ Tables in database: {tables}")
    except Exception as e:
        print(f"❌ Failed to get tables: {e}")

from app import create_app, db
from app.models.models import User
import os

app = create_app()

with app.app_context():
    print("=" * 50)
    print("Testing database connection...")
    print("=" * 50)
    
    # Print database URI
    print(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    
    # Check if database file exists
    db_path = app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', '')
    print(f"Database file path: {os.path.abspath(db_path)}")
    print(f"Database file exists: {os.path.exists(db_path)}")
    
    # Try to query
    try:
        users = User.query.all()
        print(f"✅ Query successful! Found {len(users)} users")
        for user in users:
            print(f"  - {user.username} ({user.role})")
    except Exception as e:
        print(f"❌ Query failed: {e}")
    
    # List all tables
    from sqlalchemy import inspect
    inspector = inspect(db.engine)
    tables = inspector.get_table_names()
    print(f"\nTables in database: {tables}")
import os
import sqlite3
from werkzeug.security import generate_password_hash
from datetime import datetime

# Create database directory if it doesn't exist
os.makedirs('instance', exist_ok=True)

# Connect to database (this will create it if it doesn't exist)
conn = sqlite3.connect('instance/campuscare.db')
cursor = conn.cursor()

# Create users table
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'user',
    department TEXT DEFAULT 'BSIT',
    block TEXT DEFAULT '1',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
)
''')

# Create reports table - NO TITLE COLUMN
cursor.execute('''
CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    report_type TEXT NOT NULL,
    room TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    priority TEXT DEFAULT 'Medium',
    photo_path TEXT,
    user_id INTEGER NOT NULL,
    assigned_to INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    in_progress_date TIMESTAMP,
    resolved_date TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (assigned_to) REFERENCES users (id)
)
''')

# Create report_images table
cursor.execute('''
CREATE TABLE IF NOT EXISTS report_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    report_id INTEGER NOT NULL,
    image_path TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES reports (id)
)
''')

print("✅ Database tables created successfully!")

# Check if admin already exists
cursor.execute("SELECT * FROM users WHERE username = ?", ('admin',))
admin = cursor.fetchone()

if not admin:
    # Create admin user
    admin_password = generate_password_hash('admin123')
    cursor.execute('''
    INSERT INTO users (username, email, first_name, last_name, role, password_hash)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', ('admin', 'admin@campuscare.edu', 'Admin', 'User', 'admin', admin_password))
    print("✅ Admin user created: admin / admin123")
else:
    print("✅ Admin user already exists")

# Check if test user exists
cursor.execute("SELECT * FROM users WHERE username = ?", ('testuser',))
test_user = cursor.fetchone()

if not test_user:
    # Create test user
    test_password = generate_password_hash('test123')
    cursor.execute('''
    INSERT INTO users (username, email, first_name, last_name, department, role, password_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', ('testuser', 'test@campuscare.edu', 'Test', 'User', 'BSIT', 'user', test_password))
    print("✅ Test user created: testuser / test123")
else:
    print("✅ Test user already exists")

# Commit changes and close connection
conn.commit()

# Count users
cursor.execute("SELECT COUNT(*) FROM users")
user_count = cursor.fetchone()[0]
print(f"👥 Total users in database: {user_count}")

conn.close()

print("\n📁 Database location: instance/campuscare.db")
print("\n🚀 Setup complete! You can now run the application with: python run.py")
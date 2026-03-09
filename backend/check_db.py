
import sqlite3

# Connect to the database
conn = sqlite3.connect('instance/campuscare.db')
cursor = conn.cursor()

# Get list of tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = cursor.fetchall()

print("Tables in database:")
for table in tables:
    print(f"  - {table[0]}")

# Count users
cursor.execute("SELECT COUNT(*) FROM users")
user_count = cursor.fetchone()[0]
print(f"\nNumber of users: {user_count}")

# Show users
if user_count > 0:
    cursor.execute("SELECT id, username, email, role FROM users")
    users = cursor.fetchall()
    print("\nUsers:")
    for user in users:
        print(f"  ID: {user[0]}, Username: {user[1]}, Email: {user[2]}, Role: {user[3]}")

conn.close()
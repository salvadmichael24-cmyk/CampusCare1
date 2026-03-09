import sqlite3
conn = sqlite3.connect('instance/campuscare.db')
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(reports)")
columns = cursor.fetchall()
print("Reports table columns:")
for col in columns:
    print(f"  {col[1]} ({col[2]})")
conn.close()

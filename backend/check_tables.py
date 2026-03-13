import sqlite3
import os

db_path = 'instance/campuscare.db'
print(f'📁 Checking database: {db_path}')

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    
    print(f'\n📊 Tables in database:')
    for table in tables:
        table_name = table[0]
        print(f'  📋 {table_name}')
        
        # Show first 5 rows from each table
        try:
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 1")
            columns = [description[0] for description in cursor.description]
            print(f'     Columns: {", ".join(columns)}')
        except:
            pass
    
    conn.close()
else:
    print(f'❌ Database not found at {db_path}')
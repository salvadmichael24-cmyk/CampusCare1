import sqlite3
import os

# Look for the database file
possible_dbs = ['instance/app.db', 'app.db', 'database.db', 'site.db', 'campuscare.db']
found_db = None

for db in possible_dbs:
    if os.path.exists(db):
        found_db = db
        print(f'✅ Found database: {db}')
        break

if not found_db:
    # Check instance folder
    if os.path.exists('instance'):
        for file in os.listdir('instance'):
            if file.endswith('.db'):
                found_db = os.path.join('instance', file)
                print(f'✅ Found database: {found_db}')
                break

if found_db:
    conn = sqlite3.connect(found_db)
    cursor = conn.cursor()
    
    # Check if report table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='report'")
    if cursor.fetchone():
        # Get all photos from database
        cursor.execute("SELECT id, photo_path FROM report WHERE photo_path IS NOT NULL")
        photos = cursor.fetchall()
        
        print(f'\n📸 Found {len(photos)} reports with photos in database:')
        for photo in photos:
            print(f'  Report {photo[0]}: {photo[1]}')
            
            # Check if the file exists in uploads folder
            file_path = os.path.join('app', 'static', 'uploads', photo[1])
            if os.path.exists(file_path):
                print(f'    ✅ File exists locally')
            else:
                print(f'    ❌ File NOT found locally')
    else:
        print('❌ No report table found')
    conn.close()
else:
    print('❌ No database file found')
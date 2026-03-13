import sqlite3
import os

db_path = 'instance/campuscare.db'
print(f'📁 Checking database: {db_path}')

if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check reports table for photos
    cursor.execute("SELECT id, photo_path FROM reports WHERE photo_path IS NOT NULL AND photo_path != ''")
    photos = cursor.fetchall()
    
    print(f'\n📸 Found {len(photos)} reports with photos:')
    for report_id, photo_path in photos:
        print(f'\n  Report {report_id}: {photo_path}')
        
        # Check if file exists in uploads folder
        file_path = os.path.join('app', 'static', 'uploads', photo_path)
        if os.path.exists(file_path):
            print(f'    ✅ File exists locally: {file_path}')
        else:
            print(f'    ❌ File NOT found locally: {file_path}')
            
            # Try without app/ prefix
            alt_path = os.path.join('static', 'uploads', photo_path)
            if os.path.exists(alt_path):
                print(f'    ✅ File exists at: {alt_path}')
    
    # Also check report_images table
    cursor.execute("SELECT id, report_id, image_path FROM report_images")
    images = cursor.fetchall()
    
    if images:
        print(f'\n📸 Found {len(images)} images in report_images table:')
        for img_id, report_id, image_path in images:
            print(f'  Image {img_id} (Report {report_id}): {image_path}')
    
    conn.close()
    
    # Show the full path to uploads folder
    print(f'\n📁 Uploads folder path: {os.path.abspath("app/static/uploads")}')
    
else:
    print(f'❌ Database not found at {db_path}')
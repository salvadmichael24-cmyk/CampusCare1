from flask import Blueprint, request, jsonify, make_response, current_app
from flask_login import login_user, logout_user, login_required, current_user
from flask_mail import Message
from app import db, mail
from app.models.models import User, Report
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import os
import random
import string
from werkzeug.utils import secure_filename
from config import Config
from functools import wraps


bp = Blueprint('api', __name__, url_prefix='/api')

# Helper function to get the allowed origin based on request
def get_allowed_origin():
    request_origin = request.headers.get('Origin')
    allowed_origins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://10.234.144.150:3000'
    ]
    if request_origin in allowed_origins:
        return request_origin
    return 'http://localhost:3000'

# OPTIONS handlers for CORS preflight requests
@bp.route('/login', methods=['OPTIONS'])
@bp.route('/register', methods=['OPTIONS'])
def handle_api_options():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

# Custom decorator for JSON API authentication
def login_required_json(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated:
            response = jsonify({'error': 'Authentication required', 'message': 'Please log in to access this resource'})
            response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 401
        return f(*args, **kwargs)
    return decorated_function

# Mobile/Web API endpoints

@bp.route('/login', methods=['POST'])
def api_login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        response = jsonify({'error': 'Missing username or password'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400

    print(f"Login attempt for user: {data['username']}")
    
    # Use the app context from the current request
    user = User.query.filter_by(username=data['username']).first()
    
    if user and check_password_hash(user.password_hash, data['password']):
        print(f"User found: {user.username}, Active: {user.is_active}")
        
        if not user.is_active:
            response = jsonify({'error': 'Your account is pending admin approval'})
            response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 403
            
        login_user(user)
        response = jsonify({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': user.role,
                'department': user.department,
                'block': user.block,
                'is_active': user.is_active
            }
        })
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200

    print("Invalid credentials")
    response = jsonify({'error': 'Invalid credentials'})
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 401

@bp.route('/register', methods=['POST'])
def api_register():
    data = request.get_json()

    if User.query.filter_by(username=data['username']).first():
        response = jsonify({'error': 'Username already exists'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400

    if User.query.filter_by(email=data['email']).first():
        response = jsonify({'error': 'Email already registered'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400

    user = User(
        username=data['username'],
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        department=data.get('department', 'BSIT'),
        block=data.get('block', '1'),
        password_hash=generate_password_hash(data['password']),
        role='user',
        is_active=False  # Set to False by default - requires admin approval
    )

    db.session.add(user)
    db.session.commit()

    response = jsonify({
        'success': True, 
        'message': 'Registration successful. Please wait for admin approval before logging in.'
    })
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 201

@bp.route('/me', methods=['GET'])
@login_required_json
def get_current_user():
    response = jsonify({
        'success': True,
        'user': {
            'id': current_user.id,
            'username': current_user.username,
            'email': current_user.email,
            'first_name': current_user.first_name,
            'last_name': current_user.last_name,
            'role': current_user.role,
            'department': current_user.department,
            'block': current_user.block
        }
    })
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

@bp.route('/profile', methods=['PUT'])
@login_required_json
def update_profile():
    data = request.get_json()
    user = current_user
    
    # Update allowed fields
    if 'first_name' in data:
        user.first_name = data['first_name']
    if 'last_name' in data:
        user.last_name = data['last_name']
    if 'email' in data:
        # Check if email is already taken by another user
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != user.id:
            response = jsonify({'error': 'Email already in use'})
            response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
            response.headers.add('Access-Control-Allow-Credentials', 'true')
            return response, 400
        user.email = data['email']
    if 'department' in data:
        user.department = data['department']
    if 'block' in data:
        user.block = data['block']
    
    db.session.commit()
    
    response = jsonify({
        'success': True,
        'message': 'Profile updated successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
            'department': user.department,
            'block': user.block,
            'created_at': user.created_at.isoformat() if user.created_at else None,
            'is_active': user.is_active
        }
    })
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

# Logout endpoint
@bp.route('/logout', methods=['POST'])
@login_required_json
def api_logout():
    logout_user()
    response = jsonify({'success': True, 'message': 'Logged out successfully'})
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

@bp.route('/reports', methods=['GET'])
@login_required_json
def get_reports():
    # If admin, return all reports
    if current_user.role == 'admin':
        reports = Report.query.order_by(Report.created_at.desc()).all()
    else:
        # Regular users only see their own reports
        reports = Report.query.filter_by(user_id=current_user.id).order_by(Report.created_at.desc()).all()
    
    response = jsonify([report.to_dict() for report in reports])
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

@bp.route('/reports', methods=['POST'])
@login_required_json
def create_report():
    try:
        # Check if it's multipart form data (with file)
        if request.content_type and 'multipart/form-data' in request.content_type:
            # Form data with possible file
           
            description = request.form.get('description')
            report_type = request.form.get('report_type')
            room = request.form.get('room')
            user_id = request.form.get('user_id')
            priority = request.form.get('priority', 'Medium')

            # Validate required fields
            if not all([ description, report_type, room, user_id]):
                missing = []
              
                if not description: missing.append('description')
                if not report_type: missing.append('report_type')
                if not room: missing.append('room')
                if not user_id: missing.append('user_id')
                response = jsonify({'error': f'Missing required fields: {", ".join(missing)}'})
                response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
                response.headers.add('Access-Control-Allow-Credentials', 'true')
                return response, 400

            photo = request.files.get('photo')
            photo_filename = None

            if photo and photo.filename:
                # Validate file type
                allowed_extensions = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
                if '.' in photo.filename:
                    ext = photo.filename.rsplit('.', 1)[1].lower()
                    if ext not in allowed_extensions:
                        response = jsonify({'error': 'File type not allowed. Please upload an image.'})
                        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
                        response.headers.add('Access-Control-Allow-Credentials', 'true')
                        return response, 400
                
                filename = secure_filename(photo.filename)
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                photo_filename = f"{timestamp}_{filename}"
                # Make sure upload folder exists
                os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
                photo.save(os.path.join(Config.UPLOAD_FOLDER, photo_filename))
        else:
            # Try to parse as JSON
            data = request.get_json()
            if not data:
                response = jsonify({'error': 'Invalid request format. Expected JSON or multipart/form-data'})
                response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
                response.headers.add('Access-Control-Allow-Credentials', 'true')
                return response, 400
           
            description = data.get('description')
            report_type = data.get('report_type')
            room = data.get('room')
            user_id = data.get('user_id')
            priority = data.get('priority', 'Medium')
            photo_filename = None

            # Validate required fields
            if not all([ description, report_type, room, user_id]):
                missing = []
                
                if not description: missing.append('description')
                if not report_type: missing.append('report_type')
                if not room: missing.append('room')
                if not user_id: missing.append('user_id')
                response = jsonify({'error': f'Missing required fields: {", ".join(missing)}'})
                response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
                response.headers.add('Access-Control-Allow-Credentials', 'true')
                return response, 400

        # Create the report
        report = Report(
            
            description=description,
            report_type=report_type,
            room=room,
            user_id=user_id,
            priority=priority,
            photo_path=photo_filename,
            status='Pending',
            submitted_date=datetime.utcnow()
        )

        db.session.add(report)
        db.session.commit()

        response = jsonify({
            'success': True,
            'message': 'Report created successfully',
            'report': report.to_dict()
        })
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 201
        
    except Exception as e:
        response = jsonify({'error': str(e)})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400

@bp.route('/reports/<int:report_id>', methods=['GET'])
@login_required_json
def get_report(report_id):
    report = Report.query.get_or_404(report_id)
    
    # Check if user has permission to view this report
    if current_user.role != 'admin' and report.user_id != current_user.id:
        response = jsonify({'error': 'You do not have permission to view this report'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 403
    
    response = jsonify({
        'success': True,
        'report': report.to_dict()
    })
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

@bp.route('/reports/<int:report_id>', methods=['PUT'])
@login_required_json
def update_report_status(report_id):
    report = Report.query.get_or_404(report_id)
    
    # Only admins can update report status
    if current_user.role != 'admin':
        response = jsonify({'error': 'Admin access required'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 403

    data = request.get_json()
    if 'status' in data:
        report.status = data['status']
        if data['status'] == 'In Progress':
            report.in_progress_date = datetime.utcnow()
        elif data['status'] == 'Resolved':
            report.resolved_date = datetime.utcnow()

    report.updated_at = datetime.utcnow()
    db.session.commit()

    response = jsonify({
        'success': True,
        'message': 'Report updated successfully',
        'report': report.to_dict()
    })
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

@bp.route('/reports/<int:report_id>', methods=['DELETE'])
@login_required_json
def delete_report(report_id):
    report = Report.query.get_or_404(report_id)
    
    # Check if user owns this report or is admin
    if current_user.role != 'admin' and report.user_id != current_user.id:
        response = jsonify({'error': 'You do not have permission to delete this report'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 403
    
    # Only allow deletion of pending reports for regular users
    if report.status != 'Pending' and current_user.role != 'admin':
        response = jsonify({'error': 'Only pending reports can be deleted'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400
    
    db.session.delete(report)
    db.session.commit()
    
    response = jsonify({
        'success': True,
        'message': 'Report deleted successfully'
    })
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

@bp.route('/reports/new/count', methods=['GET'])
@login_required_json
def get_new_reports_count():
    # Only admins can see this
    if current_user.role != 'admin':
        response = jsonify({'error': 'Admin access required'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 403
    
    # Get reports created in the last 24 hours
    one_day_ago = datetime.utcnow() - timedelta(days=1)
    
    # Count reports created in the last 24 hours
    new_reports_count = Report.query.filter(Report.created_at >= one_day_ago).count()
    
    response = jsonify({
        'success': True,
        'count': new_reports_count
    })
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

# Forgot Password - Send Code
@bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    
    if not email:
        response = jsonify({'error': 'Email is required'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400
    
    user = User.query.filter_by(email=email).first()
    
    # Always return the same message for security
    if not user:
        response = jsonify({'message': 'If this email is registered, you will receive a reset code.'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200
    
    # Generate a 6-digit numeric code
    reset_code = ''.join(random.choices(string.digits, k=6))
    
    # Store code in database with 10-minute expiration
    user.reset_token = reset_code
    user.reset_token_expires = datetime.utcnow() + timedelta(minutes=10)
    db.session.commit()
    
    # Send email with code
    try:
        msg = Message(
            subject='CampusCare Password Reset Code',
            recipients=[email]
        )
        msg.body = f'''Hello {user.first_name},

Your password reset code is: {reset_code}

This code will expire in 10 minutes.

If you did not request this password reset, please ignore this email.

Thanks,
The CampusCare Team
'''
        msg.html = f'''
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #0066ff, #00c6ff); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; text-align: center; }}
        .code {{ font-size: 48px; font-weight: bold; color: #0066ff; letter-spacing: 10px; margin: 30px 0; padding: 20px; background: white; border-radius: 10px; border: 2px dashed #0066ff; }}
        .footer {{ text-align: center; margin-top: 20px; color: #888; font-size: 12px; }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>CampusCare</h1>
        </div>
        <div class="content">
            <h2>Password Reset Code</h2>
            <p>Hello {user.first_name},</p>
            <p>Use the following code to reset your password:</p>
            <div class="code">{reset_code}</div>
            <p><strong>This code will expire in 10 minutes.</strong></p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <hr>
            <p>Thanks,<br>The CampusCare Team</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 CampusCare. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
'''
        mail.send(msg)
        print(f"✅ Password reset code sent to {email}: {reset_code}")
        
    except Exception as e:
        print(f"❌ Email sending failed: {e}")
        print(f"🔐 Reset code for {email}: {reset_code}")
    
    response = jsonify({'message': 'If this email is registered, you will receive a reset code.'})
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200


# Verify Code
@bp.route('/verify-code', methods=['POST'])
def verify_code():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    
    print(f"🔍 Verify code request - Email: {email}, Code: {code}")  # Debug log
    
    if not email or not code:
        print("❌ Missing email or code")
        response = jsonify({'error': 'Email and code are required'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        print(f"❌ User not found for email: {email}")
        response = jsonify({'error': 'Invalid email or code'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400
    
    print(f"✅ User found: {user.username}")
    print(f"📝 Stored token: {user.reset_token}")
    print(f"⏰ Token expires: {user.reset_token_expires}")
    print(f"⏰ Current time: {datetime.utcnow()}")
    
    if user.reset_token != code:
        print(f"❌ Code mismatch - Expected: {user.reset_token}, Got: {code}")
        response = jsonify({'error': 'Invalid code'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400
    
    if user.reset_token_expires < datetime.utcnow():
        print(f"❌ Code expired - Expired at: {user.reset_token_expires}")
        response = jsonify({'error': 'Code has expired'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400
    
    # Code is valid
    print("✅ Code verified successfully!")
    response = jsonify({'message': 'Code verified successfully', 'verified': True})
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

# Reset Password with Code
@bp.route('/reset-password-with-code', methods=['POST'])
def reset_password_with_code():
    data = request.get_json()
    email = data.get('email')
    code = data.get('code')
    new_password = data.get('password')
    
    print(f"🔍 Reset password request - Email: {email}, Code: {code}")
    
    if not email or not code or not new_password:
        print("❌ Missing required fields")
        response = jsonify({'error': 'Email, code, and password are required'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400
    
    if len(new_password) < 6:
        print("❌ Password too short")
        response = jsonify({'error': 'Password must be at least 6 characters'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        print(f"❌ User not found for email: {email}")
        response = jsonify({'error': 'Invalid email or code'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400
    
    print(f"✅ User found: {user.username}")
    print(f"📝 Stored token: {user.reset_token}")
    print(f"⏰ Token expires: {user.reset_token_expires}")
    
    if user.reset_token != code:
        print(f"❌ Code mismatch - Expected: {user.reset_token}, Got: {code}")
        response = jsonify({'error': 'Invalid code'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400
    
    if user.reset_token_expires < datetime.utcnow():
        print(f"❌ Code expired - Expired at: {user.reset_token_expires}")
        response = jsonify({'error': 'Code has expired'})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 400
    
    # Update password
    user.password_hash = generate_password_hash(new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.session.commit()
    
    print("✅ Password reset successfully!")
    response = jsonify({'message': 'Password reset successfully'})
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response, 200

# Statistics endpoints
@bp.route('/statistics', methods=['GET'])
def get_public_statistics():
    """Get public statistics for all users"""
    try:
        # Get total reports
        total_reports = Report.query.count()
        
        # Get reports by type
        from sqlalchemy import func
        reports_by_type = db.session.query(
            Report.report_type, 
            func.count(Report.id)
        ).group_by(Report.report_type).all()
        
        by_type = [{'type': t, 'count': c} for t, c in reports_by_type if t]
        
        # Get reports by room
        reports_by_room = db.session.query(
            Report.room, 
            func.count(Report.id)
        ).group_by(Report.room).all()
        
        by_room = [{'room': r, 'count': c} for r, c in reports_by_room if r]
        
        # Get reports by status
        reports_by_status = db.session.query(
            Report.status, 
            func.count(Report.id)
        ).group_by(Report.status).all()
        
        by_status = [{'status': s, 'count': c} for s, c in reports_by_status if s]
        
        response = jsonify({
            'total': total_reports,
            'by_type': by_type,
            'by_room': by_room,
            'by_status': by_status
        })
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 200
        
    except Exception as e:
        print(f"Error in statistics endpoint: {e}")
        response = jsonify({'error': str(e)})
        response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
        response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response, 500

@bp.route('/statistics', methods=['OPTIONS'])
def handle_statistics_options():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", get_allowed_origin())
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Accept')
    response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

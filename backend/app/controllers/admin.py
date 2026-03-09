from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.models import Report, User
from functools import wraps
from datetime import datetime

bp = Blueprint('admin', __name__, url_prefix='/admin')


def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

@bp.route('/reports', methods=['GET'])
@login_required
@admin_required
def get_reports():
    status = request.args.get('status', 'all')
    report_type = request.args.get('type', 'all')
    
    query = Report.query
    
    if status != 'all':
        query = query.filter_by(status=status)
    if report_type != 'all':
        query = query.filter_by(report_type=report_type)
    
    reports = query.order_by(Report.created_at.desc()).all()
    return jsonify([{
        'id': r.id,
        'title': r.title,
        'description': r.description,
        'report_type': r.report_type,
        'room': r.room,
        'status': r.status,
        'priority': r.priority,
        'photo_path': r.photo_path,
        'user_id': r.user_id,
        'author_name': r.author.get_full_name() if r.author else 'Unknown',
        'created_at': r.created_at.isoformat() if r.created_at else None,
        'submitted_date': r.submitted_date.isoformat() if r.submitted_date else None,
        'in_progress_date': r.in_progress_date.isoformat() if r.in_progress_date else None,
        'resolved_date': r.resolved_date.isoformat() if r.resolved_date else None
    } for r in reports]), 200

@bp.route('/reports/<int:report_id>', methods=['PUT'])
@login_required
@admin_required
def update_report(report_id):
    report = Report.query.get_or_404(report_id)
    
    data = request.get_json()
    status = data.get('status')
    if status:
        report.status = status
        if status == 'In Progress' and report.status != 'In Progress':
            report.in_progress_date = datetime.utcnow()
        elif status == 'Resolved' and report.status != 'Resolved':
            report.resolved_date = datetime.utcnow()
    
    report.assigned_to = current_user.id
    report.updated_at = datetime.utcnow()
    
    db.session.commit()
    return jsonify({'message': 'Report updated successfully', 'report': {
        'id': report.id,
        'title': report.title,
        'status': report.status,
        'in_progress_date': report.in_progress_date.isoformat() if report.in_progress_date else None,
        'resolved_date': report.resolved_date.isoformat() if report.resolved_date else None
    }}), 200

@bp.route('/users', methods=['GET'])
@login_required
@admin_required
def get_users():
    users = User.query.all()
    return jsonify([{
        'id': u.id,
        'username': u.username,
        'email': u.email,
        'first_name': u.first_name,
        'last_name': u.last_name,
        'role': u.role,
        'department': u.department,
        'block': u.block,
        'is_active': u.is_active,
        'created_at': u.created_at.isoformat() if u.created_at else None
    } for u in users]), 200

@bp.route('/users/<int:user_id>/toggle', methods=['POST'])
@login_required
@admin_required
def toggle_user(user_id):
    user = User.query.get_or_404(user_id)
    if user.id == current_user.id:
        return jsonify({'error': 'Cannot toggle yourself'}), 400
    
    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({
        'message': f'User {user.username} has been {"activated" if user.is_active else "deactivated"}',
        'is_active': user.is_active
    }), 200

@bp.route('/statistics', methods=['GET'])
@login_required
@admin_required
def get_statistics():
    total_reports = Report.query.count()
    
    # Reports by type
    reports_by_type = db.session.query(
        Report.report_type, 
        db.func.count(Report.id)
    ).group_by(Report.report_type).all()
    
    # Reports by room
    reports_by_room = db.session.query(
        Report.room, 
        db.func.count(Report.id)
    ).group_by(Report.room).all()
    
    # Reports by status
    reports_by_status = db.session.query(
        Report.status, 
        db.func.count(Report.id)
    ).group_by(Report.status).all()
    
    return jsonify({
        'total': total_reports,
        'by_type': [{'type': t, 'count': c} for t, c in reports_by_type],
        'by_room': [{'room': r, 'count': c} for r, c in reports_by_room],
        'by_status': [{'status': s, 'count': c} for s, c in reports_by_status]
    }), 200
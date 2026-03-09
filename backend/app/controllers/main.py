from flask import Blueprint, render_template, redirect, url_for, flash, request, jsonify
from flask_login import login_required, current_user
from app import db
from app.models.models import Report, User
from app.forms import ReportForm
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from config import Config

bp = Blueprint('main', __name__)

@bp.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('main.dashboard'))
    return render_template('index.html')

@bp.route('/dashboard')
@login_required
def dashboard():
    if current_user.role == 'admin':
        # Admin dashboard
        total_reports = Report.query.count()
        pending_reports = Report.query.filter_by(status='Pending').count()
        in_progress_reports = Report.query.filter_by(status='In Progress').count()
        resolved_reports = Report.query.filter_by(status='Resolved').count()
        
        recent_reports = Report.query.order_by(Report.created_at.desc()).limit(5).all()
        
        return render_template('admin/dashboard.html',
                             total_reports=total_reports,
                             pending_reports=pending_reports,
                             in_progress_reports=in_progress_reports,
                             resolved_reports=resolved_reports,
                             recent_reports=recent_reports)
    else:
        # User dashboard
        user_reports = Report.query.filter_by(user_id=current_user.id).order_by(Report.created_at.desc()).all()
        return render_template('user/dashboard.html', reports=user_reports)

@bp.route('/report/new', methods=['GET', 'POST'])
@login_required
def new_report():
    form = ReportForm()
    if form.validate_on_submit():
        # Handle photo upload
        photo_filename = None
        if form.photo.data:
            photo = form.photo.data
            filename = secure_filename(photo.filename)
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            photo_filename = f"{timestamp}_{filename}"
            photo.save(os.path.join(Config.UPLOAD_FOLDER, photo_filename))
        
        report = Report(
            title=form.title.data,
            description=form.description.data,
            report_type=form.report_type.data,
            room=form.room.data,
            priority=form.priority.data,
            photo_path=photo_filename,
            user_id=current_user.id,
            status='Pending',
            submitted_date=datetime.utcnow()
        )
        
        db.session.add(report)
        db.session.commit()
        
        flash('Report submitted successfully!', 'success')
        return redirect(url_for('main.view_report', report_id=report.id))
    
    return render_template('user/new_report.html', form=form)

@bp.route('/report/<int:report_id>')
@login_required
def view_report(report_id):
    report = Report.query.get_or_404(report_id)
    
    # Check if user has permission to view this report
    if current_user.role != 'admin' and report.user_id != current_user.id:
        flash('You do not have permission to view this report.', 'danger')
        return redirect(url_for('main.dashboard'))
    
    return render_template('view_report.html', report=report)

@bp.route('/profile')
@login_required
def profile():
    user_reports = Report.query.filter_by(user_id=current_user.id).count()
    return render_template('user/profile.html', reports_count=user_reports)
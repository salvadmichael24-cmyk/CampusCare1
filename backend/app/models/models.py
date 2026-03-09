from app import db
from flask_login import UserMixin
from datetime import datetime

class User(UserMixin, db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    role = db.Column(db.String(20), default='user')  # 'admin' or 'user'
    department = db.Column(db.String(50), default='BSIT')  # BSIT or BSOA
    block = db.Column(db.String(10), default='1')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
        # Add these after is_active field
    reset_token = db.Column(db.String(100), nullable=True)
    reset_token_expires = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    reports = db.relationship('Report', backref='author', lazy=True, foreign_keys='Report.user_id')
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

class Report(db.Model):
    __tablename__ = 'reports'
    
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.Text, nullable=False)
    report_type = db.Column(db.String(50), nullable=False)
    room = db.Column(db.String(20), nullable=False)
    status = db.Column(db.String(20), default='Pending')
    priority = db.Column(db.String(20), default='Medium')
    photo_path = db.Column(db.String(200))
    
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    assigned_to = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    submitted_date = db.Column(db.DateTime, default=datetime.utcnow)
    in_progress_date = db.Column(db.DateTime)
    resolved_date = db.Column(db.DateTime)
    
    assigned_admin = db.relationship('User', foreign_keys=[assigned_to])
    
    def to_dict(self):
        return {
            'id': self.id,
            'description': self.description,
            'report_type': self.report_type,
            'room': self.room,
            'status': self.status,
            'priority': self.priority,
            'photo_path': self.photo_path,
            'user_id': self.user_id,
            'author_name': self.author.get_full_name() if self.author else 'Unknown',
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'submitted_date': self.submitted_date.isoformat() if self.submitted_date else None,
            'in_progress_date': self.in_progress_date.isoformat() if self.in_progress_date else None,
            'resolved_date': self.resolved_date.isoformat() if self.resolved_date else None
        }

class ReportImage(db.Model):
    __tablename__ = 'report_images'
    
    id = db.Column(db.Integer, primary_key=True)
    report_id = db.Column(db.Integer, db.ForeignKey('reports.id'), nullable=False)
    image_path = db.Column(db.String(200), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    report = db.relationship('Report', backref='images')
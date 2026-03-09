from flask import Blueprint, render_template, redirect, url_for, flash, request, current_app
from flask_login import login_user, logout_user, login_required, current_user
from app import db
from app.models.models import User
from app.forms import LoginForm, RegistrationForm
from werkzeug.security import generate_password_hash, check_password_hash

bp = Blueprint('auth', __name__, url_prefix='/auth')

# OPTIONS handlers for CORS preflight requests
@bp.route('/login', methods=['OPTIONS'])
@bp.route('/register', methods=['OPTIONS'])
def handle_options():
    return '', 200

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    form = LoginForm()
    if form.validate_on_submit():
        # Use current_app context to ensure database access
        with current_app.app_context():
            user = User.query.filter_by(username=form.username.data).first()
            if user and check_password_hash(user.password_hash, form.password.data):
                login_user(user, remember=form.remember.data)
                next_page = request.args.get('next')
                flash(f'Welcome back, {user.get_full_name()}!', 'success')
                return redirect(next_page) if next_page else redirect(url_for('main.index'))
            else:
                flash('Invalid username or password', 'danger')
    
    return render_template('login.html', form=form)

@bp.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('main.index'))
    
    form = RegistrationForm()
    if form.validate_on_submit():
        # Use current_app context for database operations
        with current_app.app_context():
            # Check if user exists
            if User.query.filter_by(username=form.username.data).first():
                flash('Username already exists', 'danger')
                return render_template('register.html', form=form)
            
            if User.query.filter_by(email=form.email.data).first():
                flash('Email already registered', 'danger')
                return render_template('register.html', form=form)
            
            # Create new user
            user = User(
                username=form.username.data,
                email=form.email.data,
                first_name=form.first_name.data,
                last_name=form.last_name.data,
                department=form.department.data,
                block=form.block.data,
                password_hash=generate_password_hash(form.password.data),
                role='user'  # Default role
            )
            
            db.session.add(user)
            db.session.commit()
        
        flash('Registration successful! Please log in.', 'success')
        return redirect(url_for('auth.login'))
    
    return render_template('register.html', form=form)

@bp.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('main.index'))
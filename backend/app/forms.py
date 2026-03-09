from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, SelectField, FileField, BooleanField, SubmitField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError
from flask_wtf.file import FileAllowed

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember = BooleanField('Remember Me')
    submit = SubmitField('Login')

class RegistrationForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired(), Length(min=3, max=20)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    first_name = StringField('First Name', validators=[DataRequired()])
    last_name = StringField('Last Name', validators=[DataRequired()])
    department = SelectField('Department', choices=[('BSIT', 'BSIT'), ('BSOA', 'BSOA')])
    block = SelectField('Block', choices=[('1', 'Block 1'), ('2', 'Block 2'), ('3', 'Block 3'), ('4', 'Block 4'), ('5', 'Block 5'), ('6', 'Block 6'), ('7', 'Block 7'), ('8', 'Block 8'), ('9', 'Block 9'), ('10', 'Block 10')], default='1')    
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField('Register')

class ReportForm(FlaskForm):
    title = StringField('Title', validators=[DataRequired()])
    description = TextAreaField('Description', validators=[DataRequired()])
    report_type = SelectField('Report Type', choices=[
        ('vandalism', 'Vandalism'),
        ('waste', 'Waste Disposal'),
        ('technical', 'Technical Issue')
    ])
    room = SelectField('Room', choices=[
        ('CL01', 'CL01'),
        ('CL02', 'CL02'),
        ('CL03', 'CL03'),
        ('CL04', 'CL04')
    ])
    priority = SelectField('Priority', choices=[
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High')
    ])
    photo = FileField('Photo', validators=[FileAllowed(['jpg', 'png', 'jpeg'], 'Images only!')])
    submit = SubmitField('Submit Report')
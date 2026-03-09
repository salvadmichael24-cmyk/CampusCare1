from app import create_app, mail
from flask_mail import Message

app = create_app()
with app.app_context():
    try:
        msg = Message(
            subject='Test Email from CampusCare',
            recipients=['salvadmichael24@gmail.com'],  # Send to yourself
            body='If you received this, your email configuration is working!'
        )
        mail.send(msg)
        print("✅ Test email sent successfully!")
    except Exception as e:
        print(f"❌ Error sending email: {e}")
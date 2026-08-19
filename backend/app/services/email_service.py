import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

def send_reservation_confirmation_email(
    to_email: str,
    customer_name: str,
    reservation_number: str,
    date: str,
    time: str,
    guests: int,
    seating_area: str
):
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print(f"[Email Simulated] Confirmation email would be sent to {to_email} for ref {reservation_number}")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your Table Reservation is Confirmed - {reservation_number} | INDO CHINESE"
        msg["From"] = settings.SMTP_FROM_EMAIL
        msg["To"] = to_email

        html = f"""
        <html>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center; color: white;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">INDO CHINESE</h1>
                    <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">WHERE INDIAN SPICE MEETS CHINESE FLAVOUR</p>
                </div>
                <div style="padding: 30px; color: #334155;">
                    <h2 style="color: #0f172a; margin-top: 0; font-size: 20px;">Reservation Confirmed!</h2>
                    <p>Dear <strong>{customer_name}</strong>,</p>
                    <p>Thank you for choosing INDO CHINESE. We are delighted to confirm your table reservation.</p>
                    
                    <div style="background: #f1f5f9; border-radius: 8px; padding: 20px; margin: 25px 0; border-left: 4px solid #dc2626;">
                        <p style="margin: 0 0 10px 0;"><strong>Booking Reference:</strong> <span style="font-family: monospace; font-size: 16px; color: #dc2626; font-weight: bold;">{reservation_number}</span></p>
                        <p style="margin: 0 0 10px 0;"><strong>Date:</strong> {date}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Time:</strong> {time}</p>
                        <p style="margin: 0 0 10px 0;"><strong>Guests:</strong> {guests} People</p>
                        <p style="margin: 0;"><strong>Seating Area:</strong> {seating_area}</p>
                    </div>

                    <p style="font-size: 14px; color: #64748b;">
                        <strong>Restaurant Address:</strong><br>
                        124 High Street, Hounslow, London TW3 1NA, UK<br>
                        Phone: +44 20 8570 9888
                    </p>
                    
                    <p style="font-size: 13px; color: #94a3b8; margin-top: 30px;">
                        Need to modify or cancel your booking? You can do so directly on our website using your reference number.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """

        part = MIMEText(html, "html")
        msg.attach(part)

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, to_email, msg.as_string())
        
        return True
    except Exception as e:
        print(f"Error sending confirmation email: {e}")
        return False

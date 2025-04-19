# utils.py
from django.core.mail import send_mail
from django.conf import settings

# utils.py
from django.core.mail import send_mail
from django.conf import settings
from django.urls import reverse
from django.template.loader import render_to_string

# Add to the top of your utils.py
import logging
logger = logging.getLogger(__name__)

def check_fodder_alerts_for_matches(fodder_listing):
    """
    Check if a new fodder listing matches any active alerts and notify users.
    """
    from .models import FodderAlert  # Import here to avoid circular imports
    
    logger.info(f"Checking alerts for fodder listing #{fodder_listing.id}")
    
    matching_alerts = FodderAlert.objects.filter(
        active=True,
        county=fodder_listing.county,
    )
    
    logger.info(f"Found {matching_alerts.count()} potential county matches")
    
    # Filter by fodder type if specified in the alert
    type_matches = matching_alerts.filter(
        Q(fodder_type=fodder_listing.fodder_type) | Q(fodder_type__isnull=True)
    )
    
    logger.info(f"Found {type_matches.count()} type matches")
    
    # Filter by max price if specified in the alert
    price_matches = type_matches.filter(
        Q(max_price__gte=fodder_listing.price_per_unit) | Q(max_price__isnull=True)
    )
    
    logger.info(f"Found {price_matches.count()} final price matches")
    
    # For each matching alert, notify the user
    for alert in price_matches:
        logger.info(f"Processing alert #{alert.id} for user {alert.user.username}")
        # Prevent duplicate notifications
        if not alert.user == fodder_listing.seller:
            logger.info(f"Sending notification to {alert.user.username}")
            send_fodder_match_notification(alert.user, fodder_listing, alert)
        else:
            logger.info(f"Skipping notification as user is the seller")
            
            
def send_fodder_email_notification(user, message, fodder_listing, alert):
    """Send an email notification about a fodder match."""
    try:
        logger.info(f"Preparing email for {user.username} about listing #{fodder_listing.id}")
        
        subject = "Digicow: Fodder matching your alert is available"
        
        # Build the URL to the fodder listing
        listing_url = f"{settings.SITE_URL}{reverse('fodder_marketplace:fodder_detail', args=[fodder_listing.id])}"
        
        # Context for the email template
        context = {
            'user': user,
            'message': message,
            'fodder_listing': fodder_listing,
            'alert': alert,
            'listing_url': listing_url
        }
        
        # Render the email body from a template
        html_message = render_to_string('fodder/email/fodder_alert_match.html', context)
        plain_message = render_to_string('fodder/email/fodder_alert_match_plain.html', context)
        
        # Log email content for debugging
        logger.info(f"Email subject: {subject}")
        logger.info(f"Recipient: {user.email}")
        
        # Send the email
        result = send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Email send result: {result}")
        return result > 0
    except Exception as e:
        logger.error(f"Error sending email alert: {str(e)}")
        return False
# utils.py
def check_fodder_alerts_for_matches(fodder_listing):
    """
    Check if a new fodder listing matches any active alerts and notify users.
    This should be called whenever a new fodder listing is created.
    """
    from .models import FodderAlert  # Import here to avoid circular imports
    
    matching_alerts = FodderAlert.objects.filter(
        active=True,
        county=fodder_listing.county,
    )
    
    # Filter by fodder type if specified in the alert
    type_matches = matching_alerts.filter(
        Q(fodder_type=fodder_listing.fodder_type) | Q(fodder_type__isnull=True)
    )
    
    # Filter by max price if specified in the alert
    price_matches = type_matches.filter(
        Q(max_price__gte=fodder_listing.price_per_unit) | Q(max_price__isnull=True)
    )
    
    # For each matching alert, notify the user
    for alert in price_matches:
        # Prevent duplicate notifications
        if not alert.user == fodder_listing.seller:
            send_fodder_match_notification(alert.user, fodder_listing, alert)
            
# utils.py
def send_fodder_match_notification(user, fodder_listing, alert):
    """Send email and SMS notifications to the user about a matching fodder listing."""
    # Create notification message
    message = f"New fodder matching your alert: {fodder_listing.fodder_type.name} in {fodder_listing.county.name} at KSh {fodder_listing.price_per_unit} per {fodder_listing.unit}."
    
    # Send email notification
    send_fodder_email_notification(user, message, fodder_listing, alert)
    
    # Send SMS notification if phone number is available
    if user.profile.phone_number:
        send_fodder_sms_notification(user.profile.phone_number, message, fodder_listing)
        
# utils.py
import requests
from django.conf import settings

def send_fodder_sms_notification(phone_number, message, fodder_listing):
    """Send an SMS notification about a fodder match."""
    # Format the phone number if needed
    if not phone_number.startswith('+'):
        # Assuming Kenyan numbers, add country code if missing
        if phone_number.startswith('0'):
            phone_number = '+254' + phone_number[1:]
        else:
            phone_number = '+254' + phone_number
    
    # Prepare the SMS message (keep it under 160 characters for standard SMS)
    sms_message = f"Digicow Alert: {message[:120]} View details in your Digicow app."
    
    # If you're using Africa's Talking or a similar SMS gateway
    try:
        # This is a placeholder for your SMS API integration
        # Replace with your actual SMS gateway API call
        payload = {
            'username': settings.SMS_USERNAME,
            'to': phone_number,
            'message': sms_message,
            'from': settings.SMS_SENDER_ID
        }
        
        response = requests.post(
            settings.SMS_API_URL,
            data=payload,
            headers={'apiKey': settings.SMS_API_KEY}
        )
        
        # Log the notification (optional)
        # FodderAlertNotification.objects.create(
        #     user=User.objects.get(profile__phone_number=phone_number), 
        #     fodder_listing=fodder_listing, 
        #     notification_type='sms'
        # )
        
        return response.status_code == 200
        
    except Exception as e:
        # Log the error
        logger.error(f"SMS notification failed: {str(e)}")
        return False
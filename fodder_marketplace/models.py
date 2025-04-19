from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class County(models.Model):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name
        
class FodderType(models.Model):
    name = models.CharField(max_length=100)  # e.g., Hay, Silage, etc.
    description = models.TextField(blank=True)
    
    def __str__(self):
        return self.name

class FodderListing(models.Model):
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fodder_listings')
    fodder_type = models.ForeignKey(FodderType, on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit = [
        ('bales', 'Bales'),
        ('kg', 'Kilograms'),
        ('tons', 'Tons'),
        ('bags', 'Bags'),
        ('liters', 'Liters'),
        ('pieces', 'Pieces'),
    ]
    
    # ... other fields ...
    unit = models.CharField(
        max_length=50,
        choices=unit,
        default='kg'  # optional default value
    )
    # ... rest of your model ...
    price_per_unit = models.DecimalField(max_digits=10, decimal_places=2)
    county = models.ForeignKey(County, on_delete=models.CASCADE)
    specific_location = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    date_posted = models.DateTimeField(auto_now_add=True)
    available = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.fodder_type} by {self.seller.username} in {self.county.name}"

class FodderImage(models.Model):
    listing = models.ForeignKey('FodderListing', on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='fodder_images/%Y/%m/%d/')  # Organized by date
    
    def __str__(self):
        return f"Image {self.id} for Listing {self.listing.id}"
    
class FodderInterest(models.Model):
    listing = models.ForeignKey(FodderListing, on_delete=models.CASCADE, related_name='interests')
    interested_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fodder_interests')
    message = models.TextField()
    date_created = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Interest by {self.interested_user.username} in {self.listing}"
        
class FodderAlert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fodder_alerts')
    fodder_type = models.ForeignKey(FodderType, on_delete=models.CASCADE, null=True, blank=True)
    county = models.ForeignKey(County, on_delete=models.CASCADE)
    max_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"Alert for {self.fodder_type if self.fodder_type else 'any fodder'} in {self.county.name}"
    
   #implement fodder alert notofication
# # models.py
# class FodderAlertNotification(models.Model):
#     """Track notifications sent to users for fodder alerts."""
#     NOTIFICATION_TYPES = (
#         ('email', 'Email'),
#         ('sms', 'SMS'),
#     )
    
#     user = models.ForeignKey(User, on_delete=models.CASCADE)
#     alert = models.ForeignKey('FodderAlert', on_delete=models.CASCADE, null=True, blank=True)
#     fodder_listing = models.ForeignKey('FodderListing', on_delete=models.CASCADE)
#     notification_type = models.CharField(max_length=10, choices=NOTIFICATION_TYPES)
#     created_at = models.DateTimeField(auto_now_add=True)
    
#     class Meta:
#         ordering = ['-created_at']
        
#     def __str__(self):
#         return f"{self.notification_type} notification to {self.user.username} for {self.fodder_listing}"    

#create the buy section and try to intergrate payment option
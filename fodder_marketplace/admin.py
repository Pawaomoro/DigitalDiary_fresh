from django.contrib import admin

# Register your models here.
#from django.contrib import admin
from .models import County, FodderType, FodderListing, FodderImage, FodderInterest, FodderAlert

admin.site.register(County)
admin.site.register(FodderType)
admin.site.register(FodderListing)
admin.site.register(FodderImage)
admin.site.register(FodderInterest)
admin.site.register(FodderAlert)
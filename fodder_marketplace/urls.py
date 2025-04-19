from django.urls import path
from . import views

app_name = 'fodder_marketplace'  # This creates a namespace for your URLs

urlpatterns = [
    path('fodder/', views.fodder_listings, name='fodder_listings'),
    path('fodder/create/', views.create_listing, name='create_fodder_listing'),
    path('fodder/<int:pk>/', views.listing_detail, name='fodder_listing_detail'),
    path('fodder/my-listings/', views.my_listings, name='my_fodder_listings'),
    path('fodder/listing/<int:pk>/interests/', views.listing_interests, name='fodder_listing_interests'),
    path('fodder/alerts/create/', views.create_alert, name='create_fodder_alert'),
    path('fodder/my-alerts/', views.my_alerts, name='my_fodder_alerts'),
    path('fodder/<int:pk>/delete/', views.delete_listing, name='delete_fodder_listing'),
    path('fodder/alerts/<int:pk>/delete/', views.delete_alert, name='delete_fodder_alert'),
    path('fodder/alerts/<int:pk>/toggle-active/', views.toggle_alert_active, name='toggle_fodder_alert'),
]
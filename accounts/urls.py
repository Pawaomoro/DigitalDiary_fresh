from django.urls import path
from . import views
urlpatterns = [
    path('profile/', views.update_profile, name="profile"),
    path('test/', views.test, name='test'),
]

app_name = 'accounts'

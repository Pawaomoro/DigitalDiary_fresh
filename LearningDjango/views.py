from django.shortcuts import render
from django.views.decorators.http import require_http_methods

def test(request):  # The function name must match the one in urls.py
    return render(request, "test.html")
def dashboard(request):
    return render(request, template_name='digitaldairy/html/dashboard.html')
@require_http_methods(['GET'])
def index(request):
	return render(request, template_name='digitaldairy/html/landing-page.html')


def service_worker_js(request):
	return render(request, 'digitaldairy/service-worker.js',content_type="application/x-javascript")


def firebase_messaging_sw_js(request):
	return render(request, 'digitaldairy/firebase-messaging-sw.js',content_type="application/x-javascript")
def fodder_calculator(request):
    return render(request, 'digitaldairy/fodder-calculator.html')



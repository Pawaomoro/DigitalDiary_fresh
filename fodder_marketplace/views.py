from django.shortcuts import render

# Create your views here.
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .models import FodderListing, FodderType, County, FodderInterest, FodderAlert
from .forms import FodderListingForm, FodderInterestForm, FodderAlertForm
from .models import  FodderImage
from .utils import check_fodder_alerts_for_matches
def fodder_listings(request):
    counties = County.objects.all()
    fodder_types = FodderType.objects.all()
    
    county_id = request.GET.get('county')
    fodder_type_id = request.GET.get('fodder_type')
    
    listings = FodderListing.objects.filter(available=True)
    
    if county_id:
        listings = listings.filter(county_id=county_id)
    if fodder_type_id:
        listings = listings.filter(fodder_type_id=fodder_type_id)
        
    context = {
        'listings': listings,
        'counties': counties,
        'fodder_types': fodder_types,
        'selected_county': int(county_id) if county_id else None,
        'selected_fodder_type': int(fodder_type_id) if fodder_type_id else None,
    }
    
    return render(request, 'fodder/listings.html', context)

@login_required
def create_listing(request):
    if request.method == 'POST':
        form = FodderListingForm(request.POST, request.FILES)
        if form.is_valid():
            listing = form.save(commit=False)
            listing.seller = request.user
            listing.save()
            
            # Handle multiple images
            for image in request.FILES.getlist('images'):
                FodderImage.objects.create(listing=listing, image=image)
                
            # Check if any alerts match this new listing
            matching_alerts = FodderAlert.objects.filter(
                active=True,
                county=listing.county,
            )
            
            if listing.fodder_type:
                type_specific_alerts = matching_alerts.filter(fodder_type=listing.fodder_type)
                general_alerts = matching_alerts.filter(fodder_type__isnull=True)
                matching_alerts = type_specific_alerts | general_alerts
            
            # Filter by price if alert has max_price set
            price_filtered_alerts = []
            for alert in matching_alerts:
                if not alert.max_price or listing.price_per_unit <= alert.max_price:
                    price_filtered_alerts.append(alert)
            
            # Send notifications for matching alerts
            for alert in price_filtered_alerts:
                # In real implementation, send email or in-app notification
                print(f"Sending alert to {alert.user.username} about new fodder listing")
            
            messages.success(request, 'Fodder listing created successfully!')
            return redirect('fodder_marketplace:fodder_listing_detail', pk=listing.pk)
    else:
        form = FodderListingForm()
    
    return render(request, 'fodder/create_listing.html', {'form': form})

def listing_detail(request, pk):
    listing = get_object_or_404(FodderListing, pk=pk, available=True)
    interest_form = None
    
    if request.user.is_authenticated and request.user != listing.seller:
        if request.method == 'POST':
            interest_form = FodderInterestForm(request.POST)
            if interest_form.is_valid():
                interest = interest_form.save(commit=False)
                interest.listing = listing
                interest.interested_user = request.user
                interest.save()
                messages.success(request, 'Your interest has been sent to the seller!')
                return redirect('fodder_marketplace:fodder_listing_detail', pk=listing.pk)
        else:
            interest_form = FodderInterestForm()
    
    context = {
        'listing': listing,
        'interest_form': interest_form,
    }
    
    return render(request, 'fodder/listing_detail.html', context)

@login_required
def my_listings(request):
    listings = FodderListing.objects.filter(seller=request.user)
    return render(request, 'fodder/my_listings.html', {'listings': listings})

@login_required
def listing_interests(request, pk):
    listing = get_object_or_404(FodderListing, pk=pk, seller=request.user)
    interests = FodderInterest.objects.filter(listing=listing)
    return render(request, 'fodder/listing_interests.html', {'listing': listing, 'interests': interests})

@login_required
def create_alert(request):
    if request.method == 'POST':
        form = FodderAlertForm(request.POST)
        if form.is_valid():
            alert = form.save(commit=False)
            alert.user = request.user
            alert.save()
            messages.success(request, 'Fodder alert created successfully!')
            return redirect('fodder_marketplace:my_fodder_alerts')
    else:
        form = FodderAlertForm()
    
    return render(request, 'fodder/create_alert.html', {'form': form})

@login_required
def my_alerts(request):
    alerts = FodderAlert.objects.filter(user=request.user)
    return render(request, 'fodder/my_alerts.html', {'alerts': alerts})

@login_required
def delete_listing(request, pk):
    listing = get_object_or_404(FodderListing, pk=pk, seller=request.user)
    
    if request.method == 'POST':
        listing.delete()
        messages.success(request, 'Your listing has been successfully deleted')
        return redirect('fodder_marketplace:my_fodder_listings')
    
    # For GET requests, show a confirmation page
    return render(request, 'fodder/delete_listing_confirm.html', {'listing': listing})

@login_required
def delete_alert(request, pk):
    alert = get_object_or_404(FodderAlert, pk=pk, user=request.user)
    if request.method == 'POST':
        alert.delete()
        messages.success(request, "Alert has been successfully deleted.")
    return redirect('fodder_marketplace:my_fodder_alerts')

@login_required
def toggle_alert_active(request, pk):
    alert = get_object_or_404(FodderAlert, pk=pk, user=request.user)
    if request.method == 'POST':
        alert.active = not alert.active
        alert.save()
        status = "activated" if alert.active else "deactivated"
        messages.success(request, f"Alert has been {status}.")
    return redirect('fodder_marketplace:my_fodder_alerts')


# views.py
@login_required
def create_fodder_listing(request):
    if request.method == 'POST':
        form = FodderListingForm(request.POST, request.FILES)
        if form.is_valid():
            listing = form.save(commit=False)
            listing.seller = request.user
            listing.save()
            
            # Check if this new listing matches any alerts
            check_fodder_alerts_for_matches(listing)
            
            messages.success(request, "Your fodder listing has been created successfully.")
            return redirect('fodder_marketplace:fodder_detail', pk=listing.pk)
    else:
        form = FodderListingForm()
    
    return render(request, 'fodder/create_fodder_listing.html', {'form': form})
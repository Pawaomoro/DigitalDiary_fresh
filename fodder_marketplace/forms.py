from django import forms
from .models import FodderListing, FodderInterest, FodderAlert


from django import forms
from .models import FodderListing

# forms.py
from django import forms
from .models import FodderListing
from django.core.validators import FileExtensionValidator

class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True

class MultipleFileField(forms.FileField):
    def __init__(self, *args, **kwargs):
        kwargs.setdefault("widget", MultipleFileInput())
        super().__init__(*args, **kwargs)

    def clean(self, data, initial=None):
        if not data and self.required:
            raise forms.ValidationError("At least one image is required")
            
        if isinstance(data, (list, tuple)):
            result = [super().clean(d, initial) for d in data]
        else:
            result = [super().clean(data, initial)]
        return result

class FodderListingForm(forms.ModelForm):
    images = MultipleFileField(
        required=False,
        widget=MultipleFileInput(attrs={
            'class': 'form-control',
            'multiple': True,
            'accept': 'image/*'
        }),
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png'])]
    )
    
    class Meta:
        model = FodderListing
        fields = ['fodder_type', 'quantity', 'unit', 'price_per_unit', 
                'county', 'specific_location', 'description', 'images']
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4, 'class': 'form-control'}),
            'fodder_type': forms.Select(attrs={'class': 'form-select'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control'}),
            'unit': forms.Select(attrs={'class': 'form-select'}),
            'price_per_unit': forms.NumberInput(attrs={'class': 'form-control'}),
            'county': forms.Select(attrs={'class': 'form-select'}),
            'specific_location': forms.TextInput(attrs={'class': 'form-control'}),
        }
    
    def save(self, commit=True):
        instance = super().save(commit=commit)
        if commit:
            self.save_m2m()
        return instance

class FodderInterestForm(forms.ModelForm):
    class Meta:
        model = FodderInterest
        fields = ['message']
        widgets = {
            'message': forms.Textarea(attrs={'rows': 3, 'placeholder': 'Tell the seller about your interest, how much you want to buy, etc.'}),
        }

class FodderAlertForm(forms.ModelForm):
    class Meta:
        model = FodderAlert
        fields = ['county', 'fodder_type', 'max_price']
        widgets = {
            'fodder_type': forms.Select(attrs={'required': False}),
            'max_price': forms.NumberInput(attrs={'required': False}),
        }
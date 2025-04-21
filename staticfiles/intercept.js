// Save the original jQuery.ajax function
var originalAjax = $.ajax;

// Override jQuery.ajax
$.ajax = function(url, options) {
    // If url is an object, simulate pre-1.5 signature
    if (typeof url === "object") {
        options = url;
        url = undefined;
    }
    
    // Force options to be an object
    options = options || {};
    
    // Log the request details
    console.log("AJAX Request:", options.url || url);
    
    // Replace any Heroku URLs with local
    if (options.url && options.url.includes('digitaldairy.herokuapp.com')) {
        console.log("Replacing Heroku URL:", options.url);
        options.url = options.url.replace('https://digitaldairy.herokuapp.com', 'http://127.0.0.1:8000');
        console.log("New URL:", options.url);
    }
    
    // Call the original function with the updated URL
    return originalAjax.call(this, options);
};

// Override jQuery.post
var originalPost = $.post;
$.post = function(url, data, callback, type) {
    // Log the request
    console.log("POST Request to:", url);
    
    // Replace any Heroku URLs with local
    if (url && url.includes('digitaldairy.herokuapp.com')) {
        console.log("Replacing Heroku URL:", url);
        url = url.replace('https://digitaldairy.herokuapp.com', 'http://127.0.0.1:8000');
        console.log("New URL:", url);
    }
    
    // Call the original function with the updated URL
    return originalPost.call(this, url, data, callback, type);
};

// Override form submissions
$(document).ready(function() {
    console.log("Form submission interceptor loaded");
    
    // Find all forms, especially the milk form
    $('form').each(function() {
        var formId = $(this).attr('id');
        console.log("Found form:", formId);
        
        // Add our own submit handler
        $(this).off('submit').on('submit', function(event) {
            console.log("Form submitted:", formId);
            
            // Don't intercept delete or search forms
            if (formId && (formId.includes('delete') || formId.includes('search'))) {
                return true;
            }
            
            // Intercept the milk form
            if (formId === 'milkInputForm') {
                event.preventDefault();
                
                console.log("Intercepting milk form submission");
                var formData = $(this).serialize();
                var localUrl = 'http://127.0.0.1:8000/digitaldairy/save_milk_production';
                
                console.log("Sending to:", localUrl);
                console.log("Data:", formData);
                
                $.ajax({
                    url: localUrl,
                    type: 'POST',
                    data: formData,
                    success: function(data) {
                        console.log("Success:", data);
                        alert("Record saved successfully!");
                        location.reload();
                    },
                    error: function(xhr, status, error) {
                        console.error("Error:", xhr, status, error);
                        alert("Failed to save record: " + error);
                    }
                });
                
                return false;
            }
        });
    });
});
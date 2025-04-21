// Add this right before the closing </body> tag in your HTML
document.addEventListener('DOMContentLoaded', function() {
    // Override postUrl globally
    window.postUrl = 'http://127.0.0.1:8000';
    console.log('postUrl overridden to:', window.postUrl);
    
    // Override milk form submission
    var milkForm = document.getElementById('milkInputForm');
    if (milkForm) {
      milkForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        var formData = new FormData(milkForm);
        var serializedData = '';
        for (var pair of formData.entries()) {
          serializedData += pair[0] + '=' + pair[1] + '&';
        }
        serializedData = serializedData.slice(0, -1); // Remove trailing &
        
        console.log('Submitting to local server:', window.postUrl + '/digitaldairy/save_milk_production');
        
        fetch(window.postUrl + '/digitaldairy/save_milk_production', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
          },
          body: serializedData
        })
        .then(response => response.json())
        .then(data => {
          console.log('Success:', data);
          // Handle success (same logic as in your original code)
          window.sessionStorage.setItem('milk_p_' + data.id, JSON.stringify(data));
          alert('Record saved successfully!');
          // You may want to reload the page or update the UI here
        })
        .catch(error => {
          console.error('Error:', error);
          alert('Failed to save record');
        });
      });
    }
  });
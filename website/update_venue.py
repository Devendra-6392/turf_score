import sys
import re

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\venue-details.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add IDs to elements for dynamic insertion
# Name
html = re.sub(r'(<h2[^>]*>)\s*Sarah Sports Academy\s*(</h2>)', r'\1<span id="dynamic-venue-title">Sarah Sports Academy</span>\2', html)
# Location
html = re.sub(r'(<i class="feather-map-pin"></i>)\s*Port Alsworth, AK', r'\1 <span id="dynamic-venue-location">Port Alsworth, AK</span>', html)
# Price
html = re.sub(r'(\$150)(<span>/hr</span>)', r'<span id="dynamic-venue-price">\1</span>\2', html)
# Description
html = re.sub(r'(<div class="tab-pane fade show active" id="overview".*?<p>).*?(</p>)', r'\1<span id="dynamic-venue-description">Venue description will load here...</span>\2', html, flags=re.DOTALL|re.IGNORECASE, count=1)

# Include api.js
script_tag = '<script src="assets/js/api.js"></script>'
html = html.replace('<!-- Custom JS -->', f'{script_tag}\n\t<!-- Custom JS -->')

# Logic for fetching turf details and handling booking
inline_script = """
<script>
    document.addEventListener('DOMContentLoaded', async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const turfId = urlParams.get('id');
        
        if (turfId) {
            try {
                // We're using standard fetch here because apiFetch requires auth and turf details might be public
                // but apiFetch handles both. Let's use getTurfs and find it, or write a new one.
                const turfs = await getTurfs();
                const turf = turfs.find(t => t.id === turfId);
                
                if (turf) {
                    const titleEl = document.getElementById('dynamic-venue-title');
                    const locEl = document.getElementById('dynamic-venue-location');
                    const priceEl = document.getElementById('dynamic-venue-price');
                    const descEl = document.getElementById('dynamic-venue-description');
                    
                    if(titleEl) titleEl.innerText = turf.name || 'Turf Arena';
                    if(locEl) locEl.innerText = turf.location || turf.city || 'Unknown Location';
                    if(priceEl) priceEl.innerText = `₹${turf.pricePerHour || turf.price || '1000'}`;
                    if(descEl) descEl.innerText = turf.description || 'No description available.';
                }
            } catch (err) {
                console.error('Error loading turf details:', err);
            }
        }
    });

    // Booking Logic
    // We will attach an event listener to any form inside a div with class booking-form
    document.addEventListener('submit', async (e) => {
        const form = e.target;
        if(form.closest('.booking-form') || form.closest('.check-availability')) {
            e.preventDefault();
            
            if(!isLoggedIn()) {
                alert('Please login to book this turf!');
                window.location.href = 'login.html';
                return;
            }
            
            const urlParams = new URLSearchParams(window.location.search);
            const turfId = urlParams.get('id');
            if(!turfId) {
                alert('No turf selected for booking!');
                return;
            }
            
            try {
                // Find date and time inputs if they exist, else dummy data for now
                const dateInput = form.querySelector('input[type="date"]');
                const date = dateInput ? dateInput.value : new Date().toISOString().split('T')[0];
                
                const btn = form.querySelector('button[type="submit"]');
                const ogText = btn.innerHTML;
                btn.innerHTML = 'Booking...';
                btn.disabled = true;
                
                const response = await apiFetch('/bookings', {
                    method: 'POST',
                    body: JSON.stringify({
                        turfId: turfId,
                        date: date,
                        startTime: "18:00",
                        endTime: "19:00",
                        paymentMethod: "wallet"
                    })
                });
                
                alert('Booking successful!');
                window.location.href = 'user-bookings.html';
            } catch (err) {
                alert('Booking failed: ' + err.message);
                const btn = form.querySelector('button[type="submit"]');
                btn.innerHTML = 'Confirm Booking';
                btn.disabled = false;
            }
        }
    });
</script>
"""
html = html.replace('</body>', f'{inline_script}\n</body>')

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\venue-details.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated venue-details.html')

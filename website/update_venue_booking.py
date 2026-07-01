import re

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\venue-details.html', 'r', encoding='utf-8') as f:
    html = f.read()

# The old form is inside <div class="card booking-form">
# Let's replace the whole form element.
new_form = """<form id="turf-booking-form">
                                <div class="mb-10">
                                    <label for="booking-date" class="form-label">Booking Date</label>
                                    <input type="date" class="form-control" id="booking-date" required>
                                </div>
                                <div class="mb-10">
                                    <label for="booking-time" class="form-label">Time Slot</label>
                                    <select class="form-control" id="booking-time" required>
                                        <option value="08:00">08:00 AM - 09:00 AM</option>
                                        <option value="09:00">09:00 AM - 10:00 AM</option>
                                        <option value="10:00">10:00 AM - 11:00 AM</option>
                                        <option value="11:00">11:00 AM - 12:00 PM</option>
                                        <option value="12:00">12:00 PM - 01:00 PM</option>
                                        <option value="13:00">01:00 PM - 02:00 PM</option>
                                        <option value="14:00">02:00 PM - 03:00 PM</option>
                                        <option value="15:00">03:00 PM - 04:00 PM</option>
                                        <option value="16:00">04:00 PM - 05:00 PM</option>
                                        <option value="17:00">05:00 PM - 06:00 PM</option>
                                        <option value="18:00">06:00 PM - 07:00 PM</option>
                                        <option value="19:00">07:00 PM - 08:00 PM</option>
                                        <option value="20:00">08:00 PM - 09:00 PM</option>
                                        <option value="21:00">09:00 PM - 10:00 PM</option>
                                        <option value="22:00">10:00 PM - 11:00 PM</option>
                                    </select>
                                </div>
                                <div class="mb-10">
                                    <label for="booking-payment" class="form-label">Payment Method</label>
                                    <select class="form-control" id="booking-payment" required>
                                        <option value="wallet">Wallet (Deduct from balance)</option>
                                        <option value="cod">Pay at Venue</option>
                                    </select>
                                </div>
                                <hr>
                                <div class="d-flex justify-content-between mb-3">
                                    <h5 class="mb-0">Total Price</h5>
                                    <h5 class="mb-0 text-primary" id="booking-total-price">₹0</h5>
                                </div>
                                <div class="d-grid btn-block">
                                    <button type="submit" class="btn btn-secondary">Confirm Booking</button>
                                </div>
                            </form>"""

# Replace the form
html = re.sub(r'<form>.*?</form>', new_form, html, flags=re.DOTALL, count=1)

# Now update the javascript I appended at the bottom
# I will replace the script I injected earlier
js_pattern = r'// Booking Logic.*?</script>'

new_js = """// Booking Logic
    let currentTurfPrice = 1000;
    
    // Set min date to today
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
        dateInput.min = today;
    }
    
    // Hook up form logic
    const bookingForm = document.getElementById('turf-booking-form');
    if(bookingForm) {
        // When user data loads we need the price
        document.addEventListener('DOMContentLoaded', async () => {
            const urlParams = new URLSearchParams(window.location.search);
            const turfId = urlParams.get('id');
            if (turfId) {
                try {
                    const turfs = await getTurfs();
                    const turf = turfs.find(t => t.id === turfId);
                    if (turf) {
                        currentTurfPrice = turf.pricePerHour || turf.price || 1000;
                        document.getElementById('booking-total-price').innerText = `₹${currentTurfPrice}`;
                    }
                } catch(e) {}
            }
        });
        
        bookingForm.addEventListener('submit', async (e) => {
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
            
            const date = document.getElementById('booking-date').value;
            const timeSlot = document.getElementById('booking-time').value;
            const paymentMethod = document.getElementById('booking-payment').value;
            
            const btn = bookingForm.querySelector('button[type="submit"]');
            const ogText = btn.innerHTML;
            btn.innerHTML = 'Booking...';
            btn.disabled = true;
            
            try {
                const response = await apiFetch('/bookings', {
                    method: 'POST',
                    body: JSON.stringify({
                        turfId: turfId,
                        bookingDate: new Date(date).toISOString(),
                        timeSlot: timeSlot,
                        amount: currentTurfPrice,
                        paymentMethod: paymentMethod
                    })
                });
                
                alert('Booking successful!');
                window.location.href = 'user-bookings.html';
            } catch (err) {
                alert('Booking failed: ' + err.message);
                btn.innerHTML = 'Confirm Booking';
                btn.disabled = false;
            }
        });
    }
</script>"""

html = re.sub(js_pattern, new_js, html, flags=re.DOTALL)

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\venue-details.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated venue-details.html booking flow')

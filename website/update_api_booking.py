import re

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\assets\js\api.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the form inside renderTurfs
new_form = """<form id="index-booking-form-${turf.id}" onsubmit="handleIndexBooking(event, '${turf.id}', ${turf.price || 1000})">
                            <div class="row row-gap-3">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Date</label>
                                        <input type="date" class="form-control booking-date" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Time Slot</label>
                                        <select class="form-control booking-time" required>
                                            <option value="08:00">08:00 AM</option>
                                            <option value="09:00">09:00 AM</option>
                                            <option value="10:00">10:00 AM</option>
                                            <option value="11:00">11:00 AM</option>
                                            <option value="12:00">12:00 PM</option>
                                            <option value="16:00">04:00 PM</option>
                                            <option value="17:00">05:00 PM</option>
                                            <option value="18:00">06:00 PM</option>
                                            <option value="19:00">07:00 PM</option>
                                            <option value="20:00">08:00 PM</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="form-group">
                                        <label>Payment Method</label>
                                        <select class="form-control booking-payment" required>
                                            <option value="wallet">Wallet (Deduct balance)</option>
                                            <option value="cod">Pay at Venue (COD)</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-12">
                                    <div class="booking-info">
                                        <div class="total">
                                            <h4>Booking Total </h4>
                                        </div>
                                        <h5 class="price">₹${turf.price || 1000}</h5>
                                    </div>
                                </div>
                                <div class="col-12">
                                    <button type="submit" class="btn btn-primary submit-btn"> <span class="confirm-btn-text">Confirm Booking</span></button>
                                </div>
                            </div>
                        </form>"""

js = re.sub(r'<form onsubmit="event\.preventDefault\(\); alert\(\'Booking logic to be implemented!\'\);">.*?</form>', new_form, js, flags=re.DOTALL)

# Add handleIndexBooking at the end
js += """

window.handleIndexBooking = async function(event, turfId, price) {
    event.preventDefault();
    if (!isLoggedIn()) {
        alert('Please login to book a turf!');
        window.location.href = 'login.html';
        return;
    }
    
    const form = event.target;
    const date = form.querySelector('.booking-date').value;
    const timeSlot = form.querySelector('.booking-time').value;
    const paymentMethod = form.querySelector('.booking-payment').value;
    
    const btn = form.querySelector('.submit-btn');
    const ogText = btn.innerHTML;
    btn.innerHTML = 'Booking...';
    btn.disabled = true;
    
    try {
        await apiFetch('/bookings', {
            method: 'POST',
            body: JSON.stringify({
                turfId: turfId,
                bookingDate: new Date(date).toISOString(),
                timeSlot: timeSlot,
                amount: price,
                paymentMethod: paymentMethod
            })
        });
        
        alert('Booking successful!');
        window.location.href = 'user-bookings.html';
    } catch (err) {
        alert('Booking failed: ' + err.message);
        btn.innerHTML = ogText;
        btn.disabled = false;
    }
};
"""

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\assets\js\api.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Updated api.js booking logic')

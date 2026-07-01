import sys
import re

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\user-bookings.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the tab panes with empty containers
html = re.sub(
    r'(<div class="tab-pane fade show active" id="upcoming" role="tabpanel" aria-labelledby="upcoming-tab">).*?(</div>\s*<!-- /Upcoming -->)',
    r'\1\n<div id="dynamic-upcoming-bookings" class="w-100 py-4 text-center">Loading upcoming bookings...</div>\n\2',
    html,
    flags=re.DOTALL
)

html = re.sub(
    r'(<div class="tab-pane fade" id="past" role="tabpanel" aria-labelledby="past-tab">).*?(</div>\s*<!-- /Past -->)',
    r'\1\n<div id="dynamic-past-bookings" class="w-100 py-4 text-center">Loading past bookings...</div>\n\2',
    html,
    flags=re.DOTALL
)

# Add api.js
script_tag = '<script src="assets/js/api.js"></script>'
html = html.replace('<!-- Custom JS -->', f'{script_tag}\n\t<!-- Custom JS -->')

inline_script = """
<script>
    document.addEventListener('DOMContentLoaded', async () => {
        if (!isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }
        
        try {
            const upcomingContainer = document.getElementById('dynamic-upcoming-bookings');
            const pastContainer = document.getElementById('dynamic-past-bookings');
            
            const bookings = await apiFetch('/bookings/my-bookings', { method: 'GET' });
            
            if (!bookings || bookings.length === 0) {
                const emptyMsg = '<div class="text-center w-100 py-5"><h4>No Bookings Found</h4></div>';
                if (upcomingContainer) upcomingContainer.innerHTML = emptyMsg;
                if (pastContainer) pastContainer.innerHTML = emptyMsg;
                return;
            }
            
            const now = new Date();
            let upcomingHtml = '';
            let pastHtml = '';
            
            bookings.forEach(booking => {
                const turfName = booking.turf ? booking.turf.name : 'Unknown Turf';
                const turfLoc = booking.turf ? (booking.turf.location || booking.turf.city) : '';
                const dateStr = booking.date ? new Date(booking.date).toDateString() : 'N/A';
                const timeStr = booking.startTime ? `${booking.startTime} - ${booking.endTime}` : 'N/A';
                const price = booking.totalAmount || booking.price || 0;
                
                const bookingHtml = `
                    <div class="booking-list">
                        <div class="booking-widget">
                            <div class="booking-img">
                                <a href="venue-details.html?id=${booking.turfId}">
                                    <img src="assets/img/booking/booking-01.jpg" alt="Venue">
                                </a>
                            </div>
                            <div class="booking-det-info">
                                <h3>
                                    <a href="venue-details.html?id=${booking.turfId}">${turfName}</a>
                                </h3>
                                <ul class="booking-details">
                                    <li><i class="feather-calendar"></i> ${dateStr}</li>
                                    <li><i class="feather-clock"></i> ${timeStr}</li>
                                    <li><i class="feather-map-pin"></i> ${turfLoc}</li>
                                    <li><i class="feather-credit-card"></i> ₹${price}</li>
                                </ul>
                                <span class="badge bg-success">${booking.status || 'CONFIRMED'}</span>
                            </div>
                        </div>
                    </div>
                `;
                
                // Very basic split logic based on date
                const bookingDate = new Date(booking.date);
                if (bookingDate >= now || booking.status === 'PENDING' || booking.status === 'CONFIRMED') {
                    upcomingHtml += bookingHtml;
                } else {
                    pastHtml += bookingHtml;
                }
            });
            
            if (upcomingContainer) {
                upcomingContainer.innerHTML = upcomingHtml || '<div class="text-center w-100 py-5"><h4>No Upcoming Bookings</h4></div>';
            }
            if (pastContainer) {
                pastContainer.innerHTML = pastHtml || '<div class="text-center w-100 py-5"><h4>No Past Bookings</h4></div>';
            }
            
        } catch (err) {
            console.error('Failed to load bookings:', err);
        }
    });
</script>
"""
html = html.replace('</body>', f'{inline_script}\n</body>')

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\user-bookings.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated user-bookings.html')

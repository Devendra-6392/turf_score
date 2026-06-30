import sys
import re

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\user-dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Make statistics dynamic
html = html.replace('<h3>78</h3>\n											<p>Total Court Booked</p>', '<h3><span id="stat-courts-booked">0</span></h3>\n											<p>Total Court Booked</p>')

html = html.replace('<h3>45</h3>\n											<p>Total Coaches Booked</p>', '<h3><span id="stat-coaches-booked">0</span></h3>\n											<p>Total Coaches Booked</p>')

html = html.replace('<h3>14</h3>\n											<p>Total Events Request</p>', '<h3><span id="stat-events">0</span></h3>\n											<p>Total Events Request</p>')

html = html.replace('<h3>$345</h3>\n											<p>Total Earning</p>', '<h3><span id="stat-wallet">₹0</span></h3>\n											<p>Wallet Balance</p>')

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
            // Fetch User Profile
            const profile = await apiFetch('/auth/me', { method: 'GET' });
            
            // Set Wallet Balance
            const walletEl = document.getElementById('stat-wallet');
            if (walletEl && profile.wallet) {
                walletEl.innerText = `₹${profile.wallet.balance || 0}`;
            }
            
            // Fetch Bookings to count
            const bookings = await apiFetch('/bookings/my-bookings', { method: 'GET' });
            const bookedEl = document.getElementById('stat-courts-booked');
            if (bookedEl && bookings && bookings.length !== undefined) {
                bookedEl.innerText = bookings.length;
            }
            
            // We can also update other stats based on XP or MatchesPlayed
            const matchesEl = document.getElementById('stat-events');
            if (matchesEl) {
                matchesEl.innerText = profile.matchesPlayed || 0;
            }
            
        } catch (err) {
            console.error('Failed to load dashboard data:', err);
        }
    });
</script>
"""
html = html.replace('</body>', f'{inline_script}\n</body>')

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\user-dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Updated user-dashboard.html')

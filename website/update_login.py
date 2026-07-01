import sys
import re

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\login.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace the first form action (User)
html = html.replace('<form action="user-dashboard.html">', '<form id="userLoginForm">')
# Replace the second form action (Coach)
html = html.replace('<form action="index.html">', '<form id="coachLoginForm">')

# Add IDs to the input fields (We will match placeholders to be safe)
html = html.replace('placeholder="Email / Username"', 'placeholder="Email / Username" id="loginEmail" required')
html = html.replace('placeholder="Password"', 'placeholder="Password" id="loginPassword" required')

# Add api.js script at the end
script_tag = '<script src="assets/js/api.js"></script>'
html = html.replace('<!-- Custom JS -->', f'{script_tag}\n\t<!-- Custom JS -->')

# Add inline script to handle login
inline_script = """
    <script>
        async function handleLogin(e) {
            e.preventDefault();
            const email = e.target.querySelector('input[type="text"]').value;
            const password = e.target.querySelector('input[type="password"]').value;
            const btn = e.target.querySelector('button[type="submit"]');
            const ogText = btn.innerHTML;
            
            try {
                btn.innerHTML = 'Signing In...';
                btn.disabled = true;
                
                await loginUser(email, password);
                
                // On success, redirect
                window.location.href = 'user-dashboard.html';
            } catch (err) {
                alert('Login failed: ' + err.message);
                btn.innerHTML = ogText;
                btn.disabled = false;
            }
        }
        
        const userForm = document.getElementById('userLoginForm');
        const coachForm = document.getElementById('coachLoginForm');
        
        if (userForm) userForm.addEventListener('submit', handleLogin);
        if (coachForm) coachForm.addEventListener('submit', handleLogin);
    </script>
"""
html = html.replace('</body>', f'{inline_script}\n</body>')

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\login.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Successfully updated login.html')

import sys
import re

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\register.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace forms
html = html.replace('<form action="login.html">', '<form id="userRegForm">', 1)
html = html.replace('<form action="login.html">', '<form id="coachRegForm">', 1)

# Add ids to inputs - because there are two forms, replace will hit both which is fine
# We are making inputs required
html = html.replace('placeholder="Username"', 'placeholder="Username" required')
html = html.replace('placeholder="Email"', 'placeholder="Email" required')
html = html.replace('placeholder="Password"', 'placeholder="Password" required')

# Add api.js
script_tag = '<script src="assets/js/api.js"></script>'
html = html.replace('<!-- Custom JS -->', f'{script_tag}\n\t<!-- Custom JS -->')

inline_script = """
    <script>
        async function handleRegister(e) {
            e.preventDefault();
            // In the form structure, 1st input is username, 2nd is email, 3rd is password
            const inputs = e.target.querySelectorAll('input[type="text"], input[type="password"]');
            const name = inputs[0].value;
            const email = inputs[1].value;
            const password = inputs[2].value;
            const confirmPass = inputs[3].value;
            
            if (password !== confirmPass) {
                alert('Passwords do not match');
                return;
            }
            
            const btn = e.target.querySelector('button[type="submit"]');
            const ogText = btn.innerHTML;
            
            try {
                btn.innerHTML = 'Creating Account...';
                btn.disabled = true;
                
                await registerUser({ name, email, password });
                
                // On success, redirect
                window.location.href = 'user-dashboard.html';
            } catch (err) {
                alert('Registration failed: ' + err.message);
                btn.innerHTML = ogText;
                btn.disabled = false;
            }
        }
        
        const userForm = document.getElementById('userRegForm');
        const coachForm = document.getElementById('coachRegForm');
        
        if (userForm) userForm.addEventListener('submit', handleRegister);
        if (coachForm) coachForm.addEventListener('submit', handleRegister);
    </script>
"""
html = html.replace('</body>', f'{inline_script}\n</body>')

with open(r'd:\Work-Space\Industrial Prijects\turf_score\website\register.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Successfully updated register.html')

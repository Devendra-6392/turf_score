const API_URL = 'https://turf.localhostt.live/api';

// Utility to get auth token
function getAuthToken() {
    return localStorage.getItem('turf_auth_token');
}

// Utility to check if user is logged in
function isLoggedIn() {
    return !!getAuthToken();
}

// Utility to set auth token
function setAuthToken(token) {
    localStorage.setItem('turf_auth_token', token);
}

// Utility to clear auth token
function logout() {
    localStorage.removeItem('turf_auth_token');
    window.location.href = 'index.html';
}

// Custom Fetch Wrapper
async function apiFetch(endpoint, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };

    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers
        });
        
        // Some APIs might return empty responses for DELETE etc.
        const text = await response.text();
        const data = text ? JSON.parse(text) : {};
        
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error;
    }
}

// Fetch Turfs (Public)
async function getTurfs() {
    return apiFetch('/turfs', { method: 'GET' });
}

// Login
async function loginUser(email, password) {
    const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
    });
    if (data && data.token) {
        setAuthToken(data.token);
    }
    return data;
}

// Register
async function registerUser(userData) {
    const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
    if (data && data.token) {
        setAuthToken(data.token);
    }
    return data;
}

// Helper to update Auth UI across pages
function updateAuthUI() {
    const loginLinks = document.querySelectorAll('.login-link');
    const headerNavRht = document.querySelector('.header-navbar-rht');

    if (isLoggedIn()) {
        // Hide sign in / sign up in mobile menu
        loginLinks.forEach(link => link.style.display = 'none');
        
        // Update top right button
        if (headerNavRht) {
            headerNavRht.innerHTML = `
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle btn btn-primary" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="color: white; padding: 10px 20px;">
                        <i class="feather-user"></i> My Account
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end">
                        <li><a class="dropdown-item" href="user-dashboard.html">Dashboard</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="javascript:void(0);" onclick="logout()">Logout</a></li>
                    </ul>
                </li>
            `;
        }
    }
}

// Run auth UI update on load
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI();
    
    // If we are on the index page, load turfs
    if (document.getElementById('dynamic-booking-wrapper')) {
        renderTurfs();
    }
});

// Function to render turfs dynamically
async function renderTurfs() {
    const wrapper = document.getElementById('dynamic-booking-wrapper');
    if (!wrapper) return;

    try {
        const turfs = await getTurfs();
        
        if (!turfs || turfs.length === 0) {
            wrapper.innerHTML = '<div class="text-center w-100 py-5"><h4>No Turfs Available</h4></div>';
            return;
        }

        let tabsHtml = '<div class="booking-left"><div class="booking-tabs nav nav-tabs" id="pills-one-tabs" role="tablist">';
        let contentHtml = '<div class="booking-right tab-content wow fadeInDown" data-wow-delay=".9s" data-wow-duration="2s">';

        turfs.forEach((turf, index) => {
            const isActive = index === 0 ? 'active' : '';
            const isShow = index === 0 ? 'show active' : '';
            const tabId = `pills-tab-${index}`;
            const contentId = `pills-content-${index}`;

            tabsHtml += `
                <div class="tab-item ${isActive}" id="${tabId}" data-bs-toggle="pill" data-bs-target="#${contentId}" role="tab">
                    <h3 class="custom-title">${turf.name || 'Turf Arena'} <span class="badge bg-sucess">Available</span></h3>
                    <div class="booking-content">
                        <p> <i class="feather-map-pin"></i> ${turf.location || 'Unknown Location'}</p>
                        <p> <i class="feather-layout"></i> ${turf.turfType || 'Standard Turf'}</p>
                        <p> <i class="feather-zap"></i> ${turf.format || '5-a-side'}</p>
                    </div>
                </div>
            `;

            contentHtml += `
                <div class="tab-pane fade ${isShow}" id="${contentId}" role="tabpanel">
                    <div class="booking-form">
                        <h3 class="custom-title"> BOOK ${turf.name || 'TURF ARENA'} </h3>
                        <form id="index-booking-form-${turf.id}" onsubmit="handleIndexBooking(event, '${turf.id}', ${turf.price || 1000})">
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
                                            <option value="cod">Pay at Turf (COD)</option>
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
                        </form>
                    </div>
                </div>
            `;
        });

        tabsHtml += '</div></div>';
        contentHtml += '</div>';

        wrapper.innerHTML = tabsHtml + contentHtml;

    } catch (error) {
        wrapper.innerHTML = `<div class="text-center w-100 py-5 text-danger"><h4>Error loading turfs</h4><p>${error.message}</p></div>`;
    }
}


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

/**
 * URL of the API endpoint.
 * @constant {string}
 */
const API_URL = 'http://localhost:3000/api';


const loadingSpinner = document.getElementById('loadingSpinner');


hideLoadingSpinner();

/**
 * Event listener for the login form submission.
 * Prevents the default form submission behavior, retrieves the email and password values,
 * sends a POST request to the login API, and handles the response.
 * If the login is successful, stores the token in localStorage and redirects to the settings page.
 * If the login fails, displays an alert with the error message.
 * 
 * @param {Event} e - The event object.
 */
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://ampProject.onrender.com';

    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: document.getElementById('loginEmail').value,
                password: document.getElementById('loginPassword').value
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        // Store auth data
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('username', data.username);
        localStorage.setItem('accountType', data.accountType);

        console.log('Login successful');
        window.location.href = '../Html/homePage.html';
        
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
});

/**
 * Event listener for the register form submission.
 * Prevents the default form submission behavior, retrieves the form values,
 * sends a POST request to the register API, and handles the response.
 * If the registration is successful, alerts the user and switches to the login tab.
 * If the registration fails, displays an alert with the error message.
 * 
 * @param {Event} e - The event object.
 */
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const API_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://ampproject.onrender.com';

    try {
        console.log('Attempting registration...');
        const registerData = {
            username: document.getElementById('registerUsername').value,
            email: document.getElementById('registerEmail').value,
            password: document.getElementById('registerPassword').value,
            accountType: document.getElementById('accountType').value
        };
        console.log('Register data:', registerData);

        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(registerData)
        });

        console.log('Register response status:', response.status);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        alert('Registration successful! Please log in.');
        switchToTab('login');
        
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);
    }
});

/**
 * Function to switch between tabs.
 * @param {string} tab - The tab to switch to ('login' or 'register').
 */
function switchToTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const dashboard = document.getElementById('dashboard');
    const tabButtons = document.querySelectorAll('.tab-btn');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        dashboard.classList.add('hidden');
        tabButtons[0].classList.add('active');
        tabButtons[1].classList.remove('active');
    } else if (tab === 'register') {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        dashboard.classList.add('hidden');
        tabButtons[1].classList.add('active');
        tabButtons[0].classList.remove('active');
    }
}

/**
 * Add event listeners to the tab buttons to handle tab switching.
 */
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        switchToTab(targetTab);
    });
});

/**
 * Optional: Handle logout functionality.
 */
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    localStorage.removeItem('accountType');
    window.location.href = '../Html/loginPage.html'; 
});

// Optional: Check if the user is already logged in and redirect to dashboard

function showLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'flex';
}

function hideLoadingSpinner() {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) spinner.style.display = 'none';
}

// Update the DOMContentLoaded event
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        showLoadingSpinner();
        setTimeout(() => {
            window.location.href = '../Html/homePage.html';
            hideLoadingSpinner();
        }, 1000);
    }
});
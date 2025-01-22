const BASE_PATH = window.location.origin;
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : 'https://boxes-vxnc.onrender.com';

// Initialize page with user data
async function loadUserProfile() {
    const token = localStorage.getItem('authToken');
    const username = localStorage.getItem('username');
    
    if (!token) {
        console.log('No auth token found');
        window.location.href = '../Html/LoginPage.html';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const userData = await response.json();
        console.log('Profile data:', userData);

        // Update UI with user data
        document.getElementById('userDisplayName').textContent = userData.username;
        document.getElementById('accountTypeDisplay').textContent = userData.accountType;
        document.getElementById('username').value = userData.username;
        document.getElementById('email').value = userData.email;
        
    } catch (error) {
        console.error('Profile error:', error);
        alert('Failed to load profile');
    }
}

document.addEventListener('DOMContentLoaded', loadUserProfile);

// Update navigation active states
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
        const section = item.dataset.section;
        
        document.querySelectorAll('.settings-section').forEach(s => 
            s.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(i => 
            i.classList.remove('active'));
        
        document.getElementById(section).classList.add('active');
        item.classList.add('active');
    });
});

// Profile Form
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) return;

    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value,
        preferences: {
            bio: document.getElementById('bio').value,
            emailNotifications: document.getElementById('emailNotifications').checked,
            darkMode: document.getElementById('darkMode').checked
        }
    };

    try {
        const response = await fetch(`${API_URL}/profile`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error('Update failed');

        const updatedUser = await response.json();
        initializeUserData(updatedUser);
        alert('Profile updated successfully!');
    } catch (error) {
        alert('Failed to update profile');
    }
});

// Security Form
document.getElementById('securityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('authToken'); // Changed from 'token'
    if (!token) {
        alert('Please login again');
        window.location.href = '../Html/LoginPage.html';
        return;
    }

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword !== confirmPassword) {
        alert('New passwords do not match!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/api/auth/password`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                currentPassword, 
                newPassword 
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update password');
        }

        alert('Password updated successfully!');
        document.getElementById('securityForm').reset();
    } catch (error) {
        alert(error.message);
    }
});

// Delete Account
document.getElementById('deleteAccountBtn').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        try {
            const response = await fetch(`${API_URL}/profile`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete account');

            localStorage.removeItem('token');
            window.location.href = '../Html/LoginPage.html';
        } catch (error) {
            alert('Failed to delete account');
        }
    }
});

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    window.location.replace('../Html/LoginPage.html');
});
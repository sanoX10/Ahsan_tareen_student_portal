// js/auth.js
// Handles user authentication (login and register)

// BASE_URL is defined globally by app.js and accessed via window.BASE_URL.
// Utility functions (showLoading, showMessage, etc.) are also defined in app.js
// and accessed via the window object.

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginMessage = document.getElementById('login-message');
    const registerMessage = document.getElementById('register-message');

    // Login Form Submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        window.showLoading(); // Access showLoading from window object
        const username = loginForm['login-username'].value;
        const password = loginForm['login-password'].value;

        console.log('--- Login Attempt ---');
        console.log('Sending login request to:', `${window.BASE_URL}/auth/login`);
        console.log('Credentials:', { username, password: '***' }); // Mask password for console log

        try {
            const response = await fetch(`${window.BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            window.hideLoading(); // Access hideLoading from window object

            console.log('Login API Response Status:', response.status, response.statusText);
            console.log('Login API Response Data:', data);

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('role', data.role);
                localStorage.setItem('userId', data.userId);
                if (data.studentId) {
                    localStorage.setItem('studentId', data.studentId);
                }
                window.showMessage('Login successful!', 'success'); // Access showMessage from window object
                loginMessage.textContent = '';
                window.renderDashboard(); // Access renderDashboard from window object
            } else {
                loginMessage.textContent = data.msg || 'Login failed: Unknown error.';
                loginMessage.className = 'text-center text-sm mt-4 text-red-500';
                window.showMessage(data.msg || 'Login failed', 'error'); // Access showMessage from window object
            }
        } catch (error) {
            window.hideLoading(); // Access hideLoading from window object
            console.error('Login Error (Network or Server Unreachable):', error);
            loginMessage.textContent = 'Network error or server unavailable. Is the backend running?';
            loginMessage.className = 'text-center text-sm mt-4 text-red-500';
            window.showMessage('Network error or server unavailable.', 'error'); // Access showMessage from window object
        }
    });

    // Register Form Submission (Admin Only)
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        window.showLoading(); // Access showLoading from window object
        const username = registerForm['register-username'].value;
        const password = registerForm['register-password'].value;

        console.log('--- Register Attempt (Admin) ---');
        console.log('Sending register request to:', `${window.BASE_URL}/auth/register`);
        console.log('Credentials:', { username, password: '***', role: 'admin' });

        try {
            const response = await fetch(`${window.BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, role: 'admin' }),
            });

            const data = await response.json();
            window.hideLoading(); // Access hideLoading from window object

            console.log('Register API Response Status:', response.status, response.statusText);
            console.log('Register API Response Data:', data);

            if (response.ok) {
                registerMessage.textContent = data.msg;
                registerMessage.className = 'text-center text-sm mt-4 text-green-500';
                window.showMessage('Admin registered successfully! You can now login.', 'success'); // Access showMessage from window object
                registerForm.reset();
            } else {
                registerMessage.textContent = data.msg || 'Registration failed: Unknown error.';
                registerMessage.className = 'text-center text-sm mt-4 text-red-500';
                window.showMessage(data.msg || 'Registration failed', 'error'); // Access showMessage from window object
            }
        } catch (error) {
            window.hideLoading(); // Access hideLoading from window object
            console.error('Register Error (Network or Server Unreachable):', error);
            registerMessage.textContent = 'Network error or server unavailable. Is the backend running?';
            registerMessage.className = 'text-center text-sm mt-4 text-red-500';
            window.showMessage('Network error or server unavailable.', 'error'); // Access showMessage from window object
        }
    });
});

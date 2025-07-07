// js/app.js
// This file acts as the main entry point for frontend logic, handling UI rendering and routing.

// Define BASE_URL globally so other scripts can access it
const BASE_URL = 'http://localhost:5000/api';
window.BASE_URL = BASE_URL; // Make it accessible globally for other scripts

// UI Elements
const authSection = document.getElementById('auth-section');
const adminDashboard = document.getElementById('admin-dashboard');
const studentDashboard = document.getElementById('student-dashboard');
const mainNav = document.getElementById('main-nav');
const loadingSpinner = document.getElementById('loading-spinner');
const messageBox = document.getElementById('message-box');
const messageText = document.getElementById('message-text');

// Modals
const studentModal = document.getElementById('student-modal');
const courseModal = document.getElementById('course-modal');
const gradeModal = document.getElementById('grade-modal');
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmActionBtn = document.getElementById('confirm-action-btn');
const cancelConfirmBtn = document.getElementById('cancel-confirm-btn');

let currentConfirmAction = null; // Stores the function to execute on confirm

// --- Utility Functions ---

/**
 * Shows a temporary message box with a given message and type.
 * @param {string} message - The message to display.
 * @param {string} type - 'success', 'error', 'info'.
 */
function showMessage(message, type = 'info') {
    messageText.textContent = message;
    messageBox.className = 'fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-y-0 opacity-100';

    // Apply specific styles based on type
    if (type === 'success') {
        messageBox.classList.add('bg-green-600');
        messageBox.classList.remove('bg-red-600', 'bg-blue-600');
    } else if (type === 'error') {
        messageBox.classList.add('bg-red-600');
        messageBox.classList.remove('bg-green-600', 'bg-blue-600');
    } else { // info
        messageBox.classList.add('bg-blue-600');
        messageBox.classList.remove('bg-green-600', 'bg-red-600');
    }

    setTimeout(() => {
        messageBox.classList.remove('translate-y-0', 'opacity-100');
        messageBox.classList.add('translate-y-full', 'opacity-0');
        setTimeout(() => messageBox.classList.add('hidden'), 300); // Hide after transition
    }, 3000); // Message visible for 3 seconds
}

/**
 * Shows the loading spinner.
 */
function showLoading() {
    loadingSpinner.classList.remove('hidden');
}

/**
 * Hides the loading spinner.
 */
function hideLoading() {
    loadingSpinner.classList.add('hidden');
}

/**
 * Shows a generic confirmation modal.
 * @param {string} message - The message to display in the confirmation.
 * @param {function} onConfirm - The function to call if confirmed.
 */
function showConfirmModal(message, onConfirm) {
    confirmMessage.textContent = message;
    currentConfirmAction = onConfirm;
    confirmModal.classList.remove('hidden');
}

/**
 * Hides the generic confirmation modal.
 */
function hideConfirmModal() {
    confirmModal.classList.add('hidden');
    currentConfirmAction = null;
}

// Event listeners for confirmation modal
confirmActionBtn.addEventListener('click', () => {
    if (currentConfirmAction) {
        currentConfirmAction();
    }
    hideConfirmModal();
});

cancelConfirmBtn.addEventListener('click', hideConfirmModal);

/**
 * Handles navigation and displays the correct dashboard based on user role.
 */
function renderDashboard() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // Hide all sections initially
    authSection.classList.add('hidden');
    adminDashboard.classList.add('hidden');
    studentDashboard.classList.add('hidden');
    mainNav.innerHTML = ''; // Clear existing nav

    if (!token || !userRole) {
        authSection.classList.remove('hidden');
        return;
    }

    // Add logout button
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center space-x-2';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> <span>Logout</span>';
    logoutBtn.onclick = logoutUser;
    mainNav.appendChild(logoutBtn);

    if (userRole === 'admin') {
        adminDashboard.classList.remove('hidden');
        // Ensure loadAdminData is called only if it exists (admin.js loaded)
        if (typeof loadAdminData === 'function') {
            loadAdminData();
        } else {
            console.error('loadAdminData function not found. Is admin.js loaded correctly?');
        }
    } else if (userRole === 'student') {
        studentDashboard.classList.remove('hidden');
        // Ensure loadStudentData is called only if it exists (student.js loaded)
        if (typeof loadStudentData === 'function') {
            loadStudentData();
        } else {
            console.error('loadStudentData function not found. Is student.js loaded correctly?');
        }
    }
}

/**
 * Logs out the user by clearing local storage and redirecting to login.
 */
function logoutUser() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('studentId'); // Clear studentId if it was stored
    showMessage('Logged out successfully', 'info');
    // Redirect to home.html
    window.location.href = 'home.html';
}

// Initial render when the page loads
document.addEventListener('DOMContentLoaded', renderDashboard);


// --- Modal Management Functions (used by admin.js and student.js) ---

/**
 * Opens a modal.
 * @param {HTMLElement} modalElement - The modal DOM element.
 */
function openModal(modalElement) {
    modalElement.classList.remove('hidden');
}

/**
 * Closes a modal.
 * @param {HTMLElement} modalElement - The modal DOM element.
 */
function closeModal(modalElement) {
    modalElement.classList.add('hidden');
    // Reset form fields if it's a form modal
    const form = modalElement.querySelector('form');
    if (form) {
        form.reset();
        // Clear any hidden input for ID if it exists
        const idInput = form.querySelector('[name="_id"]');
        if (idInput) idInput.value = '';
    }
}

// Global utility functions accessible by other JS files
window.showMessage = showMessage;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.openModal = openModal;
window.closeModal = closeModal;
window.showConfirmModal = showConfirmModal;
window.renderDashboard = renderDashboard; // To allow re-rendering after login/logout
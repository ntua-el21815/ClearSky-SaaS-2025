
// Configuration
const API_BASE = 'http://localhost:8100'; // Userflow orchestrator
const REVIEW_API_BASE = 'http://localhost:8082'; // Review orchestrator  
const GRADE_API_BASE = 'http://localhost:8081'; // Grade orchestrator

// State
let currentUser = null;
let authToken = null;

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const userNameSpan = document.getElementById('user-name');
const logoutBtn = document.getElementById('logout-btn');

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupEventListeners();
});

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        showDashboard();
    } else {
        showLogin();
    }
}

// Setup event listeners
function setupEventListeners() {
    loginForm.addEventListener('submit', handleLogin);
    logoutBtn.addEventListener('click', handleLogout);
    
    document.getElementById('review-form').addEventListener('submit', handleCreateReview);
    document.getElementById('refresh-reviews').addEventListener('click', loadReviews);
    document.getElementById('get-stats').addEventListener('click', getStatistics);
    
    // Auto-load data when dashboard is shown
    document.getElementById('course-filter').addEventListener('input', filterReviews);
    document.getElementById('status-filter').addEventListener('change', filterReviews);
}

// Authentication functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        showError('login-error', '');
        
        const response = await fetch(`${API_BASE}/api/auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            authToken = data.token;
            currentUser = data.user;
            
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            
            showDashboard();
        } else {
            showError('login-error', data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('login-error', 'Network error. Please try again.');
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
    showLogin();
}

// View functions
function showLogin() {
    loginSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
}

function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    userNameSpan.textContent = `Welcome, ${currentUser.fullName}`;
    loadReviews();
}

// Review functions
async function handleCreateReview(e) {
    e.preventDefault();
    
    const formData = {
        studentId: document.getElementById('studentId').value,
        courseId: document.getElementById('courseId').value,
        gradeId: document.getElementById('gradeId').value,
        studentRegistrationNumber: document.getElementById('regNumber').value,
        reason: document.getElementById('reason').value
    };
    
    try {
        showError('review-error', '');
        showLoading('review-loading', true);
        
        const response = await fetch(`${REVIEW_API_BASE}/api/review-requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('review-form').reset();
            loadReviews(); // Refresh the list
            alert('Review request submitted successfully!');
        } else {
            showError('review-error', data.error || 'Failed to submit review request');
        }
    } catch (error) {
        console.error('Create review error:', error);
        showError('review-error', 'Network error. Please try again.');
    } finally {
        showLoading('review-loading', false);
    }
}

async function loadReviews() {
    try {
        showError('review-error', '');
        showLoading('review-loading', true);
        
        const response = await fetch(`${REVIEW_API_BASE}/api/review-requests`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayReviews(data.data || []);
        } else {
            showError('review-error', data.error || 'Failed to load reviews');
        }
    } catch (error) {
        console.error('Load reviews error:', error);
        showError('review-error', 'Network error. Please try again.');
    } finally {
        showLoading('review-loading', false);
    }
}

function displayReviews(reviews) {
    const container = document.getElementById('reviews-list');
    
    if (reviews.length === 0) {
        container.innerHTML = '<p>No review requests found.</p>';
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-item">
            <h4>Review Request #${review._id || review.id}</h4>
            <div class="review-meta">
                <div><strong>Student:</strong> ${review.studentId}</div>
                <div><strong>Course:</strong> ${review.courseId}</div>
                <div><strong>Grade ID:</strong> ${review.gradeId}</div>
                <div><strong>Reg. Number:</strong> ${review.studentRegistrationNumber}</div>
                <div><strong>Status:</strong> <span class="status status-${review.status.toLowerCase().replace('_', '-')}">${review.status}</span></div>
                <div><strong>Date:</strong> ${new Date(review.requestedAt || review.createdAt).toLocaleDateString()}</div>
            </div>
            <div class="review-reason">
                <strong>Reason:</strong> ${review.reason}
            </div>
            ${review.instructorResponse ? `
                <div class="review-reason">
                    <strong>Instructor Response:</strong> ${review.instructorResponse}
                </div>
            ` : ''}
        </div>
    `).join('');
}

function filterReviews() {
    const courseFilter = document.getElementById('course-filter').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    
    const reviewItems = document.querySelectorAll('.review-item');
    
    reviewItems.forEach(item => {
        const courseText = item.textContent.toLowerCase();
        const statusElement = item.querySelector('.status');
        const status = statusElement ? statusElement.textContent : '';
        
        const matchesCourse = !courseFilter || courseText.includes(courseFilter);
        const matchesStatus = !statusFilter || status === statusFilter;
        
        item.style.display = matchesCourse && matchesStatus ? 'block' : 'none';
    });
}

// Statistics functions
async function getStatistics() {
    const courseId = document.getElementById('stats-courseId').value.trim();
    
    if (!courseId) {
        showError('stats-error', 'Please enter a Course ID');
        return;
    }
    
    try {
        showError('stats-error', '');
        showLoading('stats-loading', true);
        
        const response = await fetch(`${GRADE_API_BASE}/api/course/${courseId}/statistics`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            displayStatistics(courseId, data.data);
        } else {
            showError('stats-error', data.error || 'Failed to load statistics');
            hideStatistics();
        }
    } catch (error) {
        console.error('Statistics error:', error);
        showError('stats-error', 'Network error. Please try again.');
        hideStatistics();
    } finally {
        showLoading('stats-loading', false);
    }
}

function displayStatistics(courseId, stats) {
    document.getElementById('stats-course-name').textContent = courseId;
    document.getElementById('avg-grade').textContent = stats.averageGrade || '-';
    document.getElementById('median-grade').textContent = stats.medianGrade || '-';
    document.getElementById('num-students').textContent = stats.numberOfStudents || '-';
    
    const passRate = stats.numberOfStudents > 0 
        ? ((stats.numberOfPasses / stats.numberOfStudents) * 100).toFixed(1) + '%'
        : '-';
    document.getElementById('pass-rate').textContent = passRate;
    
    document.getElementById('stats-display').classList.remove('hidden');
}

function hideStatistics() {
    document.getElementById('stats-display').classList.add('hidden');
}

// Utility functions
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (message) {
        element.textContent = message;
        element.classList.remove('hidden');
    } else {
        element.classList.add('hidden');
    }
}

function showLoading(elementId, show) {
    const element = document.getElementById(elementId);
    if (show) {
        element.classList.remove('hidden');
    } else {
        element.classList.add('hidden');
    }
}
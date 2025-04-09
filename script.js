let currentLoginType = '';
let backButton;

// Create back button when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    backButton = document.createElement('button');
    backButton.innerHTML = '<i class="fas fa-arrow-left"></i> Back';
    backButton.className = 'back-button';
    backButton.style.display = 'none';
    backButton.onclick = function() {
        const loginForm = document.getElementById('loginForm');
        loginForm.classList.remove('active');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        backButton.style.display = 'none';
    };
    document.body.appendChild(backButton);

    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = usernameInput.value;
        const password = passwordInput.value;

        // Check admin login
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('adminName', 'Admin');
            window.location.href = 'admin-dashboard.html';
            return;
        }

        // Check student login
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const student = students.find(s => s.username === username && s.password === password);
        if (student) {
            localStorage.setItem('studentName', student.name);
            localStorage.setItem('studentId', student.id);
            localStorage.setItem('studentClass', student.class);
            localStorage.setItem('studentSection', student.section);
            window.location.href = 'student-dashboard.html';
            return;
        }

        // Check teacher login
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const teacher = teachers.find(t => t.username === username && t.password === password);
        if (teacher) {
            localStorage.setItem('teacherName', teacher.name);
            localStorage.setItem('teacherId', teacher.id);
            window.location.href = 'teacher-dashboard.html';
            return;
        }

        // If no match found
        alert('Invalid username or password!');
    });
});

function showLoginForm(type) {
    currentLoginType = type;
    const loginForm = document.getElementById('loginForm');
    const loginTitle = document.getElementById('loginTitle');
    
    // Show the login form
    loginForm.classList.add('active');
    backButton.style.display = 'block'; // Show back button
    
    // Update the title based on login type
    switch(type) {
        case 'student':
            loginTitle.textContent = 'Student/Parent Login';
            break;
        case 'faculty':
            loginTitle.textContent = 'Faculty Login';
            break;
        case 'admin':
            loginTitle.textContent = 'Admin Login';
            break;
    }
    
    // Scroll to the form
    loginForm.scrollIntoView({ behavior: 'smooth' });
}

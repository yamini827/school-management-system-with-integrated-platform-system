document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (this.classList.contains('logout')) {
                // Handle logout
                if (confirm('Are you sure you want to logout?')) {
                    window.location.href = 'index.html';
                }
                return;
            }

            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Show corresponding section
            const sectionId = this.getAttribute('data-section');
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        // Implement search functionality here
        console.log('Searching for:', searchTerm);
    });

    // Update admin name from localStorage if available
    const adminName = localStorage.getItem('adminName') || 'Admin';
    document.querySelector('.admin-name').textContent = adminName;

    // Student Management Functions
    window.showAddStudentForm = function() {
        document.getElementById('addStudentForm').classList.add('active');
    };

    window.hideAddStudentForm = function() {
        document.getElementById('addStudentForm').classList.remove('active');
        document.getElementById('newStudentForm').reset();
    };

    // Toast Notification Function
    function showToast(message, type = 'success', title = '') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Set icon based on type
        let icon = '';
        switch(type) {
            case 'success':
                icon = 'fa-check-circle';
                break;
            case 'error':
                icon = 'fa-times-circle';
                break;
            case 'warning':
                icon = 'fa-exclamation-circle';
                break;
        }

        toast.innerHTML = `
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
            <i class="fas ${icon}"></i>
            <i class="fas fa-times toast-close"></i>
        `;

        toastContainer.appendChild(toast);

        // Show toast
        setTimeout(() => toast.classList.add('show'), 100);

        // Add close button functionality
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        });

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.classList.contains('show')) {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    // Modify the form submission handler
    document.getElementById('newStudentForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const studentData = {
            id: document.getElementById('studentId').value,
            name: document.getElementById('studentName').value,
            class: document.getElementById('studentClass').value,
            section: document.getElementById('studentSection').value,
            dob: document.getElementById('studentDOB').value,
            gender: document.getElementById('studentGender').value,
            email: document.getElementById('studentEmail').value,
            phone: document.getElementById('studentPhone').value,
            address: document.getElementById('studentAddress').value,
            username: document.getElementById('studentUsername').value,
            password: document.getElementById('studentPassword').value
        };

        // Validate passwords match
        const password = document.getElementById('studentPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match!', 'error', 'Validation Error');
            return;
        }

        // Get existing students from localStorage or initialize empty array
        let students = JSON.parse(localStorage.getItem('students') || '[]');

        // Check if student ID already exists
        if (students.some(student => student.id === studentData.id)) {
            showToast('Student ID already exists!', 'error', 'Duplicate Entry');
            return;
        }

        // Add new student
        students.push(studentData);

        // Save to localStorage
        localStorage.setItem('students', JSON.stringify(students));

        // Update student list
        updateStudentList();

        // Hide form and show success message
        hideAddStudentForm();
        showToast('Student added successfully!', 'success', 'Success');

        // Add activity after successful student addition
        addActivity('student', `New student ${studentData.name} registered`);
        
        // Update dashboard stats
        updateDashboardStats();
    });

    // Function to update student list
    function updateStudentList() {
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const tableBody = document.getElementById('studentTableBody');
        
        // Clear existing rows
        tableBody.innerHTML = '';

        // Add student rows
        students.forEach(student => {
            const row = createStudentTableRow(student);
            tableBody.appendChild(row);
        });
    }

    // Modify the delete student function
    window.deleteStudent = function(studentId) {
        if (confirm('Are you sure you want to delete this student?')) {
            let students = JSON.parse(localStorage.getItem('students') || '[]');
            const studentToDelete = students.find(s => s.id === studentId);
            students = students.filter(student => student.id !== studentId);
            localStorage.setItem('students', JSON.stringify(students));
            updateStudentList();
            
            // Add activity
            addActivity('student', `Student ${studentToDelete.name} deleted`);
            
            // Update dashboard stats
            updateDashboardStats();
            
            showToast(`Student ${studentToDelete.name} deleted successfully!`, 'warning', 'Student Deleted');
        }
    };

    // Modify the edit student function
    window.editStudent = function(studentId) {
        let students = JSON.parse(localStorage.getItem('students') || '[]');
        const student = students.find(s => s.id === studentId);
        
        if (student) {
            // Populate form with student data
            document.getElementById('studentId').value = student.id;
            document.getElementById('studentName').value = student.name;
            document.getElementById('studentClass').value = student.class;
            document.getElementById('studentSection').value = student.section;
            document.getElementById('studentDOB').value = student.dob;
            document.getElementById('studentGender').value = student.gender;
            document.getElementById('studentEmail').value = student.email;
            document.getElementById('studentPhone').value = student.phone;
            document.getElementById('studentAddress').value = student.address;
            document.getElementById('studentUsername').value = student.username;
            
            // Show form
            showAddStudentForm();
            
            // Remove student from list
            students = students.filter(s => s.id !== studentId);
            localStorage.setItem('students', JSON.stringify(students));
            updateStudentList();
            showToast(`Editing student: ${student.name}`, 'warning', 'Edit Mode');
        }
    };

    // Initial load of student list
    updateStudentList();

    // Teacher Management Functions
    window.showAddTeacherForm = function() {
        document.getElementById('addTeacherForm').classList.add('active');
    };

    window.hideAddTeacherForm = function() {
        document.getElementById('addTeacherForm').classList.remove('active');
        document.getElementById('newTeacherForm').reset();
    };

    // Handle new teacher form submission
    document.getElementById('newTeacherForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
        const teacherData = {
            id: document.getElementById('teacherId').value,
            name: document.getElementById('teacherName').value,
            qualification: document.getElementById('teacherQualification').value,
            department: document.getElementById('teacherDepartment').value,
            subjects: Array.from(document.getElementById('teacherSubjects').selectedOptions).map(option => option.value),
            classes: Array.from(document.getElementById('teacherClasses').selectedOptions).map(option => option.value),
            sections: Array.from(document.getElementById('teacherSections').selectedOptions).map(option => option.value),
            dob: document.getElementById('teacherDOB').value,
            gender: document.getElementById('teacherGender').value,
            email: document.getElementById('teacherEmail').value,
            phone: document.getElementById('teacherPhone').value,
            address: document.getElementById('teacherAddress').value,
            joiningDate: document.getElementById('teacherJoiningDate').value,
            username: document.getElementById('teacherUsername').value,
            password: document.getElementById('teacherPassword').value
        };

        // Validate passwords match
        const password = document.getElementById('teacherPassword').value;
        const confirmPassword = document.getElementById('confirmTeacherPassword').value;
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match!', 'error', 'Validation Error');
            return;
        }

        // Validate multiple selections
        if (teacherData.subjects.length === 0) {
            showToast('Please select at least one subject!', 'error', 'Validation Error');
            return;
        }
        if (teacherData.classes.length === 0) {
            showToast('Please select at least one class!', 'error', 'Validation Error');
            return;
        }
        if (teacherData.sections.length === 0) {
            showToast('Please select at least one section!', 'error', 'Validation Error');
            return;
        }

        // Get existing teachers from localStorage or initialize empty array
        let teachers = JSON.parse(localStorage.getItem('teachers') || '[]');

        // Check if teacher ID already exists
        if (teachers.some(teacher => teacher.id === teacherData.id)) {
            showToast('Teacher ID already exists!', 'error', 'Duplicate Entry');
            return;
        }

        // Add new teacher
        teachers.push(teacherData);

        // Save to localStorage
        localStorage.setItem('teachers', JSON.stringify(teachers));

        // Update teacher list
        updateTeacherList();

        // Hide form and show success message
        hideAddTeacherForm();
        showToast('Teacher added successfully!', 'success', 'Success');

        // Add activity after successful teacher addition
        addActivity('teacher', `New teacher ${teacherData.name} added`);
        
        // Update dashboard stats
        updateDashboardStats();
    });

    // Function to update teacher list
    function updateTeacherList() {
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const tableBody = document.getElementById('teacherTableBody');
        
        // Clear existing rows
        tableBody.innerHTML = '';

        // Add teacher rows
        teachers.forEach(teacher => {
            const row = createTeacherTableRow(teacher);
            tableBody.appendChild(row);
        });
    }

    // Function to delete teacher
    window.deleteTeacher = function(teacherId) {
        if (confirm('Are you sure you want to delete this teacher?')) {
            let teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
            const teacherToDelete = teachers.find(t => t.id === teacherId);
            teachers = teachers.filter(teacher => teacher.id !== teacherId);
            localStorage.setItem('teachers', JSON.stringify(teachers));
            updateTeacherList();
            
            // Add activity
            addActivity('teacher', `Teacher ${teacherToDelete.name} removed`);
            
            // Update dashboard stats
            updateDashboardStats();
            
            showToast(`Teacher ${teacherToDelete.name} deleted successfully!`, 'warning', 'Teacher Deleted');
        }
    };

    // Function to edit teacher
    window.editTeacher = function(teacherId) {
        let teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const teacher = teachers.find(t => t.id === teacherId);
        
        if (teacher) {
            // Populate form with teacher data
            document.getElementById('teacherId').value = teacher.id;
            document.getElementById('teacherName').value = teacher.name;
            document.getElementById('teacherQualification').value = teacher.qualification;
            document.getElementById('teacherDepartment').value = teacher.department;
            
            // Set multiple select values
            const subjectsSelect = document.getElementById('teacherSubjects');
            const classesSelect = document.getElementById('teacherClasses');
            const sectionsSelect = document.getElementById('teacherSections');
            
            teacher.subjects.forEach(subject => {
                const option = Array.from(subjectsSelect.options).find(opt => opt.value === subject);
                if (option) option.selected = true;
            });
            
            teacher.classes.forEach(cls => {
                const option = Array.from(classesSelect.options).find(opt => opt.value === cls);
                if (option) option.selected = true;
            });
            
            teacher.sections.forEach(section => {
                const option = Array.from(sectionsSelect.options).find(opt => opt.value === section);
                if (option) option.selected = true;
            });
            
            document.getElementById('teacherDOB').value = teacher.dob;
            document.getElementById('teacherGender').value = teacher.gender;
            document.getElementById('teacherEmail').value = teacher.email;
            document.getElementById('teacherPhone').value = teacher.phone;
            document.getElementById('teacherAddress').value = teacher.address;
            document.getElementById('teacherJoiningDate').value = teacher.joiningDate;
            document.getElementById('teacherUsername').value = teacher.username;
            
            // Show form
            showAddTeacherForm();
            
            // Remove teacher from list
            teachers = teachers.filter(t => t.id !== teacherId);
            localStorage.setItem('teachers', JSON.stringify(teachers));
            updateTeacherList();
            showToast(`Editing teacher: ${teacher.name}`, 'warning', 'Edit Mode');
        }
    };

    // Initial load of teacher list
    updateTeacherList();

    // Function to update dashboard statistics
    function updateDashboardStats() {
        // Get data from localStorage
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        
        // Calculate statistics
        const totalStudents = students.length;
        const totalTeachers = teachers.length;
        const totalClasses = new Set(students.map(student => student.class)).size;
        
        // Calculate total revenue (example: assuming each student pays $1000 per year)
        const totalRevenue = totalStudents * 1000;

        // Update dashboard cards
        document.querySelector('.stat-card:nth-child(1) p').textContent = totalStudents;
        document.querySelector('.stat-card:nth-child(2) p').textContent = totalTeachers;
        document.querySelector('.stat-card:nth-child(3) p').textContent = totalClasses;
        document.querySelector('.stat-card:nth-child(4) p').textContent = `$${totalRevenue.toLocaleString()}`;

        // Update recent activities
        updateRecentActivities();
    }

    // Function to update recent activities
    function updateRecentActivities() {
        const activityList = document.querySelector('.activity-list');
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        
        // Clear existing activities
        activityList.innerHTML = '';
        
        // Add recent activities (last 3)
        activities.slice(-3).forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <i class="fas ${getActivityIcon(activity.type)}"></i>
                <div class="activity-info">
                    <p>${activity.message}</p>
                    <small>${formatTimeAgo(activity.timestamp)}</small>
                </div>
            `;
            activityList.appendChild(activityItem);
        });
    }

    // Function to get icon based on activity type
    function getActivityIcon(type) {
        switch(type) {
            case 'student':
                return 'fa-user-plus';
            case 'teacher':
                return 'fa-chalkboard-teacher';
            case 'exam':
                return 'fa-file-alt';
            case 'fee':
                return 'fa-money-bill-wave';
            default:
                return 'fa-info-circle';
        }
    }

    // Function to format time ago
    function formatTimeAgo(timestamp) {
        const now = new Date();
        const activityTime = new Date(timestamp);
        const diffInMinutes = Math.floor((now - activityTime) / (1000 * 60));
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
        return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }

    // Function to add new activity
    function addActivity(type, message) {
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');
        activities.push({
            type,
            message,
            timestamp: new Date().toISOString()
        });
        localStorage.setItem('activities', JSON.stringify(activities));
        updateRecentActivities();
    }

    // Initial load of dashboard stats
    updateDashboardStats();

    // Class Management Functions
    window.showAddClassForm = function() {
        const form = document.getElementById('addClassForm');
        form.classList.add('active');
        populateTeacherDropdowns();
    };

    window.hideAddClassForm = function() {
        const form = document.getElementById('addClassForm');
        form.classList.remove('active');
        document.getElementById('newClassForm').reset();
    };

    function populateTeacherDropdowns() {
        const teacherSelects = document.querySelectorAll('.teacher-select');
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        
        teacherSelects.forEach(select => {
            // Clear existing options except the first one
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            // Add teacher options
            teachers.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.id;
                option.textContent = teacher.name;
                select.appendChild(option);
            });
        });
    }

    window.addTimeSlot = function(button) {
        const scheduleSlots = button.parentElement;
        const newSlot = document.createElement('div');
        newSlot.className = 'schedule-slot';
        newSlot.innerHTML = `
            <select class="subject-select" required>
                <option value="">Select Subject</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Physical Education">Physical Education</option>
                <option value="Art">Art</option>
                <option value="Music">Music</option>
                <option value="Hindi">Hindi</option>
                <option value="Sanskrit">Sanskrit</option>
            </select>
            <select class="teacher-select" required>
                <option value="">Select Teacher</option>
            </select>
            <div class="time-inputs">
                <input type="time" class="start-time" required>
                <span>to</span>
                <input type="time" class="end-time" required>
            </div>
            <button type="button" class="remove-slot-btn" onclick="removeTimeSlot(this)">
                <i class="fas fa-times"></i> Remove Slot
            </button>
        `;
        
        // Insert before the "Add Time Slot" button
        scheduleSlots.insertBefore(newSlot, button);
        
        // Populate teacher dropdown in the new slot
        populateTeacherDropdowns();
    };

    window.removeTimeSlot = function(button) {
        const slot = button.parentElement;
        slot.remove();
    };

    // Initialize class schedules from localStorage
    let classSchedules = JSON.parse(localStorage.getItem('classSchedules') || '[]');
    
    // Define days array in global scope
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // Handle new class schedule form submission
    document.getElementById('newClassForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const classNumber = document.getElementById('classNumber').value;
        const classSection = document.getElementById('classSection').value;
        
        if (!classNumber || !classSection) {
            showToast('Please select both class and section', 'error', 'Validation Error');
            return;
        }
        
        // Get all schedule slots for each day
        const weeklySchedule = [];
        
        days.forEach(day => {
            // Find the day container by looking for the h5 element with the day name
            const dayHeaders = document.querySelectorAll('.schedule-day h5');
            const dayHeader = Array.from(dayHeaders).find(header => header.textContent === day);
            
            if (dayHeader) {
                const dayContainer = dayHeader.parentElement;
                const slots = dayContainer.querySelectorAll('.schedule-slot');
                
                slots.forEach(slot => {
                    const subject = slot.querySelector('.subject-select').value;
                    const teacherId = slot.querySelector('.teacher-select').value;
                    const teacherName = slot.querySelector('.teacher-select').options[slot.querySelector('.teacher-select').selectedIndex].text;
                    const startTime = slot.querySelector('.start-time').value;
                    const endTime = slot.querySelector('.end-time').value;
                    
                    if (subject && teacherId && startTime && endTime) {
                        weeklySchedule.push({
                            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                            class: classNumber,
                            section: classSection,
                            day: day,
                            subject: subject,
                            teacherId: teacherId,
                            teacherName: teacherName,
                            startTime: startTime,
                            endTime: endTime
                        });
                    }
                });
            }
        });
        
        if (weeklySchedule.length === 0) {
            showToast('Please add at least one schedule slot', 'error', 'Validation Error');
            return;
        }
        
        // Add all schedules to the array
        classSchedules.push(...weeklySchedule);
        
        // Save to localStorage
        localStorage.setItem('classSchedules', JSON.stringify(classSchedules));
        
        // Update the table
        updateClassScheduleTable();
        
        // Hide form and show success message
        hideAddClassForm();
        showToast('Weekly schedule added successfully', 'success', 'Success');
        
        // Add activity
        addActivity('schedule', `New weekly schedule added for Class ${classNumber} Section ${classSection}`);
    });

    function updateClassScheduleTable() {
        const tableBody = document.getElementById('classScheduleTableBody');
        tableBody.innerHTML = '';
        
        // Sort schedules by class, section, day, and start time
        const sortedSchedules = [...classSchedules].sort((a, b) => {
            if (a.class !== b.class) return a.class - b.class;
            if (a.section !== b.section) return a.section.localeCompare(b.section);
            if (a.day !== b.day) return days.indexOf(a.day) - days.indexOf(b.day);
            return a.startTime.localeCompare(b.startTime);
        });
        
        sortedSchedules.forEach(schedule => {
            const row = createScheduleTableRow(schedule);
            tableBody.appendChild(row);
        });
    }

    window.filterSchedule = function() {
        const selectedClass = document.getElementById('filterClass').value;
        const selectedSection = document.getElementById('filterSection').value;
        
        const filteredSchedules = classSchedules.filter(schedule => {
            const classMatch = !selectedClass || schedule.class === selectedClass;
            const sectionMatch = !selectedSection || schedule.section === selectedSection;
            return classMatch && sectionMatch;
        });
        
        const tableBody = document.getElementById('classScheduleTableBody');
        tableBody.innerHTML = '';
        
        // Sort filtered schedules
        const sortedSchedules = [...filteredSchedules].sort((a, b) => {
            if (a.day !== b.day) return days.indexOf(a.day) - days.indexOf(b.day);
            return a.startTime.localeCompare(b.startTime);
        });
        
        sortedSchedules.forEach(schedule => {
            const row = createScheduleTableRow(schedule);
            tableBody.appendChild(row);
        });
    };

    window.editClassSchedule = function(scheduleId) {
        const schedule = classSchedules.find(s => s.id === scheduleId);
        if (!schedule) return;
        
        // Populate form with schedule data
        document.getElementById('classNumber').value = schedule.class;
        document.getElementById('classSection').value = schedule.section;
        
        // Find the corresponding day's schedule slot
        const dayHeaders = document.querySelectorAll('.schedule-day h5');
        const dayHeader = Array.from(dayHeaders).find(header => header.textContent === schedule.day);
        
        if (dayHeader) {
            const dayContainer = dayHeader.parentElement;
            const slots = dayContainer.querySelectorAll('.schedule-slot');
            
            // Clear existing slots
            slots.forEach(slot => slot.remove());
            
            // Add new slot with schedule data
            const newSlot = document.createElement('div');
            newSlot.className = 'schedule-slot';
            newSlot.innerHTML = `
                <select class="subject-select" required>
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Physical Education">Physical Education</option>
                    <option value="Art">Art</option>
                    <option value="Music">Music</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Sanskrit">Sanskrit</option>
                </select>
                <select class="teacher-select" required>
                    <option value="">Select Teacher</option>
                </select>
                <div class="time-inputs">
                    <input type="time" class="start-time" required>
                    <span>to</span>
                    <input type="time" class="end-time" required>
                </div>
                <button type="button" class="remove-slot-btn" onclick="removeTimeSlot(this)">
                    <i class="fas fa-times"></i> Remove Slot
                </button>
            `;
            
            // Set values
            newSlot.querySelector('.subject-select').value = schedule.subject;
            newSlot.querySelector('.teacher-select').value = schedule.teacherId;
            newSlot.querySelector('.start-time').value = schedule.startTime;
            newSlot.querySelector('.end-time').value = schedule.endTime;
            
            // Add slot before the "Add Time Slot" button
            const addSlotBtn = dayContainer.querySelector('.add-slot-btn');
            dayContainer.querySelector('.schedule-slots').insertBefore(newSlot, addSlotBtn);
            
            // Populate teacher dropdown
            populateTeacherDropdowns();
        }
        
        // Show form
        showAddClassForm();
        
        // Remove the old schedule
        classSchedules = classSchedules.filter(s => s.id !== scheduleId);
        localStorage.setItem('classSchedules', JSON.stringify(classSchedules));
        
        // Update table
        updateClassScheduleTable();
        
        showToast(`Editing schedule for Class ${schedule.class} Section ${schedule.section}`, 'warning', 'Edit Mode');
    };

    window.deleteClassSchedule = function(scheduleId) {
        if (confirm('Are you sure you want to delete this class schedule?')) {
            const scheduleToDelete = classSchedules.find(s => s.id === scheduleId);
            classSchedules = classSchedules.filter(s => s.id !== scheduleId);
            localStorage.setItem('classSchedules', JSON.stringify(classSchedules));
            updateClassScheduleTable();
            
            // Add activity
            addActivity('schedule', `Schedule deleted for Class ${scheduleToDelete.class} Section ${scheduleToDelete.section}`);
            
            showToast('Class schedule deleted successfully', 'warning', 'Schedule Deleted');
        }
    }

    // Initial load of class schedule table
    updateClassScheduleTable();

    // Initialize attendance graphs if on attendance section
    if (document.getElementById('attendance').classList.contains('active')) {
        updateAttendanceGraph();
    }

    let mentalHealthChart = null;
    let physicalHealthChart = null;

    // Function to update health assessment graphs
    window.updateHealthAssessmentGraphs = function() {
        const selectedClass = document.getElementById('resultClass').value;
        const selectedSection = document.getElementById('resultSection').value;
        const selectedPeriod = parseInt(document.getElementById('resultPeriod').value);

        if (!selectedClass || !selectedSection) {
            return;
        }

        const assessmentData = getAssessmentData(selectedClass, selectedSection, selectedPeriod);
        updateHealthCharts(assessmentData);
        updateSummaryStatistics(assessmentData);
    };

    // Function to get assessment data
    function getAssessmentData(selectedClass, selectedSection, days) {
        const healthAssessments = JSON.parse(localStorage.getItem('healthAssessments') || '[]');
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        return healthAssessments.filter(assessment => 
            assessment.class === selectedClass &&
            assessment.section === selectedSection &&
            new Date(assessment.date) >= startDate &&
            new Date(assessment.date) <= endDate
        );
    }

    // Function to update health charts
    function updateHealthCharts(assessmentData) {
        const dates = assessmentData.map(record => record.date);
        const mentalHealthData = calculateHealthScores(assessmentData, 'mentalHealth');
        const physicalHealthData = calculateHealthScores(assessmentData, 'physicalHealth');

        // Update Mental Health Chart
        if (mentalHealthChart) {
            mentalHealthChart.destroy();
        }
        const mentalCtx = document.getElementById('mentalHealthChart').getContext('2d');
        mentalHealthChart = createHealthChart(mentalCtx, dates, mentalHealthData, 'Mental Health Scores');

        // Update Physical Health Chart
        if (physicalHealthChart) {
            physicalHealthChart.destroy();
        }
        const physicalCtx = document.getElementById('physicalHealthChart').getContext('2d');
        physicalHealthChart = createHealthChart(physicalCtx, dates, physicalHealthData, 'Physical Health Scores');
    }

    // Function to calculate health scores
    function calculateHealthScores(assessmentData, healthType) {
        return {
            excellent: assessmentData.map(record => 
                record.assessments.filter(a => a[healthType] === 'excellent').length
            ),
            good: assessmentData.map(record => 
                record.assessments.filter(a => a[healthType] === 'good').length
            ),
            fair: assessmentData.map(record => 
                record.assessments.filter(a => a[healthType] === 'fair').length
            ),
            poor: assessmentData.map(record => 
                record.assessments.filter(a => a[healthType] === 'poor').length
            )
        };
    }

    // Function to create health chart
    function createHealthChart(ctx, labels, data, title) {
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(date => new Date(date).toLocaleDateString()),
                datasets: [
                    {
                        label: 'Excellent',
                        data: data.excellent,
                        backgroundColor: '#2ecc71'
                    },
                    {
                        label: 'Good',
                        data: data.good,
                        backgroundColor: '#3498db'
                    },
                    {
                        label: 'Fair',
                        data: data.fair,
                        backgroundColor: '#f1c40f'
                    },
                    {
                        label: 'Poor',
                        data: data.poor,
                        backgroundColor: '#e74c3c'
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: title
                    }
                }
            }
        });
    }

    // Function to update summary statistics
    function updateSummaryStatistics(assessmentData) {
        const overview = document.getElementById('classOverview');
        const attentionList = document.getElementById('attentionList');

        if (assessmentData.length === 0) {
            overview.innerHTML = '<p>No data available</p>';
            attentionList.innerHTML = '<p>No data available</p>';
            return;
        }

        // Calculate class overview
        const latestAssessment = assessmentData[assessmentData.length - 1];
        const totalStudents = latestAssessment.assessments.length;
        const mentalHealthCounts = countHealthScores(latestAssessment.assessments, 'mentalHealth');
        const physicalHealthCounts = countHealthScores(latestAssessment.assessments, 'physicalHealth');

        overview.innerHTML = `
            <p>Total Students: ${totalStudents}</p>
            <h5>Mental Health Overview:</h5>
            <p>Excellent: ${mentalHealthCounts.excellent} (${percentage(mentalHealthCounts.excellent, totalStudents)}%)</p>
            <p>Good: ${mentalHealthCounts.good} (${percentage(mentalHealthCounts.good, totalStudents)}%)</p>
            <p>Fair: ${mentalHealthCounts.fair} (${percentage(mentalHealthCounts.fair, totalStudents)}%)</p>
            <p>Poor: ${mentalHealthCounts.poor} (${percentage(mentalHealthCounts.poor, totalStudents)}%)</p>
            <h5>Physical Health Overview:</h5>
            <p>Excellent: ${physicalHealthCounts.excellent} (${percentage(physicalHealthCounts.excellent, totalStudents)}%)</p>
            <p>Good: ${physicalHealthCounts.good} (${percentage(physicalHealthCounts.good, totalStudents)}%)</p>
            <p>Fair: ${physicalHealthCounts.fair} (${percentage(physicalHealthCounts.fair, totalStudents)}%)</p>
            <p>Poor: ${physicalHealthCounts.poor} (${percentage(physicalHealthCounts.poor, totalStudents)}%)</p>
        `;

        // List students requiring attention
        const studentsNeedingAttention = latestAssessment.assessments.filter(student =>
            student.mentalHealth === 'poor' || 
            student.physicalHealth === 'poor' ||
            student.mentalHealth === 'fair' ||
            student.physicalHealth === 'fair'
        );

        attentionList.innerHTML = studentsNeedingAttention.map(student => `
            <div class="student-attention-item">
                <span>${student.studentName}</span>
                <div>
                    <span class="attention-score score-${student.mentalHealth}">
                        Mental: ${student.mentalHealth}
                    </span>
                    <span class="attention-score score-${student.physicalHealth}">
                        Physical: ${student.physicalHealth}
                    </span>
                </div>
            </div>
        `).join('') || '<p>No students requiring immediate attention</p>';
    }

    // Helper function to count health scores
    function countHealthScores(assessments, healthType) {
        return {
            excellent: assessments.filter(a => a[healthType] === 'excellent').length,
            good: assessments.filter(a => a[healthType] === 'good').length,
            fair: assessments.filter(a => a[healthType] === 'fair').length,
            poor: assessments.filter(a => a[healthType] === 'poor').length
        };
    }

    // Helper function to calculate percentage
    function percentage(value, total) {
        return ((value / total) * 100).toFixed(1);
    }

    // Video Management Functions - Global Scope
    window.showAddVideoForm = function() {
        document.getElementById('addVideoForm').style.display = 'block';
    };

    window.hideAddVideoForm = function() {
        document.getElementById('addVideoForm').style.display = 'none';
        document.getElementById('newVideoForm').reset();
    };

    window.filterVideos = function() {
        const subject = document.getElementById('filterVideoSubject').value;
        const classLevel = document.getElementById('filterVideoClass').value;
        const section = document.getElementById('filterVideoSection').value;
        const videoCards = document.querySelectorAll('.video-card');
        
        videoCards.forEach(card => {
            const cardSubject = card.querySelector('.video-meta span:first-child').textContent.split(' ')[1];
            const cardClass = card.querySelector('.video-meta span:nth-child(2)').textContent.split(' ')[1];
            
            // Get section if available (might not be present in all cards)
            const sectionSpan = card.querySelector('.video-meta span:nth-child(3)');
            const cardSection = sectionSpan && sectionSpan.textContent.includes('Section') 
                ? sectionSpan.textContent.split(' ')[1] 
                : '';
            
            const subjectMatch = !subject || cardSubject === subject;
            const classMatch = !classLevel || cardClass === classLevel;
            const sectionMatch = !section || cardSection === section;
            
            card.style.display = subjectMatch && classMatch && sectionMatch ? 'block' : 'none';
        });
    };

    window.editVideo = function(button) {
        const videoCard = button.closest('.video-card');
        const videoTitle = videoCard.querySelector('h4').textContent;
        
        // Get videos from localStorage
        let videos = JSON.parse(localStorage.getItem('courseVideos') || '[]');
        const videoToEdit = videos.find(v => v.title === videoTitle);
        
        if (videoToEdit) {
            // Populate form with video data
            document.getElementById('videoTitle').value = videoToEdit.title;
            document.getElementById('videoDescription').value = videoToEdit.description;
            document.getElementById('videoSubject').value = videoToEdit.subject;
            document.getElementById('videoClass').value = videoToEdit.targetClass;
            document.getElementById('videoSection').value = videoToEdit.section || '';
            document.getElementById('videoDuration').value = videoToEdit.duration;
            document.getElementById('videoTags').value = videoToEdit.tags.join(', ');
            
            // Show form
            showAddVideoForm();
            
            // Remove the old video from localStorage
            videos = videos.filter(v => v.title !== videoTitle);
            localStorage.setItem('courseVideos', JSON.stringify(videos));
            
            // Remove from DOM
            videoCard.remove();
            
            // Show edit mode message
            showToast('Edit mode activated', 'info');
        }
    };

    window.deleteVideo = function(button) {
        if (confirm('Are you sure you want to delete this video?')) {
            const videoCard = button.closest('.video-card');
            const videoTitle = videoCard.querySelector('h4').textContent;
            
            // Get videos from localStorage
            let videos = JSON.parse(localStorage.getItem('courseVideos') || '[]');
            
            // Remove the video
            videos = videos.filter(video => video.title !== videoTitle);
            
            // Save back to localStorage
            localStorage.setItem('courseVideos', JSON.stringify(videos));
            
            // Remove from DOM
            videoCard.remove();
            
            // Show success message
            showToast('Video deleted successfully!', 'success');
            
            // Add activity
            addActivity('video', `Course video "${videoTitle}" deleted`);
        }
    };

    // Video Management Functions - Local Scope
    function addVideoToGrid(videoData) {
        const videoGrid = document.getElementById('videoGrid');
        
        // Create video card
        const videoCard = document.createElement('div');
        videoCard.className = 'video-card';
        
        // Create thumbnail URL (in real app, this would be from your server)
        let thumbnailUrl;
        try {
            thumbnailUrl = URL.createObjectURL(videoData.thumbnail);
        } catch (e) {
            // If thumbnail is already a string URL or not available
            thumbnailUrl = videoData.thumbnail || 'https://via.placeholder.com/320x180?text=Video+Thumbnail';
        }
        
        // Create section display text if available
        const sectionDisplay = videoData.section 
            ? `<span><i class="fas fa-layer-group"></i> Section ${videoData.section}</span>` 
            : '';
        
        videoCard.innerHTML = `
            <div class="video-thumbnail">
                <img src="${thumbnailUrl}" alt="${videoData.title}">
                <div class="video-overlay">
                    <i class="fas fa-play"></i>
                </div>
            </div>
            <div class="video-info">
                <h4>${videoData.title}</h4>
                <p>${videoData.description}</p>
                <div class="video-meta">
                    <span><i class="fas fa-book"></i> ${videoData.subject}</span>
                    <span><i class="fas fa-users"></i> Class ${videoData.targetClass}</span>
                    ${sectionDisplay}
                    <span><i class="fas fa-clock"></i> ${videoData.duration} min</span>
                    <span><i class="fas fa-calendar"></i> ${new Date(videoData.uploadDate).toLocaleDateString()}</span>
                </div>
                <div class="video-tags">
                    ${videoData.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="video-actions">
                    <button onclick="editVideo(this)" class="edit-btn">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button onclick="deleteVideo(this)" class="delete-btn">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        videoGrid.appendChild(videoCard);
    }

    // Function to handle video form submission
    document.getElementById('newVideoForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Create a placeholder for thumbnail and video file
        let thumbnailUrl = 'https://via.placeholder.com/320x180?text=Video+Thumbnail';
        
        // Check if files were selected and create object URLs
        const thumbnailFile = document.getElementById('videoThumbnail').files[0];
        const videoFile = document.getElementById('videoFile').files[0];
        
        // For demo purposes, we'll just use placeholders
        // In a real app, these would be uploaded to a server and URLs stored
        
        // Get form data
        const videoData = {
            id: Date.now().toString(), // Add unique ID for each video
            title: document.getElementById('videoTitle').value,
            description: document.getElementById('videoDescription').value,
            subject: document.getElementById('videoSubject').value,
            targetClass: document.getElementById('videoClass').value,
            section: document.getElementById('videoSection').value, // Add section field
            duration: document.getElementById('videoDuration').value,
            tags: document.getElementById('videoTags').value.split(',').map(tag => tag.trim()),
            uploadDate: new Date().toISOString(),
            // Store string placeholders instead of File objects
            videoFile: 'video_file_placeholder',
            thumbnail: thumbnailUrl
        };
        
        console.log('Saving new video:', videoData);
        
        // Get existing videos from localStorage
        let videos = JSON.parse(localStorage.getItem('courseVideos') || '[]');
        
        // Add new video
        videos.push(videoData);
        
        // Save to localStorage
        localStorage.setItem('courseVideos', JSON.stringify(videos));
        console.log('Videos in localStorage after save:', videos.length);
        
        // Add video to grid
        addVideoToGrid(videoData);
        
        // Hide form and reset
        hideAddVideoForm();
        
        // Show success message
        showToast('Video added successfully!', 'success');
        
        // Add activity
        addActivity('video', `New course video "${videoData.title}" added`);
    });

    // Function to update video grid
    function updateVideoGrid() {
        const videoGrid = document.getElementById('videoGrid');
        videoGrid.innerHTML = ''; // Clear existing videos
        
        // Get videos from localStorage
        const videos = JSON.parse(localStorage.getItem('courseVideos') || '[]');
        
        // Add each video to the grid
        videos.forEach(video => addVideoToGrid(video));
    }

    // Initialize video section
    updateVideoGrid();

    function getClassName(classValue) {
        const classNames = {
            '1': 'Primary',
            '2': 'Secondary',
            '3': 'Pre Primary',
            '4': 'Pre Vocational',
            '5': 'Vocational',
            '6': 'Early Intervention Center',
            '7': 'Learning Center',
            '8': 'Sheltered Work Shop'
        };
        return classNames[classValue] || classValue;
    }

    // Update the student table row creation
    function createStudentTableRow(student) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>${getClassName(student.class)}</td>
            <td>Section ${student.section}</td>
            <td>${student.email}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editStudent('${student.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteStudent('${student.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        return row;
    }

    // Update the teacher table row creation
    function createTeacherTableRow(teacher) {
        const row = document.createElement('tr');
        const assignedClasses = teacher.classes.map(cls => getClassName(cls)).join(', ');
        row.innerHTML = `
            <td>${teacher.id}</td>
            <td>${teacher.name}</td>
            <td>${teacher.department}</td>
            <td>${teacher.subjects.join(', ')}</td>
            <td>${assignedClasses}</td>
            <td>${teacher.email}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editTeacher('${teacher.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteTeacher('${teacher.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        return row;
    }

    // Update the schedule table row creation
    function createScheduleTableRow(schedule) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${getClassName(schedule.class)}</td>
            <td>Section ${schedule.section}</td>
            <td>${schedule.day}</td>
            <td>${schedule.startTime} - ${schedule.endTime}</td>
            <td>${schedule.subject}</td>
            <td>${schedule.teacherName}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editClassSchedule('${schedule.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-btn" onclick="deleteClassSchedule('${schedule.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        return row;
    }
});
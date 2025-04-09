document.addEventListener('DOMContentLoaded', function() {
    // Check if teacher is logged in
    const teacherName = localStorage.getItem('teacherName');
    const teacherId = localStorage.getItem('teacherId');
    
    if (!teacherName || !teacherId) {
        window.location.href = 'index.html';
        return;
    }

    // Update teacher name in the dashboard
    document.getElementById('teacherName').textContent = teacherName;
    document.querySelector('.teacher-name').textContent = teacherName;

    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (this.classList.contains('logout')) {
                // Handle logout
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('teacherName');
                    localStorage.removeItem('teacherId');
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
                // Load class data when classes section is selected
                if (sectionId === 'classes') {
                    loadClassData();
                }
            }

            if (sectionId === 'attendance') {
                populateAttendanceFilters();
            }

            if (sectionId === 'assignments') {
                populateAssessmentFilters();
            }

            if (sectionId === 'marks') {
                populateMarksFilters();
            }
        });
    });

    // Load teacher profile data
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const teacher = teachers.find(t => t.id === teacherId);

    if (teacher) {
        // Update profile information
        document.getElementById('profileName').textContent = teacher.name;
        document.getElementById('profileId').textContent = `Teacher ID: ${teacher.id}`;
        document.getElementById('profileDepartment').textContent = teacher.department;
        document.getElementById('profileQualification').textContent = teacher.qualification;
        document.getElementById('profileSubjects').textContent = teacher.subjects.join(', ');
        document.getElementById('profileClasses').textContent = teacher.classes.map(cls => getClassName(cls)).join(', ');
        document.getElementById('profileEmail').textContent = teacher.email;
        document.getElementById('profilePhone').textContent = teacher.phone;
        document.getElementById('profileAddress').textContent = teacher.address;

        // Update dashboard stats
        const statsGrid = document.querySelector('.stats-grid');
        const totalClasses = teacher.classes.length;
        const totalStudents = calculateTotalStudents(teacher.classes);
        
        statsGrid.querySelector('.stat-card:nth-child(1) p').textContent = totalClasses;
        statsGrid.querySelector('.stat-card:nth-child(2) p').textContent = totalStudents;
    }

    // Search functionality
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        // Implement search functionality here
        console.log('Searching for:', searchTerm);
    });

    // Function to load and display class data
    function loadClassData() {
        const teacherId = localStorage.getItem('teacherId');
        const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
        const students = JSON.parse(localStorage.getItem('students') || '[]');
        
        // Find current teacher
        const currentTeacher = teachers.find(t => t.id === teacherId);
        if (!currentTeacher) return;

        const classesGrid = document.getElementById('classesGrid');
        classesGrid.innerHTML = ''; // Clear existing content

        // Create a card for each class the teacher is assigned to
        currentTeacher.classes.forEach(cls => {
            // Get students in this class
            const classStudents = students.filter(student => student.class === cls);
            
            // Calculate class statistics
            const totalStudents = classStudents.length;
            const maleStudents = classStudents.filter(s => s.gender === 'Male').length;
            const femaleStudents = classStudents.filter(s => s.gender === 'Female').length;
            
            // Create class card
            const classCard = document.createElement('div');
            classCard.className = 'class-card';
            classCard.innerHTML = `
                <div class="class-header">
                    <h3>${getClassName(cls)}</h3>
                    <span class="section-badge">${currentTeacher.sections.join(', ')}</span>
                </div>
                <div class="class-stats">
                    <div class="stat-item">
                        <i class="fas fa-users"></i>
                        <span>Total Students: ${totalStudents}</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-male"></i>
                        <span>Male: ${maleStudents}</span>
                    </div>
                    <div class="stat-item">
                        <i class="fas fa-female"></i>
                        <span>Female: ${femaleStudents}</span>
                    </div>
                </div>
                <div class="class-subjects">
                    <h4>Subjects Taught</h4>
                    <div class="subject-list">
                        ${currentTeacher.subjects.map(subject => `
                            <span class="subject-badge">${subject}</span>
                        `).join('')}
                    </div>
                </div>
                <div class="class-students">
                    <h4>Student List</h4>
                    <div class="student-list">
                        ${classStudents.map(student => `
                            <div class="student-item">
                                <span class="student-name">${student.name}</span>
                                <span class="student-section">Section ${student.section}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
            
            classesGrid.appendChild(classCard);
        });
    }

    // Initial load of class data if classes section is active
    if (document.getElementById('classes').classList.contains('active')) {
        loadClassData();
    }

    console.log("Teacher script loaded"); // Debug log
    
    // Initialize attendance section if present
    if (document.getElementById('attendance')) {
        console.log("Attendance section found"); // Debug log
        initializeAttendanceSection();
    }
    
    // Set default date to today
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
        console.log("Set default date to:", dateInput.value); // Debug log
    }
});

// Function to calculate total students in teacher's classes
function calculateTotalStudents(classes) {
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    return students.filter(student => classes.includes(student.class)).length;
}

// Function to populate class and section dropdowns based on teacher's assigned classes
function populateAttendanceFilters() {
    const teacherId = localStorage.getItem('teacherId');
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const currentTeacher = teachers.find(t => t.id === teacherId);
    
    if (!currentTeacher) return;
    
    const classSelect = document.getElementById('attendanceClass');
    const sectionSelect = document.getElementById('attendanceSection');
    
    if (classSelect) {
        classSelect.innerHTML = '<option value="">Select Class</option>';
        currentTeacher.classes.forEach(cls => {
            classSelect.innerHTML += `<option value="${cls}">${getClassName(cls)}</option>`;
        });
    }
    
    if (sectionSelect) {
        sectionSelect.innerHTML = '<option value="">Select Section</option>';
        currentTeacher.sections.forEach(section => {
            sectionSelect.innerHTML += `<option value="${section}">Section ${section}</option>`;
        });
    }
}

// Function to populate previous attendance filters
function populatePreviousAttendanceFilters() {
    const teacherId = localStorage.getItem('teacherId');
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const teacher = teachers.find(t => t.id === teacherId);

    if (!teacher) return;

    const classSelect = document.getElementById('prevClass');
    const sectionSelect = document.getElementById('prevSection');

    // Clear existing options
    classSelect.innerHTML = '<option value="">Select Class</option>';
    sectionSelect.innerHTML = '<option value="">Select Section</option>';

    // Add teacher's assigned classes
    teacher.classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = getClassName(cls);
        classSelect.appendChild(option);
    });

    // Add teacher's assigned sections
    teacher.sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = `Section ${section}`;
        sectionSelect.appendChild(option);
    });

    // Set today's date as max date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('prevDate').max = today;
}

// Function to load previous attendance
window.loadPreviousAttendance = function() {
    const selectedClass = document.getElementById('prevClass').value;
    const selectedSection = document.getElementById('prevSection').value;
    const selectedDate = document.getElementById('prevDate').value;
    const tableBody = document.getElementById('previousAttendanceBody');

    if (!selectedClass || !selectedSection || !selectedDate) {
        tableBody.innerHTML = '';
        return;
    }

    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const record = attendanceRecords.find(r => 
        r.class === selectedClass && 
        r.section === selectedSection && 
        r.date === selectedDate
    );

    if (!record) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="no-records">No attendance records found for selected date</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = record.students.map(student => `
        <tr class="student-row" data-student-id="${student.studentId}">
            <td>${student.studentId}</td>
            <td>${student.studentName}</td>
            <td>
                <select class="status-select" onchange="updateAttendanceStatus('${student.studentId}', this.value)">
                    <option value="Present" ${student.status === 'Present' ? 'selected' : ''}>Present</option>
                    <option value="Absent" ${student.status === 'Absent' ? 'selected' : ''}>Absent</option>
                    <option value="Late" ${student.status === 'Late' ? 'selected' : ''}>Late</option>
                </select>
            </td>
            <td>
                <input type="text" class="remarks-input" 
                    value="${student.remarks || ''}" 
                    onchange="updateAttendanceRemarks('${student.studentId}', this.value)">
            </td>
            <td>
                <button class="edit-attendance-btn" onclick="saveAttendanceUpdate('${student.studentId}')">
                    <i class="fas fa-save"></i> Update
                </button>
            </td>
        </tr>
    `).join('');

    // Add edit mode class to table
    tableBody.closest('table').classList.add('edit-mode');
}

// Function to update attendance status
window.updateAttendanceStatus = function(studentId, newStatus) {
    const selectedClass = document.getElementById('prevClass').value;
    const selectedSection = document.getElementById('prevSection').value;
    const selectedDate = document.getElementById('prevDate').value;
    
    let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const recordIndex = attendanceRecords.findIndex(r => 
        r.class === selectedClass && 
        r.section === selectedSection && 
        r.date === selectedDate
    );

    if (recordIndex >= 0) {
        const studentIndex = attendanceRecords[recordIndex].students.findIndex(
            s => s.studentId === studentId
        );
        if (studentIndex >= 0) {
            attendanceRecords[recordIndex].students[studentIndex].status = newStatus;
            localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
            showSuccessMessage('Status updated successfully!');
        }
    }
}

// Function to update attendance remarks
window.updateAttendanceRemarks = function(studentId, newRemarks) {
    const selectedClass = document.getElementById('prevClass').value;
    const selectedSection = document.getElementById('prevSection').value;
    const selectedDate = document.getElementById('prevDate').value;
    
    let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const recordIndex = attendanceRecords.findIndex(r => 
        r.class === selectedClass && 
        r.section === selectedSection && 
        r.date === selectedDate
    );

    if (recordIndex >= 0) {
        const studentIndex = attendanceRecords[recordIndex].students.findIndex(
            s => s.studentId === studentId
        );
        if (studentIndex >= 0) {
            attendanceRecords[recordIndex].students[studentIndex].remarks = newRemarks;
            localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
            showSuccessMessage('Remarks updated successfully!');
        }
    }
}

// Function to save attendance update
window.saveAttendanceUpdate = function(studentId) {
    const selectedClass = document.getElementById('prevClass').value;
    const selectedSection = document.getElementById('prevSection').value;
    const selectedDate = document.getElementById('prevDate').value;
    
    let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    const recordIndex = attendanceRecords.findIndex(r => 
        r.class === selectedClass && 
        r.section === selectedSection && 
        r.date === selectedDate
    );

    if (recordIndex >= 0) {
        const studentIndex = attendanceRecords[recordIndex].students.findIndex(
            s => s.studentId === studentId
        );
        if (studentIndex >= 0) {
            const row = document.querySelector(`tr[data-student-id="${studentId}"]`);
            const status = row.querySelector('.status-select').value;
            const remarks = row.querySelector('.remarks-input').value;
            
            attendanceRecords[recordIndex].students[studentIndex].status = status;
            attendanceRecords[recordIndex].students[studentIndex].remarks = remarks;
            
            localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
            showSuccessMessage('Attendance updated successfully!');
        }
    }
}

// Function to show success message
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'success-message';
    messageDiv.textContent = message;
    
    const tableBody = document.getElementById('previousAttendanceBody');
    tableBody.parentNode.insertBefore(messageDiv, tableBody);
    
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
        messageDiv.remove();
    }, 3000);
}

// Function to show attendance popup
function showAttendancePopup(attendanceData) {
    const overlay = document.getElementById('attendancePopup');
    const popup = overlay.querySelector('.attendance-popup');
    
    // Update summary information
    document.getElementById('summaryDate').textContent = new Date(attendanceData.date).toLocaleDateString();
    document.getElementById('summaryClass').textContent = `Class ${attendanceData.class}`;
    document.getElementById('summarySection').textContent = `Section ${attendanceData.section}`;
    
    // Calculate statistics
    const total = attendanceData.students.length;
    const present = attendanceData.students.filter(s => s.status === 'Present').length;
    const absent = attendanceData.students.filter(s => s.status === 'Absent').length;
    const late = attendanceData.students.filter(s => s.status === 'Late').length;
    
    document.getElementById('summaryTotal').textContent = total;
    document.getElementById('summaryPresent').textContent = present;
    document.getElementById('summaryAbsent').textContent = absent;
    document.getElementById('summaryLate').textContent = late;
    
    // Show absent students
    const absentList = document.getElementById('absentStudentList');
    absentList.innerHTML = '<h4>Absent Students:</h4>';
    
    const absentStudents = attendanceData.students.filter(s => s.status === 'Absent');
    if (absentStudents.length > 0) {
        absentStudents.forEach(student => {
            const studentDiv = document.createElement('div');
            studentDiv.className = 'absent-student-item';
            studentDiv.innerHTML = `
                <div class="absent-student-name">${student.studentName}</div>
                <div class="absent-student-details">
                    <div>Student ID: ${student.studentId}</div>
                    ${student.remarks ? `<div>Remarks: ${student.remarks}</div>` : ''}
                </div>
            `;
            absentList.appendChild(studentDiv);
        });
    } else {
        absentList.innerHTML += '<p>No absent students today!</p>';
    }
    
    // Show popup
    overlay.classList.add('active');
    popup.classList.add('active');
}

// Function to close attendance popup
window.closeAttendancePopup = function() {
    const overlay = document.getElementById('attendancePopup');
    const popup = overlay.querySelector('.attendance-popup');
    overlay.classList.remove('active');
    popup.classList.remove('active');
};

// Function to send notifications (you can implement this based on your needs)
window.sendNotifications = function() {
    alert('Notifications sent to parents of absent students!');
    closeAttendancePopup();
};

// Function to clear attendance form
function clearAttendanceForm() {
    document.getElementById('attendanceClass').value = '';
    document.getElementById('attendanceSection').value = '';
    document.getElementById('attendanceTableBody').innerHTML = '';
    
    // Reset date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
}

// Function to populate assessment filters
function populateAssessmentFilters() {
    const teacherId = localStorage.getItem('teacherId');
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const currentTeacher = teachers.find(t => t.id === teacherId);
    
    if (!currentTeacher) return;
    
    const classSelect = document.getElementById('assessmentClass');
    const sectionSelect = document.getElementById('assessmentSection');
    
    if (classSelect) {
        classSelect.innerHTML = '<option value="">Select Class</option>';
        currentTeacher.classes.forEach(cls => {
            classSelect.innerHTML += `<option value="${cls}">${getClassName(cls)}</option>`;
        });
    }
    
    if (sectionSelect) {
        sectionSelect.innerHTML = '<option value="">Select Section</option>';
        currentTeacher.sections.forEach(section => {
            sectionSelect.innerHTML += `<option value="${section}">Section ${section}</option>`;
        });
    }

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('assessmentDate').value = today;
}

// Function to load students for assessment
window.loadStudentsForAssessment = function() {
    const selectedClass = document.getElementById('assessmentClass').value;
    const selectedSection = document.getElementById('assessmentSection').value;
    const tableBody = document.getElementById('assessmentTableBody');
    
    if (!selectedClass || !selectedSection) {
        tableBody.innerHTML = '';
        return;
    }

    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const classStudents = students.filter(student => 
        student.class === selectedClass && 
        student.section === selectedSection
    );

    tableBody.innerHTML = classStudents.map(student => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>
                <div class="health-criteria">
                    <select class="health-score" id="mental_${student.id}">
                        <option value="">Select Score</option>
                        <option value="excellent">Excellent (90-100)</option>
                        <option value="good">Good (70-89)</option>
                        <option value="fair">Fair (50-69)</option>
                        <option value="poor">Poor (Below 50)</option>
                    </select>
                </div>
            </td>
            <td>
                <div class="health-criteria">
                    <select class="health-score" id="physical_${student.id}">
                        <option value="">Select Score</option>
                        <option value="excellent">Excellent (90-100)</option>
                        <option value="good">Good (70-89)</option>
                        <option value="fair">Fair (50-69)</option>
                        <option value="poor">Poor (Below 50)</option>
                    </select>
                </div>
            </td>
            <td>
                <textarea class="health-remarks" id="remarks_${student.id}" 
                    placeholder="Add remarks about student's health"></textarea>
            </td>
        </tr>
    `).join('');
};

// Function to submit health assessment
window.submitHealthAssessment = function() {
    const selectedClass = document.getElementById('assessmentClass').value;
    const selectedSection = document.getElementById('assessmentSection').value;
    const selectedDate = document.getElementById('assessmentDate').value;

    if (!selectedClass || !selectedSection || !selectedDate) {
        alert('Please select program, section and date');
        return;
    }

    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const classStudents = students.filter(student => 
        student.class === selectedClass && 
        student.section === selectedSection
    );

    const assessmentData = {
        date: selectedDate,
        class: selectedClass,
        section: selectedSection,
        assessments: []
    };

    let isValid = true;
    classStudents.forEach(student => {
        const mentalScore = document.getElementById(`mental_${student.id}`).value;
        const physicalScore = document.getElementById(`physical_${student.id}`).value;
        const remarks = document.getElementById(`remarks_${student.id}`).value;

        if (!mentalScore || !physicalScore) {
            isValid = false;
            return;
        }

        assessmentData.assessments.push({
            studentId: student.id,
            studentName: student.name,
            mentalHealth: mentalScore,
            physicalHealth: physicalScore,
            remarks: remarks
        });
    });

    if (!isValid) {
        alert('Please complete all assessments');
        return;
    }

    // Save to localStorage
    const healthAssessments = JSON.parse(localStorage.getItem('healthAssessments') || '[]');
    healthAssessments.push(assessmentData);
    localStorage.setItem('healthAssessments', JSON.stringify(healthAssessments));

    // Clear form and show success message
    alert('Health assessments submitted successfully!');
    document.getElementById('assessmentClass').value = '';
    document.getElementById('assessmentSection').value = '';
    document.getElementById('assessmentTableBody').innerHTML = '';
};

// Function to load previous assessments
window.loadPreviousAssessments = function() {
    const selectedClass = document.getElementById('viewClass').value;
    const selectedSection = document.getElementById('viewSection').value;
    const historyContainer = document.getElementById('assessmentHistory');

    if (!selectedClass || !selectedSection) {
        historyContainer.innerHTML = '';
        return;
    }

    const healthAssessments = JSON.parse(localStorage.getItem('healthAssessments') || '[]');
    const filteredAssessments = healthAssessments.filter(assessment => 
        assessment.class === selectedClass && 
        assessment.section === selectedSection
    );

    if (filteredAssessments.length === 0) {
        historyContainer.innerHTML = '<p>No assessments found for this class and section.</p>';
        return;
    }

    historyContainer.innerHTML = filteredAssessments.map(assessment => `
        <div class="assessment-card">
            <div class="assessment-date">
                Assessment Date: ${new Date(assessment.date).toLocaleDateString()}
            </div>
            <div class="assessment-list">
                ${assessment.assessments.map(student => `
                    <div class="student-assessment">
                        <div class="student-name">${student.studentName}</div>
                        <div class="health-scores">
                            <span class="health-indicator score-${student.mentalHealth}"></span>
                            Mental: ${student.mentalHealth}
                        </div>
                        <div class="health-scores">
                            <span class="health-indicator score-${student.physicalHealth}"></span>
                            Physical: ${student.physicalHealth}
                        </div>
                        ${student.remarks ? `
                            <div class="health-remarks">${student.remarks}</div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
};

// Debug function to check attendance structure
function debugAttendanceStructure() {
    const attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords') || '[]');
    console.log("Attendance Records Structure:", attendanceRecords);
}

// Add this function and call it once for testing
function addSampleStudentsData() {
    // Check if students data already exists
    const existingStudents = JSON.parse(localStorage.getItem('students') || '[]');
    
    if (existingStudents.length === 0) {
        // Sample student data
        const sampleStudents = [
            { id: "S001", name: "John Smith", class: "1", section: "A" },
            { id: "S002", name: "Emma Johnson", class: "1", section: "A" },
            { id: "S003", name: "Michael Brown", class: "1", section: "A" },
            { id: "S004", name: "Olivia Davis", class: "1", section: "B" },
            { id: "S005", name: "William Wilson", class: "1", section: "B" },
            { id: "S006", name: "Sophia Moore", class: "2", section: "A" },
            { id: "S007", name: "James Taylor", class: "2", section: "A" },
            { id: "S008", name: "Isabella White", class: "2", section: "B" },
            { id: "S009", name: "Alexander Harris", class: "2", section: "B" }
        ];
        
        localStorage.setItem('students', JSON.stringify(sampleStudents));
        console.log("Sample students data added");
    }
}

// Call this function once to add sample data
// document.addEventListener('DOMContentLoaded', addSampleStudentsData);

// Hard-coded sample students for testing
const sampleStudents = [
    { id: "S001", name: "John Smith", class: "1", section: "A" },
    { id: "S002", name: "Emma Johnson", class: "1", section: "A" },
    { id: "S003", name: "Michael Brown", class: "1", section: "A" },
    { id: "S004", name: "Olivia Davis", class: "1", section: "B" },
    { id: "S005", name: "William Wilson", class: "1", section: "B" },
    { id: "S006", name: "Sophia Moore", class: "2", section: "A" },
    { id: "S007", name: "James Taylor", class: "2", section: "A" },
    { id: "S008", name: "Isabella White", class: "2", section: "B" },
    { id: "S009", name: "Alexander Harris", class: "2", section: "B" }
];

// Save sample students to localStorage (only if not already present)
if (!localStorage.getItem('students')) {
    localStorage.setItem('students', JSON.stringify(sampleStudents));
}

// Attendance Functions
document.addEventListener('DOMContentLoaded', function() {
    console.log('Teacher script loaded');
    
    // Set today's date as default
    const today = new Date();
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
        console.log('Default date set to:', dateInput.value);
    }
});

// Function to initialize attendance section
function initializeAttendanceSection() {
    console.log("Initializing attendance section");
    
    // Initialize sample student data if not exists
    if (!localStorage.getItem('students')) {
        const sampleStudents = [
            { id: "S001", name: "John Smith", class: "1", section: "A" },
            { id: "S002", name: "Emma Johnson", class: "1", section: "A" },
            { id: "S003", name: "Michael Brown", class: "1", section: "A" },
            { id: "S004", name: "Olivia Davis", class: "1", section: "B" },
            { id: "S005", name: "William Wilson", class: "1", section: "B" },
            { id: "S006", name: "Sophia Moore", class: "2", section: "A" },
            { id: "S007", name: "James Taylor", class: "2", section: "A" },
            { id: "S008", name: "Isabella White", class: "2", section: "B" },
            { id: "S009", name: "Alexander Harris", class: "2", section: "B" }
        ];
        localStorage.setItem('students', JSON.stringify(sampleStudents));
        console.log("Sample students data initialized");
    }
    
    // Set today's date as default
    const today = new Date();
    const dateInput = document.getElementById('attendanceDate');
    if (dateInput) {
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }
    
    // Initialize class dropdown
    const teacherId = localStorage.getItem('teacherId');
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const teacher = teachers.find(t => t.id === teacherId);
    
    if (teacher) {
        const classSelect = document.getElementById('attendanceClass');
        classSelect.innerHTML = '<option value="">Select Program</option>';
        
        teacher.classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls;
            option.textContent = getClassName(cls);
            classSelect.appendChild(option);
        });
    }
    
    // Add event listeners
    const classSelect = document.getElementById('attendanceClass');
    const sectionSelect = document.getElementById('attendanceSection');
    
    if (classSelect) {
        classSelect.addEventListener('change', populateSections);
    }
    
    if (sectionSelect) {
        sectionSelect.addEventListener('change', loadStudentsForAttendance);
    }
}

// Function to populate sections based on selected class
function populateSections() {
    console.log("Populating sections");
    const selectedClass = document.getElementById('attendanceClass').value;
    const sectionSelect = document.getElementById('attendanceSection');
    
    // Clear existing options
    sectionSelect.innerHTML = '<option value="">Select Section</option>';
    
    if (!selectedClass) return;
    
    // Get all students
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    console.log("All students:", students);
    
    // Get unique sections for the selected class
    const sections = [...new Set(students
        .filter(student => student.class === selectedClass)
        .map(student => student.section)
    )].sort();
    
    console.log("Available sections:", sections);
    
    // Add section options
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = `Section ${section}`;
        sectionSelect.appendChild(option);
    });
}

// Function to load students for attendance
window.loadStudentsForAttendance = function() {
    console.log('Loading students for attendance');
    
    const selectedClass = document.getElementById('attendanceClass').value;
    const selectedSection = document.getElementById('attendanceSection').value;
    const selectedDate = document.getElementById('attendanceDate').value;
    
    console.log('Selected values:', { class: selectedClass, section: selectedSection, date: selectedDate });
    
    if (!selectedClass || !selectedSection || !selectedDate) {
        alert('Please select program, section and date');
        return;
    }
    
    // Get students for this class and section
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    console.log('All students:', students);
    
    const filteredStudents = students.filter(student => 
        student.class === selectedClass && 
        student.section === selectedSection
    );
    console.log('Filtered students:', filteredStudents);
    
    if (filteredStudents.length === 0) {
        document.getElementById('studentsAttendanceList').innerHTML = 
            '<p class="no-students">No students found for the selected class and section.</p>';
        document.getElementById('attendanceActions').style.display = 'none';
        return;
    }
    
    // Create attendance table
    let tableHTML = `
        <table class="attendance-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Remarks</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    filteredStudents.forEach(student => {
        tableHTML += `
            <tr class="student-row" data-student-id="${student.id}">
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>
                    <select class="status-select">
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Late">Late</option>
                    </select>
                </td>
                <td>
                    <input type="text" class="remarks-input" placeholder="Remarks (optional)">
                </td>
            </tr>
        `;
    });
    
    tableHTML += `
            </tbody>
        </table>
    `;
    
    // Show the students list and save button
    document.getElementById('studentsAttendanceList').innerHTML = tableHTML;
    document.getElementById('studentsAttendanceList').style.display = 'block';
    document.getElementById('attendanceActions').style.display = 'block';
    document.getElementById('noStudentsMessage').style.display = 'none';
};

// Function to save attendance
function saveAttendance() {
    console.log('Save attendance function called');
    
    const selectedClass = document.getElementById('attendanceClass').value;
    const selectedSection = document.getElementById('attendanceSection').value;
    const selectedDate = document.getElementById('attendanceDate').value;

    if (!selectedClass || !selectedSection || !selectedDate) {
        alert('Please select program, section and date');
        return;
    }

    const attendanceData = [];
    const studentRows = document.querySelectorAll('.student-row');
    
    studentRows.forEach(row => {
        const studentId = row.querySelector('td:nth-child(1)').textContent;
        const studentName = row.querySelector('td:nth-child(2)').textContent;
        const status = row.querySelector('.status-select').value;
        const remarks = row.querySelector('.remarks-input').value;

        attendanceData.push({
            studentId,
            studentName,
            status,
            remarks
        });
    });

    // Calculate attendance summary
    const total = attendanceData.length;
    const present = attendanceData.filter(s => s.status === 'Present').length;
    const absent = attendanceData.filter(s => s.status === 'Absent').length;
    const late = attendanceData.filter(s => s.status === 'Late').length;

    // Get existing attendance records or initialize empty array
    let attendanceRecords;
    try {
        const storedRecords = localStorage.getItem('attendanceData');
        attendanceRecords = storedRecords ? JSON.parse(storedRecords) : [];
        
        // Ensure attendanceRecords is an array
        if (!Array.isArray(attendanceRecords)) {
            console.error('Attendance data is not an array. Resetting to empty array.');
            attendanceRecords = [];
        }
    } catch (error) {
        console.error('Error parsing attendance data:', error);
        attendanceRecords = [];
    }
    
    // Check if there's already a record for this class/section/date
    const existingRecordIndex = attendanceRecords.findIndex(record => 
        record.class === selectedClass && 
        record.section === selectedSection && 
        record.date === selectedDate
    );
    
    // Either update existing record or add new one
    if (existingRecordIndex >= 0) {
        attendanceRecords[existingRecordIndex] = {
            class: selectedClass,
            section: selectedSection,
            date: selectedDate,
            students: attendanceData,
            markedBy: localStorage.getItem('teacherName') || 'Faculty'
        };
    } else {
        attendanceRecords.push({
            class: selectedClass,
            section: selectedSection,
            date: selectedDate,
            students: attendanceData,
            markedBy: localStorage.getItem('teacherName') || 'Faculty'
        });
    }
    
    // Save back to localStorage
    localStorage.setItem('attendanceData', JSON.stringify(attendanceRecords));

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'success-message';
    successMessage.innerHTML = `
        <i class="fas fa-check-circle"></i>
        Attendance saved successfully for ${selectedClass} ${selectedSection} on ${selectedDate}
    `;
    document.querySelector('.attendance-form').appendChild(successMessage);
    successMessage.style.display = 'block';

    // Reset form after delay
    setTimeout(() => {
        // Reset individual form elements
        document.getElementById('attendanceClass').value = '';
        document.getElementById('attendanceSection').value = '';
        document.getElementById('attendanceDate').value = new Date().toISOString().split('T')[0];
        
        // Hide students list and actions
        document.getElementById('studentsAttendanceList').style.display = 'none';
        document.getElementById('attendanceActions').style.display = 'none';
        document.getElementById('noStudentsMessage').style.display = 'block';
        
        // Remove success message
        successMessage.remove();
    }, 3000);
}

// Function to show success popup
function showSuccessPopup(selectedClass, selectedSection, selectedDate, summary) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <h3>Attendance Saved Successfully!</h3>
            <p>Your attendance records have been saved.</p>
            <div class="attendance-details">
                <p><i class="fas fa-chalkboard"></i> Class: ${selectedClass}</p>
                <p><i class="fas fa-users"></i> Section: ${selectedSection}</p>
                <p><i class="fas fa-calendar"></i> Date: ${selectedDate}</p>
                <div class="attendance-summary">
                    <p><i class="fas fa-user-check"></i> Present: ${summary.present}</p>
                    <p><i class="fas fa-user-times"></i> Absent: ${summary.absent}</p>
                    <p><i class="fas fa-clock"></i> Late: ${summary.late}</p>
                    <p><i class="fas fa-users"></i> Total: ${summary.total}</p>
                </div>
            </div>
        </div>
        <i class="fas fa-check-circle"></i>
    `;
    
    document.body.appendChild(notification);

    // Remove notification after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.5s ease-out forwards';
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 5000);
}

// You can run this in the browser console to clean up
localStorage.removeItem('courseVideos');

// Add this temporarily to any of the script files to clean up attendance data
localStorage.removeItem('attendanceRecords');

function resetAttendanceForm() {
    // Reset section dropdown
    document.getElementById('attendanceSection').innerHTML = '<option value="">Select Section</option>';
    
    // Hide students list and actions
    document.getElementById('studentsAttendanceList').style.display = 'none';
    document.getElementById('attendanceActions').style.display = 'none';
    
    // Show default message
    document.getElementById('noStudentsMessage').style.display = 'block';
    document.getElementById('noStudentsMessage').textContent = 'Please select program and section to load students';
    
    // Reset class selection
    document.getElementById('attendanceClass').value = '';
    
    // Reset date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('attendanceDate').value = today;
}

// Function to validate attendance data before saving
function validateAttendanceData(attendanceData) {
    if (!attendanceData || attendanceData.length === 0) {
        return false;
    }
    
    // Check if all required fields are filled
    return attendanceData.every(record => 
        record.studentId && 
        record.status && 
        ['Present', 'Absent', 'Late'].includes(record.status)
    );
}

// Function to get attendance summary
function getAttendanceSummary(attendanceData) {
    const summary = {
        total: attendanceData.length,
        present: 0,
        absent: 0,
        late: 0
    };
    
    attendanceData.forEach(record => {
        switch(record.status) {
            case 'Present':
                summary.present++;
                break;
            case 'Absent':
                summary.absent++;
                break;
            case 'Late':
                summary.late++;
                break;
        }
    });
    
    return summary;
}

// Function to show attendance summary popup
function showAttendanceSummaryPopup(summary) {
    const popup = document.createElement('div');
    popup.className = 'attendance-summary-popup';
    popup.innerHTML = `
        <div class="summary-content">
            <h3>Attendance Summary</h3>
            <div class="summary-stats">
                <div class="stat-item">
                    <span class="stat-label">Total Students:</span>
                    <span class="stat-value">${summary.total}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Present:</span>
                    <span class="stat-value">${summary.present}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Absent:</span>
                    <span class="stat-value">${summary.absent}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Late:</span>
                    <span class="stat-value">${summary.late}</span>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(popup);
    
    // Remove popup after 3 seconds
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

// Add these styles to teacher-styles.css

// Function to load students for marks entry
window.loadStudentsForMarks = function() {
    const selectedClass = document.getElementById('marksClass').value;
    const selectedSection = document.getElementById('marksSection').value;
    const tableBody = document.getElementById('marksTableBody');
    
    if (!selectedClass || !selectedSection) {
        tableBody.innerHTML = '';
        return;
    }

    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const classStudents = students.filter(student => 
        student.class === selectedClass && 
        student.section === selectedSection
    );

    if (classStudents.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4">No students found for this class and section.</td></tr>';
        return;
    }

    tableBody.innerHTML = classStudents.map(student => `
        <tr>
            <td>${student.id}</td>
            <td>${student.name}</td>
            <td>
                <input type="number" min="0" max="100" class="marks-input" id="marks_${student.id}">
            </td>
            <td>
                <textarea class="marks-remarks" id="marksRemarks_${student.id}" 
                    placeholder="Add remarks about student's performance"></textarea>
            </td>
        </tr>
    `).join('');
};

// Function to submit student marks
window.submitStudentMarks = function() {
    const selectedClass = document.getElementById('marksClass').value;
    const selectedSection = document.getElementById('marksSection').value;
    const selectedSubject = document.getElementById('marksSubject').value;
    const selectedDate = document.getElementById('marksDate').value;

    if (!selectedClass || !selectedSection || !selectedSubject || !selectedDate) {
        alert('Please select program, section, subject, and date');
        return;
    }

    const students = JSON.parse(localStorage.getItem('students') || '[]');
    const classStudents = students.filter(student => 
        student.class === selectedClass && 
        student.section === selectedSection
    );

    // Prepare marks data
    const marksData = [];
    let isValid = true;

    classStudents.forEach(student => {
        const marksInput = document.getElementById(`marks_${student.id}`);
        const remarksInput = document.getElementById(`marksRemarks_${student.id}`);
        
        if (!marksInput || !marksInput.value) {
            isValid = false;
            return;
        }

        const marks = parseFloat(marksInput.value);
        if (isNaN(marks) || marks < 0 || marks > 100) {
            isValid = false;
            return;
        }

        marksData.push({
            studentId: student.id,
            studentName: student.name,
            class: selectedClass,
            section: selectedSection,
            subject: selectedSubject,
            marks: marks.toString(),
            remarks: remarksInput ? remarksInput.value : '',
            date: selectedDate,
            submittedBy: localStorage.getItem('teacherName') || 'Faculty'
        });
    });

    if (!isValid) {
        alert('Please enter valid marks (0-100) for all students');
        return;
    }

    // Save to localStorage
    let existingMarks;
    try {
        const marksData = localStorage.getItem('marksData');
        existingMarks = marksData ? JSON.parse(marksData) : [];
        
        // Ensure existingMarks is an array
        if (!Array.isArray(existingMarks)) {
            console.error('Existing marks data is not an array, resetting to empty array');
            existingMarks = [];
        }
    } catch (error) {
        console.error('Error parsing marks data:', error);
        existingMarks = [];
    }
    
    // Add new marks data
    marksData.forEach(markRecord => {
        existingMarks.push(markRecord);
    });
    
    localStorage.setItem('marksData', JSON.stringify(existingMarks));

    // Show success message and reset form
    alert('Academic marks submitted successfully!');
    
    // Reset form
    document.getElementById('marksClass').value = '';
    document.getElementById('marksSection').value = '';
    document.getElementById('marksSubject').value = '';
    document.getElementById('marksTableBody').innerHTML = '';
};

// Function to populate marks section filters
function populateMarksFilters() {
    const teacherId = localStorage.getItem('teacherId');
    const teachers = JSON.parse(localStorage.getItem('teachers') || '[]');
    const teacher = teachers.find(t => t.id === teacherId);

    if (!teacher) return;

    // Populate class dropdown
    const classSelect = document.getElementById('marksClass');
    classSelect.innerHTML = '<option value="">Select Class</option>';
    teacher.classes.forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = getClassName(cls);
        classSelect.appendChild(option);
    });

    // Populate section dropdown
    const sectionSelect = document.getElementById('marksSection');
    sectionSelect.innerHTML = '<option value="">Select Section</option>';
    teacher.sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = `Section ${section}`;
        sectionSelect.appendChild(option);
    });

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('marksDate').value = today;
}

// Initialize all sections when document loads
document.addEventListener('DOMContentLoaded', function() {
    // Initialize attendance section
    initializeAttendanceSection();
    
    // Initialize assessment filters
    populateAssessmentFilters();
    
    // Initialize marks section
    populateMarksFilters();
    
    // Add event listeners for buttons
    const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');
    if (saveAttendanceBtn) {
        saveAttendanceBtn.addEventListener('click', function() {
            console.log('Save attendance button clicked');
            saveAttendance();
        });
        console.log('Save attendance button event listener attached');
    }
    
    const submitMarksBtn = document.getElementById('submitMarksBtn');
    if (submitMarksBtn) {
        submitMarksBtn.addEventListener('click', function() {
            console.log('Submit marks button clicked');
            submitStudentMarks();
        });
        console.log('Submit marks button event listener attached');
    }
});

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
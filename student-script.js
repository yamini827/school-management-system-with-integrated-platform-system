document.addEventListener('DOMContentLoaded', function() {
    console.log('Student dashboard loaded');
    
    // Update date and time
    function updateDateTime() {
        const now = new Date();
        const dateElement = document.getElementById('currentDate');
        const timeElement = document.getElementById('currentTime');
        
        if (dateElement) {
            dateElement.textContent = now.toLocaleDateString();
        }
        if (timeElement) {
            timeElement.textContent = now.toLocaleTimeString();
        }
    }
    
    // Update time every second
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Navigation functionality
    const navLinks = document.querySelectorAll('.nav-links li');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (this.classList.contains('logout')) {
                // Handle logout
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('studentName');
                    localStorage.removeItem('studentId');
                    localStorage.removeItem('studentClass');
                    localStorage.removeItem('studentSection');
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
                
                // If videos section is selected, initialize videos
                if (sectionId === 'course-videos') {
                    initializeVideoFilters();
                }
            }
        });
    });

    // Load student data
    const studentName = localStorage.getItem('studentName');
    const studentId = localStorage.getItem('studentId');
    const studentClass = localStorage.getItem('studentClass');
    const studentSection = localStorage.getItem('studentSection');

    console.log('Student info:', { 
        name: studentName, 
        id: studentId, 
        class: studentClass, 
        section: studentSection 
    });

    if (!studentName || !studentId) {
        window.location.href = 'index.html';
        return;
    }

    // Update welcome message
    document.querySelector('.section-header h2').textContent = `Welcome, ${studentName}`;

    // Load student stats
    loadStudentStats();

    // Load recent activities
    loadRecentActivities();

    // Initialize video filters
    initializeVideoFilters();

    // Load assessment data
    loadStudentHealthAssessment();

    // Load attendance data
    loadStudentAttendance();

    // Load academic results
    loadStudentAcademicResults();
});

// Add getClassName function at the top level
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

// Function to load student statistics
function loadStudentStats() {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) return;

    // Get student data from localStorage
    const studentsData = JSON.parse(localStorage.getItem('studentsData')) || [];
    const student = studentsData.find(s => s.id === studentId);

    if (student) {
        // Update current class with proper name
        document.querySelector('.stat-card:nth-child(1) p').textContent = getClassName(student.class);

        // Calculate attendance
        const attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
        
        // Process attendance records for this student
        let totalDays = 0;
        let presentDays = 0;
        
        // Find records for this student's class and section
        attendanceData.forEach(record => {
            if (record.class === student.class && 
                record.section === student.section && 
                Array.isArray(record.students)) {
                
                // Find this student in the record
                const studentAttendance = record.students.find(s => s.studentId === studentId);
                if (studentAttendance) {
                    totalDays++;
                    if (studentAttendance.status === 'Present') {
                        presentDays++;
                    }
                }
            }
        });

        if (totalDays > 0) {
            const attendancePercentage = ((presentDays / totalDays) * 100).toFixed(1);
            document.querySelector('.stat-card:nth-child(2) p').textContent = `${attendancePercentage}%`;
        } else {
            document.querySelector('.stat-card:nth-child(2) p').textContent = 'N/A';
        }

        // Calculate pending assignments
        const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
        const pendingAssignments = assignments.filter(assignment => 
            assignment.class === student.class && 
            assignment.section === student.section &&
            !assignment.submitted
        ).length;
        document.querySelector('.stat-card:nth-child(3) p').textContent = pendingAssignments.toString();

        // Calculate average grade
        const marksData = JSON.parse(localStorage.getItem('marksData')) || [];
        const studentMarks = marksData.filter(record => record.studentId === studentId);
        
        if (studentMarks.length > 0) {
            const averageMarks = studentMarks.reduce((sum, record) => sum + parseFloat(record.marks), 0) / studentMarks.length;
            let grade = 'F';
            if (averageMarks >= 90) grade = 'A';
            else if (averageMarks >= 80) grade = 'B';
            else if (averageMarks >= 70) grade = 'C';
            else if (averageMarks >= 60) grade = 'D';
            document.querySelector('.stat-card:nth-child(4) p').textContent = grade;
        }
    }
}

// Function to load recent activities
function loadRecentActivities() {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) return;

    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    // Clear existing activities
    activityList.innerHTML = '';

    // Get all relevant data
    const marksData = JSON.parse(localStorage.getItem('marksData')) || [];
    const assignments = JSON.parse(localStorage.getItem('assignments')) || [];
    
    // Fix: Handle attendance data structure properly
    let attendanceRecords = [];
    try {
        const attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
        
        // Check if attendanceData is an array
        if (Array.isArray(attendanceData)) {
            // For each attendance record, extract student entries
            attendanceData.forEach(record => {
                if (record && Array.isArray(record.students)) {
                    // Find entries for this student
                    const studentEntries = record.students.filter(student => student.studentId === studentId);
                    
                    // Add them to our records with the date from the parent record
                    studentEntries.forEach(entry => {
                        attendanceRecords.push({
                            studentId: entry.studentId,
                            date: record.date,
                            status: entry.status,
                            class: record.class,
                            section: record.section,
                            markedBy: record.markedBy
                        });
                    });
                }
            });
        } else {
            console.error('Attendance data is not an array:', attendanceData);
        }
    } catch (error) {
        console.error('Error processing attendance data:', error);
    }

    // Combine all activities
    const activities = [
        ...marksData
            .filter(record => record.studentId === studentId)
            .map(record => ({
                type: 'marks',
                date: record.date,
                description: `Marks updated for ${record.subject}: ${record.marks}`,
                icon: 'fas fa-star'
            })),
        ...assignments
            .filter(assignment => assignment.studentId === studentId)
            .map(assignment => ({
                type: 'assignment',
                date: assignment.date,
                description: `New assignment in ${assignment.subject}`,
                icon: 'fas fa-tasks'
            })),
        ...attendanceRecords.map(record => ({
            type: 'attendance',
            date: record.date,
            description: `Attendance marked: ${record.status}`,
            icon: 'fas fa-calendar-check'
        }))
    ];

    // Sort activities by date (most recent first)
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display only the 5 most recent activities
    activities.slice(0, 5).forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <i class="${activity.icon}"></i>
            <div class="activity-info">
                <p>${activity.description}</p>
                <small>${formatDate(activity.date)}</small>
            </div>
        `;
        activityList.appendChild(activityItem);
    });
}

// Function to initialize video filters
function initializeVideoFilters() {
    console.log('Initializing video filters');
    
    const filterSubject = document.getElementById('filterVideoSubject');
    const videoGrid = document.getElementById('videoGrid');

    if (!filterSubject || !videoGrid) {
        console.error('Filter subject or video grid elements not found');
        return;
    }

    // Get student class and section directly from localStorage
    const studentClass = localStorage.getItem('studentClass');
    const studentSection = localStorage.getItem('studentSection');
    
    if (!studentClass || !studentSection) {
        console.error('Student class/section data not found');
        videoGrid.innerHTML = '<div class="no-videos">Unable to load student data. Please log in again.</div>';
        return;
    }

    console.log('Student class:', studentClass, 'Student section:', studentSection);

    // Load videos from localStorage
    const allVideosString = localStorage.getItem('courseVideos');
    console.log('Raw videos string from localStorage:', allVideosString);
    
    let videos = [];
    try {
        videos = JSON.parse(allVideosString || '[]');
    } catch (error) {
        console.error('Error parsing videos from localStorage:', error);
        videoGrid.innerHTML = '<div class="no-videos">Error loading videos. Please try again later.</div>';
        return;
    }
    
    console.log('All videos (parsed):', videos);
    
    if (!Array.isArray(videos)) {
        console.error('Videos is not an array:', videos);
        videoGrid.innerHTML = '<div class="no-videos">Error: Invalid video data format.</div>';
        return;
    }
    
    if (videos.length === 0) {
        console.log('No videos found in localStorage');
        videoGrid.innerHTML = '<div class="no-videos">No videos available yet.</div>';
        return;
    }
    
    // Filter videos for student's class and section
    const filteredVideos = videos.filter(video => {
        if (!video || typeof video !== 'object') {
            console.error('Invalid video object:', video);
            return false;
        }
        
        console.log('Checking video:', video);
        console.log('Video class:', video.targetClass, 'Video section:', video.section);
        console.log('Comparing with student class:', studentClass, 'student section:', studentSection);
        
        const classMatches = video.targetClass === studentClass;
        const sectionMatches = video.section === studentSection || !video.section;
        
        console.log('Class matches:', classMatches, 'Section matches or is empty:', sectionMatches);
        
        return classMatches && sectionMatches;
    });
    
    console.log('Filtered videos:', filteredVideos);

    // Display videos
    displayVideos(filteredVideos);

    // Add filter event listener
    filterSubject.addEventListener('change', function() {
        const selectedSubject = this.value;
        console.log('Subject filter changed to:', selectedSubject);
        
        const subjectFilteredVideos = selectedSubject 
            ? filteredVideos.filter(video => video.subject === selectedSubject)
            : filteredVideos;
        
        console.log('Subject filtered videos:', subjectFilteredVideos);
        displayVideos(subjectFilteredVideos);
    });
}

// Function to display videos
function displayVideos(videos) {
    console.log('Displaying videos:', videos);
    
    const videoGrid = document.getElementById('videoGrid');
    if (!videoGrid) {
        console.error('Video grid element not found');
        return;
    }

    videoGrid.innerHTML = '';
    
    if (!videos || videos.length === 0) {
        console.log('No videos to display');
        videoGrid.innerHTML = '<div class="no-videos">No videos available for your class and section.</div>';
        return;
    }

    videos.forEach((video, index) => {
        console.log(`Processing video ${index + 1}:`, video);
        
        try {
            const videoCard = document.createElement('div');
            videoCard.className = 'video-card';
            
            // Safely get thumbnail URL
            let thumbnailSrc = 'https://via.placeholder.com/320x180?text=Video+Thumbnail';
            if (video.thumbnail && typeof video.thumbnail === 'string' && video.thumbnail.startsWith('http')) {
                thumbnailSrc = video.thumbnail;
            }
            
            console.log('Using thumbnail:', thumbnailSrc);
            
            videoCard.innerHTML = `
                <div class="video-thumbnail">
                    <img src="${thumbnailSrc}" alt="${video.title || 'Video'}">
                    <div class="video-overlay">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="video-info">
                    <h4>${video.title || 'Untitled Video'}</h4>
                    <p>${video.description || 'No description available'}</p>
                    <div class="video-meta">
                        <span><i class="fas fa-book"></i> ${video.subject || 'General'}</span>
                        <span><i class="fas fa-graduation-cap"></i> Class ${video.targetClass || 'N/A'}</span>
                        <span><i class="fas fa-clock"></i> ${video.duration || 'N/A'} mins</span>
                    </div>
                    <button class="watch-btn" onclick="watchVideo('${video.id}')">
                        <i class="fas fa-play"></i> Watch Now
                    </button>
                </div>
            `;
            videoGrid.appendChild(videoCard);
        } catch (error) {
            console.error('Error creating video card for:', video, error);
        }
    });
    
    if (videoGrid.children.length === 0) {
        console.log('No valid videos were rendered');
        videoGrid.innerHTML = '<div class="no-videos">Error displaying videos. Please try again later.</div>';
    } else {
        console.log(`Successfully displayed ${videoGrid.children.length} videos`);
    }
}

// Function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
}

// Function to watch a video
function watchVideo(videoId) {
    console.log('Attempting to watch video with ID:', videoId);
    
    // Get the selected video from localStorage
    const videos = JSON.parse(localStorage.getItem('courseVideos') || '[]');
    console.log('All videos for playback:', videos.length);
    
    const video = videos.find(v => v.id === videoId);
    
    if (!video) {
        console.error('Video not found with ID:', videoId);
        alert('Video not found!');
        return;
    }
    
    console.log('Found video to play:', video);
    
    // Create a modal to display the video
    const modal = document.createElement('div');
    modal.className = 'video-modal';
    
    // Create a video player (in a real app, this would play the actual video)
    // For this demo, we'll show a placeholder
    const videoContent = `
        <div class="video-player-placeholder">
            <h3>Video Player</h3>
            <p>This is where the actual video "${video.title}" would play in a production environment.</p>
            <p>Duration: ${video.duration} minutes</p>
            <p>Subject: ${video.subject}</p>
            <p>Class: ${video.targetClass}</p>
            ${video.section ? `<p>Section: ${video.section}</p>` : ''}
        </div>
    `;
    
    modal.innerHTML = `
        <div class="video-modal-content">
            <span class="close-modal">&times;</span>
            <h3>${video.title}</h3>
            ${videoContent}
            <div class="video-details">
                <p>${video.description}</p>
                <div class="video-meta">
                    <span><i class="fas fa-book"></i> ${video.subject}</span>
                    <span><i class="fas fa-graduation-cap"></i> Class ${video.targetClass}</span>
                    <span><i class="fas fa-clock"></i> ${video.duration} mins</span>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Show modal with animation
    requestAnimationFrame(() => {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.style.opacity = '1';
        }, 10);
    });
    
    // Close modal when clicking the close button
    const closeBtn = modal.querySelector('.close-modal');
    closeBtn.addEventListener('click', () => {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.remove();
        }, 300);
    });
    
    // Close modal when clicking outside content
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    });
    
    // Record that the student watched this video
    addStudentActivity('Watched course video: ' + video.title);
    console.log('Video modal displayed successfully');
}

// Function to add student activity
function addStudentActivity(description) {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) return;
    
    // Get existing activities
    const activities = JSON.parse(localStorage.getItem('studentActivities')) || [];
    
    // Add new activity
    activities.push({
        studentId,
        description,
        date: new Date().toISOString(),
        type: 'video-watch'
    });
    
    // Save back to localStorage
    localStorage.setItem('studentActivities', JSON.stringify(activities));
}

// Function to get grade based on marks
function getGrade(marks) {
    if (marks >= 90) return 'A+';
    if (marks >= 80) return 'A';
    if (marks >= 70) return 'B+';
    if (marks >= 60) return 'B';
    if (marks >= 50) return 'C+';
    if (marks >= 40) return 'C';
    if (marks >= 30) return 'D';
    return 'F';
}

// Function to load student health assessment data
function loadStudentHealthAssessment() {
    console.log('Loading student health assessment data');
    const studentId = localStorage.getItem('studentId');
    if (!studentId) return;

    // Get health assessment data from localStorage
    const healthAssessments = JSON.parse(localStorage.getItem('healthAssessments') || '[]');
    console.log('Health assessments data:', healthAssessments);
    
    // Filter data for current student
    const studentAssessments = [];
    
    healthAssessments.forEach(assessment => {
        const studentData = assessment.assessments.find(a => a.studentId === studentId);
        if (studentData) {
            studentAssessments.push({
                date: assessment.date,
                class: assessment.class,
                section: assessment.section,
                mentalHealth: studentData.mentalHealth,
                physicalHealth: studentData.physicalHealth,
                remarks: studentData.remarks
            });
        }
    });
    
    console.log('Student assessments:', studentAssessments);
    
    // Update the assessment summary
    updateHealthAssessmentSummary(studentAssessments);
    
    // Update the assessment history table
    updateHealthAssessmentHistory(studentAssessments);
}

// Function to update health assessment summary
function updateHealthAssessmentSummary(assessments) {
    if (assessments.length === 0) {
        document.getElementById('mentalHealthScore').textContent = '--';
        document.getElementById('mentalHealthStatus').textContent = 'No data available';
        document.getElementById('physicalHealthScore').textContent = '--';
        document.getElementById('physicalHealthStatus').textContent = 'No data available';
        return;
    }
    
    // Get the latest assessment
    const latestAssessment = assessments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
    
    // Update mental health score
    const mentalScore = latestAssessment.mentalHealth;
    document.getElementById('mentalHealthScore').textContent = getHealthScoreText(mentalScore);
    document.getElementById('mentalHealthStatus').textContent = getHealthStatusText(mentalScore);
    
    // Update physical health score
    const physicalScore = latestAssessment.physicalHealth;
    document.getElementById('physicalHealthScore').textContent = getHealthScoreText(physicalScore);
    document.getElementById('physicalHealthStatus').textContent = getHealthStatusText(physicalScore);
    
    // Add appropriate classes based on health status
    document.querySelector('.health-score-card.mental').className = 
        `health-score-card mental ${getHealthScoreClass(mentalScore)}`;
    document.querySelector('.health-score-card.physical').className = 
        `health-score-card physical ${getHealthScoreClass(physicalScore)}`;
}

// Function to update health assessment history table
function updateHealthAssessmentHistory(assessments) {
    const tableBody = document.getElementById('assessmentHistoryTable');
    tableBody.innerHTML = '';
    
    if (assessments.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4" class="no-data">No assessment data available</td>';
        tableBody.appendChild(row);
        return;
    }
    
    // Sort assessments by date (newest first)
    assessments.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Add rows to table
    assessments.forEach(assessment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(assessment.date)}</td>
            <td>${getHealthScoreText(assessment.mentalHealth)}</td>
            <td>${getHealthScoreText(assessment.physicalHealth)}</td>
            <td>${assessment.remarks || 'N/A'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Helper function to get health score text
function getHealthScoreText(score) {
    switch(score) {
        case 'excellent': return 'Excellent';
        case 'good': return 'Good';
        case 'fair': return 'Fair';
        case 'poor': return 'Poor';
        default: return 'N/A';
    }
}

// Helper function to get health status text
function getHealthStatusText(score) {
    switch(score) {
        case 'excellent': return 'Excellent condition';
        case 'good': return 'Good condition';
        case 'fair': return 'Fair condition - Needs attention';
        case 'poor': return 'Poor condition - Immediate action required';
        default: return 'No data available';
    }
}

// Helper function to get health score class for styling
function getHealthScoreClass(score) {
    switch(score) {
        case 'excellent': return 'excellent';
        case 'good': return 'good';
        case 'fair': return 'fair';
        case 'poor': return 'poor';
        default: return '';
    }
}

// Function to load student attendance data
function loadStudentAttendance() {
    console.log('Loading student attendance data');
    const studentId = localStorage.getItem('studentId');
    if (!studentId) return;

    // Get attendance data from localStorage
    const attendanceData = JSON.parse(localStorage.getItem('attendanceData') || '[]');
    console.log('Attendance data:', attendanceData);
    
    // Process attendance records
    const attendanceRecords = [];
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    
    attendanceData.forEach(record => {
        if (record && Array.isArray(record.students)) {
            // Find the student in this record
            const studentRecord = record.students.find(s => s.studentId === studentId);
            if (studentRecord) {
                attendanceRecords.push({
                    date: record.date,
                    status: studentRecord.status,
                    class: record.class,
                    section: record.section,
                    markedBy: record.markedBy || 'Faculty'
                });
                
                if (studentRecord.status === 'Present') presentCount++;
                else if (studentRecord.status === 'Absent') absentCount++;
                else if (studentRecord.status === 'Late') lateCount++;
            }
        }
    });
    
    console.log('Student attendance records:', attendanceRecords);
    
    // Update attendance summary
    updateAttendanceSummary(presentCount, absentCount, lateCount);
    
    // Update attendance history table
    updateAttendanceHistory(attendanceRecords);
}

// Function to update attendance summary
function updateAttendanceSummary(present, absent, late) {
    const total = present + absent + late;
    
    if (total === 0) {
        document.getElementById('attendancePercentage').textContent = '0%';
        document.getElementById('presentDays').textContent = '0';
        document.getElementById('absentDays').textContent = '0';
        document.getElementById('lateDays').textContent = '0';
        return;
    }
    
    const attendancePercentage = ((present / total) * 100).toFixed(1);
    
    document.getElementById('attendancePercentage').textContent = `${attendancePercentage}%`;
    document.getElementById('presentDays').textContent = present;
    document.getElementById('absentDays').textContent = absent;
    document.getElementById('lateDays').textContent = late;
    
    // Update color based on attendance percentage
    const attendanceElement = document.getElementById('attendancePercentage');
    if (attendancePercentage >= 90) {
        attendanceElement.className = 'excellent';
    } else if (attendancePercentage >= 75) {
        attendanceElement.className = 'good';
    } else if (attendancePercentage >= 60) {
        attendanceElement.className = 'fair';
    } else {
        attendanceElement.className = 'poor';
    }
}

// Function to update attendance history table
function updateAttendanceHistory(records) {
    const tableBody = document.getElementById('attendanceHistoryTable');
    if (!tableBody) return;

    tableBody.innerHTML = records.map(record => `
        <tr>
            <td>${formatDate(record.date)}</td>
            <td>
                <span class="status-badge ${record.status.toLowerCase()}">
                    ${record.status}
                </span>
            </td>
            <td>${getClassName(record.class)}</td>
            <td>Section ${record.section}</td>
            <td>${record.markedBy}</td>
        </tr>
    `).join('');
}

// Function to load student academic results
function loadStudentAcademicResults() {
    console.log('Loading student academic results');
    const studentId = localStorage.getItem('studentId');
    if (!studentId) return;

    // Get marks data from localStorage
    const marksData = JSON.parse(localStorage.getItem('marksData') || '[]');
    console.log('Marks data:', marksData);
    
    // Filter marks for current student
    const studentMarks = marksData.filter(record => record.studentId === studentId);
    console.log('Student marks:', studentMarks);
    
    // Update academic results summary
    updateAcademicResultsSummary(studentMarks);
    
    // Update marks history table
    updateMarksHistory(studentMarks);
}

// Function to update academic results summary
function updateAcademicResultsSummary(marks) {
    if (marks.length === 0) {
        document.getElementById('averageGrade').textContent = '--';
        document.getElementById('highestMark').textContent = '--';
        document.getElementById('averageMark').textContent = '--';
        return;
    }
    
    // Calculate average marks
    const totalMarks = marks.reduce((sum, record) => sum + parseFloat(record.marks), 0);
    const averageMarks = totalMarks / marks.length;
    
    // Find highest mark
    const highestMark = Math.max(...marks.map(record => parseFloat(record.marks)));
    
    // Get grade based on average marks
    const grade = getGrade(averageMarks);
    
    // Update the DOM
    document.getElementById('averageGrade').textContent = grade;
    document.getElementById('highestMark').textContent = highestMark;
    document.getElementById('averageMark').textContent = averageMarks.toFixed(1);
    
    // Update grade color
    const gradeElement = document.getElementById('averageGrade');
    if (averageMarks >= 80) {
        gradeElement.className = 'excellent';
    } else if (averageMarks >= 60) {
        gradeElement.className = 'good';
    } else if (averageMarks >= 40) {
        gradeElement.className = 'fair';
    } else {
        gradeElement.className = 'poor';
    }
}

// Function to update marks history table
function updateMarksHistory(studentMarks) {
    const tableBody = document.getElementById('marksHistoryTable');
    if (!tableBody) return;

    if (studentMarks.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="no-data">No academic records available</td></tr>';
        return;
    }

    // Sort marks by date (newest first)
    studentMarks.sort((a, b) => new Date(b.date) - new Date(a.date));

    tableBody.innerHTML = studentMarks.map(mark => {
        const grade = getGrade(parseFloat(mark.marks));
        return `
            <tr>
                <td>${formatDate(mark.date)}</td>
                <td>${mark.subject}</td>
                <td>${getClassName(mark.class)}</td>
                <td>Section ${mark.section}</td>
                <td>${mark.marks}</td>
                <td><span class="grade-badge ${getGradeClass(grade)}">${grade}</span></td>
                <td>${mark.remarks || '-'}</td>
            </tr>
        `;
    }).join('');
}

// Helper function to get grade class for styling
function getGradeClass(grade) {
    switch(grade[0]) {
        case 'A': return 'excellent';
        case 'B': return 'good';
        case 'C': return 'fair';
        case 'D': return 'poor';
        case 'F': return 'poor';
        default: return '';
    }
}
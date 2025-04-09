// Student Attendance Analytics Functions
function updateStudentAttendanceAnalytics() {
    const selectedPeriod = document.getElementById('analyticsPeriod').value;
    const studentId = getCurrentStudentId();

    // Get attendance data from localStorage
    const attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
    
    // Filter data for current student
    const studentData = attendanceData.filter(record => 
        record.students.some(student => student.id === studentId)
    );

    // Calculate statistics
    const stats = calculateStudentAttendanceStats(studentData, selectedPeriod);
    
    // Update statistics display
    updateStudentStatisticsDisplay(stats);
    
    // Update charts
    updateStudentAttendanceCharts(studentData, selectedPeriod);
    
    // Update attendance history
    updateStudentAttendanceHistory(studentData);
}

function calculateStudentAttendanceStats(data, period) {
    const now = new Date();
    let startDate = new Date();
    const studentId = getCurrentStudentId();
    
    // Calculate start date based on period
    switch(period) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
    }

    // Filter data for the selected period
    const periodData = data.filter(record => new Date(record.date) >= startDate);
    
    let totalDays = 0;
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    
    periodData.forEach(record => {
        const studentRecord = record.students.find(s => s.id === studentId);
        if (studentRecord) {
            totalDays++;
            switch(studentRecord.status) {
                case 'present':
                    presentCount++;
                    break;
                case 'absent':
                    absentCount++;
                    break;
                case 'late':
                    lateCount++;
                    break;
            }
        }
    });

    // Calculate percentages and trends
    const attendanceRate = totalDays > 0 ? (presentCount / totalDays) * 100 : 0;
    
    // Calculate trend (comparing with previous period)
    const previousPeriodData = data.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate < startDate && recordDate >= new Date(startDate.getTime() - (now.getTime() - startDate.getTime()));
    });
    
    let previousAttendance = 0;
    if (previousPeriodData.length > 0) {
        let prevTotal = 0;
        let prevPresent = 0;
        previousPeriodData.forEach(record => {
            const studentRecord = record.students.find(s => s.id === studentId);
            if (studentRecord) {
                prevTotal++;
                if (studentRecord.status === 'present') prevPresent++;
            }
        });
        previousAttendance = prevTotal > 0 ? (prevPresent / prevTotal) * 100 : 0;
    }
    
    const trend = previousAttendance > 0 ? ((attendanceRate - previousAttendance) / previousAttendance) * 100 : 0;

    return {
        totalDays,
        presentCount,
        absentCount,
        lateCount,
        attendanceRate,
        trend,
        periodData
    };
}

function updateStudentStatisticsDisplay(stats) {
    document.getElementById('studentAttendanceRate').textContent = `${stats.attendanceRate.toFixed(1)}%`;
    document.getElementById('studentAbsentCount').textContent = stats.absentCount;
    document.getElementById('studentLateCount').textContent = stats.lateCount;
    document.getElementById('studentAttendanceTrend').textContent = `${stats.trend.toFixed(1)}%`;
}

function updateStudentAttendanceCharts(data, period) {
    const studentId = getCurrentStudentId();
    
    // Attendance Trend Chart
    const trendCtx = document.getElementById('studentAttendanceChart').getContext('2d');
    const trendData = prepareStudentAttendanceTrendData(data, period, studentId);
    
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [{
                label: 'Attendance Status',
                data: trendData.status,
                borderColor: '#4CAF50',
                tension: 0.4,
                fill: false
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });

    // Attendance Distribution Chart
    const distributionCtx = document.getElementById('studentAttendanceDistributionChart').getContext('2d');
    const distributionData = prepareStudentDistributionData(data, studentId);
    
    new Chart(distributionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent', 'Late'],
            datasets: [{
                data: [distributionData.present, distributionData.absent, distributionData.late],
                backgroundColor: ['#4CAF50', '#f44336', '#ff9800']
            }]
        },
        options: {
            responsive: true
        }
    });
}

function prepareStudentAttendanceTrendData(data, period, studentId) {
    const now = new Date();
    let startDate = new Date();
    
    switch(period) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
    }

    const periodData = data.filter(record => new Date(record.date) >= startDate);
    const labels = [];
    const status = [];

    periodData.forEach(record => {
        const date = new Date(record.date);
        labels.push(date.toLocaleDateString());
        
        const studentRecord = record.students.find(s => s.id === studentId);
        if (studentRecord) {
            status.push(studentRecord.status === 'present' ? 100 : 
                      studentRecord.status === 'late' ? 50 : 0);
        }
    });

    return { labels, status };
}

function prepareStudentDistributionData(data, studentId) {
    let present = 0;
    let absent = 0;
    let late = 0;

    data.forEach(record => {
        const studentRecord = record.students.find(s => s.id === studentId);
        if (studentRecord) {
            switch(studentRecord.status) {
                case 'present':
                    present++;
                    break;
                case 'absent':
                    absent++;
                    break;
                case 'late':
                    late++;
                    break;
            }
        }
    });

    return { present, absent, late };
}

function updateStudentAttendanceHistory(data) {
    const tbody = document.getElementById('studentAttendanceHistory');
    tbody.innerHTML = '';
    const studentId = getCurrentStudentId();

    // Sort data by date in descending order
    const sortedData = [...data].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    sortedData.forEach(record => {
        const studentRecord = record.students.find(s => s.id === studentId);
        if (studentRecord) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(record.date).toLocaleDateString()}</td>
                <td>${studentRecord.status}</td>
                <td>${record.class}</td>
                <td>${record.section}</td>
            `;
            tbody.appendChild(row);
        }
    });
}

// Helper function to get current student ID
function getCurrentStudentId() {
    // This should be replaced with actual student ID from login session
    return localStorage.getItem('currentStudentId') || 'STU001';
}

// Initialize student attendance analytics when the section is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initial update of analytics
    updateStudentAttendanceAnalytics();
}); 
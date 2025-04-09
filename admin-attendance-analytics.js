// Admin Attendance Analytics Functions
function updateAttendanceAnalytics() {
    const selectedClass = document.getElementById('analyticsClass').value;
    const selectedSection = document.getElementById('analyticsSection').value;
    const selectedPeriod = document.getElementById('analyticsPeriod').value;

    // Get attendance data from localStorage
    const attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
    
    // Filter data based on selected filters
    let filteredData = attendanceData;
    if (selectedClass !== 'all') {
        filteredData = filteredData.filter(record => record.class === selectedClass);
    }
    if (selectedSection !== 'all') {
        filteredData = filteredData.filter(record => record.section === selectedSection);
    }

    // Calculate statistics
    const stats = calculateAttendanceStats(filteredData, selectedPeriod);
    
    // Update statistics display
    updateStatisticsDisplay(stats);
    
    // Update charts
    updateAttendanceCharts(filteredData, selectedPeriod);
    
    // Update detailed statistics table
    updateDetailedStatsTable(filteredData);
}

function calculateAttendanceStats(data, period) {
    const now = new Date();
    let startDate = new Date();
    
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
    
    let totalStudents = 0;
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLate = 0;
    
    periodData.forEach(record => {
        record.students.forEach(student => {
            totalStudents++;
            switch(student.status) {
                case 'present':
                    totalPresent++;
                    break;
                case 'absent':
                    totalAbsent++;
                    break;
                case 'late':
                    totalLate++;
                    break;
            }
        });
    });

    // Calculate percentages and trends
    const averageAttendance = totalStudents > 0 ? (totalPresent / totalStudents) * 100 : 0;
    
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
            record.students.forEach(student => {
                if (student.status === 'present') prevPresent++;
                prevTotal++;
            });
        });
        previousAttendance = prevTotal > 0 ? (prevPresent / prevTotal) * 100 : 0;
    }
    
    const trend = previousAttendance > 0 ? ((averageAttendance - previousAttendance) / previousAttendance) * 100 : 0;

    return {
        totalStudents,
        totalPresent,
        totalAbsent,
        totalLate,
        averageAttendance,
        trend,
        periodData
    };
}

function updateStatisticsDisplay(stats) {
    document.getElementById('averageAttendance').textContent = `${stats.averageAttendance.toFixed(1)}%`;
    document.getElementById('absentStudents').textContent = stats.totalAbsent;
    document.getElementById('lateArrivals').textContent = stats.totalLate;
    document.getElementById('attendanceTrend').textContent = `${stats.trend.toFixed(1)}%`;
}

function updateAttendanceCharts(data, period) {
    // Daily Attendance Trend Chart
    const trendCtx = document.getElementById('dailyAttendanceChart').getContext('2d');
    const trendData = prepareDailyAttendanceData(data, period);
    
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [{
                label: 'Attendance Rate',
                data: trendData.rates,
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

    // Class-wise Attendance Chart
    const classCtx = document.getElementById('classAttendanceChart').getContext('2d');
    const classData = prepareClassAttendanceData(data);
    
    new Chart(classCtx, {
        type: 'bar',
        data: {
            labels: classData.labels,
            datasets: [{
                label: 'Attendance Rate',
                data: classData.rates,
                backgroundColor: '#4CAF50'
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
    const distributionCtx = document.getElementById('attendanceDistributionChart').getContext('2d');
    const distributionData = prepareDistributionData(data);
    
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

function prepareDailyAttendanceData(data, period) {
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
    const rates = [];

    periodData.forEach(record => {
        const date = new Date(record.date);
        labels.push(date.toLocaleDateString());
        
        let total = record.students.length;
        let present = record.students.filter(s => s.status === 'present').length;
        rates.push(total > 0 ? (present / total) * 100 : 0);
    });

    return { labels, rates };
}

function prepareClassAttendanceData(data) {
    const classData = {};
    
    data.forEach(record => {
        if (!classData[record.class]) {
            classData[record.class] = {
                total: 0,
                present: 0
            };
        }
        
        record.students.forEach(student => {
            classData[record.class].total++;
            if (student.status === 'present') {
                classData[record.class].present++;
            }
        });
    });

    const labels = Object.keys(classData);
    const rates = labels.map(className => {
        const data = classData[className];
        return data.total > 0 ? (data.present / data.total) * 100 : 0;
    });

    return { labels, rates };
}

function prepareDistributionData(data) {
    let present = 0;
    let absent = 0;
    let late = 0;

    data.forEach(record => {
        record.students.forEach(student => {
            switch(student.status) {
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
        });
    });

    return { present, absent, late };
}

function updateDetailedStatsTable(data) {
    const tbody = document.getElementById('detailedStatsTable');
    tbody.innerHTML = '';
    
    // Group data by class and section
    const statsByClass = {};
    data.forEach(record => {
        const key = `${record.class}-${record.section}`;
        if (!statsByClass[key]) {
            statsByClass[key] = {
                class: record.class,
                section: record.section,
                total: 0,
                present: 0,
                absent: 0,
                late: 0
            };
        }
        
        record.students.forEach(student => {
            statsByClass[key].total++;
            switch(student.status) {
                case 'present':
                    statsByClass[key].present++;
                    break;
                case 'absent':
                    statsByClass[key].absent++;
                    break;
                case 'late':
                    statsByClass[key].late++;
                    break;
            }
        });
    });

    // Create table rows
    Object.values(statsByClass).forEach(stats => {
        const row = document.createElement('tr');
        const attendanceRate = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;
        
        row.innerHTML = `
            <td>${stats.class}</td>
            <td>${stats.section}</td>
            <td>${stats.total}</td>
            <td>${stats.present}</td>
            <td>${stats.absent}</td>
            <td>${stats.late}</td>
            <td>${attendanceRate.toFixed(1)}%</td>
        `;
        tbody.appendChild(row);
    });
}

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
    return classNames[classValue] || `Class ${classValue}`;
}

// Initialize attendance analytics when the section is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Populate class and section dropdowns
    const attendanceData = JSON.parse(localStorage.getItem('attendanceData')) || [];
    const classes = new Set();
    const sections = new Set();
    
    attendanceData.forEach(record => {
        classes.add(record.class);
        sections.add(record.section);
    });
    
    const classSelect = document.getElementById('analyticsClass');
    const sectionSelect = document.getElementById('analyticsSection');
    
    classes.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = getClassName(className);
        classSelect.appendChild(option);
    });
    
    sections.forEach(section => {
        const option = document.createElement('option');
        option.value = section;
        option.textContent = section;
        sectionSelect.appendChild(option);
    });
    
    // Initial update of analytics
    updateAttendanceAnalytics();
}); 
// Academic Results Functions
let classPerformanceChart = null;
let subjectMarksChart = null;
let performanceDistributionChart = null;

// Function to update results graphs
function updateResultsGraphs() {
    const selectedClass = document.getElementById('resultClass').value;
    const selectedSection = document.getElementById('resultSection').value;
    const selectedPeriod = document.getElementById('resultPeriod').value;

    console.log('Updating results graphs with:', {
        class: selectedClass,
        section: selectedSection,
        period: selectedPeriod
    });

    // Reset all statistics to 0 initially
    document.getElementById('classAverage').textContent = '0%';
    document.getElementById('performanceTrend').textContent = '0%';
    document.getElementById('topPerformers').textContent = '0';
    document.getElementById('needsImprovement').textContent = '0';

    // If no class or section is selected, show empty charts
    if (!selectedClass || !selectedSection) {
        showEmptyCharts();
        return;
    }

    // Get marks data from localStorage
    const marksData = JSON.parse(localStorage.getItem('marksData')) || [];
    console.log('Retrieved marks data:', marksData);
    
    // Filter data based on selections
    const filteredData = marksData.filter(record => {
        const classMatch = record.class === selectedClass;
        const sectionMatch = record.section === selectedSection;
        const dateMatch = isWithinPeriod(record.date, selectedPeriod);
        return classMatch && sectionMatch && dateMatch;
    });

    console.log('Filtered marks data:', filteredData);

    if (filteredData.length === 0) {
        showToast('No marks data available for the selected filters', 'warning');
        showEmptyCharts();
        return;
    }

    // Update charts and statistics
    updateClassPerformanceChart(filteredData);
    updateSubjectMarksChart(filteredData);
    updatePerformanceDistributionChart(filteredData);
    updateSummaryStats(filteredData);
    updateDetailedResultsTable(filteredData);
}

function showEmptyCharts() {
    // Clear existing charts
    if (classPerformanceChart) classPerformanceChart.destroy();
    if (subjectMarksChart) subjectMarksChart.destroy();
    if (performanceDistributionChart) performanceDistributionChart.destroy();

    // Create empty charts
    const emptyChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Select Program and Section to View Data'
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    };

    // Empty class performance chart
    const classCtx = document.getElementById('classPerformanceChart').getContext('2d');
    classPerformanceChart = new Chart(classCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: []
        },
        options: emptyChartOptions
    });

    // Empty subject marks chart
    const subjectCtx = document.getElementById('subjectMarksChart').getContext('2d');
    subjectMarksChart = new Chart(subjectCtx, {
        type: 'bar',
        data: {
            labels: [],
            datasets: []
        },
        options: emptyChartOptions
    });

    // Empty performance distribution chart
    const distCtx = document.getElementById('performanceDistributionChart').getContext('2d');
    performanceDistributionChart = new Chart(distCtx, {
        type: 'doughnut',
        data: {
            labels: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
            datasets: [{
                data: [0, 0, 0, 0, 0, 0, 0, 0],
                backgroundColor: [
                    '#4CAF50', // A+
                    '#8BC34A', // A
                    '#CDDC39', // B+
                    '#FFEB3B', // B
                    '#FFC107', // C+
                    '#FF9800', // C
                    '#FF5722', // D
                    '#F44336'  // F
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Select Program and Section to View Data'
                }
            }
        }
    });

    // Clear detailed results table
    const tbody = document.getElementById('detailedResultsBody');
    tbody.innerHTML = '';
}

// Function to check if a date is within the selected period
function isWithinPeriod(date, period) {
    const recordDate = new Date(date);
    const now = new Date();
    const daysDiff = Math.floor((now - recordDate) / (1000 * 60 * 60 * 24));
    return daysDiff <= parseInt(period);
}

// Function to get class name
function getClassName(classValue) {
    const programNames = {
        '1': 'Primary',
        '2': 'Secondary',
        '3': 'Pre Primary',
        '4': 'Pre Vocational',
        '5': 'Vocational',
        '6': 'Early Intervention Center',
        '7': 'Learning Center',
        '8': 'Sheltered Work Shop'
    };
    return programNames[classValue] || classValue;
}

// Function to update class performance chart
function updateClassPerformanceChart(data) {
    const ctx = document.getElementById('classPerformanceChart').getContext('2d');
    
    // Clear existing chart
    if (classPerformanceChart) {
        classPerformanceChart.destroy();
    }
    
    // Group data by class
    const classData = {};
    data.forEach(record => {
        if (!classData[record.class]) {
            classData[record.class] = {
                total: 0,
                count: 0
            };
        }
        classData[record.class].total += parseFloat(record.marks);
        classData[record.class].count++;
    });

    // Calculate averages
    const labels = Object.keys(classData).sort();
    const averages = labels.map(cls => 
        (classData[cls].total / classData[cls].count).toFixed(2)
    );

    classPerformanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels.map(cls => getClassName(cls)),
            datasets: [{
                label: 'Average Marks',
                data: averages,
                backgroundColor: 'rgba(76, 175, 80, 0.7)',
                borderColor: '#388E3C',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Average Marks',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        stepSize: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Program-wise Performance',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

// Function to update subject marks chart
function updateSubjectMarksChart(data) {
    const ctx = document.getElementById('subjectMarksChart').getContext('2d');
    
    // Clear existing chart
    if (subjectMarksChart) {
        subjectMarksChart.destroy();
    }
    
    // Group data by subject
    const subjectData = {};
    data.forEach(record => {
        if (!subjectData[record.subject]) {
            subjectData[record.subject] = {
                total: 0,
                count: 0
            };
        }
        subjectData[record.subject].total += parseFloat(record.marks);
        subjectData[record.subject].count++;
    });

    // Calculate averages
    const labels = Object.keys(subjectData);
    const averages = labels.map(subject => 
        (subjectData[subject].total / subjectData[subject].count).toFixed(2)
    );

    subjectMarksChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Average Marks',
                data: averages,
                backgroundColor: 'rgba(33, 150, 243, 0.7)',
                borderColor: '#1976D2',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Average Marks',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        stepSize: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Subject-wise Performance',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    display: false
                }
            }
        }
    });
}

// Function to update performance distribution chart
function updatePerformanceDistributionChart(data) {
    const ctx = document.getElementById('performanceDistributionChart').getContext('2d');
    
    // Clear existing chart
    if (performanceDistributionChart) {
        performanceDistributionChart.destroy();
    }
    
    // Calculate grade distribution
    const distribution = {
        'A+': 0,
        'A': 0,
        'B+': 0,
        'B': 0,
        'C+': 0,
        'C': 0,
        'D': 0,
        'F': 0
    };

    data.forEach(record => {
        const marks = parseFloat(record.marks);
        if (marks >= 90) distribution['A+']++;
        else if (marks >= 80) distribution['A']++;
        else if (marks >= 70) distribution['B+']++;
        else if (marks >= 60) distribution['B']++;
        else if (marks >= 50) distribution['C+']++;
        else if (marks >= 40) distribution['C']++;
        else if (marks >= 30) distribution['D']++;
        else distribution['F']++;
    });

    performanceDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(distribution),
            datasets: [{
                data: Object.values(distribution),
                backgroundColor: [
                    'rgba(76, 175, 80, 0.8)',  // A+
                    'rgba(139, 195, 74, 0.8)',  // A
                    'rgba(205, 220, 57, 0.8)',  // B+
                    'rgba(255, 235, 59, 0.8)',  // B
                    'rgba(255, 193, 7, 0.8)',   // C+
                    'rgba(255, 152, 0, 0.8)',   // C
                    'rgba(255, 87, 34, 0.8)',   // D
                    'rgba(244, 67, 54, 0.8)'    // F
                ],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Grade Distribution',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                },
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });
}

// Function to update summary statistics
function updateSummaryStats(data) {
    // Calculate average marks
    const totalMarks = data.reduce((sum, record) => sum + parseFloat(record.marks), 0);
    const averageMarks = (totalMarks / data.length).toFixed(2);
    
    // Calculate performance trend
    const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
    const firstHalf = sortedData.slice(0, Math.floor(sortedData.length / 2));
    const secondHalf = sortedData.slice(Math.floor(sortedData.length / 2));
    
    const firstHalfAvg = firstHalf.reduce((sum, record) => sum + parseFloat(record.marks), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, record) => sum + parseFloat(record.marks), 0) / secondHalf.length;
    const trend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100).toFixed(2);
    
    // Calculate top performers and needs improvement
    const topPerformers = data.filter(record => parseFloat(record.marks) >= 80).length;
    const needsImprovement = data.filter(record => parseFloat(record.marks) < 40).length;
    
    // Update statistics display
    document.getElementById('classAverage').textContent = `${averageMarks}%`;
    document.getElementById('performanceTrend').textContent = `${trend}%`;
    document.getElementById('topPerformers').textContent = topPerformers;
    document.getElementById('needsImprovement').textContent = needsImprovement;
}

// Function to update detailed results table
function updateDetailedResultsTable(data) {
    const tbody = document.getElementById('detailedResultsBody');
    tbody.innerHTML = '';
    
    data.forEach(record => {
        const row = document.createElement('tr');
        const grade = getGrade(parseFloat(record.marks));
        
        row.innerHTML = `
            <td>${record.studentId}</td>
            <td>${record.studentName}</td>
            <td>${record.class}</td>
            <td>${record.section}</td>
            <td>${record.subject}</td>
            <td>${record.marks}</td>
            <td>${grade}</td>
        `;
        
        tbody.appendChild(row);
    });
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

// Initialize results when the section is loaded
document.addEventListener('DOMContentLoaded', function() {
    const examsSection = document.getElementById('exams');
    if (examsSection) {
        console.log('Initializing exams section...');
        updateResultsGraphs();
    }
}); 
// Initialize sample data for the admin dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize marks data if not exists
    if (!localStorage.getItem('marksData')) {
        const sampleMarksData = [
            {
                studentId: '1',
                studentName: 'John Doe',
                class: '1',
                section: 'A',
                subject: 'Mathematics',
                marks: '85',
                date: '2023-04-10'
            },
            {
                studentId: '1',
                studentName: 'John Doe',
                class: '1',
                section: 'A',
                subject: 'Science',
                marks: '92',
                date: '2023-04-12'
            },
            {
                studentId: '1',
                studentName: 'John Doe',
                class: '1',
                section: 'A',
                subject: 'English',
                marks: '78',
                date: '2023-04-14'
            },
            {
                studentId: '1',
                studentName: 'John Doe',
                class: '1',
                section: 'A',
                subject: 'History',
                marks: '88',
                date: '2023-04-16'
            },
            {
                studentId: '2',
                studentName: 'Jane Smith',
                class: '2',
                section: 'B',
                subject: 'Mathematics',
                marks: '90',
                date: '2023-04-10'
            },
            {
                studentId: '2',
                studentName: 'Jane Smith',
                class: '2',
                section: 'B',
                subject: 'Science',
                marks: '95',
                date: '2023-04-12'
            },
            {
                studentId: '3',
                studentName: 'Michael Johnson',
                class: '3',
                section: 'A',
                subject: 'Mathematics',
                marks: '72',
                date: '2023-04-10'
            },
            {
                studentId: '4',
                studentName: 'Emily Wilson',
                class: '1',
                section: 'B',
                subject: 'Mathematics',
                marks: '80',
                date: '2023-04-10'
            }
        ];
        localStorage.setItem('marksData', JSON.stringify(sampleMarksData));
    }

    // Initialize attendance data if not exists
    if (!localStorage.getItem('attendanceData')) {
        const sampleAttendanceData = [
            {
                date: '2023-05-01',
                class: '1',
                section: 'A',
                markedBy: 'Mr. Smith',
                students: [
                    { id: '1', status: 'Present' },
                    { id: '2', status: 'Present' },
                    { id: '3', status: 'Absent' },
                    { id: '4', status: 'Present' }
                ]
            },
            {
                date: '2023-05-02',
                class: '1',
                section: 'A',
                markedBy: 'Ms. Johnson',
                students: [
                    { id: '1', status: 'Present' },
                    { id: '2', status: 'Absent' },
                    { id: '3', status: 'Present' },
                    { id: '4', status: 'Late' }
                ]
            },
            {
                date: '2023-05-03',
                class: '1',
                section: 'A',
                markedBy: 'Mr. Smith',
                students: [
                    { id: '1', status: 'Present' },
                    { id: '2', status: 'Present' },
                    { id: '3', status: 'Present' },
                    { id: '4', status: 'Present' }
                ]
            },
            {
                date: '2023-05-04',
                class: '1',
                section: 'A',
                markedBy: 'Ms. Johnson',
                students: [
                    { id: '1', status: 'Absent' },
                    { id: '2', status: 'Present' },
                    { id: '3', status: 'Present' },
                    { id: '4', status: 'Present' }
                ]
            },
            {
                date: '2023-05-05',
                class: '1',
                section: 'A',
                markedBy: 'Mr. Smith',
                students: [
                    { id: '1', status: 'Present' },
                    { id: '2', status: 'Present' },
                    { id: '3', status: 'Late' },
                    { id: '4', status: 'Present' }
                ]
            }
        ];
        localStorage.setItem('attendanceData', JSON.stringify(sampleAttendanceData));
    }

    // Initialize teachers data if not exists
    if (!localStorage.getItem('teachersData')) {
        const sampleTeachersData = [
            {
                id: '1',
                name: 'Mr. Johnson',
                department: 'Mathematics',
                subjects: ['Mathematics'],
                classes: ['1', '2'],
                sections: ['A', 'B']
            },
            {
                id: '2',
                name: 'Ms. Williams',
                department: 'Science',
                subjects: ['Science', 'Physics'],
                classes: ['1', '2'],
                sections: ['A', 'B']
            }
        ];
        localStorage.setItem('teachersData', JSON.stringify(sampleTeachersData));
    }

    // Initialize students data if not exists
    if (!localStorage.getItem('students')) {
        const sampleStudents = [
            {
                id: '1',
                name: 'John Doe',
                class: '1',
                section: 'A',
                email: 'john@example.com',
                username: 'john',
                password: 'student123'
            },
            {
                id: '2',
                name: 'Jane Smith',
                class: '2',
                section: 'B',
                email: 'jane@example.com',
                username: 'jane',
                password: 'student123'
            },
            {
                id: '3',
                name: 'Michael Johnson',
                class: '3',
                section: 'A',
                email: 'michael@example.com',
                username: 'michael',
                password: 'student123'
            },
            {
                id: '4',
                name: 'Emily Wilson',
                class: '1',
                section: 'B',
                email: 'emily@example.com',
                username: 'emily',
                password: 'student123'
            }
        ];
        localStorage.setItem('students', JSON.stringify(sampleStudents));
    }

    // Initialize course videos data if not exists
    if (!localStorage.getItem('courseVideos')) {
        const sampleVideos = [
            {
                id: 'v1',
                title: 'Introduction to Mathematics',
                description: 'Basic concepts and fundamentals of mathematics for beginners',
                subject: 'mathematics',
                targetClass: '1',
                section: 'A',
                duration: '20',
                tags: ['introduction', 'basics', 'fundamentals'],
                uploadDate: new Date().toISOString(),
                thumbnail: 'https://via.placeholder.com/320x180?text=Math+Video'
            },
            {
                id: 'v2',
                title: 'Science Experiments for Primary',
                description: 'Interactive science experiments for primary students',
                class: '1',
                subject: 'Science',
                teacher: 'John Doe',
                date: '2024-03-15',
                duration: '45 minutes',
                videoUrl: 'https://example.com/video1.mp4'
            },
            {
                id: 'v3',
                title: 'English Grammar Basics',
                description: 'Learn the basics of English grammar with easy examples',
                subject: 'english',
                targetClass: '1',
                section: '',  // Available for all sections
                duration: '15',
                tags: ['grammar', 'basics', 'language'],
                uploadDate: new Date().toISOString(),
                thumbnail: 'https://via.placeholder.com/320x180?text=English+Video'
            },
            {
                id: 'v4',
                title: 'Advanced Mathematics',
                description: 'Complex math concepts for higher grades',
                subject: 'mathematics',
                targetClass: '2',
                section: 'B',
                duration: '30',
                tags: ['advanced', 'algebra', 'geometry'],
                uploadDate: new Date().toISOString(),
                thumbnail: 'https://via.placeholder.com/320x180?text=Advanced+Math'
            }
        ];
        localStorage.setItem('courseVideos', JSON.stringify(sampleVideos));
    }

    // Initialize health assessments data if not exists
    if (!localStorage.getItem('healthAssessments')) {
        const sampleHealthAssessments = [
            {
                date: '2023-04-15',
                class: '1',
                section: 'A',
                assessments: [
                    {
                        studentId: '1',
                        studentName: 'John Doe',
                        mentalHealth: 'good',
                        physicalHealth: 'excellent',
                        remarks: 'Student is doing well overall. Participates actively in class.'
                    },
                    {
                        studentId: '2',
                        studentName: 'Jane Smith',
                        mentalHealth: 'excellent',
                        physicalHealth: 'good',
                        remarks: 'Excellent academic progress. Should engage more in physical activities.'
                    },
                    {
                        studentId: '3',
                        studentName: 'Michael Johnson',
                        mentalHealth: 'fair',
                        physicalHealth: 'good',
                        remarks: 'Shows signs of stress. Recommend counseling session.'
                    },
                    {
                        studentId: '4',
                        studentName: 'Emily Wilson',
                        mentalHealth: 'good',
                        physicalHealth: 'fair',
                        remarks: 'Needs more physical activity. Consider additional sports.'
                    }
                ]
            },
            {
                date: '2023-05-15',
                class: '1',
                section: 'A',
                assessments: [
                    {
                        studentId: '1',
                        studentName: 'John Doe',
                        mentalHealth: 'excellent',
                        physicalHealth: 'excellent',
                        remarks: 'Significant improvement in overall health. Keep up the good work!'
                    },
                    {
                        studentId: '2',
                        studentName: 'Jane Smith',
                        mentalHealth: 'excellent',
                        physicalHealth: 'excellent',
                        remarks: 'Excellent progress in both mental and physical health.'
                    },
                    {
                        studentId: '3',
                        studentName: 'Michael Johnson',
                        mentalHealth: 'good',
                        physicalHealth: 'good',
                        remarks: 'Improving mental health. Continue with current activities.'
                    },
                    {
                        studentId: '4',
                        studentName: 'Emily Wilson',
                        mentalHealth: 'good',
                        physicalHealth: 'good',
                        remarks: 'Improvement in physical health. Continue regular exercise.'
                    }
                ]
            }
        ];
        localStorage.setItem('healthAssessments', JSON.stringify(sampleHealthAssessments));
    }

    console.log('Sample data initialized successfully');
}); 
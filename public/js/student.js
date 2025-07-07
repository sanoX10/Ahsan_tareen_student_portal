// js/student.js
// Handles student dashboard functionalities: viewing profile and grades, downloading transcript, and profile updates.

// BASE_URL and utility functions are defined globally by app.js and accessed via window.

document.addEventListener('DOMContentLoaded', () => {
    const studentProfileDetails = document.getElementById('student-profile-details');
    const studentGradesTableBody = document.getElementById('student-grades-table-body');
    const studentEnrolledCoursesTableBody = document.getElementById('student-enrolled-courses-table-body');
    const downloadTranscriptBtn = document.getElementById('download-transcript-btn');
    const editStudentProfileBtn = document.getElementById('edit-student-profile-btn');

    // Student Profile Edit Modal elements
    const studentProfileEditModal = document.getElementById('student-profile-edit-modal');
    const studentProfileEditForm = document.getElementById('student-profile-edit-form');
    const cancelStudentProfileEditModalBtn = document.getElementById('cancel-student-profile-edit-modal-btn');
    const editStudentName = document.getElementById('edit-student-name');
    const editStudentEmail = document.getElementById('edit-student-email');
    const editStudentDob = document.getElementById('edit-student-dob');
    const editStudentAddress = document.getElementById('edit-student-address');
    const editStudentContact = document.getElementById('edit-student-contact');
    const editStudentPassword = document.getElementById('edit-student-password');


    let studentProfileData = null; // Store student profile for transcript and editing
    let studentGradesData = []; // Store student grades for transcript
    let studentEnrolledCourses = []; // Store enrolled courses

    // --- Data Fetching Functions ---

    async function fetchStudentProfile() {
        window.showLoading();
        console.log('Fetching student profile...');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.showMessage('Authentication token not found. Please log in.', 'error');
                window.hideLoading();
                return;
            }
            const response = await fetch(`${window.BASE_URL}/student/profile`, {
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to fetch student profile:', response.status, errorData);
                window.showMessage(errorData.msg || 'Failed to fetch student profile', 'error');
                return;
            }

            const profile = await response.json();
            console.log('Student profile fetched successfully:', profile);
            studentProfileData = profile;
            renderStudentProfile(profile);
        } catch (error) {
            console.error('Error fetching student profile:', error);
            window.showMessage('Network error while fetching profile. Check console for details.', 'error');
        } finally {
            window.hideLoading();
        }
    }

    async function fetchStudentGrades() {
        window.showLoading();
        console.log('Fetching student grades...');
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.showMessage('Authentication token not found. Please log in.', 'error');
                window.hideLoading();
                return;
            }
            const response = await fetch(`${window.BASE_URL}/student/grades`, {
                headers: { 'x-auth-token': token }
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to fetch grades:', response.status, errorData);
                window.showMessage(errorData.msg || 'Failed to fetch grades', 'error');
                return;
            }

            const grades = await response.json();
            console.log('Student grades fetched successfully:', grades);
            studentGradesData = grades;
            renderStudentGradesTable(grades);
            determineEnrolledCourses(grades);
        } catch (error) {
            console.error('Error fetching student grades:', error);
            window.showMessage('Network error while fetching grades. Check console for details.', 'error');
        } finally {
            window.hideLoading();
        }
    }

    // --- Render Functions ---

    function renderStudentProfile(profile) {
        studentProfileDetails.innerHTML = `
            <p><strong>Student ID:</strong> ${profile.studentUniqueId || 'N/A'}</p>
            <p><strong>Name:</strong> ${profile.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${profile.email || 'N/A'}</p>
            <p><strong>Date of Birth:</strong> ${profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Address:</strong> ${profile.address || 'N/A'}</p>
            <p><strong>Contact:</strong> ${profile.contactNumber || 'N/A'}</p>
        `;
    }

    function renderStudentGradesTable(grades) {
        studentGradesTableBody.innerHTML = '';
        if (grades.length === 0) {
            studentGradesTableBody.innerHTML = '<tr><td colspan="5" class="table-data text-center text-gray-500">No grades recorded yet.</td></tr>';
            return;
        }
        grades.forEach(grade => {
            const row = studentGradesTableBody.insertRow();
            row.innerHTML = `
                <td class="table-data">${grade.course?.courseCode || 'N/A'}</td>
                <td class="table-data">${grade.course?.courseName || 'N/A'}</td>
                <td class="table-data">${grade.course?.credits || 'N/A'}</td>
                <td class="table-data">${grade.score || 'N/A'}</td>
                <td class="table-data font-bold">${grade.gradeLetter || 'N/A'}</td>
            `;
        });
    }

    function determineEnrolledCourses(grades) {
        const enrolledCoursesMap = new Map();
        grades.forEach(grade => {
            if (grade.course && !enrolledCoursesMap.has(grade.course._id)) {
                enrolledCoursesMap.set(grade.course._id, {
                    courseCode: grade.course.courseCode,
                    courseName: grade.course.courseName,
                    credits: grade.course.credits
                });
            }
        });
        studentEnrolledCourses = Array.from(enrolledCoursesMap.values());
        renderEnrolledCoursesTable(studentEnrolledCourses);
    }

    function renderEnrolledCoursesTable(courses) {
        studentEnrolledCoursesTableBody.innerHTML = '';
        if (courses.length === 0) {
            studentEnrolledCoursesTableBody.innerHTML = '<tr><td colspan="3" class="table-data text-center text-gray-500">Not currently enrolled in any courses with grades.</td></tr>';
            return;
        }
        courses.forEach(course => {
            const row = studentEnrolledCoursesTableBody.insertRow();
            row.innerHTML = `
                <td class="table-data">${course.courseCode}</td>
                <td class="table-data">${course.courseName}</td>
                <td class="table-data">${course.credits}</td>
            `;
        });
    }

    // --- Profile Update Functionality ---

    editStudentProfileBtn.addEventListener('click', () => {
        if (studentProfileData) {
            editStudentName.value = studentProfileData.name || '';
            editStudentEmail.value = studentProfileData.email || '';
            editStudentDob.value = studentProfileData.dateOfBirth ? new Date(studentProfileData.dateOfBirth).toISOString().split('T')[0] : '';
            editStudentAddress.value = studentProfileData.address || '';
            editStudentContact.value = studentProfileData.contactNumber || '';
            editStudentPassword.value = ''; // Always clear password field for security
            studentProfileEditModal.classList.remove('hidden');
        } else {
            window.showMessage('Student profile data not loaded. Please refresh.', 'error');
        }
    });

    cancelStudentProfileEditModalBtn.addEventListener('click', () => {
        studentProfileEditModal.classList.add('hidden');
        // Clear any previous error messages if applicable
        document.getElementById('student-profile-edit-message')?.remove();
    });

    studentProfileEditForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        window.showLoading();
        console.log('Attempting to save student profile changes...');

        const updatedProfile = {
            name: editStudentName.value.trim(),
            email: editStudentEmail.value.trim(),
            dateOfBirth: editStudentDob.value,
            address: editStudentAddress.value.trim(),
            contactNumber: editStudentContact.value.trim(),
        };

        // Only include password if it's not empty and has length
        if (editStudentPassword.value.trim().length > 0) {
            updatedProfile.password = editStudentPassword.value.trim();
        }

        console.log('Data to be sent for update:', updatedProfile);

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                window.showMessage('Authentication token not found. Please log in.', 'error');
                window.hideLoading();
                return;
            }

            const response = await fetch(`${window.BASE_URL}/student/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(updatedProfile)
            });

            const result = await response.json();
            console.log('Response from profile update:', result);

            if (response.ok) {
                window.showMessage('Profile updated successfully!', 'success');
                studentProfileEditModal.classList.add('hidden');
                fetchStudentProfile(); // Re-fetch profile to show updated data
            } else {
                // Display specific validation errors from backend if available
                if (result.errors && Array.isArray(result.errors) && result.errors.length > 0) {
                    const errorMsgs = result.errors.map(err => err.msg).join(', ');
                    window.showMessage(`Validation Error: ${errorMsgs}`, 'error');
                    console.error('Backend validation errors:', result.errors);
                } else {
                    window.showMessage(result.msg || 'Failed to update profile.', 'error');
                }
            }
        } catch (error) {
            console.error('Error during student profile update:', error);
            window.showMessage('Network error or unexpected response. Check console for details.', 'error');
        } finally {
            window.hideLoading();
        }
    });


    // --- Transcript Generation ---

    downloadTranscriptBtn.addEventListener('click', generateTranscriptPDF);

    async function generateTranscriptPDF() {
        console.log('--- Attempting Transcript Download ---');
        console.log('Student Profile Data for PDF:', studentProfileData);
        console.log('Student Grades Data for PDF:', studentGradesData);

        if (!studentProfileData) {
            window.showMessage('Student profile data is not loaded. Please ensure you are logged in and profile details are visible.', 'info');
            console.error('Transcript generation failed: Student profile data is missing.');
            return;
        }

        window.showLoading();

        try {
            const { jsPDF } = window.jspdf;
            if (!jsPDF) {
                console.error('jsPDF library not found. Check if the CDN script is loaded correctly in index.html.');
                window.showMessage('PDF generation library not loaded. Please try again or contact support.', 'error');
                return;
            }
            const doc = new jsPDF();
            console.log('jsPDF instance created.');

            const margin = 15;
            let y = margin;
            const lineHeight = 7;

            // Header
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('Academic Transcript', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
            y += lineHeight * 2;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('Student Management System', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
            y += lineHeight;
            doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
            y += lineHeight;

            // Student Information
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Student Information:', margin, y);
            y += lineHeight;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Student ID: ${studentProfileData.studentUniqueId || 'N/A'}`, margin, y); y += lineHeight;
            doc.text(`Name: ${studentProfileData.name || 'N/A'}`, margin, y); y += lineHeight;
            doc.text(`Email: ${studentProfileData.email || 'N/A'}`, margin, y); y += lineHeight;
            doc.text(`Date of Birth: ${studentProfileData.dateOfBirth ? new Date(studentProfileData.dateOfBirth).toLocaleDateString() : 'N/A'}`, margin, y); y += lineHeight;
            doc.text(`Contact: ${studentProfileData.contactNumber || 'N/A'}`, margin, y); y += lineHeight;
            doc.text(`Address: ${studentProfileData.address || 'N/A'}`, margin, y); y += lineHeight * 2;

            doc.line(margin, y, doc.internal.pageSize.getWidth() - margin, y);
            y += lineHeight;

            // Grades Information
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Academic Record:', margin, y);
            y += lineHeight;

            const headers = [['Course Code', 'Course Name', 'Credits', 'Score', 'Grade']];
            const data = studentGradesData.map(grade => [
                grade.course?.courseCode || 'N/A',
                grade.course?.courseName || 'N/A',
                (grade.course?.credits || 0).toString(),
                (grade.score || 'N/A').toString(),
                grade.gradeLetter || 'N/A'
            ]);

            let totalCredits = 0;
            let totalGradePoints = 0;
            studentGradesData.forEach(grade => {
                const credits = grade.course?.credits || 0;
                let gradePoint = 0;
                switch (grade.gradeLetter) {
                    case 'A+': case 'A': gradePoint = 4.0; break;
                    case 'A-': gradePoint = 3.7; break;
                    case 'B+': gradePoint = 3.3; break;
                    case 'B': gradePoint = 3.0; break;
                    case 'B-': gradePoint = 2.7; break;
                    case 'C+': gradePoint = 2.3; break;
                    case 'C': gradePoint = 2.0; break;
                    case 'C-': gradePoint = 1.7; break;
                    case 'D': gradePoint = 1.0; break;
                    case 'F': gradePoint = 0.0; break;
                    default: gradePoint = 0.0;
                }
                totalCredits += credits;
                totalGradePoints += (gradePoint * credits);
            });

            const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 'N/A';

            console.log('Attempting to generate autoTable...');
            doc.autoTable({
                startY: y,
                head: headers,
                body: data,
                theme: 'striped',
                styles: { fontSize: 10, cellPadding: 2, overflow: 'linebreak' },
                headStyles: { fillColor: [20, 83, 136], textColor: 255, fontStyle: 'bold' },
                columnStyles: {
                    0: { cellWidth: 30 },
                    1: { cellWidth: 60 },
                    2: { cellWidth: 20, halign: 'center' },
                    3: { cellWidth: 20, halign: 'center' },
                    4: { cellWidth: 20, halign: 'center' }
                },
                margin: { left: margin, right: margin },
                didDrawPage: function (data) {
                    let pageHeight = doc.internal.pageSize.height;
                    doc.setFontSize(8);
                    doc.text(`Page ${doc.internal.getNumberOfPages()}`, doc.internal.pageSize.getWidth() - margin, pageHeight - 10, { align: 'right' });
                    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, pageHeight - 10);
                }
            });
            console.log('autoTable generated.');

            y = doc.autoTable.previous.finalY + lineHeight;

            // Summary
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total Credits Earned: ${totalCredits}`, margin, y); y += lineHeight;
            doc.text(`Cumulative GPA: ${gpa}`, margin, y); y += lineHeight * 2;

            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text('This is an official academic transcript of Student Management System.', margin, y);
            y += lineHeight;
            doc.text('For verification, please contact the administration office.', margin, y);

            console.log('Attempting to save PDF...');
            doc.save(`${studentProfileData.name}_Transcript.pdf`);
            console.log('PDF save initiated.');
            window.showMessage('Transcript downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error during PDF generation or download:', error);
            window.showMessage('Failed to generate or download transcript. Check console for details.', 'error');
        } finally {
            window.hideLoading();
        }
    }

    // Initial load for student dashboard
    window.loadStudentData = () => {
        fetchStudentProfile();
        fetchStudentGrades();
    };
});
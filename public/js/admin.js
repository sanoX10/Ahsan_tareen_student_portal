// js/admin.js
// Handles admin dashboard functionalities: Student, Course, and Grade management.

// BASE_URL and utility functions are defined globally by app.js and accessed via window.

document.addEventListener('DOMContentLoaded', () => {
    // Admin Dashboard UI Elements
    const adminStudentsPanel = document.getElementById('admin-students-panel');
    const adminCoursesPanel = document.getElementById('admin-courses-panel');
    const adminGradesPanel = document.getElementById('admin-grades-panel');

    const showStudentsBtn = document.getElementById('show-students-btn');
    const showCoursesBtn = document.getElementById('show-courses-btn');
    const showGradesBtn = document.getElementById('show-grades-btn');

    // Table bodies
    const studentsTableBody = document.getElementById('students-table-body');
    const coursesTableBody = document.getElementById('courses-table-body');
    const gradesTableBody = document.getElementById('grades-table-body');

    // Modals and Forms
    const addStudentModalBtn = document.getElementById('add-student-modal-btn');
    const studentModalTitle = document.getElementById('student-modal-title');
    const studentForm = document.getElementById('student-form');
    const studentPasswordGroup = document.getElementById('student-password-group');
    const saveStudentBtn = document.getElementById('save-student-btn');
    const cancelStudentModalBtn = document.getElementById('cancel-student-modal-btn');

    const addCourseModalBtn = document.getElementById('add-course-modal-btn');
    const courseModalTitle = document.getElementById('course-modal-title');
    const courseForm = document.getElementById('course-form');
    const saveCourseBtn = document.getElementById('save-course-btn');
    const cancelCourseModalBtn = document.getElementById('cancel-course-modal-btn');

    const addGradeModalBtn = document.getElementById('add-grade-modal-btn');
    const gradeModalTitle = document.getElementById('grade-modal-title');
    const gradeForm = document.getElementById('grade-form');
    const gradeStudentSelect = document.getElementById('grade-student');
    const gradeCourseSelect = document.getElementById('grade-course');
    const saveGradeBtn = document.getElementById('save-grade-btn');
    const cancelGradeModalBtn = document.getElementById('cancel-grade-modal-btn');

    let currentStudentId = null; // For editing students
    let currentCourseId = null; // For editing courses
    let currentGradeId = null; // For editing grades

    // --- Panel Switching ---
    function showPanel(panel) {
        adminStudentsPanel.classList.add('hidden');
        adminCoursesPanel.classList.add('hidden');
        adminGradesPanel.classList.add('hidden');
        panel.classList.remove('hidden');
    }

    showStudentsBtn.addEventListener('click', () => {
        showPanel(adminStudentsPanel);
        fetchStudents();
    });
    showCoursesBtn.addEventListener('click', () => {
        showPanel(adminCoursesPanel);
        fetchCourses();
    });
    showGradesBtn.addEventListener('click', () => {
        showPanel(adminGradesPanel);
        fetchGrades();
    });

    // --- Data Fetching Functions ---

    async function fetchStudents() {
        window.showLoading();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${window.BASE_URL}/admin/students`, {
                headers: { 'x-auth-token': token }
            });
            const students = await response.json();
            if (response.ok) {
                renderStudentsTable(students);
            } else {
                window.showMessage(students.msg || 'Failed to fetch students', 'error');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            window.showMessage('Network error while fetching students.', 'error');
        } finally {
            window.hideLoading();
        }
    }

    async function fetchCourses() {
        window.showLoading();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${window.BASE_URL}/admin/courses`, {
                headers: { 'x-auth-token': token }
            });
            const courses = await response.json();
            if (response.ok) {
                renderCoursesTable(courses);
            } else {
                window.showMessage(courses.msg || 'Failed to fetch courses', 'error');
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            window.showMessage('Network error while fetching courses.', 'error');
        } finally {
            window.hideLoading();
        }
    }

    async function fetchGrades() {
        window.showLoading();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${window.BASE_URL}/admin/grades`, {
                headers: { 'x-auth-token': token }
            });
            const grades = await response.json();
            if (response.ok) {
                renderGradesTable(grades);
            } else {
                window.showMessage(grades.msg || 'Failed to fetch grades', 'error');
            }
        } catch (error) {
            console.error('Error fetching grades:', error);
            window.showMessage('Network error while fetching grades.', 'error');
        } finally {
            window.hideLoading();
        }
    }

    // --- Render Table Functions ---

    function renderStudentsTable(students) {
        studentsTableBody.innerHTML = '';
        if (students.length === 0) {
            studentsTableBody.innerHTML = '<tr><td colspan="5" class="table-data text-center text-gray-500">No students found.</td></tr>';
            return;
        }
        students.forEach(student => {
            const row = studentsTableBody.insertRow();
            row.innerHTML = `
                <td class="table-data font-semibold">${student.studentUniqueId}</td>
                <td class="table-data">${student.name}</td>
                <td class="table-data">${student.email}</td>
                <td class="table-data">${student.contactNumber || 'N/A'}</td>
                <td class="table-data">
                    <button data-id="${student._id}" class="edit-student-btn btn-secondary text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i> Edit</button>
                    <button data-id="${student._id}" class="delete-student-btn btn-danger text-red-600 hover:text-red-800"><i class="fas fa-trash-alt"></i> Delete</button>
                </td>
            `;
        });
        document.querySelectorAll('.edit-student-btn').forEach(button => {
            button.addEventListener('click', (e) => editStudent(e.target.dataset.id));
        });
        document.querySelectorAll('.delete-student-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteStudent(e.target.dataset.id));
        });
    }

    function renderCoursesTable(courses) {
        coursesTableBody.innerHTML = '';
        if (courses.length === 0) {
            coursesTableBody.innerHTML = '<tr><td colspan="4" class="table-data text-center text-gray-500">No courses found.</td></tr>';
            return;
        }
        courses.forEach(course => {
            const row = coursesTableBody.insertRow();
            row.innerHTML = `
                <td class="table-data font-semibold">${course.courseCode}</td>
                <td class="table-data">${course.courseName}</td>
                <td class="table-data">${course.credits}</td>
                <td class="table-data">
                    <button data-id="${course._id}" class="edit-course-btn btn-secondary text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i> Edit</button>
                    <button data-id="${course._id}" class="delete-course-btn btn-danger text-red-600 hover:text-red-800"><i class="fas fa-trash-alt"></i> Delete</button>
                </td>
            `;
        });
        document.querySelectorAll('.edit-course-btn').forEach(button => {
            button.addEventListener('click', (e) => editCourse(e.target.dataset.id));
        });
        document.querySelectorAll('.delete-course-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteCourse(e.target.dataset.id));
        });
    }

    function renderGradesTable(grades) {
        gradesTableBody.innerHTML = '';
        if (grades.length === 0) {
            gradesTableBody.innerHTML = '<tr><td colspan="5" class="table-data text-center text-gray-500">No grades found.</td></tr>';
            return;
        }
        grades.forEach(grade => {
            const row = gradesTableBody.insertRow();
            row.innerHTML = `
                <td class="table-data">${grade.student.name} (${grade.student.studentUniqueId})</td>
                <td class="table-data">${grade.course.courseName} (${grade.course.courseCode})</td>
                <td class="table-data">${grade.score}</td>
                <td class="table-data font-bold">${grade.gradeLetter}</td>
                <td class="table-data">
                    <button data-id="${grade._id}" class="edit-grade-btn btn-secondary text-blue-600 hover:text-blue-800 mr-2"><i class="fas fa-edit"></i> Edit</button>
                    <button data-id="${grade._id}" class="delete-grade-btn btn-danger text-red-600 hover:text-red-800"><i class="fas fa-trash-alt"></i> Delete</button>
                </td>
            `;
        });
        document.querySelectorAll('.edit-grade-btn').forEach(button => {
            button.addEventListener('click', (e) => editGrade(e.target.dataset.id));
        });
        document.querySelectorAll('.delete-grade-btn').forEach(button => {
            button.addEventListener('click', (e) => deleteGrade(e.target.dataset.id));
        });
    }

    // --- Student CRUD Operations ---

    addStudentModalBtn.addEventListener('click', () => {
        studentModalTitle.textContent = 'Add New Student';
        studentForm.reset();
        document.getElementById('student-unique-id').readOnly = false; // Enable editing for new student
        studentPasswordGroup.classList.remove('hidden'); // Show password field for new student
        document.getElementById('student-password').required = true;
        currentStudentId = null;
        window.openModal(studentModal); // Access openModal from window object
    });

    cancelStudentModalBtn.addEventListener('click', () => window.closeModal(studentModal)); // Access closeModal from window object

    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        window.showLoading();
        const formData = new FormData(studentForm);
        const studentData = Object.fromEntries(formData.entries());

        const token = localStorage.getItem('token');
        let response;
        if (currentStudentId) {
            // Update existing student
            response = await fetch(`${window.BASE_URL}/admin/students/${currentStudentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(studentData),
            });
        } else {
            // Create new student
            response = await fetch(`${window.BASE_URL}/admin/students`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(studentData),
            });
        }

        const data = await response.json();
        window.hideLoading();

        if (response.ok) {
            window.showMessage(data.msg, 'success');
            window.closeModal(studentModal);
            fetchStudents(); // Refresh student list
        } else {
            window.showMessage(data.msg || 'Operation failed', 'error');
        }
    });

    async function editStudent(id) {
        window.showLoading();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${window.BASE_URL}/admin/students/${id}`, {
                headers: { 'x-auth-token': token }
            });
            const student = await response.json();
            window.hideLoading();

            if (response.ok) {
                currentStudentId = id;
                studentModalTitle.textContent = 'Edit Student';
                // Populate form fields
                document.getElementById('student-unique-id').value = student.studentUniqueId;
                document.getElementById('student-unique-id').readOnly = true; // Prevent changing unique ID
                document.getElementById('student-name').value = student.name;
                document.getElementById('student-email').value = student.email;
                document.getElementById('student-dob').value = student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '';
                document.getElementById('student-address').value = student.address || '';
                document.getElementById('student-contact').value = student.contactNumber || '';
                studentPasswordGroup.classList.remove('hidden'); // Show password field for editing
                document.getElementById('student-password').value = ''; // Clear password field for security
                document.getElementById('student-password').placeholder = 'Leave blank to keep current password';
                document.getElementById('student-password').required = false; // Password is optional on edit
                window.openModal(studentModal);
            } else {
                window.showMessage(student.msg || 'Student not found', 'error');
            }
        } catch (error) {
            window.hideLoading();
            console.error('Error fetching student for edit:', error);
            window.showMessage('Network error while fetching student data.', 'error');
        }
    }

    async function deleteStudent(id) {
        window.showConfirmModal('Are you sure you want to delete this student? This will also delete their login account and all grades.', async () => {
            window.showLoading();
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${window.BASE_URL}/admin/students/${id}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                const data = await response.json();
                window.hideLoading();

                if (response.ok) {
                    window.showMessage(data.msg, 'success');
                    fetchStudents(); // Refresh student list
                } else {
                    window.showMessage(data.msg || 'Deletion failed', 'error');
                }
            } catch (error) {
                window.hideLoading();
                console.error('Error deleting student:', error);
                window.showMessage('Network error while deleting student.', 'error');
            }
        });
    }

    // --- Course CRUD Operations ---

    addCourseModalBtn.addEventListener('click', () => {
        courseModalTitle.textContent = 'Add New Course';
        courseForm.reset();
        document.getElementById('course-code').readOnly = false; // Enable editing for new course
        currentCourseId = null;
        window.openModal(courseModal);
    });

    cancelCourseModalBtn.addEventListener('click', () => window.closeModal(courseModal));

    courseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        window.showLoading();
        const formData = new FormData(courseForm);
        const courseData = Object.fromEntries(formData.entries());
        courseData.credits = parseInt(courseData.credits); // Ensure credits is a number

        const token = localStorage.getItem('token');
        let response;
        if (currentCourseId) {
            // Update existing course
            response = await fetch(`${window.BASE_URL}/admin/courses/${currentCourseId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(courseData),
            });
        } else {
            // Create new course
            response = await fetch(`${window.BASE_URL}/admin/courses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(courseData),
            });
        }

        const data = await response.json();
        window.hideLoading();

        if (response.ok) {
            window.showMessage(data.msg, 'success');
            window.closeModal(courseModal);
            fetchCourses(); // Refresh course list
        } else {
            window.showMessage(data.msg || 'Operation failed', 'error');
        }
    });

    async function editCourse(id) {
        window.showLoading();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${window.BASE_URL}/admin/courses/${id}`, {
                headers: { 'x-auth-token': token }
            });
            const course = await response.json();
            window.hideLoading();

            if (response.ok) {
                currentCourseId = id;
                courseModalTitle.textContent = 'Edit Course';
                document.getElementById('course-code').value = course.courseCode;
                document.getElementById('course-code').readOnly = true; // Prevent changing course code
                document.getElementById('course-name').value = course.courseName;
                document.getElementById('course-description').value = course.description || '';
                document.getElementById('course-credits').value = course.credits;
                window.openModal(courseModal);
            } else {
                window.showMessage(course.msg || 'Course not found', 'error');
            }
        } catch (error) {
            window.hideLoading();
            console.error('Error fetching course for edit:', error);
            window.showMessage('Network error while fetching course data.', 'error');
        }
    }

    async function deleteCourse(id) {
        window.showConfirmModal('Are you sure you want to delete this course? This will also delete all grades associated with this course.', async () => {
            window.showLoading();
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${window.BASE_URL}/admin/courses/${id}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                const data = await response.json();
                window.hideLoading();

                if (response.ok) {
                    window.showMessage(data.msg, 'success');
                    fetchCourses(); // Refresh course list
                } else {
                    window.showMessage(data.msg || 'Deletion failed', 'error');
                }
            } catch (error) {
                window.hideLoading();
                console.error('Error deleting course:', error);
                window.showMessage('Network error while deleting course.', 'error');
            }
        });
    }

    // --- Grade CRUD Operations ---

    addGradeModalBtn.addEventListener('click', async () => {
        gradeModalTitle.textContent = 'Assign New Grade';
        gradeForm.reset();
        currentGradeId = null;
        await populateGradeDropdowns();
        window.openModal(gradeModal);
    });

    cancelGradeModalBtn.addEventListener('click', () => window.closeModal(gradeModal));

    async function populateGradeDropdowns() {
        window.showLoading();
        try {
            const token = localStorage.getItem('token');
            const [studentsRes, coursesRes] = await Promise.all([
                fetch(`${window.BASE_URL}/admin/students`, { headers: { 'x-auth-token': token } }),
                fetch(`${window.BASE_URL}/admin/courses`, { headers: { 'x-auth-token': token } })
            ]);

            const students = await studentsRes.json();
            const courses = await coursesRes.json();
            window.hideLoading();

            if (studentsRes.ok && coursesRes.ok) {
                gradeStudentSelect.innerHTML = '<option value="">Select a Student</option>';
                students.forEach(student => {
                    const option = document.createElement('option');
                    option.value = student._id;
                    option.textContent = `${student.name} (${student.studentUniqueId})`;
                    gradeStudentSelect.appendChild(option);
                });

                gradeCourseSelect.innerHTML = '<option value="">Select a Course</option>';
                courses.forEach(course => {
                    const option = document.createElement('option');
                    option.value = course._id;
                    option.textContent = `${course.courseName} (${course.courseCode})`;
                    gradeCourseSelect.appendChild(option);
                });
            } else {
                window.showMessage('Failed to load students or courses for grade assignment.', 'error');
            }
        } catch (error) {
            window.hideLoading();
            console.error('Error populating grade dropdowns:', error);
            window.showMessage('Network error while loading student/course data.', 'error');
        }
    }

    gradeForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        window.showLoading();
        const formData = new FormData(gradeForm);
        const gradeData = Object.fromEntries(formData.entries());
        gradeData.score = parseInt(gradeData.score); // Ensure score is a number

        const token = localStorage.getItem('token');
        let response;
        if (currentGradeId) {
            // Update existing grade
            response = await fetch(`${window.BASE_URL}/admin/grades/${currentGradeId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(gradeData),
            });
        } else {
            // Assign new grade
            response = await fetch(`${window.BASE_URL}/admin/grades`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-auth-token': token
                },
                body: JSON.stringify(gradeData),
            });
        }

        const data = await response.json();
        window.hideLoading();

        if (response.ok) {
            window.showMessage(data.msg, 'success');
            window.closeModal(gradeModal);
            fetchGrades(); // Refresh grades list
        } else {
            window.showMessage(data.msg || 'Operation failed', 'error');
        }
    });

    async function editGrade(id) {
        window.showLoading();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${window.BASE_URL}/admin/grades`, { // Fetch all grades to find the one by ID and populate dropdowns
                headers: { 'x-auth-token': token }
            });
            const allGrades = await response.json();
            const gradeToEdit = allGrades.find(g => g._id === id);

            if (!gradeToEdit) {
                window.hideLoading();
                window.showMessage('Grade not found for editing.', 'error');
                return;
            }

            currentGradeId = id;
            gradeModalTitle.textContent = 'Update Grade';
            await populateGradeDropdowns(); // Populate dropdowns first

            // Set selected values
            gradeStudentSelect.value = gradeToEdit.student._id;
            gradeCourseSelect.value = gradeToEdit.course._id;
            document.getElementById('grade-score').value = gradeToEdit.score;

            // Disable dropdowns for editing existing grade (student and course cannot be changed)
            gradeStudentSelect.disabled = true;
            gradeCourseSelect.disabled = true;

            window.openModal(gradeModal);
        } catch (error) {
            window.hideLoading();
            console.error('Error fetching grade for edit:', error);
            window.showMessage('Network error while fetching grade data.', 'error');
        } finally {
            window.hideLoading();
        }
    }

    async function deleteGrade(id) {
        window.showConfirmModal('Are you sure you want to delete this grade?', async () => {
            window.showLoading();
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${window.BASE_URL}/admin/grades/${id}`, {
                    method: 'DELETE',
                    headers: { 'x-auth-token': token }
                });
                const data = await response.json();
                window.hideLoading();

                if (response.ok) {
                    window.showMessage(data.msg, 'success');
                    fetchGrades(); // Refresh grades list
                } else {
                    window.showMessage(data.msg || 'Deletion failed', 'error');
                }
            } catch (error) {
                window.hideLoading();
                console.error('Error deleting grade:', error);
                window.showMessage('Network error while deleting grade.', 'error');
            }
        });
    }

    // Initial load for admin dashboard (default to students panel)
    window.loadAdminData = () => {
        showPanel(adminStudentsPanel);
        fetchStudents();
    };
});

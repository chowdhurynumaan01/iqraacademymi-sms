// public/js/admin-portal.js

// Import necessary functions and variables
import { db, appId, currentUserId, currentUserRole } from './auth.js';
import { getAllStudents, addStudent, updateStudent, deleteStudent, addTeacher, getAllTeachers, addCourse, getAllCourses, addAnnouncement, getAllAnnouncements } from './data-service.js';
import { collection, doc, getDocs, deleteDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// DOM Elements for Admin Portal
const adminPortalModal = document.getElementById('adminPortalModal');
const manageUsersSection = document.getElementById('manageUsersSection');
const studentListBody = document.getElementById('studentListBody');
const addStudentForm = document.getElementById('addStudentForm');
const addStudentBtn = document.getElementById('addStudentBtn');
const studentModal = document.getElementById('studentModal');
const closeStudentModalBtn = document.getElementById('closeStudentModal');
const studentFormTitle = document.getElementById('studentFormTitle');
const studentFormSubmitBtn = document.getElementById('studentFormSubmitBtn');
const studentIdField = document.getElementById('studentIdField'); // Hidden field for editing
const deleteStudentBtn = document.getElementById('deleteStudentBtn'); // Delete button in modal

const csvUploadInput = document.getElementById('csvUploadInput');
const uploadCsvBtn = document.getElementById('uploadCsvBtn');
const csvUploadMessage = document.getElementById('csvUploadMessage');

// Function to initialize the Admin Portal view
export async function setupAdminPortal() {
    console.log("AdminPortal: Setting up Admin Portal.");
    if (adminPortalModal.classList.contains('hidden')) {
        return; // Only setup if the modal is about to be shown
    }
    await loadStudents();
    // Add other initial loads here (e.g., teachers, courses)
}

// --- Student Management Functions ---

/**
 * Loads and displays student data in the Admin Portal table.
 */
async function loadStudents() {
    console.log("AdminPortal: Loading students...");
    studentListBody.innerHTML = '<tr><td colspan="10" class="text-center py-4">Loading students...</td></tr>';
    const students = await getAllStudents(); // Fetch students using data-service
    studentListBody.innerHTML = ''; // Clear loading message

    if (students.length === 0) {
        studentListBody.innerHTML = '<tr><td colspan="10" class="text-center py-4">No students found.</td></tr>';
        return;
    }

    students.forEach(student => {
        const row = document.createElement('tr');
        row.className = 'border-b hover:bg-gray-50';
        row.innerHTML = `
            <td class="py-2 px-1">${student.id}</td>
            <td class="py-2 px-1">${student.firstName || ''} ${student.lastName || ''}</td>
            <td class="py-2 px-1">${student.email || ''}</td>
            <td class="py-2 px-1">${student.programType || ''}</td>
            <td class="py-2 px-1">
                <button data-id="${student.id}" class="edit-student-btn text-blue-600 hover:text-blue-800 text-sm mr-2">Edit</button>
                <button data-id="${student.id}" class="delete-student-btn text-red-600 hover:text-red-800 text-sm">Delete</button>
            </td>
        `;
        studentListBody.appendChild(row);
    });

    // Add event listeners for edit/delete buttons after rendering
    document.querySelectorAll('.edit-student-btn').forEach(button => {
        button.addEventListener('click', (e) => openStudentModalForEdit(e.target.dataset.id));
    });
    document.querySelectorAll('.delete-student-btn').forEach(button => {
        button.addEventListener('click', (e) => confirmDeleteStudent(e.target.dataset.id));
    });
    console.log(`AdminPortal: ${students.length} students loaded.`);
}

/**
 * Opens the student add/edit modal.
 * @param {Object|null} student - Student data to pre-fill the form for editing, or null for new student.
 */
function openStudentModal(student = null) {
    studentModal.classList.remove('hidden');
    addStudentForm.reset(); // Clear form

    if (student) {
        studentFormTitle.textContent = 'Edit Student';
        studentFormSubmitBtn.textContent = 'Update Student';
        studentIdField.value = student.id; // Store ID for update
        // Populate form fields
        document.getElementById('studentFirstName').value = student.firstName || '';
        document.getElementById('studentLastName').value = student.lastName || '';
        document.getElementById('studentEmail').value = student.email || '';
        document.getElementById('studentProgramType').value = student.programType || '';
        // Add other fields as they are implemented in the form
        deleteStudentBtn.classList.remove('hidden'); // Show delete button for edit mode
        deleteStudentBtn.onclick = () => confirmDeleteStudent(student.id);
        console.log("AdminPortal: Opened student modal for editing.");
    } else {
        studentFormTitle.textContent = 'Add New Student';
        studentFormSubmitBtn.textContent = 'Add Student';
        studentIdField.value = ''; // Clear ID for new student
        deleteStudentBtn.classList.add('hidden'); // Hide delete button for new student
        console.log("AdminPortal: Opened student modal for adding new student.");
    }
}

/**
 * Handles form submission for adding/editing students.
 */
addStudentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = studentIdField.value;
    const studentData = {
        firstName: document.getElementById('studentFirstName').value,
        lastName: document.getElementById('studentLastName').value,
        email: document.getElementById('studentEmail').value,
        programType: document.getElementById('studentProgramType').value,
        // Add other fields from the form
    };

    if (studentId) {
        // Update existing student
        const success = await updateStudent(studentId, studentData);
        if (success) {
            alert('Student updated successfully!');
            hideStudentModal();
            loadStudents(); // Reload list
        } else {
            alert('Failed to update student.');
        }
    } else {
        // Add new student
        const newId = await addStudent(studentData);
        if (newId) {
            alert('Student added successfully with ID: ' + newId);
            hideStudentModal();
            loadStudents(); // Reload list
        } else {
            alert('Failed to add student.');
        }
    }
});

/**
 * Closes the student add/edit modal.
 */
function hideStudentModal() {
    studentModal.classList.add('hidden');
    addStudentForm.reset();
    studentIdField.value = '';
    console.log("AdminPortal: Student modal closed.");
}

// Event listener for "Add New Student" button
if (addStudentBtn) {
    addStudentBtn.addEventListener('click', () => openStudentModal());
}

// Event listener for closing the student modal
if (closeStudentModalBtn) {
    closeStudentModalBtn.addEventListener('click', hideStudentModal);
}

// Function to open student modal for editing
async function openStudentModalForEdit(id) {
    const students = await getAllStudents(); // Re-fetch or get from already loaded list
    const studentToEdit = students.find(s => s.id === id);
    if (studentToEdit) {
        openStudentModal(studentToEdit);
    } else {
        alert('Student not found for editing.');
        console.error("AdminPortal: Student not found for editing with ID:", id);
    }
}

// Function to confirm and delete a student
async function confirmDeleteStudent(id) {
    if (confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
        const success = await deleteStudent(id);
        if (success) {
            alert('Student deleted successfully!');
            hideStudentModal(); // Close modal if open
            loadStudents(); // Reload list
        } else {
            alert('Failed to delete student.');
        }
    }
}

// --- CSV Upload/Import Functionality ---
if (uploadCsvBtn && csvUploadInput) {
    uploadCsvBtn.addEventListener('click', async () => {
        const file = csvUploadInput.files[0];
        if (!file) {
            csvUploadMessage.textContent = 'Please select a CSV file to upload.';
            csvUploadMessage.classList.remove('hidden');
            return;
        }

        csvUploadMessage.textContent = 'Uploading and processing CSV...';
        csvUploadMessage.classList.remove('hidden');
        csvUploadMessage.style.color = 'blue';

        const reader = new FileReader();
        reader.onload = async (e) => {
            const csvText = e.target.result;
            // Basic CSV parsing (for full robustness, consider a library like PapaParse)
            const lines = csvText.split('\n').filter(line => line.trim() !== '');
            if (lines.length === 0) {
                csvUploadMessage.textContent = 'CSV file is empty.';
                csvUploadMessage.style.color = 'red';
                return;
            }

            const headers = lines[0].split(',').map(h => h.trim());
            const requiredHeaders = ['StudentID', 'FirstName', 'LastName', 'Email', 'ProgramType', 'Parent1_Email']; // Define required headers
            const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

            if (missingHeaders.length > 0) {
                csvUploadMessage.textContent = `Missing required CSV headers: ${missingHeaders.join(', ')}.`;
                csvUploadMessage.style.color = 'red';
                return;
            }

            let successCount = 0;
            let failCount = 0;
            const errors = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values.length !== headers.length) {
                    errors.push(`Row ${i + 1}: Mismatched column count.`);
                    failCount++;
                    continue;
                }

                const studentData = {};
                headers.forEach((header, index) => {
                    studentData[header] = values[index];
                });

                // Basic validation for essential fields
                if (!studentData.Email || !studentData.FirstName || !studentData.LastName || !studentData.ProgramType) {
                    errors.push(`Row ${i + 1}: Missing essential student data (Email, FirstName, LastName, ProgramType).`);
                    failCount++;
                    continue;
                }

                try {
                    // Check if student already exists by StudentID (if provided) or Email
                    let existingStudentId = null;
                    if (studentData.StudentID) {
                        const q = query(collection(db, `artifacts/${appId}/public/data/students`), where("StudentID", "==", studentData.StudentID));
                        const querySnapshot = await getDocs(q);
                        if (!querySnapshot.empty) {
                            existingStudentId = querySnapshot.docs[0].id;
                        }
                    } else if (studentData.Email) {
                         const q = query(collection(db, `artifacts/${appId}/public/data/students`), where("email", "==", studentData.Email));
                         const querySnapshot = await getDocs(q);
                         if (!querySnapshot.empty) {
                             existingStudentId = querySnapshot.docs[0].id;
                         }
                    }

                    if (existingStudentId) {
                        // Update existing student
                        await updateStudent(existingStudentId, studentData);
                        console.log(`AdminPortal: Updated student ${studentData.Email}`);
                        successCount++;
                    } else {
                        // Add new student
                        const newStudentId = await addStudent(studentData);
                        if (newStudentId) {
                            console.log(`AdminPortal: Added new student ${studentData.Email} with ID ${newStudentId}`);
                            successCount++;

                            // --- Parent Account Creation/Linking (Simplified) ---
                            if (studentData.Parent1_Email) {
                                // Check if parent exists in Firebase Auth (not directly from client-side)
                                // This would typically be a server-side call for security.
                                // For now, we'll just create a profile if it doesn't exist in Firestore.
                                const parentProfileDocRef = doc(db, `artifacts/${appId}/users/${btoa(studentData.Parent1_Email)}/profile/data/userProfile`); // Using base64 encoded email as a placeholder UID for unauthenticated parents
                                const parentProfileSnap = await getDoc(parentProfileDocRef);
                                if (!parentProfileSnap.exists()) {
                                    await setDoc(parentProfileDocRef, {
                                        email: studentData.Parent1_Email,
                                        displayName: studentData.Parent1_Name || studentData.Parent1_Email,
                                        role: 'parent',
                                        createdAt: new Date(),
                                        children: [newStudentId] // Link child
                                    });
                                    console.log(`AdminPortal: Created new parent profile for ${studentData.Parent1_Email}`);
                                } else {
                                    // If parent profile exists, update children array if needed
                                    const parentData = parentProfileSnap.data();
                                    if (!parentData.children || !parentData.children.includes(newStudentId)) {
                                        await updateDoc(parentProfileDocRef, {
                                            children: [...(parentData.children || []), newStudentId]
                                        });
                                        console.log(`AdminPortal: Linked student ${newStudentId} to existing parent ${studentData.Parent1_Email}`);
                                    }
                                }
                            }
                        } else {
                            errors.push(`Row ${i + 1}: Failed to add student ${studentData.Email}.`);
                            failCount++;
                        }
                    }
                } catch (error) {
                    errors.push(`Row ${i + 1}: Error processing ${studentData.Email}: ${error.message}`);
                    failCount++;
                    console.error(`AdminPortal: Error processing student from CSV row ${i + 1}:`, error);
                }
            }

            csvUploadMessage.textContent = `CSV upload complete. Success: ${successCount}, Failed: ${failCount}.`;
            csvUploadMessage.style.color = failCount > 0 ? 'orange' : 'green';
            if (errors.length > 0) {
                console.error("AdminPortal: CSV upload errors:", errors);
                alert("Some students could not be processed. Check console for details.");
            }
            loadStudents(); // Reload the student list after upload
        };
        reader.readAsText(file);
    });
}


// --- CSV Export Functionality ---
const exportStudentsBtn = document.getElementById('exportStudentsBtn'); // Assuming you add this button in index.html

if (exportStudentsBtn) {
    exportStudentsBtn.addEventListener('click', async () => {
        console.log("AdminPortal: Exporting students...");
        const students = await getAllStudents(); // Fetch all students

        if (students.length === 0) {
            alert("No students to export.");
            return;
        }

        // Define CSV headers
        const headers = [
            'StudentID', 'FirstName', 'LastName', 'Email', 'ProgramType',
            'DateOfBirth', 'Gender', 'Address', 'City', 'State', 'Zip', 'PhoneNumber',
            'EnrollmentDate', 'GradeLevel',
            'Parent1_Name', 'Parent1_Email', 'Parent1_Phone',
            'Parent2_Name', 'Parent2_Email', 'Parent2_Phone',
            'EmergencyContact_Name', 'EmergencyContact_Phone', 'Allergies', 'MedicalConditions'
        ];

        // Create CSV content
        let csvContent = headers.join(',') + '\n'; // Add headers
        students.forEach(student => {
            const row = headers.map(header => {
                let value = student[header] !== undefined && student[header] !== null ? String(student[header]) : '';
                // Escape commas and double quotes for CSV format
                value = value.replace(/"/g, '""'); // Escape double quotes
                if (value.includes(',') || value.includes('\n')) {
                    value = `"${value}"`; // Enclose in double quotes if it contains commas or newlines
                }
                return value;
            }).join(',');
            csvContent += row + '\n';
        });

        // Create a Blob and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) { // Feature detection for download attribute
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'iqra_academy_students.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log("AdminPortal: Students exported to CSV.");
        } else {
            alert("Your browser does not support downloading files directly. Please copy the content from the console.");
            console.log(csvContent); // Fallback to console log
        }
    });
}


// --- Add event listener for when the Admin Portal modal is opened ---
// This ensures setupAdminPortal is called when the modal becomes visible
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (!adminPortalModal.classList.contains('hidden')) {
                // Modal is now visible, perform setup
                setupAdminPortal();
            }
        }
    }
});

if (adminPortalModal) {
    observer.observe(adminPortalModal, { attributes: true });
}


// You will add more functions here for:
// - Teacher Management UI (add, edit, delete teachers)
// - Course Management UI (add, edit, delete courses)
// - Announcement Management UI (add, edit, delete announcements)
// - Other admin-specific UI interactions

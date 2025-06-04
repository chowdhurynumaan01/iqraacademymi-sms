// public/js/data-service.js

// Import Firebase instances from auth.js
import { db, appId } from './auth.js';
import { collection, doc, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Utility function to get the base path for collections
// This ensures all data is stored under artifacts/{appId}/users/{userId}/... or artifacts/{appId}/public/data/...
function getCollectionPath(collectionName, userId = null) {
    if (userId) {
        // Private user-specific data
        return `artifacts/${appId}/users/${userId}/${collectionName}`;
    } else {
        // Public or school-wide data (e.g., announcements, courses)
        return `artifacts/${appId}/public/data/${collectionName}`;
    }
}

// --- User Profile Management ---
/**
 * Fetches a user's profile based on their UID.
 * @param {string} userId - The UID of the user.
 * @returns {Promise<Object|null>} The user profile data or null if not found.
 */
export async function getUserProfile(userId) {
    if (!userId) {
        console.error("DataService: getUserProfile - userId is required.");
        return null;
    }
    const userProfileDocRef = doc(db, getCollectionPath('profile/data', userId), 'userProfile');
    try {
        const docSnap = await getDoc(userProfileDocRef);
        if (docSnap.exists()) {
            console.log("DataService: User profile fetched successfully.");
            return docSnap.data();
        } else {
            console.log("DataService: No user profile found for UID:", userId);
            return null;
        }
    } catch (error) {
        console.error("DataService: Error fetching user profile:", error);
        return null;
    }
}

/**
 * Creates or updates a user's profile.
 * @param {string} userId - The UID of the user.
 * @param {Object} profileData - The data to set/update in the user profile.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
export async function setUserProfile(userId, profileData) {
    if (!userId || !profileData) {
        console.error("DataService: setUserProfile - userId and profileData are required.");
        return false;
    }
    const userProfileDocRef = doc(db, getCollectionPath('profile/data', userId), 'userProfile');
    try {
        await setDoc(userProfileDocRef, profileData, { merge: true }); // Use merge to update existing fields
        console.log("DataService: User profile set/updated successfully for UID:", userId);
        return true;
    } catch (error) {
        console.error("DataService: Error setting/updating user profile:", error);
        return false;
    }
}

// --- Student Management ---
/**
 * Adds a new student record.
 * @param {Object} studentData - The data for the new student.
 * @returns {Promise<string|null>} The ID of the new student document or null on error.
 */
export async function addStudent(studentData) {
    if (!studentData) {
        console.error("DataService: addStudent - studentData is required.");
        return null;
    }
    try {
        const docRef = await addDoc(collection(db, getCollectionPath('students')), studentData);
        console.log("DataService: Student added with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("DataService: Error adding student:", error);
        return null;
    }
}

/**
 * Fetches all student records.
 * @returns {Promise<Array<Object>>} An array of student objects.
 */
export async function getAllStudents() {
    const students = [];
    try {
        const q = query(collection(db, getCollectionPath('students')));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            students.push({ id: doc.id, ...doc.data() });
        });
        console.log("DataService: All students fetched.");
        return students;
    } catch (error) {
        console.error("DataService: Error fetching all students:", error);
        return [];
    }
}

/**
 * Updates an existing student record.
 * @param {string} studentId - The ID of the student to update.
 * @param {Object} updateData - The data to update.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
export async function updateStudent(studentId, updateData) {
    if (!studentId || !updateData) {
        console.error("DataService: updateStudent - studentId and updateData are required.");
        return false;
    }
    const studentDocRef = doc(db, getCollectionPath('students'), studentId);
    try {
        await updateDoc(studentDocRef, updateData);
        console.log("DataService: Student updated successfully:", studentId);
        return true;
    } catch (error) {
        console.error("DataService: Error updating student:", error);
        return false;
    }
}

/**
 * Deletes a student record.
 * @param {string} studentId - The ID of the student to delete.
 * @returns {Promise<boolean>} True if successful, false otherwise.
 */
export async function deleteStudent(studentId) {
    if (!studentId) {
        console.error("DataService: deleteStudent - studentId is required.");
        return false;
    }
    const studentDocRef = doc(db, getCollectionPath('students'), studentId);
    try {
        await deleteDoc(studentDocRef);
        console.log("DataService: Student deleted successfully:", studentId);
        return true;
    } catch (error) {
        console.error("DataService: Error deleting student:", error);
        return false;
    }
}

// --- Teacher Management (Similar functions will be added here) ---
// Example:
export async function addTeacher(teacherData) {
    if (!teacherData) {
        console.error("DataService: addTeacher - teacherData is required.");
        return null;
    }
    try {
        const docRef = await addDoc(collection(db, getCollectionPath('teachers')), teacherData);
        console.log("DataService: Teacher added with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("DataService: Error adding teacher:", error);
        return null;
    }
}

export async function getAllTeachers() {
    const teachers = [];
    try {
        const q = query(collection(db, getCollectionPath('teachers')));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            teachers.push({ id: doc.id, ...doc.data() });
        });
        console.log("DataService: All teachers fetched.");
        return teachers;
    } catch (error) {
        console.error("DataService: Error fetching all teachers:", error);
        return [];
    }
}

// --- Course Management (Similar functions will be added here) ---
// Example:
export async function addCourse(courseData) {
    if (!courseData) {
        console.error("DataService: addCourse - courseData is required.");
        return null;
    }
    try {
        const docRef = await addDoc(collection(db, getCollectionPath('courses')), courseData);
        console.log("DataService: Course added with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("DataService: Error adding course:", error);
        return null;
    }
}

export async function getAllCourses() {
    const courses = [];
    try {
        const q = query(collection(db, getCollectionPath('courses')));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            courses.push({ id: doc.id, ...doc.data() });
        });
        console.log("DataService: All courses fetched.");
        return courses;
    } catch (error) {
        console.error("DataService: Error fetching all courses:", error);
        return [];
    }
}


// --- Announcements Management ---
/**
 * Adds a new announcement.
 * @param {Object} announcementData - The data for the new announcement.
 * @returns {Promise<string|null>} The ID of the new announcement document or null on error.
 */
export async function addAnnouncement(announcementData) {
    if (!announcementData) {
        console.error("DataService: addAnnouncement - announcementData is required.");
        return null;
    }
    try {
        // Announcements are public data, so no userId in path
        const docRef = await addDoc(collection(db, getCollectionPath('announcements')), announcementData);
        console.log("DataService: Announcement added with ID:", docRef.id);
        return docRef.id;
    } catch (error) {
        console.error("DataService: Error adding announcement:", error);
        return null;
    }
}

/**
 * Fetches all announcements.
 * @returns {Promise<Array<Object>>} An array of announcement objects.
 */
export async function getAllAnnouncements() {
    const announcements = [];
    try {
        const q = query(collection(db, getCollectionPath('announcements')));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            announcements.push({ id: doc.id, ...doc.data() });
        });
        console.log("DataService: All announcements fetched.");
        return announcements;
    } catch (error) {
        console.error("DataService: Error fetching all announcements:", error);
        return [];
    }
}

// You will add more functions here for:
// - Parent management
// - Class management
// - Assignment management
// - Submission management
// - Grade management
// - Attendance management
// - Finance management
// - Event management
// ... and any other data interactions your system needs.

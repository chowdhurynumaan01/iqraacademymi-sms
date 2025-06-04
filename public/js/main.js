// public/js/main.js

// Import necessary variables and functions from auth.js
import { auth, currentUserId, currentUserRole } from './auth.js';
// Import setup function for admin portal
import { setupAdminPortal } from './admin-portal.js';

// DOM Elements for general UI
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebar = document.getElementById('sidebar');
const mainContent = document.getElementById('mainContent');
const userMenuButton = document.getElementById('userMenuButton');
const userMenu = document.getElementById('userMenu');
const portalCards = document.querySelectorAll('.portal-card');
const studentPortalModal = document.getElementById('studentPortalModal');
const parentPortalModal = document.getElementById('parentPortalModal');
const teacherPortalModal = document.getElementById('teacherPortalModal');
const adminPortalModal = document.getElementById('adminPortalModal'); // Ensure this is correctly referenced

const closeStudentPortal = document.getElementById('closeStudentPortal');
const closeParentPortal = document.getElementById('closeParentPortal');
const closeTeacherPortal = document.getElementById('closeTeacherPortal');
const closeAdminPortal = document.getElementById('closeAdminPortal');
const programTabs = document.querySelectorAll('.program-tab');
const programDetails = document.querySelectorAll('.program-details');


// --- Sidebar Toggle Logic ---
if (sidebarToggle && sidebar && mainContent) {
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        mainContent.classList.toggle('expanded');
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('active');
        }
        console.log("Main: Sidebar toggled.");
    });

    // Close sidebar on click outside for mobile
    document.addEventListener('click', (event) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('active') &&
            !sidebar.contains(event.target) && !sidebarToggle.contains(event.target)) {
            sidebar.classList.remove('active');
            console.log("Main: Sidebar closed on outside click (mobile).");
        }
    });
}

// --- User Menu Toggle Logic ---
if (userMenuButton && userMenu) {
    userMenuButton.addEventListener('click', (event) => {
        userMenu.classList.toggle('hidden');
        event.stopPropagation(); // Prevent document click from immediately closing it
        console.log("Main: User menu toggled.");
    });

    // Close user menu on click outside
    document.addEventListener('click', (event) => {
        if (!userMenuButton.contains(event.target) && !userMenu.contains(event.target)) {
            userMenu.classList.add('hidden');
            console.log("Main: User menu closed on outside click.");
        }
    });
}

// --- Program Tabs Logic ---
if (programTabs.length > 0 && programDetails.length > 0) {
    programTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            programTabs.forEach(t => t.classList.remove('active-tab'));
            tab.classList.add('active-tab');

            const program = tab.dataset.program;
            programDetails.forEach(details => {
                if (details.id === `${program}-school-details`) {
                    details.classList.remove('hidden');
                } else {
                    details.classList.add('hidden');
                }
            });
            console.log(`Main: Switched to ${program} school tab.`);
        });
    });
}

// --- Portal Modals Logic ---
if (portalCards.length > 0) {
    portalCards.forEach(card => {
        card.addEventListener('click', () => {
            const portal = card.dataset.portal;
            // Access current user role from auth.js
            // Note: currentUserRole might not be immediately available if auth.js is still processing.
            // For production, you'd want to ensure auth state is ready before enabling these clicks.
            // For now, we rely on the onAuthStateChanged in auth.js to set it.
            console.log(`Main: Attempting to open ${portal} portal. Current user role: ${currentUserRole}`);

            // Check if currentUserRole is defined before comparison
            if (currentUserRole === null) {
                console.warn("Main: currentUserRole is null. Authentication might still be in progress.");
                alert('Please wait, authentication is still loading. Try again in a moment.');
                return;
            }

            if (currentUserRole === 'admin' || currentUserRole === portal) {
                if (portal === 'student' && studentPortalModal) {
                    studentPortalModal.classList.remove('hidden');
                } else if (portal === 'parent' && parentPortalModal) {
                    parentPortalModal.classList.remove('hidden');
                } else if (portal === 'teacher' && teacherPortalModal) {
                    teacherPortalModal.classList.remove('hidden');
                } else if (portal === 'admin' && adminPortalModal) {
                    adminPortalModal.classList.remove('hidden');
                    // Call the setup function for Admin Portal when it's opened
                    setupAdminPortal();
                }
                console.log(`Main: Opened ${portal} portal.`);
            } else {
                console.warn(`Main: Access Denied: User role "${currentUserRole}" cannot access "${portal}" portal.`);
                alert('Access Denied: You do not have permission to access this portal.');
            }
        });
    });
}

// --- Close Portal Modals Logic ---
if (closeStudentPortal) {
    closeStudentPortal.addEventListener('click', () => {
        studentPortalModal.classList.add('hidden');
        console.log("Main: Student portal closed.");
    });
}
if (closeParentPortal) {
    closeParentPortal.addEventListener('click', () => {
        parentPortalModal.classList.add('hidden');
        console.log("Main: Parent portal closed.");
    });
}
if (closeTeacherPortal) {
    closeTeacherPortal.addEventListener('click', () => {
        teacherPortalModal.classList.add('hidden');
        console.log("Main: Teacher portal closed.");
    });
}
if (closeAdminPortal) {
    closeAdminPortal.addEventListener('click', () => {
        adminPortalModal.classList.add('hidden');
        console.log("Main: Admin portal closed.");
    });
}

// Close modals on escape key press
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        if (studentPortalModal && !studentPortalModal.classList.contains('hidden')) {
            studentPortalModal.classList.add('hidden');
            console.log("Main: Student portal closed by Escape key.");
        }
        if (parentPortalModal && !parentPortalModal.classList.contains('hidden')) {
            parentPortalModal.classList.add('hidden');
            console.log("Main: Parent portal closed by Escape key.");
        }
        if (teacherPortalModal && !teacherPortalModal.classList.contains('hidden')) {
            teacherPortalModal.classList.add('hidden');
            console.log("Main: Teacher portal closed by Escape key.");
        }
        if (adminPortalModal && !adminPortalModal.classList.contains('hidden')) {
            adminPortalModal.classList.add('hidden');
            console.log("Main: Admin portal closed by Escape key.");
        }
    }
});

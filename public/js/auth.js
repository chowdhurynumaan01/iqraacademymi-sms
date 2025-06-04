// public/js/auth.js

// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Firebase Configuration (using your provided details)
const firebaseConfig = {
    apiKey: "AIzaSyDpUWpAFj2SAIo0r6D-BLfGwxMVLW88Urs",
    authDomain: "iqraacademymisms.firebaseapp.com",
    projectId: "iqraacademymisms",
    storageBucket: "iqraacademymisms.firebasestorage.app",
    messagingSenderId: "565375301652",
    appId: "1:565375301652:web:8ef05fce5a88bbf67f0f01",
    measurementId: "G-745VHWDW3S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Export Firebase instances for other modules
export { auth, db, app };

// Global variables for user state
export let currentUserId = null;
export let currentUserRole = null;
export const appId = firebaseConfig.projectId; // Using projectId as appId for Firestore path

// DOM Elements related to authentication
const loginModal = document.getElementById('loginModal');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('loginButton');
const googleSignInButton = document.getElementById('googleSignInButton');
const loginMessage = document.getElementById('loginMessage');
const logoutButton = document.getElementById('logoutButton');

// Export functions to show/hide login modal
export function showLoginModal() {
    loginModal.classList.remove('hidden');
    console.log("Auth: Login modal shown.");
}

export function hideLoginModal() {
    loginModal.classList.add('hidden');
    loginMessage.classList.add('hidden');
    loginMessage.textContent = '';
    console.log("Auth: Login modal hidden.");
}

// Handle Email/Password Login
if (loginButton) {
    loginButton.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            loginMessage.textContent = 'Please enter both email and password.';
            loginMessage.classList.remove('hidden');
            return;
        }

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Auth: User logged in with email:', userCredential.user.uid);
            // onAuthStateChanged will handle UI update and profile creation/fetch
        } catch (error) {
            console.error('Auth: Email/Password Login error:', error);
            loginMessage.textContent = 'Login failed: ' + error.message;
            loginMessage.classList.remove('hidden');
        }
    });
}

// Handle Google Sign-In
if (googleSignInButton) {
    googleSignInButton.addEventListener('click', async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            console.log('Auth: User logged in with Google:', result.user.uid);
            // onAuthStateChanged will handle UI update and profile creation/fetch
        } catch (error) {
            console.error('Auth: Google Sign-In error:', error);
            loginMessage.textContent = 'Google Sign-In failed: ' + error.message;
            loginMessage.classList.remove('hidden');
        }
    });
}

// Handle Logout
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        try {
            await signOut(auth);
            console.log('Auth: User logged out');
            // UI will be updated by onAuthStateChanged
        } catch (error) {
            console.error('Auth: Logout error:', error);
        }
    });
}

// Auth State Change Listener - Centralized User Profile Management
// This function will be called whenever the user's sign-in state changes.
onAuthStateChanged(auth, async (user) => {
    console.log("Auth: Auth state changed. User:", user ? user.uid : "null");
    const loggedInUserName = document.getElementById('loggedInUserName');
    const sidebarUserName = document.getElementById('sidebarUserName');
    const sidebarUserRole = document.getElementById('sidebarUserRole');
    const userIdDisplay = document.getElementById('userIdDisplay');
    const mainContent = document.getElementById('mainContent'); // Get mainContent here

    if (user) {
        currentUserId = user.uid;
        userIdDisplay.textContent = `User ID: ${currentUserId}`;
        loggedInUserName.textContent = user.displayName || user.email || 'Authenticated User';
        sidebarUserName.textContent = user.displayName || user.email || 'Authenticated User';

        // Immediately attempt to hide login modal and show main content
        // This prevents the "stuck" screen after successful authentication.
        hideLoginModal();
        if (mainContent) {
            mainContent.classList.remove('hidden');
        }
        console.log("Auth: Main content shown for authenticated user.");

        const userProfileDocRef = doc(db, `artifacts/${appId}/users/${currentUserId}/profile/data/userProfile`);
        try {
            const userProfileSnap = await getDoc(userProfileDocRef);

            if (userProfileSnap.exists()) {
                // Profile exists, fetch role
                currentUserRole = userProfileSnap.data().role;
                console.log('Auth: Existing user profile found. Role:', currentUserRole);
            } else {
                // Profile does NOT exist, create a new one with default role
                currentUserRole = 'student'; // Default role for new users
                await setDoc(userProfileDocRef, {
                    email: user.email,
                    displayName: user.displayName || user.email,
                    role: currentUserRole,
                    createdAt: new Date()
                });
                console.log('Auth: New user profile created with role:', currentUserRole);
            }
            sidebarUserRole.textContent = currentUserRole.charAt(0).toUpperCase() + currentUserRole.slice(1);

        } catch (error) {
            console.error('Auth: Error managing user profile in Firestore:', error);
            // Fallback in case of Firestore error, still show main content but log error
            currentUserRole = 'student'; // Assume student role on error
            sidebarUserRole.textContent = 'Student (Error)';
            // Ensure login modal is hidden and main content is visible even if profile fetch fails
            hideLoginModal();
            if (mainContent) {
                mainContent.classList.remove('hidden');
            }
        }

    } else {
        currentUserId = null;
        currentUserRole = null;
        userIdDisplay.textContent = '';
        loggedInUserName.textContent = 'Guest User';
        sidebarUserName.textContent = 'Guest User';
        sidebarUserRole.textContent = 'Not Logged In';
        if (mainContent) {
            mainContent.classList.add('hidden'); // Hide main content
        }
        console.log("Auth: Main content hidden for unauthenticated user.");
        showLoginModal(); // Show login modal if not authenticated
    }
});

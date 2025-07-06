import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

// Firebase configuration for MatchBoard project
const firebaseConfig = {
  apiKey: "AIzaSyCYXNBbohrkN_vSyfp77xFFQ3zXWpcgAYI",
  authDomain: "matchboard-f3d7d.firebaseapp.com",
  projectId: "matchboard-f3d7d",
  storageBucket: "matchboard-f3d7d.firebasestorage.app",
  messagingSenderId: "13844647335",
  appId: "1:13844647335:web:264bb27ae256a4429a3a82"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);

// Export for use in other modules
export { app, auth, firebaseConfig }; 
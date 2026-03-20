
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Official configuration for "shree-cafe" project
const firebaseConfig = {
  apiKey: "AIzaSyDiqACYkZJ45bokciieBTqSh_yOnpApqFs",
  authDomain: "shree-cafe.firebaseapp.com",
  projectId: "shree-cafe",
  storageBucket: "shree-cafe.firebasestorage.app",
  messagingSenderId: "703258982165",
  appId: "1:703258982165:web:c8afd8804e7ef2beea9b1c",
  measurementId: "G-L854KRT4MF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

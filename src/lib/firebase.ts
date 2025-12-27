import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCBE7BQR5tKmNTRZPBiFDXvM9dM2QsFs3g",
    authDomain: "portfolio-ba30d.firebaseapp.com",
    projectId: "portfolio-ba30d",
    storageBucket: "portfolio-ba30d.firebasestorage.app",
    messagingSenderId: "477640903872",
    appId: "1:477640903872:web:9a71836ba73134a4593125",
    measurementId: "G-WJDPKK4BX7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);

export { app, db, analytics };

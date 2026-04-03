// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBhgeKTEsSMQyXEKGvZ2iMO8yfXTHpLhZo",
  authDomain: "comptrack-d9cff.firebaseapp.com",
  projectId: "comptrack-d9cff",
  storageBucket: "comptrack-d9cff.firebasestorage.app",
  messagingSenderId: "419068288887",
  appId: "1:419068288887:web:191e2b7388a1007caccb72",
  measurementId: "G-L1Z1PNMPJ1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

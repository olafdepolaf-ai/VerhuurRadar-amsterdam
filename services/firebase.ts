// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCFfjJLmScGSqJ5lLPbNol63s3itbWxCQA",
  authDomain: "amsterdam-vergunningen.firebaseapp.com",
  projectId: "amsterdam-vergunningen",
  storageBucket: "amsterdam-vergunningen.firebasestorage.app",
  messagingSenderId: "285598123174",
  appId: "1:285598123174:web:e6f972adffdffd03a4a067"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

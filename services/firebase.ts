import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Force Update: 1722424800000

const firebaseConfig = {
  apiKey: "AIzaSyCFfjJLmScGSqJ5lLPbNol63s3itbWxCQA",
  authDomain: "amsterdam-vergunningen.firebaseapp.com",
  projectId: "amsterdam-vergunningen",
  storageBucket: "amsterdam-vergunningen.appspot.com",
  messagingSenderId: "285598123174",
  appId: "1:285598123174:web:e6f972adffdffd03a4a067"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

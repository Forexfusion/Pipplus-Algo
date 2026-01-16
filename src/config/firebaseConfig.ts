import { initializeApp } from "firebase/app";
import { getFirestore, Timestamp } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


const firebaseConfig = {
  apiKey: "AIzaSyAp42UsatmZcwKvSXSWxHTGhNYqfjWO4oo",
  authDomain: "pipplus-algo.firebaseapp.com",
  projectId: "pipplus-algo",
  storageBucket: "pipplus-algo.firebasestorage.app",
  messagingSenderId: "901052350389",
  appId: "1:901052350389:web:9660e030205b6a5dafa3fc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);
export { db, auth, storage, Timestamp };
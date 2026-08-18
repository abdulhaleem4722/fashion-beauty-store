import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCPKWWfXexTfXnahEv8OIVmXYAWbTdso6M",
  authDomain: "fashion-beauty-store-95259.firebaseapp.com",
  projectId: "fashion-beauty-store-95259",
  storageBucket: "fashion-beauty-store-95259.firebasestorage.app",
  messagingSenderId: "623767142416",
  appId: "1:623767142416:web:0b018da07f9d1ffb7d8a95"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


export {  auth, db, app };
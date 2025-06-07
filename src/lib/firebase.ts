import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCLYxW_2qvpkmMy75LJPvMusEnbEzq3jWo",
  authDomain: "reeves-dining.firebaseapp.com",
  projectId: "reeves-dining",
  storageBucket: "reeves-dining.appspot.com",
  messagingSenderId: "387714717936",
  appId: "1:387714717936:web:1fc4a2b6e50388a9cd8a35",
  measurementId: "G-P2TEYKW1FW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

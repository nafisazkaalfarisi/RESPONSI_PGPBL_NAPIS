// Import the functions you need from the SDKs
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeOLykoFhHqbQRz_ZFUFePxhYUM-QvXSQ",
  authDomain: "rainspot-d3e72.firebaseapp.com",
  databaseURL: "https://rainspot-d3e72-default-rtdb.asia-southeast1.firebasedatabase.app", // <== Tambahkan ini
  projectId: "rainspot-d3e72",
  storageBucket: "rainspot-d3e72.firebasestorage.app",
  messagingSenderId: "1084466509634",
  appId: "1:1084466509634:web:8cd2ca962cc3b10069badb",
  measurementId: "G-0SWKW3WXEJ"
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Export database
export const database = getDatabase(app);

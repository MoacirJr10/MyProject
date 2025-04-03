// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDd5PiJHhTqp9auFVoOxDfb4D4FSj5hM-4",
  authDomain: "myproject-33922.firebaseapp.com",
  databaseURL: "https://myproject-33922-default-rtdb.firebaseio.com",
  projectId: "myproject-33922",
  storageBucket: "myproject-33922.firebasestorage.app",
  messagingSenderId: "495488653894",
  appId: "1:495488653894:web:8b146e53c4dacffeaa0847",
  measurementId: "G-XQNZG78S47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
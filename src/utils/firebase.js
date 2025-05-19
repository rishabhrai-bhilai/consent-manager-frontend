import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDln21fUeSPlkx1hujLwXKjQQX70ZDt3WI",
    authDomain: "consentmanager-7deb8.firebaseapp.com",
    projectId: "consentmanager-7deb8",
    storageBucket: "consentmanager-7deb8.firebasestorage.app",
    messagingSenderId: "433447487718",
    appId: "1:433447487718:web:cd7b3ca28854f6b5679327",
    measurementId: "G-2QMJZ7H4DD"
  };

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
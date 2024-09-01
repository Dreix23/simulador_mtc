import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBYYigOXkIugO250tq-NyHQDCRNjiTFQ-k",
    authDomain: "simulador-mtc.firebaseapp.com",
    projectId: "simulador-mtc",
    storageBucket: "simulador-mtc.appspot.com",
    messagingSenderId: "1091959346564",
    appId: "1:1091959346564:web:535b5c951065518e4879d1",
    measurementId: "G-ZGJP8SQRV6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, analytics, storage };

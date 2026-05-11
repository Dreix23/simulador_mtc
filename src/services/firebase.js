import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyDBLIWd1zAVcZw02qMn0rCnBIdi4SvvBQ4",
    authDomain: "simulador-81507.firebaseapp.com",
    projectId: "simulador-81507",
    storageBucket: "simulador-81507.appspot.com",
    messagingSenderId: "745383913078",
    appId: "1:745383913078:web:05e4413ebce9cb5ea7a157",
    measurementId: "G-6MEXKWTEKY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// DB compartida — siempre la (default), contiene questionnaire
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

// DB específica del sitio — para users, examResults, devices
// Si no hay variable de entorno, usa la misma DB (default) para retrocompatibilidad
const siteDbId = import.meta.env.VITE_FIRESTORE_DB;
const dbSite = siteDbId
    ? initializeFirestore(app, {
        localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager()
        })
    }, siteDbId)
    : db;

const storage = getStorage(app);

export { app, auth, db, dbSite, analytics, storage };
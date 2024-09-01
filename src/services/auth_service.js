import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "./firebase";

const auth = getAuth(app);

export const authService = {
    login: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Error de inicio de sesión:", error.message);
            throw error;
        }
    },

    logout: async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error al cerrar sesión:", error.message);
            throw error;
        }
    },

    getCurrentUser: () => {
        return new Promise((resolve, reject) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user);
            }, reject);
        });
    }
};

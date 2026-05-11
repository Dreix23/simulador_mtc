import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { app, dbSite } from "./firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

const auth = getAuth(app);

export const authService = {
    login: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Verificar si el admin está autorizado para este sitio
            const authorized = await checkSiteAuthorization(userCredential.user.uid);
            if (!authorized) {
                await signOut(auth);
                throw new Error("No autorizado para este sitio");
            }

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

// Verifica si el UID del admin existe en la colección site_admins de la DB del sitio
// Si la colección está vacía o no existe, permite el acceso (retrocompatible con MTC)
async function checkSiteAuthorization(uid) {
    try {
        const adminsRef = collection(dbSite, 'site_admins');
        const snapshot = await getDocs(adminsRef);

        // Si no hay documentos, no hay restricción (retrocompatible)
        if (snapshot.empty) return true;

        // Buscar si el UID está en la lista
        return snapshot.docs.some(doc => doc.id === uid || doc.data().uid === uid);
    } catch (error) {
        // Si hay error leyendo la colección, permitir acceso para no bloquear
        console.error("Error verificando autorización:", error.message);
        return true;
    }
}

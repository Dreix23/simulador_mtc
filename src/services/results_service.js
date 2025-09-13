import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { logInfo, logError } from '@/utils/logger.js';
import { userService } from './user_service';

export const saveExamResults = async (score) => {
    try {
        const storedUserData = localStorage.getItem('userData');
        if (!storedUserData) {
            throw new Error('No se encontraron datos del usuario en localStorage');
        }
        const userData = JSON.parse(storedUserData);

        // Guardar resultados del examen
        const examResults = {
            numeroDocumento: userData.numeroDocumento,
            score,
            startTime: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'examResults'), examResults);
        logInfo(`Resultados del examen guardados con ID: ${docRef.id}`);

        // Buscar el usuario por número de documento
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where("numeroDocumento", "==", userData.numeroDocumento));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const userDoc = querySnapshot.docs[0];
            // Actualizar el estado del intento a false
            await userService.updateUserAttempt(userDoc.id, false);
            logInfo(`Estado de intento actualizado para usuario: ${userDoc.id}`);
        }

        return docRef.id;
    } catch (error) {
        logError('Error al guardar los resultados del examen:', error);
        throw error;
    }
};

export const getExamResults = async (numeroDocumento) => {
    try {
        const examResultsRef = collection(db, 'examResults');
        const q = query(examResultsRef, where("numeroDocumento", "==", numeroDocumento));
        const querySnapshot = await getDocs(q);

        const results = [];
        querySnapshot.forEach((doc) => {
            results.push({ id: doc.id, ...doc.data() });
        });

        logInfo(`Resultados obtenidos para el usuario con documento: ${numeroDocumento}`);
        return results;
    } catch (error) {
        logError('Error al obtener los resultados del examen:', error);
        throw error;
    }
};
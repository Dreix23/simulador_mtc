import { db } from './firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { logInfo, logError } from '@/utils/logger.js';

export const saveExamResults = async (score) => {
    try {
        const storedUserData = localStorage.getItem('userData');
        if (!storedUserData) {
            throw new Error('No se encontraron datos del usuario en localStorage');
        }
        const userData = JSON.parse(storedUserData);

        const examResults = {
            numeroDocumento: userData.numeroDocumento,
            score,
            startTime: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'examResults'), examResults);
        logInfo(`Resultados del examen guardados con ID: ${docRef.id}`);
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
import { db, storage } from '@/services/firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, onSnapshot, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { logInfo, logError, logDebug } from "@/utils/logger.js";
import * as XLSX from 'xlsx';

const CACHE_KEY = 'questionnaires_cache';

export const getQuestionnaires = async () => {
    try {
        const cachedData = localStorage.getItem(CACHE_KEY);

        if (cachedData) {
            logDebug('Usando datos en caché');
            return JSON.parse(cachedData);
        }

        return await fetchAndCacheQuestionnaires();
    } catch (error) {
        logError('Error al obtener los cuestionarios:', error);
        throw error;
    }
};

const fetchAndCacheQuestionnaires = async () => {
    const questionnaireRef = collection(db, 'questionnaire');
    const snapshot = await getDocs(questionnaireRef);
    const questionnaires = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            RESPUESTA: data.RESPUESTA ? data.RESPUESTA.toUpperCase() : data.RESPUESTA
        };
    });

    const uniqueThemes = [...new Set(questionnaires.map(q => q.TEMA || 'Sin tema'))];
    const groupedQuestionnaires = uniqueThemes.reduce((acc, tema) => {
        acc[tema] = questionnaires.filter(q => q.TEMA === tema);
        return acc;
    }, {});

    localStorage.setItem(CACHE_KEY, JSON.stringify(groupedQuestionnaires));
    logInfo('Cuestionarios obtenidos y guardados en caché');
    return groupedQuestionnaires;
};

export const initializeRealtimeSync = (callback) => {
    const questionnaireRef = collection(db, 'questionnaire');
    return onSnapshot(questionnaireRef, async (snapshot) => {
        let hasChanges = false;
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added" || change.type === "modified" || change.type === "removed") {
                logDebug(`Documento ${change.doc.id} ${change.type}`);
                hasChanges = true;
            }
        });

        if (hasChanges) {
            const updatedQuestionnaires = await fetchAndCacheQuestionnaires();
            if (callback) {
                callback(updatedQuestionnaires);
            }
        }
    });
};

export const uploadExcelToFirestore = async (file) => {
    try {
        const data = await readExcelFile(file);
        await uploadToFirestore(data);
        logInfo('Datos subidos exitosamente a Firestore');
    } catch (error) {
        logError('Error al procesar el archivo:', error);
        throw error;
    }
};

const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            resolve(jsonData);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

const uploadToFirestore = async (data) => {
    const headers = data[0];
    const questionnaireRef = collection(db, 'questionnaire');

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const doc = {};

        headers.forEach((header, index) => {
            if (header && row[index] !== undefined && header !== 'Nº') {
                let value = row[index];

                if (header.startsWith('ALTERNATIVA')) {
                    const letter = String.fromCharCode(65 + parseInt(header.slice(-1)) - 1);
                    value = value.replace(/^[a-d]\)/, `${letter}.`);
                }

                if (header === 'RESPUESTA') {
                    value = value.trim().toUpperCase();
                }

                if (header === 'DESCRIPCIÓN DE LA PREGUNTA') {
                    value = value.replace(/\s{3,}/g, ' ___________');
                    value = value.replace(/_{2,}/g, '___________ ');
                }

                doc[header.replace(/ /g, '_').toUpperCase()] = value;
            }
        });

        if (Object.keys(doc).length > 0) {
            await addDoc(questionnaireRef, doc);
        }
    }
};

export const uploadImage = async (file) => {
    try {
        const storageRef = ref(storage, `images/${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        logInfo(`Imagen subida exitosamente: ${file.name}`);
        return downloadURL;
    } catch (error) {
        logError(`Error al subir la imagen: ${error.message}`);
        throw error;
    }
};

export const updateQuestionnaire = async (questionnaire) => {
    try {
        for (const question of questionnaire.questions) {
            let imageUrl = question.imageUrl;

            if (question.image && question.image instanceof File) {
                imageUrl = await uploadImage(question.image);
            }

            const questionData = {
                TEMA: questionnaire.title,
                DESCRIPCIÓN_DE_LA_PREGUNTA: question.text,
                ALTERNATIVA_1: question.options[0],
                ALTERNATIVA_2: question.options[1],
                ALTERNATIVA_3: question.options[2],
                ALTERNATIVA_4: question.options[3],
                RESPUESTA: ['A', 'B', 'C', 'D'][question.correctOption],
                CATEGORIA: question.category,
                TIPO_DE_MATERIA: question.tipo_de_materia,
                FUNDAMENTO: question.fundamento,
                IMAGE_URL: imageUrl,
            };

            if (question.id.startsWith('new-')) {
                await addDoc(collection(db, 'questionnaire'), questionData);
            } else {
                await updateDoc(doc(db, 'questionnaire', question.id), questionData);
            }
        }
        logInfo(`Cuestionario actualizado: ${questionnaire.title}`);
    } catch (error) {
        logError(`Error al actualizar el cuestionario: ${error.message}`);
        throw error;
    }
};

export const deleteQuestion = async (questionId) => {
    try {
        await deleteDoc(doc(db, 'questionnaire', questionId));
        logInfo(`Pregunta eliminada: ${questionId}`);
    } catch (error) {
        logError(`Error al eliminar la pregunta: ${error.message}`);
        throw error;
    }
};

export const deleteQuestionnaire = async (tema) => {
    try {
        logDebug(`Iniciando eliminación del tema: "${tema}"`);
        const questionnaireRef = collection(db, 'questionnaire');
        const snapshot = await getDocs(questionnaireRef);
        const batch = writeBatch(db);
        let deletedCount = 0;

        snapshot.docs.forEach((doc) => {
            const data = doc.data();
            if (data.TEMA === tema) {
                batch.delete(doc.ref);
                deletedCount++;
            }
        });

        logDebug(`Se encontraron ${deletedCount} documentos para eliminar`);

        if (deletedCount === 0) {
            logInfo(`No se encontraron documentos para el tema "${tema}"`);
            return;
        }

        await batch.commit();
        logInfo(`Tema "${tema}" y sus ${deletedCount} cuestionarios eliminados exitosamente`);

        // Actualizar el caché local
        const cachedData = JSON.parse(localStorage.getItem(CACHE_KEY));
        if (cachedData) {
            delete cachedData[tema];
            localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
            logDebug(`Caché local actualizado para el tema "${tema}"`);
        }
    } catch (error) {
        logError(`Error al eliminar el tema "${tema}":`, error);
        throw new Error(`No se pudo eliminar el tema "${tema}". Detalles: ${error.message}`);
    }
};
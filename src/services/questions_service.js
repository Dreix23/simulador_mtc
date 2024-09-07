import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase.js';
import { logError, logInfo, logDebug } from '@/utils/logger.js';

const CACHE_KEY = 'cachedAllQuestions';
let unsubscribe = null;

const encryptData = (data) => {
    const jsonString = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(jsonString)));
};

const decryptData = (encryptedData) => {
    try {
        const decodedString = decodeURIComponent(escape(atob(encryptedData)));
        return JSON.parse(decodedString);
    } catch (error) {
        logError('Error al desencriptar los datos de la caché:', error);
        return null;
    }
};

const saveToCache = (questions) => {
    const encryptedQuestions = encryptData(questions);
    localStorage.setItem(CACHE_KEY, encryptedQuestions);
};

const getFromCache = () => {
    const encryptedQuestions = localStorage.getItem(CACHE_KEY);
    return encryptedQuestions ? decryptData(encryptedQuestions) : null;
};

const fetchAllQuestionsFromDB = () => {
    return new Promise((resolve, reject) => {
        const questionsRef = collection(db, 'questionnaire');

        unsubscribe = onSnapshot(questionsRef, (querySnapshot) => {
            const allQuestions = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ALTERNATIVA_1: doc.data().ALTERNATIVA_1,
                ALTERNATIVA_2: doc.data().ALTERNATIVA_2,
                ALTERNATIVA_3: doc.data().ALTERNATIVA_3,
                ALTERNATIVA_4: doc.data().ALTERNATIVA_4,
                DESCRIPCIÓN_DE_LA_PREGUNTA: doc.data().DESCRIPCIÓN_DE_LA_PREGUNTA,
                IMAGE_URL: doc.data().IMAGE_URL,
                RESPUESTA: doc.data().RESPUESTA,
                TEMA: doc.data().TEMA,
                CATEGORIA: doc.data().CATEGORIA
            }));

            saveToCache(allQuestions);
            logInfo(`Se actualizaron ${allQuestions.length} preguntas en la caché`);
            resolve(allQuestions);
        }, (error) => {
            logError('Error al obtener las preguntas de la BD:', error);
            reject(error);
        });
    });
};

const selectRandomQuestions = (questions, count) => {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export const getQuestionsByCategory = async () => {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.categoria) {
            throw new Error('No se encontró la categoría del usuario en localStorage');
        }

        let cachedQuestions = getFromCache();

        if (!cachedQuestions) {
            logInfo('No se encontraron preguntas en la caché. Consultando la BD...');
            cachedQuestions = await fetchAllQuestionsFromDB();
        }

        const categoryQuestions = cachedQuestions.filter(q => q.CATEGORIA === userData.categoria);
        let finalQuestions;

        if (categoryQuestions.length >= 40) {
            finalQuestions = selectRandomQuestions(categoryQuestions, 40);
        } else {
            finalQuestions = [...categoryQuestions];
            const remainingCount = 40 - categoryQuestions.length;
            const otherQuestions = cachedQuestions.filter(q => q.CATEGORIA !== userData.categoria);
            const additionalQuestions = selectRandomQuestions(otherQuestions, remainingCount);
            finalQuestions = [...finalQuestions, ...additionalQuestions];
        }

        // Agrupar las preguntas por tema
        const groupedByTopic = finalQuestions.reduce((acc, question) => {
            if (!acc[question.TEMA]) {
                acc[question.TEMA] = [];
            }
            acc[question.TEMA].push(question);
            return acc;
        }, {});

        // Ordenar los temas alfabéticamente
        const sortedTopics = Object.keys(groupedByTopic).sort();

        // Crear el array final de preguntas, agrupadas por tema
        finalQuestions = sortedTopics.flatMap(topic => groupedByTopic[topic]);

        logInfo(`Se seleccionaron ${finalQuestions.length} preguntas para la categoría ${userData.categoria}`);
        localStorage.setItem('questionOrder', JSON.stringify(finalQuestions.map(q => q.id)));

        return finalQuestions;
    } catch (error) {
        logError('Error al obtener preguntas por categoría:', error);
        throw error;
    }
};

export const getInitialQuestion = async () => {
    try {
        const questions = await getQuestionsByCategory();
        return questions[0] || null;
    } catch (error) {
        logError('Error al obtener la pregunta inicial:', error);
        throw error;
    }
};

export const unsubscribeFromQuestions = () => {
    if (unsubscribe) {
        unsubscribe();
        logInfo('Desuscrito del listener de preguntas');
    }
};

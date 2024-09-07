import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase.js';
import { logError, logInfo, logDebug } from '@/utils/logger.js';

const CACHE_KEY = 'cachedQuestions';

let unsubscribe = null;

export const getQuestionsByCategory = async () => {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData || !userData.categoria) {
            throw new Error('No se encontró la categoría del usuario en localStorage');
        }

        const category = userData.categoria;
        let cachedQuestions = getCachedQuestions();

        if (!cachedQuestions) {
            cachedQuestions = await fetchAllQuestions();
            cacheQuestions(cachedQuestions);
            setupRealtimeListener();
        }

        if (cachedQuestions[category]) {
            logInfo('Usando preguntas en caché');
            return selectRandomQuestions(cachedQuestions[category]);
        } else {
            logError(`No se encontraron preguntas para la categoría ${category}`);
            return [];
        }
    } catch (error) {
        logError('Error al obtener las preguntas:', error);
        throw error;
    }
};

const getCachedQuestions = () => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    return cachedData ? JSON.parse(cachedData) : null;
};

const cacheQuestions = (questions) => {
    const encryptedQuestions = encryptResponses(questions);
    localStorage.setItem(CACHE_KEY, JSON.stringify(encryptedQuestions));
};

const encryptResponses = (questions) => {
    return Object.keys(questions).reduce((acc, category) => {
        acc[category] = questions[category].map(question => ({
            ...question,
            RESPUESTA: btoa(question.RESPUESTA)
        }));
        return acc;
    }, {});
};

const decryptResponse = (encryptedResponse) => {
    return atob(encryptedResponse);
};

const fetchAllQuestions = async () => {
    const questionsRef = collection(db, 'questionnaire');
    const querySnapshot = await getDocs(questionsRef);

    const questions = {};
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (!questions[data.CATEGORIA]) {
            questions[data.CATEGORIA] = [];
        }
        questions[data.CATEGORIA].push({
            id: doc.id,
            ...data
        });
    });

    logInfo(`Se cargaron preguntas para ${Object.keys(questions).length} categorías`);
    return questions;
};

const setupRealtimeListener = () => {
    if (unsubscribe) {
        unsubscribe();
    }

    const questionsRef = collection(db, 'questionnaire');
    unsubscribe = onSnapshot(questionsRef, async () => {
        logInfo('Cambios detectados en la base de datos, actualizando caché');
        const updatedQuestions = await fetchAllQuestions();
        cacheQuestions(updatedQuestions);
    }, (error) => {
        logError('Error en el listener de preguntas:', error);
    });
};

const selectRandomQuestions = (questions) => {
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 40);
    logDebug(`Seleccionadas ${selected.length} preguntas aleatorias de un total de ${questions.length}`);
    return selected;
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

export const getDecryptedResponse = (question) => {
    return decryptResponse(question.RESPUESTA);
};

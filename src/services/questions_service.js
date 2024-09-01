import { collection, query, where, onSnapshot } from 'firebase/firestore';
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
        const questionsRef = collection(db, 'questionnaire');
        const q = query(questionsRef, where('CATEGORIA', '==', category));

        return new Promise((resolve, reject) => {
            unsubscribe = onSnapshot(q, (querySnapshot) => {
                const questions = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ALTERNATIVA_1: doc.data().ALTERNATIVA_1,
                    ALTERNATIVA_2: doc.data().ALTERNATIVA_2,
                    ALTERNATIVA_3: doc.data().ALTERNATIVA_3,
                    ALTERNATIVA_4: doc.data().ALTERNATIVA_4,
                    DESCRIPCIÓN_DE_LA_PREGUNTA: doc.data().DESCRIPCIÓN_DE_LA_PREGUNTA,
                    IMAGE_URL: doc.data().IMAGE_URL,
                    RESPUESTA: doc.data().RESPUESTA,
                    TEMA: doc.data().TEMA
                }));

                localStorage.setItem(CACHE_KEY, JSON.stringify(questions));
                logInfo(`Se actualizaron ${questions.length} preguntas para la categoría ${category}`);

                const selectedQuestions = selectRandomQuestions(questions);
                resolve(selectedQuestions);
            }, (error) => {
                logError('Error al obtener las preguntas:', error);
                reject(error);
            });
        });
    } catch (error) {
        logError('Error al configurar el listener de preguntas:', error);
        throw error;
    }
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

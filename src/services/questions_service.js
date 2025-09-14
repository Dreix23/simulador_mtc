import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/services/firebase.js';
import { logError, logInfo, logDebug } from '@/utils/logger.js';

const CACHE_KEY = 'cachedAllQuestions';
let unsubscribe = null;

const obfuscateData = (data) => {
    const jsonString = JSON.stringify(data);
    const encodedString = encodeURIComponent(jsonString);
    return encodedString.split('').reverse().join('');
};

const deobfuscateData = (obfuscatedData) => {
    try {
        const reversedString = obfuscatedData.split('').reverse().join('');
        const decodedString = decodeURIComponent(reversedString);
        return JSON.parse(decodedString);
    } catch (error) {
        logError('Error al desobfuscar los datos de la caché:', error);
        return null;
    }
};

const saveToCache = (questions) => {
    const obfuscatedQuestions = obfuscateData(questions);
    localStorage.setItem(CACHE_KEY, obfuscatedQuestions);
};

const getFromCache = () => {
    const obfuscatedQuestions = localStorage.getItem(CACHE_KEY);
    return obfuscatedQuestions ? deobfuscateData(obfuscatedQuestions) : null;
};

const obfuscateAnswer = (answer) => {
    return encodeURIComponent(answer).split('').reverse().join('');
};

const fetchAllQuestionsFromDB = () => {
    return new Promise((resolve, reject) => {
        const questionsRef = collection(db, 'questionnaire');

        unsubscribe = onSnapshot(questionsRef, (querySnapshot) => {
            const allQuestions = querySnapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ALTERNATIVA_1: doc.data().ALTERNATIVA_1,
                    ALTERNATIVA_2: doc.data().ALTERNATIVA_2,
                    ALTERNATIVA_3: doc.data().ALTERNATIVA_3,
                    ALTERNATIVA_4: doc.data().ALTERNATIVA_4,
                    DESCRIPCIÓN_DE_LA_PREGUNTA: doc.data().DESCRIPCIÓN_DE_LA_PREGUNTA,
                    IMAGE_URL: doc.data().IMAGE_URL,
                    RESPUESTA: obfuscateAnswer(doc.data().RESPUESTA),
                    TEMA: doc.data().TEMA,
                    CATEGORIA: doc.data().CATEGORIA
                }))
                .filter(question => question.ALTERNATIVA_4 && question.ALTERNATIVA_4.trim() !== '');

            saveToCache(allQuestions);
            logInfo(`Se actualizaron ${allQuestions.length} preguntas en la caché (se excluyeron las de 3 opciones)`);
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

        const questionsWithFourOptions = cachedQuestions.filter(q =>
            q.ALTERNATIVA_4 && q.ALTERNATIVA_4.trim() !== ''
        );

        const userCategory = userData.categoria;
        let finalQuestions = [];

        if (['AIIA', 'AIIB', 'AIIIA', 'AIIIB', 'AIIIC'].includes(userCategory)) {
            const filteredQuestions = questionsWithFourOptions.filter(q => q.TEMA !== 'Mercancías peligrosas');

            const categoryQuestions = filteredQuestions.filter(q => q.CATEGORIA === userCategory);
            const aiQuestions = filteredQuestions.filter(q => q.CATEGORIA === 'AI');

            if (categoryQuestions.length >= 20) {
                finalQuestions = [...selectRandomQuestions(categoryQuestions, 20)];
            } else {
                finalQuestions = [...categoryQuestions];
                const remainingCount = 20 - categoryQuestions.length;
                const additionalQuestions = selectRandomQuestions(aiQuestions, remainingCount);
                finalQuestions = [...finalQuestions, ...additionalQuestions];
            }

            const aiQuestionsToAdd = selectRandomQuestions(aiQuestions, 20);
            finalQuestions = [...finalQuestions, ...aiQuestionsToAdd];
        } else if (userCategory === 'BIIB' || userCategory === 'BIIA') {
            const biiaQuestions = questionsWithFourOptions.filter(q => q.CATEGORIA === 'BIIA');
            finalQuestions = selectRandomQuestions(biiaQuestions, 40);
        } else if (userCategory === 'BIIC') {
            const biicQuestions = questionsWithFourOptions.filter(q => q.CATEGORIA === 'BIIC');
            const biiaQuestions = questionsWithFourOptions.filter(q => q.CATEGORIA === 'BIIA');

            const selectedBiicQuestions = selectRandomQuestions(biicQuestions, 20);
            const selectedBiiaQuestions = selectRandomQuestions(biiaQuestions, 20);

            finalQuestions = [...selectedBiicQuestions, ...selectedBiiaQuestions];
        } else {
            const categoryQuestions = questionsWithFourOptions.filter(q => q.CATEGORIA === userCategory);
            finalQuestions = selectRandomQuestions(categoryQuestions, 40);
        }

        const groupedByTopic = finalQuestions.reduce((acc, question) => {
            if (!acc[question.TEMA]) {
                acc[question.TEMA] = [];
            }
            acc[question.TEMA].push(question);
            return acc;
        }, {});

        const sortedTopics = Object.keys(groupedByTopic).sort();

        finalQuestions = sortedTopics.flatMap(topic => groupedByTopic[topic]);

        logInfo(`Se seleccionaron ${finalQuestions.length} preguntas para la categoría ${userCategory} (solo con 4 opciones)`);
        localStorage.setItem('questionOrder', JSON.stringify(finalQuestions.map(q => q.id)));

        return finalQuestions;
    } catch (error) {
        logError('Error al obtener preguntas por categoría:', error);
        throw error;
    }
};

export const unsubscribeFromQuestions = () => {
    if (unsubscribe) {
        unsubscribe();
        logInfo('Desuscrito del listener de preguntas');
    }
};
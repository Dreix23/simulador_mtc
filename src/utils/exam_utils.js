import { ref } from 'vue';
import { logDebug, logError } from '@/utils/logger.js';

export const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const getImageUrl = (imageName) => {
    if (!imageName || typeof imageName !== 'string') {
        logDebug(`Nombre de imagen inválido: ${imageName}`);
        return null;
    }

    const imageNameParts = imageName.split('.');
    if (imageNameParts.length < 2) {
        logDebug(`Formato de nombre de imagen inválido: ${imageName}`);
        return null;
    }

    const imageFileName = imageNameParts.slice(1).join('.').trim();

    try {
        return new URL(`../assets/img-questions/${imageFileName}`, import.meta.url).href;
    } catch (error) {
        logError(`Error al generar URL para la imagen ${imageFileName}:`, error);
        return null;
    }
};

export const isImageAlternative = (alternative) => {
    return typeof alternative === 'string' && alternative.toLowerCase().endsWith('.png');
};

export const calculateScore = (selectedAnswers, questions) => {
    let correctAnswers = 0;

    questions.forEach(question => {
        const selectedAnswer = selectedAnswers[question.id];
        if (selectedAnswer && selectedAnswer.charAt(0) === question.RESPUESTA) {
            correctAnswers++;
        }
    });

    const score = (correctAnswers / questions.length) * 100;
    return Math.round(score * 100) / 100;
};

export const useExamState = () => {
    const isResizing = ref(false);
    const leftPaneWidth = ref("320px");
    const maxWidth = ref("80%");
    const showHelpImage = ref(false);
    const questions = ref([]);
    const answeredQuestions = ref(0);
    const totalQuestions = ref(0);
    const currentQuestion = ref(null);
    const selectedAnswers = ref({});
    const remainingTime = ref(2400);
    const showConfirmationDialog = ref(false);
    const zoomLevel = ref(50);

    return {
        isResizing,
        leftPaneWidth,
        maxWidth,
        showHelpImage,
        questions,
        answeredQuestions,
        totalQuestions,
        currentQuestion,
        selectedAnswers,
        remainingTime,
        showConfirmationDialog,
        zoomLevel
    };
};

import { ref } from 'vue';

export const categories = [
    "A-I",
    "BII-A",
    "BII-B",
    "AII-A",
    "AII-B",
    "AIII-A",
    "AIII-B",
    "AIII-C",
    "BII-C",
];

export const selectedCategory = ref("");

export const mapCategory = (category) => {
    const mapping = {
        "AI": "A-I",
        "BIIA": "BII-A",
        "BIIB": "BII-B",
        "AIIA": "AII-A",
        "AIIB": "AII-B",
        "AIIIA": "AIII-A",
        "AIIIB": "AIII-B",
        "AIIIC": "AIII-C",
        "BIIC": "BII-C",
    };
    return mapping[category] || category;
};

export const reverseCategoryMap = (category) => {
    const reverseMapping = {
        "A-I": "AI",
        "BII-A": "BIIA",
        "BII-B": "BIIB",
        "AII-A": "AIIA",
        "AII-B": "AIIB",
        "AIII-A": "AIIIA",
        "AIII-B": "AIIIB",
        "AIII-C": "AIIIC",
        "BII-C": "BIIC",
    };
    return reverseMapping[category] || category;
};

export const updateAllQuestionsCategory = (questionnaire, newCategory) => {
    questionnaire.questions.forEach(question => {
        question.category = newCategory;
    });
};

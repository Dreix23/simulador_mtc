// Categorías permitidas según el sitio (env var)
// Si no hay restricción, se permiten todas
const envCategories = import.meta.env.VITE_ALLOWED_CATEGORIES;

const ALL_CATEGORIES = ["AI", "BIIA", "BIIB", "AIIA", "AIIB", "AIIIA", "AIIIB", "AIIIC", "BIIC"];

// Categorías con formato display (con guión)
const ALL_DISPLAY_CATEGORIES = [
    "A-I", "BII-A", "BII-B", "AII-A", "AII-B", "AIII-A", "AIII-B", "AIII-C", "BII-C"
];

export const allowedCategories = envCategories
    ? envCategories.split(',').map(c => c.trim())
    : ALL_CATEGORIES;

// Categorías con formato display filtradas
export const allowedDisplayCategories = ALL_DISPLAY_CATEGORIES.filter(dc => {
    const raw = dc.replace(/-/g, '');
    return allowedCategories.includes(raw);
});

// Verificar si una categoría está permitida
export const isCategoryAllowed = (category) => {
    return allowedCategories.includes(category.replace(/-/g, ''));
};

// Categoría por defecto del sitio
export const defaultCategory = allowedCategories[0];

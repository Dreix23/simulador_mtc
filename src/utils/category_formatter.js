export function formatCategory(category) {
    if (!category) return '';

    if (category === 'AI') {
        return '(A) I';
    } else if (category.length >= 3) {
        const letter = category[0];
        const roman = category.slice(1, -1);
        const lastLetter = category.slice(-1).toLowerCase();
        return `(${letter}) ${roman}${lastLetter}`;
    }

    return category;
}
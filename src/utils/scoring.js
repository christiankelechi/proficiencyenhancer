/**
 * Calculates Levenshtein distance between two strings
 */
function getLevenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1  // deletion
                    )
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

/**
 * Scores the verbatim repetition of a phrase based on completeness and accuracy.
 * Returns a score out of 100.
 */
export function scorePart1Response(expected, actual) {
    if (!actual || actual.trim() === "") return 0;
    
    // Clean strings (remove punctuation, lowercase)
    const cleanStr = (str) => str.toLowerCase().replace(/[.,?!]/g, '').trim();
    
    const expectedClean = cleanStr(expected);
    const actualClean = cleanStr(actual);
    
    const distance = getLevenshteinDistance(expectedClean, actualClean);
    const maxLength = Math.max(expectedClean.length, actualClean.length);
    
    if (maxLength === 0) return 0;
    
    // Similarity ratio
    const similarity = 1 - (distance / maxLength);
    return Math.max(0, Math.round(similarity * 100 * 10) / 10); // round to 1 decimal
}

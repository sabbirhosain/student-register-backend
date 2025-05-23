// Helper function to convert string to Sentence Case
export const toSentenceCase = (value) => {
    if (!value) return '';
    return value.toLowerCase().replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());
};
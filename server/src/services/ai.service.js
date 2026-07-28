import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Sends a set of 5 captured base64 images to the FastAPI AI service
 * and returns the averaged 512-D face embedding vector.
 * @param {string[]} images Array of base64 encoded images
 * @returns {Promise<number[]>} 512-D embedding array of floats
 */
export const generateFaceEmbedding = async (images) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/generate-embedding`, { images });
        return response.data.embedding;
    } catch (err) {
        console.error('Failed to communicate with AI Service (/generate-embedding):', err.message);
        throw Object.assign(
            new Error('AI Biometric enrollment offline. Please ensure the python AI service is running.'),
            { status: 503 }
        );
    }
};

/**
 * Sends a single base64 image (live snapshot) to the FastAPI AI service
 * and returns the 512-D face embedding vector.
 * @param {string} image Base64 encoded image
 * @returns {Promise<number[]>} 512-D embedding array of floats
 */
export const getSingleFaceEmbedding = async (image) => {
    try {
        const response = await axios.post(`${AI_SERVICE_URL}/verify-face`, { image });
        return response.data.embedding;
    } catch (err) {
        console.error('Failed to communicate with AI Service (/verify-face):', err.message);
        throw Object.assign(
            new Error('AI Biometric scan offline. Please ensure the python AI service is running.'),
            { status: 503 }
        );
    }
};

/**
 * Calculates the cosine similarity score between two face embedding vectors.
 * Since the vectors are normalized, it is the dot product of two arrays.
 * @param {number[]} a First embedding vector
 * @param {number[]} b Second embedding vector
 * @returns {number} Cosine similarity score between -1 and 1
 */
export const computeCosineSimilarity = (a, b) => {
    if (!a || !b || a.length !== b.length) return 0;
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

import ImageKit from 'imagekit';

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT;

let imagekit = null;

if (publicKey && privateKey && urlEndpoint) {
    try {
        imagekit = new ImageKit({
            publicKey,
            privateKey,
            urlEndpoint,
        });
        console.log('ImageKit SDK successfully initialized.');
    } catch (err) {
        console.error('Error initializing ImageKit SDK:', err.message);
    }
} else {
    console.warn('ImageKit environment variables are missing in server/.env. Using fallback mock service.');
}

/**
 * Uploads a base64 image to ImageKit.
 * Fallbacks to data URI if ImageKit is not configured.
 * @param {string} base64Image Base64-encoded image string
 * @param {string} fileName Name for the uploaded file
 * @returns {Promise<string>} URL of the uploaded image
 */
export const uploadToImageKit = async (base64Image, fileName) => {
    if (!imagekit) {
        console.warn('ImageKit not initialized. Mocking upload: falling back to base64 data URI.');
        if (base64Image && base64Image.startsWith('data:image')) {
            return base64Image;
        }
        return `https://ik.imagekit.io/mock_fallback/${fileName || `selfie_${Date.now()}.jpg`}`;
    }

    try {
        let cleanBase64 = base64Image;
        if (cleanBase64.includes(',')) {
            cleanBase64 = cleanBase64.split(',')[1];
        }

        const result = await imagekit.upload({
            file: cleanBase64,
            fileName: fileName || `selfie_${Date.now()}.jpg`,
            folder: '/safeballot_selfies',
        });
        return result.url;
    } catch (err) {
        console.error('ImageKit upload failed, falling back to base64 URI:', err.message);
        if (base64Image && base64Image.startsWith('data:image')) {
            return base64Image;
        }
        throw err;
    }
};

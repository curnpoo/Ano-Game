const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();
const CLOUDINARY_FOLDER = (import.meta.env.VITE_CLOUDINARY_FOLDER?.trim() || 'ano-game').replace(/^\/+|\/+$/g, '');

export interface CloudinaryUploadOptions {
    folder?: string;
    publicId?: string;
    fileName?: string;
    tags?: string[];
}

interface CloudinaryUploadResponse {
    secure_url?: string;
    error?: {
        message?: string;
    };
}

function getConfiguredUploadUrl(): string {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        throw new Error('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to your .env file.');
    }

    return `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
}

function buildFolder(folder?: string): string {
    const cleanedFolder = folder?.replace(/^\/+|\/+$/g, '');
    return cleanedFolder ? `${CLOUDINARY_FOLDER}/${cleanedFolder}` : CLOUDINARY_FOLDER;
}

export const CloudinaryService = {
    async uploadImage(file: Blob | File, options: CloudinaryUploadOptions = {}): Promise<string> {
        const uploadUrl = getConfiguredUploadUrl();
        const formData = new FormData();

        formData.append('file', file, options.fileName || 'upload.jpg');
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET as string);
        formData.append('folder', buildFolder(options.folder));

        if (options.publicId) {
            formData.append('public_id', options.publicId);
        }

        if (options.tags?.length) {
            formData.append('tags', options.tags.join(','));
        }

        const response = await fetch(uploadUrl, {
            method: 'POST',
            body: formData
        });

        let payload: CloudinaryUploadResponse | null = null;

        try {
            payload = await response.json();
        } catch {
            payload = null;
        }

        if (!response.ok) {
            const message = payload?.error?.message || `Cloudinary upload failed (${response.status})`;
            throw new Error(message);
        }

        if (!payload?.secure_url) {
            throw new Error('Cloudinary upload succeeded but no secure URL was returned.');
        }

        return payload.secure_url;
    }
};

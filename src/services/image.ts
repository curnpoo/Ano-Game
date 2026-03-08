import { CloudinaryService } from './cloudinary';

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'image/heic-sequence',
    'image/heif-sequence'
]);

const HEIC_TYPES = new Set([
    'image/heic',
    'image/heif',
    'image/heic-sequence',
    'image/heif-sequence'
]);

export type ImageUploadStage = 'convert' | 'compress' | 'upload';

class ImageUploadError extends Error {
    loadingStage: ImageUploadStage;

    constructor(message: string, loadingStage: ImageUploadStage) {
        super(message);
        this.name = 'ImageUploadError';
        this.loadingStage = loadingStage;
    }
}

export const SUPPORTED_UPLOAD_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,.heic,.heif,image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif';

function getNormalizedMimeType(file: File): string {
    const explicitType = file.type?.toLowerCase().trim();
    if (explicitType) return explicitType;

    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'jpg':
        case 'jpeg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        case 'gif':
            return 'image/gif';
        case 'heic':
            return 'image/heic';
        case 'heif':
            return 'image/heif';
        default:
            return '';
    }
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const objectUrl = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(img);
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('Failed to decode image.'));
        };

        img.src = objectUrl;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Failed to export image.'));
                return;
            }

            resolve(blob);
        }, type, quality);
    });
}

async function convertHeicToJpeg(file: File): Promise<File> {
    try {
        const heic2anyModule = await import('heic2any');
        const heic2any = heic2anyModule.default;
        const converted = await heic2any({
            blob: file,
            toType: 'image/jpeg',
            quality: 0.92
        });

        const outputBlob = Array.isArray(converted) ? converted[0] : converted;
        if (!(outputBlob instanceof Blob)) {
            throw new Error('HEIC conversion returned an unexpected result.');
        }

        const baseName = file.name.replace(/\.(heic|heif)$/i, '') || 'upload';
        return new File([outputBlob], `${baseName}.jpg`, {
            type: 'image/jpeg',
            lastModified: Date.now()
        });
    } catch (error: any) {
        throw new ImageUploadError(
            error?.message || 'Failed to convert HEIC photo. Please try another image.',
            'convert'
        );
    }
}

async function normalizeInputFile(file: File): Promise<File> {
    const normalizedMimeType = getNormalizedMimeType(file);
    if (!HEIC_TYPES.has(normalizedMimeType)) {
        return file;
    }

    return convertHeicToJpeg(file);
}

export const ImageService = {
    processImage: (
        file: File,
        roomCode: string,
        options?: { onStageChange?: (stage: ImageUploadStage) => void }
    ): Promise<string> => {
        return new Promise((resolve, reject) => {
            const normalizedMimeType = getNormalizedMimeType(file);

            if (file.size > MAX_IMAGE_BYTES) {
                reject(new ImageUploadError('Image too large (max 20MB)', 'convert'));
                return;
            }

            if (!SUPPORTED_MIME_TYPES.has(normalizedMimeType)) {
                reject(new ImageUploadError('Invalid file format. Use JPG, PNG, GIF, WebP, or HEIC', 'convert'));
                return;
            }

            (async () => {
                try {
                    options?.onStageChange?.('convert');
                    const normalizedFile = await normalizeInputFile(file);

                    options?.onStageChange?.('compress');
                    const img = await loadImageFromFile(normalizedFile);
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        reject(new ImageUploadError('Failed to create canvas context', 'compress'));
                        return;
                    }

                    const size = Math.min(img.width, img.height);
                    const offsetX = (img.width - size) / 2;
                    const offsetY = (img.height - size) / 2;
                    const maxSize = 600;
                    const outputSize = Math.min(size, maxSize);

                    canvas.width = outputSize;
                    canvas.height = outputSize;
                    ctx.drawImage(img, offsetX, offsetY, size, size, 0, 0, outputSize, outputSize);

                    const processedBlob = await canvasToBlob(canvas, 'image/jpeg', 0.86);
                    const timestamp = Date.now();
                    const fileName = `${timestamp}_${Math.random().toString(36).slice(2, 11)}.jpg`;
                    const publicId = fileName.replace(/\.jpg$/i, '');

                    options?.onStageChange?.('upload');
                    const downloadUrl = await CloudinaryService.uploadImage(processedBlob, {
                        folder: `game-images/${roomCode}`,
                        publicId,
                        fileName,
                        tags: ['ano-game', 'round-image', `room-${roomCode.toLowerCase()}`]
                    });

                    resolve(downloadUrl);
                } catch (error: any) {
                    console.error('Error processing/uploading image:', error);
                    if (error instanceof ImageUploadError) {
                        reject(error);
                        return;
                    }
                    reject(new ImageUploadError(error?.message || 'Failed to upload image', 'upload'));
                }
            })();
        });
    },

    deleteRoomImages: async (roomCode: string): Promise<void> => {
        console.info(`[ImageService] Skipping room image cleanup for ${roomCode}. Cloudinary unsigned uploads require server-side deletion.`);
    }
};

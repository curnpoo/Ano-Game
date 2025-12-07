import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import type { DrawingStroke } from '../types';

/**
 * Service for rendering and managing avatar images
 */
export const AvatarService = {
    /**
     * Render avatar strokes to a data URL (for preview or local use)
     */
    renderToDataUrl: (
        strokes: DrawingStroke[],
        backgroundColor: string = '#ffffff',
        size: number = 200
    ): string => {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) return '';

        // Fill background
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, size, size);

        // Render each stroke with proper effects
        for (const stroke of strokes) {
            if (!stroke.points || stroke.points.length === 0) continue;

            const points = stroke.points.map(p => ({
                x: (p.x / 100) * size,
                y: (p.y / 100) * size
            }));

            // Reset context
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = stroke.color;
            ctx.fillStyle = stroke.color;
            ctx.lineWidth = stroke.size * (size / 100);
            ctx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over';
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
            ctx.globalAlpha = 1.0;

            if (stroke.isEraser) {
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.stroke();
                continue;
            }

            switch (stroke.type) {
                case 'marker':
                    ctx.globalAlpha = 0.5;
                    ctx.shadowBlur = stroke.size * 0.2 * (size / 100);
                    ctx.shadowColor = stroke.color;
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    for (let i = 1; i < points.length; i++) {
                        ctx.lineTo(points[i].x, points[i].y);
                    }
                    ctx.stroke();
                    break;

                case 'neon':
                    ctx.globalCompositeOperation = 'lighter';
                    ctx.shadowBlur = 30 * (size / 200);
                    ctx.shadowColor = stroke.color;
                    ctx.globalAlpha = 0.5;
                    ctx.lineWidth = stroke.size * 1.5 * (size / 100);
                    ctx.beginPath();
                    ctx.moveTo(points[0].x, points[0].y);
                    for (let i = 1; i < points.length; i++) {
                        ctx.lineTo(points[i].x, points[i].y);
                    }
                    ctx.stroke();
                    // White core
                    ctx.globalCompositeOperation = 'source-over';
                    ctx.strokeStyle = '#ffffff';
                    ctx.lineWidth = Math.max(1, stroke.size / 3) * (size / 100);
                    ctx.globalAlpha = 1.0;
                    ctx.stroke();
                    break;

                case 'pixel':
                    ctx.imageSmoothingEnabled = false;
                    const gridSize = Math.max(1, Math.floor(stroke.size * (size / 100)));
                    points.forEach((p) => {
                        const snapX = Math.floor(p.x / gridSize) * gridSize;
                        const snapY = Math.floor(p.y / gridSize) * gridSize;
                        ctx.fillRect(snapX, snapY, gridSize, gridSize);
                    });
                    ctx.imageSmoothingEnabled = true;
                    break;

                case 'calligraphy':
                    const angle = -45 * Math.PI / 180;
                    const penWidth = stroke.size * (size / 100);
                    ctx.fillStyle = stroke.color;
                    points.forEach((p, i) => {
                        if (i > 0) {
                            const prev = points[i - 1];
                            const dx = (penWidth / 2) * Math.cos(angle);
                            const dy = (penWidth / 2) * Math.sin(angle);
                            ctx.beginPath();
                            ctx.moveTo(prev.x - dx, prev.y - dy);
                            ctx.lineTo(p.x - dx, p.y - dy);
                            ctx.lineTo(p.x + dx, p.y + dy);
                            ctx.lineTo(prev.x + dx, prev.y + dy);
                            ctx.closePath();
                            ctx.fill();
                        }
                    });
                    break;

                case 'spray':
                    // Use deterministic seeded random for consistency
                    const radiusS = stroke.size * 3 * (size / 100);
                    const dotCountS = Math.floor(stroke.size * 1.5);

                    // Seed based on stroke properties for determinism
                    let seed = stroke.points.reduce((acc, p) => acc + p.x + p.y, 0);
                    const seededRandom = () => {
                        seed = (seed * 9301 + 49297) % 233280;
                        return seed / 233280;
                    };

                    points.forEach((p, i) => {
                        const prev = i > 0 ? points[i - 1] : p;
                        const dist = Math.hypot(p.x - prev.x, p.y - prev.y);
                        const steps = Math.max(1, Math.ceil(dist / (stroke.size * 0.1 * (size / 100))));

                        for (let s = 0; s < steps; s++) {
                            const t = s / steps;
                            const cx = prev.x + (p.x - prev.x) * t;
                            const cy = prev.y + (p.y - prev.y) * t;

                            for (let d = 0; d < dotCountS; d++) {
                                const a = seededRandom() * Math.PI * 2;
                                const r = radiusS * Math.pow(seededRandom(), 2);
                                const px = cx + Math.cos(a) * r;
                                const py = cy + Math.sin(a) * r;
                                ctx.fillRect(px, py, 1, 1);
                            }
                        }
                    });
                    break;

                default:
                    ctx.beginPath();
                    if (points.length === 1) {
                        ctx.arc(points[0].x, points[0].y, stroke.size / 2 * (size / 100), 0, Math.PI * 2);
                        ctx.fill();
                    } else {
                        ctx.moveTo(points[0].x, points[0].y);
                        for (let i = 1; i < points.length; i++) {
                            ctx.lineTo(points[i].x, points[i].y);
                        }
                        ctx.stroke();
                    }
                    break;
            }
        }

        // Reset context
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1.0;

        return canvas.toDataURL('image/png');
    },

    /**
     * Render avatar and upload to Firebase Storage, return download URL
     */
    renderAndUpload: async (
        userId: string,
        strokes: DrawingStroke[],
        backgroundColor: string = '#ffffff'
    ): Promise<string> => {
        const dataUrl = AvatarService.renderToDataUrl(strokes, backgroundColor, 200);

        if (!dataUrl) {
            throw new Error('Failed to render avatar');
        }

        // Upload to Firebase Storage
        const fileName = `${Date.now()}.png`;
        const storageRefPath = ref(storage, `avatars/${userId}/${fileName}`);

        const snapshot = await uploadString(storageRefPath, dataUrl, 'data_url');
        const downloadUrl = await getDownloadURL(snapshot.ref);

        return downloadUrl;
    }
};

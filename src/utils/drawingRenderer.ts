import type { BlockInfo, DrawingStroke } from '../types';

export async function loadImageElement(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = src;
    });
}

export function renderStrokeToContext(
    ctx: CanvasRenderingContext2D,
    stroke: DrawingStroke,
    points: { x: number; y: number }[]
): void {
    if (!points.length) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.globalCompositeOperation = stroke.isEraser ? 'destination-out' : 'source-over';
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.globalAlpha = 1.0;
    ctx.imageSmoothingEnabled = true;

    if (stroke.isEraser) {
        ctx.beginPath();
        if (points.length === 1) {
            ctx.arc(points[0].x, points[0].y, stroke.size / 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
            ctx.stroke();
        }
        return;
    }

    switch (stroke.type) {
        case 'marker':
            ctx.globalAlpha = 0.5;
            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = stroke.size * 0.2;
            ctx.shadowColor = stroke.color;
            ctx.beginPath();
            if (points.length === 1) {
                ctx.arc(points[0].x, points[0].y, stroke.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
                ctx.stroke();
            }
            break;

        case 'neon':
            ctx.globalCompositeOperation = 'lighter';
            ctx.shadowBlur = 30;
            ctx.shadowColor = stroke.color;
            ctx.globalAlpha = 0.5;
            ctx.lineWidth = stroke.size * 1.5;
            ctx.beginPath();
            if (points.length === 1) {
                ctx.arc(points[0].x, points[0].y, stroke.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
                ctx.stroke();
            }

            ctx.shadowBlur = 10;
            ctx.globalAlpha = 0.8;
            ctx.lineWidth = stroke.size;
            ctx.stroke();

            ctx.globalCompositeOperation = 'source-over';
            ctx.shadowBlur = 5;
            ctx.shadowColor = 'white';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = Math.max(1, stroke.size / 3);
            ctx.globalAlpha = 1.0;
            ctx.stroke();
            break;

        case 'pixel': {
            ctx.imageSmoothingEnabled = false;
            const gridSize = Math.max(1, Math.floor(stroke.size));

            const drawPixel = (px: number, py: number) => {
                const snapX = Math.floor(px / gridSize) * gridSize;
                const snapY = Math.floor(py / gridSize) * gridSize;
                ctx.fillRect(snapX, snapY, gridSize, gridSize);
            };

            points.forEach((point, index) => {
                if (index === 0) {
                    drawPixel(point.x, point.y);
                    return;
                }

                const prev = points[index - 1];
                const dist = Math.hypot(point.x - prev.x, point.y - prev.y);
                const steps = Math.ceil((dist / gridSize) * 2);
                for (let step = 1; step <= steps; step++) {
                    const t = step / steps;
                    drawPixel(
                        prev.x + (point.x - prev.x) * t,
                        prev.y + (point.y - prev.y) * t
                    );
                }
            });
            break;
        }

        case 'calligraphy': {
            const angle = -45 * Math.PI / 180;
            const penWidth = stroke.size;
            ctx.fillStyle = stroke.color;
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = 1;

            points.forEach((point, index) => {
                if (index === 0) return;
                const prev = points[index - 1];
                const dx = (penWidth / 2) * Math.cos(angle);
                const dy = (penWidth / 2) * Math.sin(angle);

                ctx.beginPath();
                ctx.moveTo(prev.x - dx, prev.y - dy);
                ctx.lineTo(point.x - dx, point.y - dy);
                ctx.lineTo(point.x + dx, point.y + dy);
                ctx.lineTo(prev.x + dx, prev.y + dy);
                ctx.closePath();
                ctx.fill();
            });
            break;
        }

        case 'spray': {
            const radius = stroke.size * 3;
            const dotCount = Math.floor(stroke.size * 1.5);
            let seed = stroke.points.reduce((acc, point) => acc + point.x + point.y, 0);
            const seededRandom = () => {
                seed = (seed * 9301 + 49297) % 233280;
                return seed / 233280;
            };

            points.forEach((point, index) => {
                const prev = index > 0 ? points[index - 1] : point;
                const dist = Math.hypot(point.x - prev.x, point.y - prev.y);
                const steps = Math.max(1, Math.ceil(dist / Math.max(1, stroke.size * 0.1)));

                for (let step = 0; step < steps; step++) {
                    const t = step / steps;
                    const cx = prev.x + (point.x - prev.x) * t;
                    const cy = prev.y + (point.y - prev.y) * t;

                    for (let dot = 0; dot < dotCount; dot++) {
                        const angle = seededRandom() * Math.PI * 2;
                        const distance = radius * Math.pow(seededRandom(), 2);
                        ctx.fillRect(
                            cx + Math.cos(angle) * distance,
                            cy + Math.sin(angle) * distance,
                            1,
                            1
                        );
                    }
                }
            });
            break;
        }

        default:
            ctx.beginPath();
            if (points.length === 1) {
                ctx.arc(points[0].x, points[0].y, stroke.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
                ctx.stroke();
            }
            break;
    }
}

export function drawBlockToContext(
    ctx: CanvasRenderingContext2D,
    block: BlockInfo | null | undefined,
    canvasSize: number,
    borderWidth = 0
): void {
    if (!block) return;

    ctx.fillStyle = '#ffffff';
    const bx = borderWidth + (block.x / 100) * canvasSize;
    const by = borderWidth + (block.y / 100) * canvasSize;
    const blockSize = (block.size / 100) * canvasSize;

    if (block.type === 'circle') {
        ctx.beginPath();
        ctx.arc(bx + blockSize / 2, by + blockSize / 2, blockSize / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
    }

    ctx.fillRect(bx, by, blockSize, blockSize);
}

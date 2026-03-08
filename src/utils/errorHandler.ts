import { ERROR_CODES, getFriendlyErrorMessage } from '../constants/errorCodes';

export interface GameError {
    code: string;
    message: string;
    originalError?: any;
    isFatal: boolean;
    timestamp: number;
}

export const analyzeError = (error: any): GameError => {
    const message = error?.message || (typeof error === 'string' ? error : 'Unknown error occurred');
    let code: string = ERROR_CODES.UNKNOWN_ERROR;
    let isFatal = false;

    // Analyze error message to determine code
    const msgLower = message.toLowerCase();

    // Network / Connection
    if (msgLower.includes('network') || msgLower.includes('offline') || msgLower.includes('connection')) {
        code = ERROR_CODES.NETWORK_ERROR;
    }
    else if (msgLower.includes('timeout')) {
        code = ERROR_CODES.TIMEOUT_ERROR;
    }

    // Room
    else if (msgLower.includes('room not found') || msgLower.includes('room does not exist')) {
        code = ERROR_CODES.ROOM_NOT_FOUND;
        isFatal = true; // Usually fatal if you're trying to play
    }
    else if (msgLower.includes('full') && msgLower.includes('room')) {
        code = ERROR_CODES.ROOM_FULL;
    }
    else if (msgLower.includes('kicked') || msgLower.includes('removed')) {
        code = ERROR_CODES.KICKED_FROM_ROOM;
        isFatal = true;
    }

    // Auth
    else if (msgLower.includes('auth') || msgLower.includes('login') || msgLower.includes('sign in')) {
        code = ERROR_CODES.AUTH_LOGIN_FAILED;
        isFatal = true;
    }
    else if (msgLower.includes('permission') || msgLower.includes('access denied')) {
        code = ERROR_CODES.PERMISSION_DENIED;
    }

    // Game Logic
    else if (msgLower.includes('upload') || msgLower.includes('storage')) {
        code = ERROR_CODES.IMAGE_UPLOAD_FAILED;
    }
    else if (msgLower.includes('canvas') || msgLower.includes('context')) {
        code = ERROR_CODES.CANVAS_ERROR;
    }

    // Explicit Fatal Check
    // If the error object explicitly says it's fatal (custom error throwing)
    if (error?.isFatal) {
        isFatal = true;
    }

    return {
        code,
        message,
        originalError: error,
        isFatal,
        timestamp: Date.now()
    };
};

export const formatErrorMessage = (error: any): string => {
    const analyzed = analyzeError(error);
    const friendly = getFriendlyErrorMessage(analyzed.code);
    const hasSpecificMessage =
        analyzed.message &&
        analyzed.message !== 'Unknown error occurred' &&
        analyzed.message !== friendly;

    // Keep specific actionable upload/canvas/storage messages instead of collapsing them
    // into the generic friendly copy. Otherwise the user only sees ERR_GAME_003 again.
    const shouldPreferSpecificMessage =
        analyzed.code === ERROR_CODES.UNKNOWN_ERROR ||
        analyzed.code === ERROR_CODES.IMAGE_UPLOAD_FAILED ||
        analyzed.code === ERROR_CODES.CANVAS_ERROR;

    const displayMsg = shouldPreferSpecificMessage && hasSpecificMessage
        ? analyzed.message
        : friendly;

    return `${displayMsg} [${analyzed.code}]`;
};

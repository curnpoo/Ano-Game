import { useState } from 'react';

export const useGameFlow = () => {
    const [isMyTimerRunning, setIsMyTimerRunning] = useState(false);
    const [showHowToPlay, setShowHowToPlay] = useState(false);
    const [isReadying, setIsReadying] = useState(false);

    const [showGameEnded, setShowGameEnded] = useState(false);
    const [showKicked, setShowKicked] = useState(false);
    const [endGameCountdown, setEndGameCountdown] = useState(3);
    const [kickCountdown, setKickCountdown] = useState(3);

    const [lastGameDetails, setLastGameDetails] = useState<{
        roomCode: string;
        hostName: string;
        playerCount: number;
    } | null>(null);

    return {
        isMyTimerRunning, setIsMyTimerRunning,
        showHowToPlay, setShowHowToPlay,
        isReadying, setIsReadying,
        showGameEnded, setShowGameEnded,
        showKicked, setShowKicked,
        endGameCountdown, setEndGameCountdown,
        kickCountdown, setKickCountdown,
        lastGameDetails, setLastGameDetails
    };
};

import { useMemo } from 'react';
import type { GameRoom, Player } from '../types';

interface RoomViewModelArgs {
    room: GameRoom | null;
    player: Player | null;
    optimisticTimerStart: number | null;
    optimisticHasSubmitted: boolean;
}

export const useRoomViewModel = ({
    room,
    player,
    optimisticTimerStart,
    optimisticHasSubmitted,
}: RoomViewModelArgs) => {
    return useMemo(() => {
        const myState = room?.playerStates?.[player?.id || ''];
        const submitted = myState?.status === 'submitted';
        const totalDuration = room?.settings?.timerDuration || 15;
        const hasTimeBonus = room?.timeBonusPlayerId === player?.id;
        const isTimeSabotaged =
            room?.sabotageTargetId === player?.id &&
            room?.sabotageEffect?.type === 'subtract_time';
        const penalty = Math.ceil(totalDuration * 0.2);
        const powerupExtra = myState?.extraTime || 0;
        const timekeeperBonus = player?.activePowerups?.includes('timekeeper') ? 5 : 0;
        const bonusTime =
            (hasTimeBonus ? 5 : 0) +
            powerupExtra +
            timekeeperBonus -
            (isTimeSabotaged ? penalty : 0);

        const effectiveStartedAt = myState?.timerStartedAt || optimisticTimerStart;
        const endsAt = effectiveStartedAt
            ? effectiveStartedAt + (totalDuration + bonusTime) * 1000
            : null;

        const players = room?.players ?? [];
        const playerStates = room?.playerStates ?? {};

        return {
            myPlayerState: myState,
            hasSubmitted: submitted || optimisticHasSubmitted,
            timerEndsAt: endsAt,
            effectiveTotalDuration: totalDuration + bonusTime,
            submittedCount: Object.values(playerStates).filter((state) => state.status === 'submitted').length,
            totalPlayers: players.length,
            unfinishedPlayers: players.filter((currentPlayer) => {
                if (optimisticHasSubmitted && currentPlayer.id === player?.id) return false;
                return playerStates[currentPlayer.id]?.status !== 'submitted';
            }),
        };
    }, [optimisticHasSubmitted, optimisticTimerStart, player, room]);
};

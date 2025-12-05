import { ref, set, get, onValue, off } from 'firebase/database';
import { database } from '../firebase';
import type { GameRoom, Player, PlayerDrawing, GameSettings, BlockInfo, PlayerState, RoundResult } from '../types';

const ROOMS_PATH = 'rooms';

const DEFAULT_SETTINGS: GameSettings = {
    timerDuration: 15,
    totalRounds: 5
};

export const StorageService = {
    // Helpers
    normalizeRoom: (data: any): GameRoom => {
        if (!data.players) data.players = [];
        else if (!Array.isArray(data.players)) data.players = Object.values(data.players);

        if (!data.playerStates) data.playerStates = {};
        if (!data.votes) data.votes = {};
        if (!data.scores) data.scores = {};
        if (!data.roundResults) data.roundResults = [];
        else if (!Array.isArray(data.roundResults)) data.roundResults = Object.values(data.roundResults);

        if (!data.settings) data.settings = DEFAULT_SETTINGS;

        return data as GameRoom;
    },

    // Generate random block for the image
    generateBlock: (): BlockInfo => {
        const isCircle = Math.random() > 0.5;
        const size = 25 + Math.random() * 15; // 25-40% of image

        if (isCircle) {
            // Circle somewhere in the middle area
            return {
                type: 'circle',
                x: 30 + Math.random() * 40, // 30-70%
                y: 30 + Math.random() * 40,
                size
            };
        } else {
            // Square in one of the corners
            const corners = [
                { x: 5, y: 5 },    // top-left
                { x: 65, y: 5 },   // top-right
                { x: 5, y: 65 },   // bottom-left
                { x: 65, y: 65 }   // bottom-right
            ];
            const corner = corners[Math.floor(Math.random() * corners.length)];
            return {
                type: 'square',
                x: corner.x + Math.random() * 10,
                y: corner.y + Math.random() * 10,
                size: size * 0.9
            };
        }
    },

    // Room Management
    createRoom: async (roomCode: string, hostPlayer: Player): Promise<GameRoom> => {
        const room: GameRoom = {
            roomCode,
            hostId: hostPlayer.id,
            status: 'lobby',
            settings: DEFAULT_SETTINGS,
            roundNumber: 0,
            players: [hostPlayer],
            playerStates: {},
            votes: {},
            scores: {},
            roundResults: [],
            createdAt: Date.now(),
        };

        const roomRef = ref(database, `${ROOMS_PATH}/${roomCode}`);
        await set(roomRef, room);
        return room;
    },

    getRoom: async (roomCode: string): Promise<GameRoom | null> => {
        const roomRef = ref(database, `${ROOMS_PATH}/${roomCode}`);
        const snapshot = await get(roomRef);
        if (snapshot.exists()) {
            return StorageService.normalizeRoom(snapshot.val());
        }
        return null;
    },

    saveRoom: async (room: GameRoom): Promise<void> => {
        const roomRef = ref(database, `${ROOMS_PATH}/${room.roomCode}`);
        await set(roomRef, room);
    },

    updateRoom: async (roomCode: string, updateFn: (room: GameRoom) => GameRoom): Promise<GameRoom | null> => {
        try {
            const room = await StorageService.getRoom(roomCode);
            if (room) {
                const updatedRoom = updateFn(room);
                await StorageService.saveRoom(updatedRoom);
                return updatedRoom;
            }
            return null;
        } catch (error) {
            console.error('Error updating room:', error);
            throw error;
        }
    },

    // Subscribe to room changes (real-time)
    subscribeToRoom: (roomCode: string, callback: (room: GameRoom | null) => void): (() => void) => {
        console.log('Subscribing to room:', roomCode);
        const roomRef = ref(database, `${ROOMS_PATH}/${roomCode}`);

        const listener = onValue(roomRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = StorageService.normalizeRoom(snapshot.val());
                callback(data);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error('Firebase subscription error:', error);
        });

        return () => {
            off(roomRef, 'value', listener);
        };
    },

    // Player Session (localStorage for individual session)
    saveSession: (player: Player): void => {
        localStorage.setItem('aic_game_session', JSON.stringify(player));
    },

    getSession: (): Player | null => {
        const data = localStorage.getItem('aic_game_session');
        return data ? JSON.parse(data) : null;
    },

    generateRoomCode: (): string => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    joinRoom: async (roomCode: string, player: Player): Promise<GameRoom | null> => {
        const room = await StorageService.getRoom(roomCode);
        if (!room) return null;

        const existingPlayerIndex = room.players.findIndex(p => p.id === player.id);
        if (existingPlayerIndex >= 0) {
            room.players[existingPlayerIndex] = { ...player, lastSeen: Date.now() };
        } else {
            room.players.push({ ...player, lastSeen: Date.now() });
        }

        // Initialize player state and score
        if (!room.playerStates[player.id]) {
            room.playerStates[player.id] = { status: 'waiting' };
        }
        if (room.scores[player.id] === undefined) {
            room.scores[player.id] = 0;
        }

        await StorageService.saveRoom(room);
        return room;
    },

    // Game Settings
    updateSettings: async (roomCode: string, settings: Partial<GameSettings>): Promise<GameRoom | null> => {
        return StorageService.updateRoom(roomCode, (r) => ({
            ...r,
            settings: { ...r.settings, ...settings }
        }));
    },

    // Start a new round
    startRound: async (roomCode: string, imageUrl: string, uploadedBy: string): Promise<GameRoom | null> => {
        const block = StorageService.generateBlock();

        return StorageService.updateRoom(roomCode, (r) => {
            // Reset player states for new round
            const playerStates: { [id: string]: PlayerState } = {};
            r.players.forEach(p => {
                playerStates[p.id] = { status: 'waiting' };
            });

            return {
                ...r,
                status: 'drawing',
                roundNumber: r.roundNumber + 1,
                currentImage: {
                    url: imageUrl,
                    uploadedBy,
                    uploadedAt: Date.now()
                },
                block,
                playerStates,
                votes: {}
            };
        });
    },

    // Player ready to draw (starts their personal timer)
    playerReady: async (roomCode: string, playerId: string): Promise<GameRoom | null> => {
        return StorageService.updateRoom(roomCode, (r) => ({
            ...r,
            playerStates: {
                ...r.playerStates,
                [playerId]: {
                    ...r.playerStates[playerId],
                    status: 'drawing',
                    timerStartedAt: Date.now()
                }
            }
        }));
    },

    // Submit drawing
    submitDrawing: async (roomCode: string, drawing: PlayerDrawing): Promise<GameRoom | null> => {
        return StorageService.updateRoom(roomCode, (r) => {
            const newPlayerStates = {
                ...r.playerStates,
                [drawing.playerId]: {
                    status: 'submitted' as const,
                    drawing
                }
            };

            // Check if all players have submitted
            const allSubmitted = r.players.every(p =>
                newPlayerStates[p.id]?.status === 'submitted'
            );

            return {
                ...r,
                playerStates: newPlayerStates,
                status: allSubmitted ? 'voting' : r.status
            };
        });
    },

    // Submit vote
    submitVote: async (roomCode: string, oderId: string, votedForId: string): Promise<GameRoom | null> => {
        return StorageService.updateRoom(roomCode, (r) => {
            const newVotes = { ...r.votes, [oderId]: votedForId };

            // Check if all players have voted
            const allVoted = r.players.every(p => newVotes[p.id]);

            // If all voted, calculate results
            if (allVoted) {
                // Count votes
                const voteCounts: { [playerId: string]: number } = {};
                r.players.forEach(p => { voteCounts[p.id] = 0; });
                Object.values(newVotes).forEach(votedFor => {
                    voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
                });

                // Sort by votes
                const rankings = r.players
                    .map(p => ({
                        playerId: p.id,
                        playerName: p.name,
                        votes: voteCounts[p.id] || 0,
                        points: 0
                    }))
                    .sort((a, b) => b.votes - a.votes);

                // Award points (3, 2, 1 for top 3)
                if (rankings[0]) rankings[0].points = 3;
                if (rankings[1]) rankings[1].points = 2;
                if (rankings[2]) rankings[2].points = 1;

                // Update scores
                const newScores = { ...r.scores };
                rankings.forEach(rank => {
                    newScores[rank.playerId] = (newScores[rank.playerId] || 0) + rank.points;
                });

                const roundResult: RoundResult = {
                    roundNumber: r.roundNumber,
                    rankings
                };

                const isFinalRound = r.roundNumber >= r.settings.totalRounds;

                return {
                    ...r,
                    votes: newVotes,
                    scores: newScores,
                    roundResults: [...r.roundResults, roundResult],
                    status: isFinalRound ? 'final' : 'results'
                };
            }

            return {
                ...r,
                votes: newVotes
            };
        });
    },

    // Continue to next round (from results screen)
    nextRound: async (roomCode: string): Promise<GameRoom | null> => {
        return StorageService.updateRoom(roomCode, (r) => ({
            ...r,
            status: 'lobby',
            currentImage: null,
            block: undefined,
            playerStates: {},
            votes: {}
        }));
    },

    // Reset game for new game
    resetGame: async (roomCode: string): Promise<GameRoom | null> => {
        return StorageService.updateRoom(roomCode, (r) => ({
            ...r,
            status: 'lobby',
            roundNumber: 0,
            currentImage: null,
            block: undefined,
            playerStates: {},
            votes: {},
            scores: {},
            roundResults: []
        }));
    }
};

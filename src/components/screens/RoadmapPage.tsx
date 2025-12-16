import React, { useState } from 'react';
import { MonogramBackground } from '../common/MonogramBackground';
import './RoadmapPage.css';

interface RoadmapTask {
    id: string;
    type: 'FIX' | 'FEAT' | 'ADD' | 'REMOVE' | 'REFACTOR' | 'CONFIRMED';
    title: string;
    description?: string;
    completedDate?: string;
}

interface RoadmapColumn {
    id: string;
    title: string;
    emoji: string;
    color: string;
    tasks: RoadmapTask[];
}

// Done items with completion dates
const doneItems: RoadmapTask[] = [
    { id: 'd1', type: 'CONFIRMED', title: 'Game Loop', description: 'Core game loop is working', completedDate: 'Dec 1' },
    { id: 'd2', type: 'FIX', title: 'Player Profile picture in waiting for upload screen', description: 'Fixed visibility and text contrast on dark background', completedDate: 'Dec 7' },
    { id: 'd3', type: 'FIX', title: 'Results screen scrolling', description: 'Results can now be scrolled', completedDate: 'Dec 8' },
    { id: 'd4', type: 'FIX', title: 'Drawing round UI and UX', description: 'Timer aligned with canvas, Bento style toolbar, touch-friendly interface', completedDate: 'Dec 8' },
    { id: 'd5', type: 'REMOVE', title: 'Circle above color picker', description: 'Removed preview circle, color reflects on profile photo directly', completedDate: 'Dec 8' },
    { id: 'd6', type: 'FIX', title: 'Popup z-index issue', description: 'Leave/join popup is now front and foremost above all menus', completedDate: 'Dec 9' },
    { id: 'd7', type: 'FIX', title: 'Remove Landscape mode', description: 'App locked to portrait-only orientation with landscape blocker overlay', completedDate: 'Dec 10' },
    { id: 'd8', type: 'ADD', title: 'Profile picture loading state', description: 'Universal loading spinner shown when fetching profile pictures', completedDate: 'Dec 10' },
    { id: 'd9', type: 'FIX', title: 'Level 0 bug', description: 'XP synced from Firebase to fix level calculation for older accounts', completedDate: 'Dec 10' },
    { id: 'd10', type: 'FEAT', title: 'Pinch-to-zoom on drawing canvas', description: 'iOS-native spring physics, two-finger pan, drawing disabled during gestures', completedDate: 'Dec 10' },
    { id: 'd11', type: 'FEAT', title: 'iOS-style toast notifications', description: 'Redesigned toasts with glassmorphism, spring animations, and action buttons', completedDate: 'Dec 10' },
    { id: 'd12', type: 'FEAT', title: 'Grouped notifications', description: 'Multiple notifications batch together with dynamic sizing', completedDate: 'Dec 10' },
    { id: 'd13', type: 'ADD', title: 'Database cleanup script', description: 'Script to clear stale rooms, drawings, presence, invites, and friendRequests', completedDate: 'Dec 10' },
    { id: 'd14', type: 'FEAT', title: 'Tappable notification cards', description: 'Tap anywhere on notification to take action, left pill to dismiss', completedDate: 'Dec 10' },
    { id: 'd15', type: 'ADD', title: 'Notification timer progress bar', description: 'Gradient line shrinks inward showing time remaining before auto-dismiss', completedDate: 'Dec 10' },
    { id: 'd16', type: 'FIX', title: 'Loading screen transition', description: 'Smooth transition with 500ms delay after all checks complete', completedDate: 'Dec 10' },
    { id: 'd17', type: 'FIX', title: 'Help overlay animation polish', description: 'Refined animation timing and line endpoints for help guide', completedDate: 'Dec 11' },
    { id: 'd18', type: 'FIX', title: 'Double loading screen', description: 'Removed janky secondary loading screen, only smart loader visible', completedDate: 'Dec 13' },
    { id: 'd19', type: 'FEAT', title: 'Avatars on Final Results', description: 'Player avatars now display on Game Over and Final Scores screens', completedDate: 'Dec 13' },
    { id: 'd20', type: 'FIX', title: 'Casino navigation bug', description: 'Fixed back button navigation from casino screen', completedDate: 'Dec 13' },
    { id: 'd21', type: 'FEAT', title: 'Realtime presence system', description: 'Accurate Online/Offline/Playing statuses for friends', completedDate: 'Dec 14' },
    { id: 'd22', type: 'FIX', title: 'Avatar rendering consistency', description: 'Pre-rendered avatarImageUrl used across all screens with stroke fallback', completedDate: 'Dec 14' },
    { id: 'd23', type: 'FIX', title: 'Push notifications', description: 'Fixed external push notifications for background messaging', completedDate: 'Dec 15' },
    { id: 'd24', type: 'FEAT', title: 'Challenges system', description: 'Challenges panel with progress tracking and completion logic', completedDate: 'Dec 15' },
    { id: 'd25', type: 'REFACTOR', title: 'Profile setup screen', description: 'Added back button, purchased-only items, legacy borders in store', completedDate: 'Dec 15' },
    { id: 'd26', type: 'FIX', title: 'Gallery block overlay', description: 'Block data correctly captured and visible in Match History', completedDate: 'Dec 16' },
    { id: 'd27', type: 'FEAT', title: 'Guest account restrictions', description: 'Guest status indicator, grayed out features, account creation prompts', completedDate: 'Dec 16' },
    { id: 'd28', type: 'REFACTOR', title: 'Bundle size optimization', description: 'Lazy loading for RoadmapPage/ShareModal, vendor chunk splitting', completedDate: 'Dec 16' },
    { id: 'd29', type: 'FIX', title: 'CLS performance', description: 'Font loading moved to index.html, user preferences applied inline', completedDate: 'Dec 16' },
    { id: 'd30', type: 'FIX', title: 'Empty game join prevention', description: 'Auto-close empty games in Firebase, gray out left games in room list', completedDate: 'Dec 16' },
    { id: 'd31', type: 'FIX', title: 'Timer end screen flow', description: 'Toolbar stays visible when timer ends, blurred overlay on ready', completedDate: 'Dec 16' },
    { id: 'd32', type: 'FIX', title: 'Home from results = left game', description: 'Clicking home marks player as left, no rejoin button on HomeScreen', completedDate: 'Dec 16' },
    { id: 'd33', type: 'FEAT', title: 'Game start notifications', description: 'In-app modal + push notification when host starts game, deep link to jump into round', completedDate: 'Dec 16' },
    { id: 'd34', type: 'FEAT', title: 'Deep Linking', description: 'Invite links bypass home screen and drop users directly into specific game lobby', completedDate: 'Dec 16' },
    { id: 'd35', type: 'FEAT', title: 'Post-game Account Prompt', description: 'Guest restrictions with prompts to create account to save stats/drawings', completedDate: 'Dec 16' },
];

const roadmapData: RoadmapColumn[] = [
    {
        id: 'working',
        title: 'Working',
        emoji: '🔧',
        color: '#f59e0b',
        tasks: [
            { id: 'w1', type: 'FIX', title: 'Fix sabotage mechanic', description: '[DrawingScreen.tsx, VotingScreen.tsx, GameService] Sabotage game mode needs work - fix saboteur assignment, voting logic, random round selection, and reveal flow' },
            { id: 'w2', type: 'FIX', title: 'Service worker MIME errors', description: '[sw.ts, vite.config.ts] Fix intermittent text/html MIME type errors on app restart' },
        ]
    },
    {
        id: 'today',
        title: 'Today',
        emoji: '📅',
        color: '#eab308',
        tasks: [
            { id: 't1', type: 'FIX', title: 'Verify Database Cleanup', description: 'Run and verify the database cleanup script on production data' },
            { id: 't2', type: 'FIX', title: 'Fix "Money Earned" stat', description: '[FinalResultsScreen.tsx, UserService] Ensure totalCurrencyEarned is correctly tracked and incremented' },
            { id: 't3', type: 'FIX', title: 'iPhone haptic feedback', description: '[utils/haptics.ts] Investigate why haptic feedback only works on Android, implement iOS-compatible solution' },
        ]
    },
    {
        id: 'tomorrow',
        title: 'Tomorrow',
        emoji: '📆',
        color: '#3b82f6',
        tasks: [
            { id: 'tm1', type: 'FEAT', title: 'Conditional Idle Refresh', description: '[App.tsx] Ensure auto-refresh only triggers when user is on homescreen and truly idle' },
            { id: 'tm2', type: 'FEAT', title: 'Add invites section', description: '[HomeScreen.tsx, new InvitesPanel component] Add section showing game invites from friends, auto-clear after 5 hours, allow late join' },
            { id: 'tm3', type: 'FEAT', title: 'Update/Version Popup Logic', description: '[App.tsx, UpdateNotification.tsx] Check version.json vs running version to show "Update Available" only when needed' },
        ]
    },
    {
        id: 'later',
        title: 'Later',
        emoji: '🔮',
        color: '#8b5cf6',
        tasks: [
            { id: 'l1', type: 'FEAT', title: 'Replay mode', description: '[FinalResultsScreen.tsx, new ReplayPlayer component] Add playback feature that animates strokes appearing in real-time for each drawing' },
            { id: 'l2', type: 'FEAT', title: 'Waiting room minigame', description: '[LobbyScreen.tsx, new WaitingMinigame component] Add interactive activities while waiting for other players between rounds' },
            { id: 'l3', type: 'FEAT', title: 'NEW GAME MODES!', description: '[GameService, RoomSelectionScreen.tsx] Add new game mode options beyond standard drawing guessing' },
            { id: 'l4', type: 'FEAT', title: 'Dark and Light mode', description: '[ThemeProvider, all screens] Add theme toggle with cohesive dark/light color schemes across entire app' },
            { id: 'l5', type: 'FEAT', title: 'Release iOS app', description: 'Deploy to App Store' },
        ]
    },
    {
        id: 'todo',
        title: 'Backlog',
        emoji: '📋',
        color: '#ec4899',
        tasks: [
            { id: 'b1', type: 'FIX', title: 'Polish animations for iOS native feel', description: '[All animation files, ScreenTransition.tsx] Apply Apple HIG spring physics, consistent easing curves, and gesture feedback across all interactions' },
            { id: 'b2', type: 'FIX', title: 'Smooth transitions overhaul', description: '[App.tsx, ScreenTransition.tsx, transitions.css] Optimize all screen-to-screen transitions for 60fps with preloading and GPU acceleration' },
            { id: 'b3', type: 'REFACTOR', title: 'Performance optimization', description: '[GameService, Firebase listeners, React components] Reduce network calls, optimize re-renders, fix lag on slow connections' },
            { id: 'b4', type: 'REFACTOR', title: 'Universal Button Components', description: '[src/components/common/] Create reusable GlassButton, IconButton, ActionButton components with consistent styling and animations' },
            { id: 'b5', type: 'FEAT', title: 'Viral Match History', description: 'Match history images auto-generated with "anogame.xyz" watermark to drive organic growth' },
            { id: 'b6', type: 'ADD', title: 'Admin Stats Dashboard', description: 'Secret desktop-only URL to view high-fidelity game analytics (DAU, rounds played, retention, economy stats)' },
        ]
    }
];

const typeColors: Record<string, { bg: string; text: string }> = {
    FIX: { bg: 'rgba(239, 68, 68, 0.2)', text: '#ef4444' },
    FEAT: { bg: 'rgba(34, 197, 94, 0.2)', text: '#22c55e' },
    ADD: { bg: 'rgba(59, 130, 246, 0.2)', text: '#3b82f6' },
    REMOVE: { bg: 'rgba(249, 115, 22, 0.2)', text: '#f97316' },
    REFACTOR: { bg: 'rgba(168, 85, 247, 0.2)', text: '#a855f7' },
    CONFIRMED: { bg: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
};

export const RoadmapPage: React.FC = () => {
    const [isDoneExpanded, setIsDoneExpanded] = useState(false);

    const handleBackToGame = () => {
        window.location.href = '/';
    };

    return (
        <div className="roadmap-page">
            <MonogramBackground />

            {/* Header */}
            <header className="roadmap-header">
                <div className="header-top-row">
                    <button onClick={handleBackToGame} className="back-button">
                        ← Back
                    </button>
                    <div className="version-badge">v0.9.0</div>
                </div>
                <div className="header-content">
                    <h1>🗺️ Roadmap</h1>
                    <p className="subtitle">What's coming to ANO</p>
                    <p className="last-updated">Last updated: December 16, 2025</p>
                </div>
            </header>

            {/* Done Dropdown */}
            <section className="done-dropdown">
                <button
                    className="done-dropdown-header"
                    onClick={() => setIsDoneExpanded(!isDoneExpanded)}
                >
                    <div className="done-dropdown-left">
                        <span className="done-emoji">✅</span>
                        <span className="done-title">Done</span>
                        <span className="done-count">{doneItems.length}</span>
                    </div>
                    <span className={`done-chevron ${isDoneExpanded ? 'expanded' : ''}`}>
                        ▼
                    </span>
                </button>

                {isDoneExpanded && (
                    <div className="done-dropdown-content">
                        {doneItems.map((task) => (
                            <article key={task.id} className="task-card done-task-card">
                                <div className="task-header">
                                    <span
                                        className="task-type"
                                        style={{
                                            backgroundColor: typeColors[task.type]?.bg,
                                            color: typeColors[task.type]?.text
                                        }}
                                    >
                                        {task.type}
                                    </span>
                                    {task.completedDate && (
                                        <span className="task-completed-date">
                                            {task.completedDate}
                                        </span>
                                    )}
                                </div>
                                <h3 className="task-title">{task.title}</h3>
                                {task.description && (
                                    <p className="task-description">{task.description}</p>
                                )}
                            </article>
                        ))}
                    </div>
                )}
            </section>

            {/* Roadmap Grid */}
            <main className="roadmap-grid">
                {roadmapData.map((column) => (
                    <section key={column.id} className="roadmap-column">
                        <div className="column-header" style={{ borderColor: column.color }}>
                            <span className="column-emoji">{column.emoji}</span>
                            <h2>{column.title}</h2>
                            <span className="task-count">{column.tasks.length}</span>
                        </div>

                        <div className="column-tasks">
                            {column.tasks.map((task) => (
                                <article key={task.id} className="task-card">
                                    <div className="task-header">
                                        <span
                                            className="task-type"
                                            style={{
                                                backgroundColor: typeColors[task.type]?.bg,
                                                color: typeColors[task.type]?.text
                                            }}
                                        >
                                            {task.type}
                                        </span>
                                    </div>
                                    <h3 className="task-title">{task.title}</h3>
                                    {task.description && (
                                        <p className="task-description">{task.description}</p>
                                    )}
                                </article>
                            ))}
                        </div>
                    </section>
                ))}
            </main>

            {/* Footer */}
            <footer className="roadmap-footer">
                <p>Last updated: December 16, 2025</p>
                <p className="footer-note">Built with ❤️ by Curren</p>
            </footer>
        </div>
    );
};

export default RoadmapPage;

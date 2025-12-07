# ANO: The Party Drawing Game 🎨

**ANO** is a real-time, chaotic drawing game where players take turns annotating images and voting for the best (or funniest) addition. It's a digital party game designed for friends, laughter, and a bit of anarchy.

![Cover Image](./public/og-image.png)

## 🚀 The Vibe

We built **ANO** because we missed the raw fun of collaborative creativity. No complex rules, no steep learning curve—just jump in, draw on stuff, and try to make your friends laugh.

It's **Mobile-First Chaos**. The UI feels like a premium, vibrant toy—big buttons, neon colors, and snappy animations. Perfect for playing on your phone while hanging out on the couch or over a group call.

## ✨ Features

*   **Real-Time Everything**: See strokes appear instantly as your friends draw. Powered by Firebase Realtime Database.
*   **Zero-Friction Entry**: Scan a QR code or use a 4-letter room code to join instantly. No account required.
*   **Democratic Gameplay**: The game flows naturally. Anyone can become the uploader, everyone votes, and the group decides the winner.
*   **Tools of Destruction**: Markers, spray paint, pixel brushes, and more. Express yourself (badly) with style.
*   **Smart Room Management**: Late to the party? Join the "Waiting Room" and hop in next round. Disconnected? Refresh and you're right back in.

## 🎮 How to Play

1.  **Start a Party**: One person hosts and shares the 4-letter code (or QR code).
2.  **Join In**: Everyone else joins on their phones. Pick a nickname and a color.
3.  **The Subject**: The game picks an "Uploader" to choose a photo or take a fresh one.
4.  **Draw!**: Everyone gets 30 seconds to add their masterpiece to the image.
5.  **Vote**: Pick your favorite addition. You can't vote for yourself!
6.  **Win**: Earn points, level up, and unlock new badges.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Hex Engine (Custom Canvas)
*   **Styling**: Tailwind CSS, Framer Motion
*   **Backend**: Firebase Realtime Database (Serverless)

### Technical Highlights
*   **Resolution Independence**: All drawings use a percentage-based coordinate system (0-100%), ensuring your masterpiece looks the same on an iPhone and a desktop.
*   **State Machine Architecture**: The game logic is driven by a strict state machine, ensuring all 10+ players stay perfectly in sync through every phase of the game.

---

*Built with ❤️ (and a lot of chaos) by the Antigravity Team.*

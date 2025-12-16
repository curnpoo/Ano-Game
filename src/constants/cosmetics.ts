export const UNLOCKABLE_BRUSHES = [
    { id: 'default', name: 'Simple', emoji: '🖊️', price: 0 },
    { id: 'marker', name: 'Marker', emoji: '🖍️', price: 150 },
    { id: 'calligraphy', name: 'Ink Pen', emoji: '✒️', price: 200 },
    { id: 'pixel', name: 'Pixel', emoji: '👾', price: 250 },
    { id: 'neon', name: 'Neon', emoji: '✨', price: 500 },
    { id: 'spray', name: 'Spray', emoji: '💨', price: 300 }
];

export const UNLOCKABLE_COLORS = [
    // Standard (free)
    { id: '#000000', name: 'Black', price: 0 },
    { id: '#ffffff', name: 'White', price: 0 },
    { id: '#FF0000', name: 'Red', price: 0 },
    { id: '#00FF00', name: 'Green', price: 0 },
    { id: '#0000FF', name: 'Blue', price: 0 },
    { id: '#FFA500', name: 'Orange', price: 0 },
    { id: '#FFFF00', name: 'Yellow', price: 0 },
    { id: '#800080', name: 'Purple', price: 0 },
    { id: '#A52A2A', name: 'Brown', price: 0 },
    { id: '#FFC0CB', name: 'Pink', price: 0 },

    // Unlockables
    { id: '#FFD700', name: 'Gold', locked: true, price: 250 },
    { id: '#C0C0C0', name: 'Silver', locked: true, price: 150 },
    { id: '#FF69B4', name: 'Hot Pink', locked: true, price: 150 },
    { id: '#00CCFF', name: 'Cyan', locked: true, price: 150 },
    { id: '#9D00FF', name: 'Electric Purple', locked: true, price: 250 }
];

export const BADGES = [
    // Achievement badges
    { id: 'first_win', name: 'First Win', emoji: '🏆', description: 'Won your first round!', price: 0 },
    { id: 'artist', name: 'True Artist', emoji: '🎨', description: 'Drew 100 strokes in one round', price: 0 },
    { id: 'speed', name: 'Speed Demon', emoji: '⚡', description: 'Submitted in under 5 seconds', price: 0 },
    { id: 'social', name: 'Chatty', emoji: '💭', description: 'Sent 50 messages', price: 0 },
    { id: 'saboteur', name: 'Chaos Agent', emoji: '😈', description: 'Successfully sabotaged a round', price: 0 },
    { id: 'high_roller', name: 'High Roller', emoji: '🎰', description: 'Win big at the casino', price: 0 },
    { id: 'rich', name: 'Loaded', emoji: '💰', description: 'Have 100$ at once', price: 0 },

    // Drawing-themed level milestone badges
    { id: 'level_5', name: 'Sketch Artist', emoji: '✏️', description: 'Drew your way to Level 5', price: 0, levelRequired: 5 },
    { id: 'level_10', name: 'Ink Master', emoji: '🖊️', description: 'Mastered the pen at Level 10', price: 0, levelRequired: 10 },
    { id: 'level_25', name: 'Canvas Virtuoso', emoji: '🖼️', description: 'A true artist at Level 25', price: 0, levelRequired: 25 },
    { id: 'level_50', name: 'Masterpiece Maker', emoji: '🎨', description: 'Creating masterpieces at Level 50', price: 0, levelRequired: 50 },
    { id: 'level_100', name: 'Legendary Illustrator', emoji: '👑', description: 'The ultimate artist at Level 100', price: 0, levelRequired: 100 }
];

// Powerups (Consumables & Permanent)
export const POWERUPS = [
    // Consumables
    { id: 'extra_time', name: 'Extra Time', emoji: '⏰', description: '+10s drawing time', price: 50, type: 'consumable' },
    { id: 'flash_bang', name: 'Flash Bang', emoji: '💥', description: 'Blind opponents for 3s', price: 100, type: 'consumable' },
    { id: 'vote_peep', name: 'Vote Peep', emoji: '👁️', description: 'Reveal 1 random vote', price: 75, type: 'consumable' },
    { id: 'double_vote', name: 'Double Vote', emoji: '✌️', description: 'Your vote counts x2', price: 75, type: 'consumable' },
    { id: 'shield', name: 'Anti-Sabotage', emoji: '🛡️', description: 'Block 1 sabotage', price: 100, type: 'consumable' },
    { id: 'reveal', name: 'Reveal Saboteur', emoji: '🔦', description: 'Expose the saboteur', price: 125, type: 'consumable' },
    { id: 'steal', name: 'Vote Steal', emoji: '🎭', description: 'Steal 1 vote from leader', price: 150, type: 'consumable' },

    // Permanent
    { id: 'timekeeper', name: 'Timekeeper', emoji: '⏳', description: 'Passive +5s to every round', price: 2500, type: 'permanent' },
    { id: 'mirror_shield', name: 'Mirror Shield', emoji: '🪞', description: '30% chance to reflect sabotage', price: 5000, type: 'permanent' }
];

// Purchasable fonts (permanent unlocks)
export const FONTS = [
    { id: 'default', name: 'Inter', fontFamily: "'Inter', sans-serif", description: 'Clean & modern', price: 0 },
    { id: 'comic', name: 'Comic Neue', fontFamily: "'Comic Neue', cursive", description: 'Fun & playful', price: 100 },
    { id: 'pixel', name: 'Press Start 2P', fontFamily: "'Press Start 2P', cursive", description: 'Retro gaming vibes', price: 250 },
    { id: 'mono', name: 'JetBrains Mono', fontFamily: "'JetBrains Mono', monospace", description: 'Developer favorite', price: 150 },
    { id: 'handwritten', name: 'Caveat', fontFamily: "'Caveat', cursive", description: 'Handwritten style', price: 150 },
    { id: 'retro', name: 'VT323', fontFamily: "'VT323', monospace", description: 'Terminal nostalgia', price: 200 }
];

// Avatar Frames (New) - CSS classes or style IDs
// Note: Some frames use special types that require custom rendering logic in AvatarDisplay
export const FRAMES = [
    { id: 'none', name: 'None', preview: '⬜', description: 'No frame', price: 0 },
    
    // Legacy / Basic Frames (Cheap)
    { id: 'glow', name: 'Glow', preview: '✨', description: 'Soft outline', price: 50, className: 'shadow-[0_0_12px_4px_currentColor,0_0_20px_8px_currentColor]' },
    { id: 'border', name: 'Bold', preview: '🔲', description: 'Thick border', price: 50, className: 'border-4 border-current' },
    { id: 'dash', name: 'Dash', preview: '➖', description: 'Dashed line', price: 75, className: 'border-4 border-dashed border-current' },
    { id: 'double', name: 'Double', preview: '══', description: 'Double border', price: 100, className: 'border-double border-8 border-current' },
    { id: 'ring', name: 'Ring', preview: '⭕', description: 'Offset ring', price: 100, className: 'ring-4 ring-current ring-offset-2' },

    // Premium Frames
    { id: 'gold_glow', name: 'Golden Glow', preview: '🌟', description: 'Radiate energy', price: 500, className: 'shadow-[0_0_20px_8px_#ffd700,0_0_40px_16px_#ffb300,0_0_60px_24px_rgba(255,215,0,0.5)] border-yellow-400 border-2' },
    { id: 'neon_pink', name: 'Neon Pink', preview: '💖', description: 'Cyberpunk vibes', price: 400, className: 'shadow-[0_0_15px_6px_#ff00ff,0_0_30px_12px_rgba(255,0,255,0.6)] border-[#ff00ff] border-2' },
    { id: 'rainbow', name: 'Rainbow', preview: '🌈', description: 'Multicolor border', price: 600, type: 'rainbow' },
    { id: 'wood', name: 'Wooden', preview: '🪵', description: 'Classic feel', price: 200, type: 'wood' }
];

// Avatar Background Themes (New) - CSS gradients
export const THEMES = [
    // --- Basic Solids (Cheap) ---
    { id: 'default', name: 'Dark Mode', preview: '⚫', description: 'Classic Darkness', price: 0, value: '#121212' },
    { id: 'light', name: 'Clean White', preview: '⚪', description: 'Blindingly Bright', price: 0, value: '#f5f5f5' },
    { id: 'midnight', name: 'Midnight', preview: '🌙', description: 'Deep Blue Black', price: 50, value: '#0f172a' },
    { id: 'forest_dark', name: 'Deep Forest', preview: '🌲', description: 'Dark Green', price: 50, value: '#064e3b' },
    { id: 'coffee', name: 'Espresso', preview: '☕', description: 'Dark Brown', price: 50, value: '#271c19' },
    { id: 'slate', name: 'Slate', preview: '🪨', description: 'Professional Grey', price: 50, value: '#334155' },

    // --- Simple Gradients (Affordable) ---
    { id: 'twilight', name: 'Twilight', preview: '🌆', description: 'Purple Haze', price: 100, value: 'linear-gradient(to bottom, #2e1065, #0f172a)' },
    { id: 'sunrise', name: 'Sunrise', preview: '🌅', description: 'Morning Glow', price: 100, value: 'linear-gradient(to top, #fdba74, #fcd34d)' },
    { id: 'ocean', name: 'Ocean', preview: '🌊', description: 'Deep Sea', price: 100, value: 'linear-gradient(to bottom, #0ea5e9, #1e40af)' },
    { id: 'mint', name: 'Fresh Mint', preview: '🌿', description: 'Cool Green', price: 100, value: 'linear-gradient(135deg, #86efac, #3b82f6)' },
    { id: 'lavender', name: 'Lavender', preview: '🌸', description: 'Soft Purple', price: 100, value: 'linear-gradient(to right, #e9d5ff, #c084fc)' },

    // --- Premium Gradients (Pricey) ---
    { id: 'sunset', name: 'Sunset Vibe', preview: '🌇', description: 'Pink & Orange', price: 300, value: 'linear-gradient(to bottom right, #ff512f, #dd2476)' },
    { id: 'neon_city', name: 'Neon City', preview: '🌃', description: 'Cyberpunk', price: 400, value: 'linear-gradient(to bottom, #0f0c29, #302b63, #24243e)' },
    { id: 'northern_lights', name: 'Aurora', preview: '🌌', description: 'Magical', price: 500, value: 'linear-gradient(to right, #43cea2, #185a9d)' },
    { id: 'galaxy', name: 'Galaxy', preview: '✨', description: 'Far Far Away', price: 500, value: 'linear-gradient(to bottom right, #654ea3, #eaafc8)' },
    { id: 'fire', name: 'Inferno', preview: '🔥', description: 'Hot Stuff', price: 400, value: 'linear-gradient(to top, #f83600, #f9d423)' },

    // --- "Ugly" / Bold / Weird (Fun) ---
    { id: 'mustard', name: 'Old Mustard', preview: '🌭', description: 'Why?', price: 200, value: '#ca8a04' },
    { id: 'clown', name: 'Clown Vomit', preview: '🤡', description: 'Too many colors', price: 250, value: 'conic-gradient(red, orange, yellow, green, blue, purple, red)' },
    { id: 'hacker', name: 'Matrix', preview: '💻', description: 'Green Code', price: 300, value: 'linear-gradient(0deg, #000 0%, #003300 100%)' }, // Noise overlay acts as code?
    { id: 'barbie', name: 'Plastic', preview: '💅', description: 'Life is plastic', price: 300, value: '#ec4899' },
    { id: 'rainbow_road', name: 'Rainbow Rd', preview: '🌈', description: 'Don\'t fall off', price: 600, value: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3)' },
    
    // --- Special ---
    { id: 'gold', name: 'Pure Gold', preview: '🏆', description: 'You are rich', price: 1000, value: 'radial-gradient(ellipse at center, #ffd700 0%, #b8860b 100%)' },
    { id: 'void', name: 'The Void', preview: '🕳️', description: 'Absorb light', price: 666, value: '#000000' }
];

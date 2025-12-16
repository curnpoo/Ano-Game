import React, { useEffect, useState } from 'react';
import { Button } from './Button';

interface GameStartModalProps {
  hostName: string;
  roomCode: string;
  onJumpIn: () => void;
  onDismiss: () => void;
}

export const GameStartModal: React.FC<GameStartModalProps> = ({ 
  hostName, 
  roomCode, 
  onJumpIn, 
  onDismiss 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`fixed inset-0 z-[3000] flex items-center justify-center p-5 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onDismiss} />
      
      {/* Card */}
      <div 
        className={`relative w-full max-w-sm bg-zinc-900 border border-zinc-700 rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-300 ${isVisible ? 'scale-100 translate-y-0' : 'scale-90 translate-y-4'}`}
      >
        {/* Gradient Header - Green for "Go" */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-green-500/30 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center p-8 text-center">
          {/* Game Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg mb-4">
            🎮
          </div>
          
          <h2 className="mt-2 mb-2 text-2xl font-black text-white">Game Started!</h2>
          <p className="mb-6 text-gray-300">
            <strong className="text-white">{hostName}</strong> started the game<br/>
            in Room <strong className="text-green-400">{roomCode}</strong>
          </p>

          <div className="flex gap-3 w-full mt-2">
            <Button 
              variant="secondary" 
              onClick={onDismiss}
              fullWidth
            >
              Later
            </Button>
            <Button 
              variant="primary" 
              onClick={onJumpIn}
              fullWidth
            >
              Jump In! 🚀
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

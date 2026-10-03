import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { RestaurantScene } from '../game/RestaurantScene';
import { gameBridge } from '../game/gameBridge';

export const GameCanvas: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;

    // Tránh khởi tạo 2 lần trong React StrictMode
    if (gameInstanceRef.current) {
      return;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: 800,
      height: 600,
      backgroundColor: '#FFF1F6',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [RestaurantScene],
    };

    const game = new Phaser.Game(config);
    gameInstanceRef.current = game;

    return () => {
      gameBridge.setScene(null);
      game.destroy(true);
      gameInstanceRef.current = null;
    };
  }, []);

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#FFF1F6] p-2 select-none relative">
      <div
        ref={gameContainerRef}
        id="phaser-game-container"
        className="w-full max-w-[900px] aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border-4 border-[#FFD6E5]"
      />
    </div>
  );
};

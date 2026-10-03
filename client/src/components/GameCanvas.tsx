import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { RestaurantScene } from '../game/RestaurantScene';
import { gameBridge } from '../game/gameBridge';
import { MobileDPad } from './MobileDPad';

export const GameCanvas: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameContainerRef.current) return;

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
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#FFF1F6] p-1 sm:p-2 select-none relative overflow-hidden">
      <div
        ref={gameContainerRef}
        id="phaser-game-container"
        className="w-full h-full max-w-[900px] max-h-[675px] rounded-2xl overflow-hidden shadow-lg border-2 sm:border-4 border-[#FFD6E5] flex items-center justify-center"
      />
      
      {/* Phím điều hướng ảo cho Mobile */}
      <MobileDPad />
    </div>
  );
};

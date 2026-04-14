"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { trackEvent } from "@/lib/posthog";

interface CardPickerProps {
  onPick: () => void;
}

export default function CardPicker({ onPick }: CardPickerProps) {
  const [flippedIdx, setFlippedIdx] = useState<number | null>(null);

  const handlePick = (idx: number) => {
    if (flippedIdx !== null) return;
    setFlippedIdx(idx);
    trackEvent("card_picked", { position: idx });

    setTimeout(() => {
      onPick();
    }, 800);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <h2 className="text-xl font-semibold text-gray-700">
        Wählen Sie eine Karte für die heutige Frage
      </h2>
      <div className="flex gap-4">
        {[0, 1, 2].map((idx) => (
          <button
            key={idx}
            onClick={() => handlePick(idx)}
            className={cn(
              "relative w-24 h-36 sm:w-28 sm:h-40 rounded-xl cursor-pointer transition-all duration-500 [perspective:600px]",
              flippedIdx !== null && flippedIdx !== idx && "opacity-30 scale-95"
            )}
          >
            <div
              className={cn(
                "relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d]",
                flippedIdx === idx && "[transform:rotateY(180deg)]"
              )}
            >
              {/* Front (face-down) */}
              <div className="absolute inset-0 rounded-xl bg-[#1d3557] shadow-lg flex items-center justify-center [backface-visibility:hidden] border-2 border-[#2a4a7a]">
                <span className="text-3xl text-white font-bold">?</span>
              </div>
              {/* Back (face-up) */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg flex items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden] border-2 border-emerald-300">
                <span className="text-2xl text-white">&#10003;</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

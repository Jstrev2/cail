"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  timerEnd: string;
  onExpire?: () => void;
}

export default function CountdownTimer({ timerEnd, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(1);
  const [targetTime, setTargetTime] = useState("");

  useEffect(() => {
    const endTime = new Date(timerEnd).getTime();

    // Format target time in viewer's local timezone
    setTargetTime(
      new Date(timerEnd).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    );

    const update = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        setProgress(0);
        onExpire?.();
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (hours > 0) {
        setTimeLeft(`${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
      } else {
        setTimeLeft(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
      }

      const totalDuration = Math.max(endTime - (endTime - 30 * 60 * 1000), 1);
      setProgress(Math.min(diff / totalDuration, 1));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timerEnd, onExpire]);

  return (
    <div className="mt-3 flex flex-col items-center gap-1.5">
      <div className="text-2xl font-bold font-mono text-yellow-400 tracking-widest tabular-nums">
        {timeLeft}
      </div>
      <p className="text-[10px] text-zinc-500">Ready at ~{targetTime}</p>
      <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-yellow-500 rounded-full transition-all duration-1000 ease-linear"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

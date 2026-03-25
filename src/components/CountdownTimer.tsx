"use client";

import { useState, useEffect } from "react";

interface CountdownTimerProps {
  timerEnd: string;
  onExpire?: () => void;
  showDays?: boolean;
  label?: string;
}

export default function CountdownTimer({ timerEnd, onExpire, showDays = false, label }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(1);
  const [targetTime, setTargetTime] = useState("");

  useEffect(() => {
    const endTime = new Date(timerEnd).getTime();

    // Format target time in viewer's local timezone
    const endDate = new Date(timerEnd);
    if (showDays) {
      setTargetTime(
        endDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
      );
    } else {
      setTargetTime(
        endDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
      );
    }

    const update = () => {
      const now = Date.now();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("00:00");
        setProgress(0);
        onExpire?.();
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
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
  }, [timerEnd, onExpire, showDays]);

  const color = showDays ? "#a855f7" : "#eab308";

  return (
    <div className="mt-2 flex flex-col items-center gap-1 w-full">
      <div className="text-xl font-bold font-mono tracking-widest tabular-nums" style={{ color }}>
        {timeLeft}
      </div>
      {label ? (
        <p className="text-[10px] text-zinc-500">{label}</p>
      ) : targetTime ? (
        <p className="text-[10px] text-zinc-500">Ready at ~{targetTime}</p>
      ) : null}
      {!showDays && (
        <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${progress * 100}%`, backgroundColor: color }}
          />
        </div>
      )}
    </div>
  );
}

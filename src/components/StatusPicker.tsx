"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MemberStatus } from "@/lib/supabase";
import { useState } from "react";

const TIMER_OPTIONS = [5, 10, 15, 30];

interface StatusPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (status: MemberStatus, timerMinutes?: number) => void;
  currentStatus: MemberStatus;
}

export default function StatusPicker({ isOpen, onClose, onSelect, currentStatus }: StatusPickerProps) {
  const [showTimerPicker, setShowTimerPicker] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");

  const handleAlmostReady = () => {
    setShowTimerPicker(true);
  };

  const handleTimerSelect = (minutes?: number) => {
    onSelect("almost_ready", minutes);
    setShowTimerPicker(false);
    onClose();
  };

  const handleCustomTimer = () => {
    const mins = parseInt(customMinutes);
    if (mins > 0 && mins <= 180) {
      handleTimerSelect(mins);
    }
  };

  const handleStatusSelect = (status: MemberStatus) => {
    if (status === "almost_ready") {
      handleAlmostReady();
      return;
    }
    onSelect(status);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => { onClose(); setShowTimerPicker(false); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#1a1a25] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {!showTimerPicker ? (
              <>
                <h3 className="text-lg font-bold text-center mb-4 tracking-wide" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  SET STATUS
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => handleStatusSelect("not_ready")}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3
                      ${currentStatus === "not_ready" ? "bg-red-500/30 border-2 border-red-500" : "bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50"}`}
                  >
                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.6)]" />
                    Not Ready
                  </button>
                  <button
                    onClick={() => handleStatusSelect("almost_ready")}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3
                      ${currentStatus === "almost_ready" ? "bg-yellow-500/30 border-2 border-yellow-500" : "bg-white/5 border border-white/10 hover:bg-yellow-500/20 hover:border-yellow-500/50"}`}
                  >
                    <span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.6)]" />
                    Almost Ready
                  </button>
                  <button
                    onClick={() => handleStatusSelect("ready")}
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3
                      ${currentStatus === "ready" ? "bg-green-500/30 border-2 border-green-500" : "bg-white/5 border border-white/10 hover:bg-green-500/20 hover:border-green-500/50"}`}
                  >
                    <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                    Ready
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-center mb-1 tracking-wide" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  SET TIMER
                </h3>
                <p className="text-sm text-zinc-500 text-center mb-4">How long until you&apos;re ready?</p>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {TIMER_OPTIONS.map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleTimerSelect(mins)}
                      className="py-2.5 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-yellow-500/20 hover:border-yellow-500/50 font-semibold transition-all"
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Custom min"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50"
                    min={1}
                    max={180}
                  />
                  <button
                    onClick={handleCustomTimer}
                    className="py-2 px-4 rounded-xl bg-yellow-500/20 border border-yellow-500/50 font-semibold hover:bg-yellow-500/30 transition-all"
                  >
                    Go
                  </button>
                </div>
                <button
                  onClick={() => handleTimerSelect()}
                  className="w-full mt-3 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Skip timer
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

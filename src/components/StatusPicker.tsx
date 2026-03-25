"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MemberStatus, supabase, TIMEZONES } from "@/lib/supabase";
import { useState } from "react";

const TIMER_OPTIONS = [5, 10, 15, 30];
const SCHEDULE_REASONS = [
  { value: "Out of Town", icon: "🧳" },
  { value: "Vacation", icon: "🏖️" },
  { value: "Work Trip", icon: "💼" },
  { value: "Family", icon: "👨‍👩‍👦" },
  { value: "Busy", icon: "🚫" },
];

interface StatusPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (status: MemberStatus, timerEnd?: Date) => void;
  currentStatus: MemberStatus;
  currentUser: string;
  currentTimezone: string;
}

type PickerView = "status" | "timer" | "schedule";

export default function StatusPicker({ isOpen, onClose, onSelect, currentStatus, currentUser, currentTimezone }: StatusPickerProps) {
  const [view, setView] = useState<PickerView>("status");
  const [timeMode, setTimeMode] = useState<"duration" | "specific">("duration");
  const [customMinutes, setCustomMinutes] = useState("");
  const [specificTime, setSpecificTime] = useState("");
  const [schedTitle, setSchedTitle] = useState("Out of Town");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const reset = () => {
    setView("status");
    setTimeMode("duration");
    setCustomMinutes("");
    setSpecificTime("");
    setStartDate("");
    setEndDate("");
  };

  const close = () => {
    reset();
    onClose();
  };

  const handleTimerSelect = (minutes?: number) => {
    const timerEnd = minutes ? new Date(Date.now() + minutes * 60 * 1000) : undefined;
    onSelect("almost_ready", timerEnd);
    close();
  };

  const handleSpecificTime = () => {
    if (!specificTime) return;
    const [hours, mins] = specificTime.split(":").map(Number);
    const target = new Date();
    target.setHours(hours, mins, 0, 0);
    if (target <= new Date()) target.setDate(target.getDate() + 1);
    onSelect("almost_ready", target);
    close();
  };

  const handleCustomTimer = () => {
    const mins = parseInt(customMinutes);
    if (mins > 0 && mins <= 480) handleTimerSelect(mins);
  };

  const handleStatusSelect = (status: MemberStatus) => {
    if (status === "almost_ready") {
      setView("timer");
      return;
    }
    onSelect(status);
    close();
  };

  const handleScheduleSave = async () => {
    if (!startDate || !endDate) return;
    setSaving(true);
    await supabase.from("schedules").insert({
      callsign: currentUser,
      title: schedTitle,
      start_date: startDate,
      end_date: endDate,
    });
    setSaving(false);
    close();
  };

  const inputClass = "w-full py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-500/50 text-sm";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-[#1a1a25] border border-white/10 rounded-2xl p-6 w-80 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* STATUS VIEW */}
            {view === "status" && (
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

                  <div className="border-t border-white/10 pt-3 space-y-2">
                    <button
                      onClick={() => setView("schedule")}
                      className="w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-purple-500/20 hover:border-purple-500/50"
                    >
                      <span className="text-lg">📅</span>
                      Set Schedule / Away
                    </button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">🌐 Timezone:</span>
                      <select
                        value={currentTimezone}
                        onChange={async (e) => {
                          await supabase.from("squad_members").update({ timezone: e.target.value }).eq("callsign", currentUser);
                        }}
                        className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500/50"
                      >
                        {TIMEZONES.map((tz) => (
                          <option key={tz.value} value={tz.value}>{tz.label} ({tz.short})</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TIMER VIEW */}
            {view === "timer" && (
              <>
                <h3 className="text-lg font-bold text-center mb-1 tracking-wide" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  WHEN READY?
                </h3>

                <div className="flex gap-1 mb-4 bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setTimeMode("duration")}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      timeMode === "duration" ? "bg-yellow-500/20 text-yellow-400" : "text-zinc-500"
                    }`}
                  >
                    ⏱️ In Minutes
                  </button>
                  <button
                    onClick={() => setTimeMode("specific")}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      timeMode === "specific" ? "bg-yellow-500/20 text-yellow-400" : "text-zinc-500"
                    }`}
                  >
                    🕐 At Time
                  </button>
                </div>

                {timeMode === "duration" ? (
                  <>
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
                    <div className="flex gap-2 mb-3">
                      <input type="number" placeholder="Custom min" value={customMinutes} onChange={(e) => setCustomMinutes(e.target.value)}
                        className="flex-1 py-2 px-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-500/50" min={1} max={480} />
                      <button onClick={handleCustomTimer} className="py-2 px-4 rounded-xl bg-yellow-500/20 border border-yellow-500/50 font-semibold hover:bg-yellow-500/30 transition-all">Go</button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-zinc-500 text-center mb-3">Set exact time you&apos;ll be ready</p>
                    <div className="flex gap-2 mb-3">
                      <input type="time" value={specificTime} onChange={(e) => setSpecificTime(e.target.value)}
                        className="flex-1 py-3 px-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-500/50 text-center text-lg" />
                      <button onClick={handleSpecificTime} disabled={!specificTime}
                        className="py-3 px-5 rounded-xl bg-yellow-500/20 border border-yellow-500/50 font-bold hover:bg-yellow-500/30 transition-all disabled:opacity-30">Set</button>
                    </div>
                    <p className="text-[10px] text-zinc-600 text-center">If time has passed today, sets for tomorrow</p>
                  </>
                )}

                <button onClick={() => handleTimerSelect()} className="w-full mt-2 py-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                  Skip timer
                </button>
                <button onClick={() => setView("status")} className="w-full mt-1 py-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                  ← Back
                </button>
              </>
            )}

            {/* SCHEDULE VIEW */}
            {view === "schedule" && (
              <>
                <h3 className="text-lg font-bold text-center mb-1 tracking-wide" style={{ fontFamily: "Orbitron, sans-serif" }}>
                  SET SCHEDULE
                </h3>
                <p className="text-xs text-zinc-500 text-center mb-4">Let the squad know when you&apos;re out</p>

                <div className="space-y-3">
                  <div className="grid grid-cols-5 gap-1.5">
                    {SCHEDULE_REASONS.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => setSchedTitle(r.value)}
                        className={`py-2 rounded-lg text-center text-lg transition-all ${
                          schedTitle === r.value ? "bg-purple-500/20 border-2 border-purple-500" : "bg-white/5 border border-white/10"
                        }`}
                        title={r.value}
                      >
                        {r.icon}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-center text-zinc-400">{schedTitle}</p>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5">From</label>
                      <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); if (!endDate) setEndDate(e.target.value); }} className={inputClass} />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5">To</label>
                      <input type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
                    </div>
                  </div>

                  <button
                    onClick={handleScheduleSave}
                    disabled={saving || !startDate || !endDate}
                    className="w-full py-3 bg-purple-500/20 border border-purple-500/40 rounded-xl text-purple-400 font-bold text-sm hover:bg-purple-500/30 transition-all disabled:opacity-30"
                  >
                    {saving ? "Saving..." : "📅 Save Schedule"}
                  </button>
                </div>

                <button onClick={() => setView("status")} className="w-full mt-2 py-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                  ← Back
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

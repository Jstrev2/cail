"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase, Schedule } from "@/lib/supabase";

interface SchedulePanelProps {
  currentUser: string | null;
}

export default function SchedulePanel({ currentUser }: SchedulePanelProps) {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("Out of Town");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchSchedules = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("schedules")
      .select("*")
      .gte("end_date", today)
      .order("start_date", { ascending: true });
    if (data) setSchedules(data);
  };

  useEffect(() => {
    fetchSchedules();

    const channel = supabase
      .channel("schedule_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "schedules" }, () => fetchSchedules())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const addSchedule = async () => {
    if (!currentUser || !startDate || !endDate) return;
    setSaving(true);
    await supabase.from("schedules").insert({
      callsign: currentUser,
      title,
      start_date: startDate,
      end_date: endDate,
    });
    setSaving(false);
    setShowAdd(false);
    setTitle("Out of Town");
    setStartDate("");
    setEndDate("");
    fetchSchedules();
  };

  const deleteSchedule = async (id: string) => {
    await supabase.from("schedules").delete().eq("id", id);
    fetchSchedules();
  };

  const isToday = (start: string, end: string) => {
    const today = new Date().toISOString().split("T")[0];
    return start <= today && end >= today;
  };

  const formatDate = (d: string) => {
    const date = new Date(d + "T12:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (schedules.length === 0 && !showAdd) {
    return (
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">📅 Schedule</h2>
          {currentUser && (
            <button onClick={() => setShowAdd(true)} className="text-xs text-purple-400 hover:underline">+ Add</button>
          )}
        </div>
        <p className="text-xs text-zinc-600 text-center py-3">No upcoming away schedules</p>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">📅 Schedule</h2>
        {currentUser && (
          <button onClick={() => setShowAdd(!showAdd)} className="text-xs text-purple-400 hover:underline">
            {showAdd ? "Cancel" : "+ Add"}
          </button>
        )}
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#12121a] border border-purple-500/30 rounded-xl p-4 mb-3 overflow-hidden"
          >
            <div className="space-y-2">
              <select
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-2 px-3 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50"
              >
                <option value="Out of Town">🧳 Out of Town</option>
                <option value="Vacation">🏖️ Vacation</option>
                <option value="Work Trip">💼 Work Trip</option>
                <option value="Family">👨‍👩‍👦 Family</option>
                <option value="Busy">🚫 Busy</option>
              </select>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5">From</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); if (!endDate) setEndDate(e.target.value); }}
                    className="w-full py-2 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5">To</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full py-2 px-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>
              <button
                onClick={addSchedule}
                disabled={saving || !startDate || !endDate}
                className="w-full py-2 bg-purple-500/20 border border-purple-500/40 rounded-lg text-purple-400 font-bold text-sm hover:bg-purple-500/30 transition-all disabled:opacity-30"
              >
                {saving ? "Saving..." : "Add to Schedule"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule list */}
      <div className="space-y-2">
        {schedules.map((s) => {
          const active = isToday(s.start_date, s.end_date);
          return (
            <div
              key={s.id}
              className={`bg-[#12121a] border rounded-xl px-4 py-3 flex items-center justify-between ${
                active ? "border-red-500/40" : "border-white/10"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border"
                  style={{
                    borderColor: active ? "#ef444466" : "#ffffff20",
                    color: active ? "#ef4444" : "#71717a",
                  }}
                >
                  {s.callsign[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    <span className="text-zinc-400">{s.callsign}</span>
                    {active && <span className="ml-2 text-[10px] text-red-400 font-bold">● NOW</span>}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {s.title} · {formatDate(s.start_date)} – {formatDate(s.end_date)}
                  </p>
                </div>
              </div>
              {currentUser === s.callsign && (
                <button
                  onClick={() => deleteSchedule(s.id)}
                  className="text-zinc-700 hover:text-red-400 text-xs transition-colors"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

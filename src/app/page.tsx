"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, SquadMember, MemberStatus } from "@/lib/supabase";
import SchedulePanel from "@/components/SchedulePanel";
import MemberCard from "@/components/MemberCard";
import StatusPicker from "@/components/StatusPicker";
import UserSelect from "@/components/UserSelect";
import { motion } from "framer-motion";

const SQUAD = ["Tomcat", "Crazy", "Stalemate", "Bender"];

export default function Home() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [members, setMembers] = useState<SquadMember[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    const { data } = await supabase
      .from("squad_members")
      .select("*")
      .order("callsign");

    if (data) setMembers(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Check localStorage for saved user
    const saved = localStorage.getItem("cail_user");
    if (saved && SQUAD.includes(saved)) {
      setCurrentUser(saved);
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    fetchMembers();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("squad_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "squad_members" },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchMembers]);

  const handleUserSelect = (callsign: string) => {
    localStorage.setItem("cail_user", callsign);
    setCurrentUser(callsign);
  };

  const handleStatusChange = async (status: MemberStatus, timerEnd?: Date) => {
    if (!currentUser) return;

    await supabase
      .from("squad_members")
      .update({
        status,
        timer_end: timerEnd ? timerEnd.toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("callsign", currentUser);
  };

  const handleTimerExpire = async () => {
    if (!currentUser) return;

    await supabase
      .from("squad_members")
      .update({
        status: "ready",
        timer_end: null,
        updated_at: new Date().toISOString(),
      })
      .eq("callsign", currentUser);
  };

  if (!currentUser) {
    return <UserSelect onSelect={handleUserSelect} />;
  }

  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1
          className="text-5xl md:text-6xl font-black tracking-[0.3em] mb-1 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
          style={{ fontFamily: "Orbitron, sans-serif" }}
        >
          CAIL
        </h1>
        <p className="text-zinc-600 text-xs tracking-[0.2em] uppercase">
          Squad Readiness Board
        </p>
        <button
          onClick={() => {
            localStorage.removeItem("cail_user");
            setCurrentUser(null);
          }}
          className="mt-2 text-[10px] text-zinc-700 hover:text-zinc-400 tracking-wider uppercase transition-colors"
        >
          Playing as {currentUser} · Switch
        </button>
      </motion.div>

      {/* Squad Grid */}
      {loading ? (
        <div className="text-zinc-600 tracking-wider">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl">
          {members.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <MemberCard
                member={member}
                isCurrentUser={member.callsign === currentUser}
                onClick={() => setShowPicker(true)}
                onTimerExpire={member.callsign === currentUser ? handleTimerExpire : undefined}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Schedule */}
      <div className="w-full max-w-5xl">
        <SchedulePanel currentUser={currentUser} />
      </div>

      {/* Status Picker Modal */}
      {currentUser && (
        <StatusPicker
          isOpen={showPicker}
          onClose={() => setShowPicker(false)}
          onSelect={handleStatusChange}
          currentStatus={
            members.find((m) => m.callsign === currentUser)?.status || "not_ready"
          }
        />
      )}
    </main>
  );
}

"use client";

import { motion } from "framer-motion";
import { MemberStatus, SquadMember } from "@/lib/supabase";
import { ROLES } from "@/lib/roles";
import RoleIcon from "./RoleIcon";
import CountdownTimer from "./CountdownTimer";

const STATUS_CONFIG: Record<MemberStatus, { label: string; color: string; glow: string; bgAccent: string }> = {
  not_ready: {
    label: "NOT READY",
    color: "#ef4444",
    glow: "rgba(239, 68, 68, 0.35)",
    bgAccent: "rgba(239, 68, 68, 0.08)",
  },
  almost_ready: {
    label: "ALMOST READY",
    color: "#eab308",
    glow: "rgba(234, 179, 8, 0.35)",
    bgAccent: "rgba(234, 179, 8, 0.08)",
  },
  ready: {
    label: "READY",
    color: "#22c55e",
    glow: "rgba(34, 197, 94, 0.35)",
    bgAccent: "rgba(34, 197, 94, 0.08)",
  },
};

interface MemberCardProps {
  member: SquadMember;
  isCurrentUser: boolean;
  onClick?: () => void;
  onTimerExpire?: () => void;
}

export default function MemberCard({ member, isCurrentUser, onClick, onTimerExpire }: MemberCardProps) {
  const config = STATUS_CONFIG[member.status];
  const role = ROLES[member.callsign];

  return (
    <motion.div
      layout
      onClick={isCurrentUser ? onClick : undefined}
      className={`relative rounded-2xl border backdrop-blur-md p-6 flex flex-col items-center gap-3 transition-colors duration-500 ${
        isCurrentUser ? "cursor-pointer hover:scale-[1.02]" : ""
      }`}
      style={{
        background: `linear-gradient(135deg, ${config.bgAccent}, rgba(18, 18, 26, 0.9))`,
        borderColor: `${config.color}33`,
        boxShadow: `0 0 25px ${config.glow}, 0 0 50px ${config.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
      animate={
        member.status === "ready"
          ? {
              boxShadow: [
                `0 0 25px ${config.glow}, 0 0 50px ${config.glow}`,
                `0 0 35px ${config.glow}, 0 0 70px ${config.glow}`,
                `0 0 25px ${config.glow}, 0 0 50px ${config.glow}`,
              ],
            }
          : {}
      }
      transition={
        member.status === "ready"
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.4 }
      }
    >
      {/* Status dot */}
      <div className="absolute top-4 right-4">
        <span
          className="block w-3 h-3 rounded-full"
          style={{
            backgroundColor: config.color,
            boxShadow: `0 0 8px ${config.color}, 0 0 16px ${config.glow}`,
          }}
        />
      </div>

      {/* Role icon circle */}
      <div
        className="w-18 h-18 rounded-full flex items-center justify-center border-2"
        style={{
          borderColor: `${config.color}66`,
          background: `${config.bgAccent}`,
          width: "4.5rem",
          height: "4.5rem",
        }}
      >
        <RoleIcon callsign={member.callsign} color={config.color} size={32} />
      </div>

      {/* Callsign */}
      <h2
        className="text-xl font-extrabold tracking-wider"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        {member.callsign.toUpperCase()}
      </h2>

      {/* Role title */}
      {role && (
        <span className="text-[10px] font-semibold tracking-[0.25em] text-zinc-500 -mt-2">
          {role.title}
        </span>
      )}

      {/* Status label */}
      <motion.span
        key={member.status}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xs font-bold tracking-[0.2em] px-3 py-1 rounded-full"
        style={{
          color: config.color,
          backgroundColor: `${config.color}15`,
          border: `1px solid ${config.color}30`,
        }}
      >
        {config.label}
      </motion.span>

      {/* Timer */}
      {member.status === "almost_ready" && member.timer_end && (
        <CountdownTimer timerEnd={member.timer_end} onExpire={onTimerExpire} />
      )}

      {/* Click hint for current user */}
      {isCurrentUser && (
        <p className="text-[10px] text-zinc-600 mt-1 tracking-wider uppercase">Tap to change</p>
      )}
    </motion.div>
  );
}

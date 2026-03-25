"use client";

import { motion } from "framer-motion";
import { MemberStatus, SquadMember, Schedule, TIMEZONES } from "@/lib/supabase";
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

function getLocalTime(timezone: string): string {
  try {
    return new Date().toLocaleTimeString("en-US", {
      timeZone: timezone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function getTimezoneShort(tz: string): string {
  const found = TIMEZONES.find((t) => t.value === tz);
  return found ? found.short : "CT";
}

function getActiveSchedule(schedules: Schedule[], callsign: string): Schedule | null {
  const today = new Date().toISOString().split("T")[0];
  return schedules.find((s) => s.callsign === callsign && s.start_date <= today && s.end_date >= today) || null;
}

function getNextSchedule(schedules: Schedule[], callsign: string): Schedule | null {
  const today = new Date().toISOString().split("T")[0];
  const upcoming = schedules
    .filter((s) => s.callsign === callsign && s.start_date > today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
  return upcoming[0] || null;
}

function formatScheduleDate(d: string): string {
  const date = new Date(d + "T12:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getNextAvailableDate(schedules: Schedule[], callsign: string): string | null {
  const active = getActiveSchedule(schedules, callsign);
  if (!active) return null;
  const endDate = new Date(active.end_date + "T12:00:00");
  const nextDay = new Date(endDate);
  nextDay.setDate(nextDay.getDate() + 1);
  return nextDay.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

interface MemberCardProps {
  member: SquadMember;
  isCurrentUser: boolean;
  schedules: Schedule[];
  onClick?: () => void;
  onTimerExpire?: () => void;
}

export default function MemberCard({ member, isCurrentUser, schedules, onClick, onTimerExpire }: MemberCardProps) {
  const config = STATUS_CONFIG[member.status];
  const role = ROLES[member.callsign];
  const localTime = getLocalTime(member.timezone);
  const tzShort = getTimezoneShort(member.timezone);
  const activeSchedule = getActiveSchedule(schedules, member.callsign);
  const nextSchedule = getNextSchedule(schedules, member.callsign);
  const nextAvailable = getNextAvailableDate(schedules, member.callsign);

  return (
    <motion.div
      onClick={isCurrentUser ? onClick : undefined}
      className={`relative rounded-2xl border backdrop-blur-md p-6 flex flex-col items-center gap-3 transition-colors duration-500 ${
        isCurrentUser ? "cursor-pointer hover:scale-[1.02]" : ""
      }`}
      style={{
        background: `linear-gradient(135deg, ${config.bgAccent}, rgba(18, 18, 26, 0.9))`,
        borderColor: activeSchedule ? "#a855f740" : `${config.color}33`,
        boxShadow: activeSchedule
          ? "0 0 25px rgba(168, 85, 247, 0.2), 0 0 50px rgba(168, 85, 247, 0.1)"
          : `0 0 25px ${config.glow}, 0 0 50px ${config.glow}, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
      animate={
        member.status === "ready" && !activeSchedule
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
        member.status === "ready" && !activeSchedule
          ? { duration: 2, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.4 }
      }
    >
      {/* Status dot + local time */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-1">
        <span
          className="block w-3 h-3 rounded-full"
          style={{
            backgroundColor: activeSchedule ? "#a855f7" : config.color,
            boxShadow: activeSchedule
              ? "0 0 8px #a855f7, 0 0 16px rgba(168,85,247,0.4)"
              : `0 0 8px ${config.color}, 0 0 16px ${config.glow}`,
          }}
        />
        <span className="text-[10px] text-zinc-500 font-mono">
          {localTime} {tzShort}
        </span>
      </div>

      {/* Role icon circle */}
      <div
        className="rounded-full flex items-center justify-center border-2"
        style={{
          borderColor: activeSchedule ? "#a855f766" : `${config.color}66`,
          background: activeSchedule ? "rgba(168,85,247,0.08)" : `${config.bgAccent}`,
          width: "4.5rem",
          height: "4.5rem",
        }}
      >
        <RoleIcon callsign={member.callsign} color={activeSchedule ? "#a855f7" : config.color} size={32} />
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

      {/* Active schedule (away) */}
      {activeSchedule ? (
        <div className="flex flex-col items-center gap-1.5 w-full">
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold tracking-[0.2em] px-3 py-1 rounded-full"
            style={{
              color: "#a855f7",
              backgroundColor: "rgba(168,85,247,0.15)",
              border: "1px solid rgba(168,85,247,0.3)",
            }}
          >
            {activeSchedule.title.toUpperCase()}
          </motion.span>
          <CountdownTimer
            timerEnd={new Date(activeSchedule.end_date + "T23:59:59").toISOString()}
            showDays={true}
            label={`Back ${nextAvailable}`}
          />
        </div>
      ) : (
        <>
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

          {/* Timer for almost ready */}
          {member.status === "almost_ready" && member.timer_end && (
            <CountdownTimer timerEnd={member.timer_end} onExpire={onTimerExpire} showDays={false} />
          )}
        </>
      )}

      {/* Upcoming schedule (not currently active) */}
      {!activeSchedule && nextSchedule && (
        <div className="w-full mt-1 bg-purple-500/5 border border-purple-500/20 rounded-lg px-3 py-1.5 text-center">
          <p className="text-[10px] text-purple-400">
            📅 {nextSchedule.title}: {formatScheduleDate(nextSchedule.start_date)} – {formatScheduleDate(nextSchedule.end_date)}
          </p>
        </div>
      )}

      {/* Click hint for current user */}
      {isCurrentUser && (
        <p className="text-[10px] text-zinc-600 mt-1 tracking-wider uppercase">Tap to change</p>
      )}
    </motion.div>
  );
}

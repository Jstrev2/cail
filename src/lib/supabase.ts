import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type MemberStatus = "not_ready" | "almost_ready" | "ready";

export interface SquadMember {
  id: string;
  callsign: string;
  status: MemberStatus;
  timer_end: string | null;
  timezone: string;
  updated_at: string;
}

export interface Schedule {
  id: string;
  callsign: string;
  title: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export const TIMEZONES = [
  { value: "America/New_York", label: "Eastern", short: "ET" },
  { value: "America/Chicago", label: "Central", short: "CT" },
  { value: "America/Denver", label: "Mountain", short: "MT" },
  { value: "America/Los_Angeles", label: "Pacific", short: "PT" },
];

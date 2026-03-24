"use client";

import { ROLES } from "@/lib/roles";

interface RoleIconProps {
  callsign: string;
  color: string;
  size?: number;
}

export default function RoleIcon({ callsign, color, size = 28 }: RoleIconProps) {
  const role = ROLES[callsign];
  if (!role) return null;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: `drop-shadow(0 0 6px ${color})` }}
    >
      <path d={role.icon} />
    </svg>
  );
}

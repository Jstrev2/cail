"use client";

import { motion } from "framer-motion";

const MEMBERS = ["Tomcat", "Crazy", "Stalemate", "Bender"];

interface UserSelectProps {
  onSelect: (callsign: string) => void;
}

export default function UserSelect({ onSelect }: UserSelectProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-6xl font-black tracking-[0.3em] mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        CAIL
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-zinc-500 text-sm tracking-[0.15em] mb-10 uppercase"
      >
        Who are you?
      </motion.p>
      <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
        {MEMBERS.map((name, i) => (
          <motion.button
            key={name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (i + 1) }}
            onClick={() => onSelect(name)}
            className="py-4 px-6 rounded-xl bg-white/5 border border-white/10 font-bold text-lg tracking-wider hover:bg-white/10 hover:border-white/20 hover:scale-105 transition-all duration-200"
            style={{ fontFamily: "Orbitron, sans-serif" }}
          >
            {name.toUpperCase()}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

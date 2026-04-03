"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-background" />

      {/* Large primary orb -- top left */}
      <motion.div
        animate={{
          x: [0, 60, -40, 20, 0],
          y: [0, -60, 30, -20, 0],
          scale: [1, 1.2, 0.9, 1.1, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-15%] left-[-5%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-violet-600/[0.08] dark:bg-violet-500/[0.06] blur-[140px]"
      />

      {/* Secondary orb -- bottom right */}
      <motion.div
        animate={{
          x: [0, -50, 40, -20, 0],
          y: [0, 40, -40, 20, 0],
          scale: [1, 0.85, 1.15, 0.95, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute bottom-[-10%] right-[-5%] w-[55vw] h-[55vw] max-w-[700px] max-h-[700px] rounded-full bg-indigo-600/[0.07] dark:bg-indigo-500/[0.05] blur-[140px]"
      />

      {/* Accent orb -- center */}
      <motion.div
        animate={{
          x: [0, 30, -40, 25, 0],
          y: [0, -35, 50, -15, 0],
          scale: [1, 1.1, 0.9, 1.05, 1],
        }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 6 }}
        className="absolute top-[35%] left-[50%] -translate-x-1/2 w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-fuchsia-500/[0.05] dark:bg-fuchsia-500/[0.04] blur-[120px]"
      />

      {/* Small floating orb -- top right */}
      <motion.div
        animate={{
          x: [0, -20, 30, -10, 0],
          y: [0, 25, -15, 30, 0],
          opacity: [0.4, 0.7, 0.5, 0.8, 0.4],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-[10%] right-[15%] w-[20vw] h-[20vw] max-w-[250px] max-h-[250px] rounded-full bg-cyan-500/[0.04] dark:bg-cyan-400/[0.03] blur-[80px]"
      />

      {/* Small floating orb -- bottom left */}
      <motion.div
        animate={{
          x: [0, 25, -15, 20, 0],
          y: [0, -20, 25, -10, 0],
          opacity: [0.5, 0.3, 0.6, 0.4, 0.5],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        className="absolute bottom-[15%] left-[10%] w-[18vw] h-[18vw] max-w-[220px] max-h-[220px] rounded-full bg-rose-500/[0.03] dark:bg-rose-400/[0.025] blur-[80px]"
      />

      {/* Grid overlay for depth */}
      <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.02]" style={{
        backgroundImage: "linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
      }} />

      {/* Radial fade to background at edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,var(--background)_65%)]" />
    </div>
  );
}

"use client";

import { motion } from "framer-motion";

export function SwapArrow() {
  return (
    <div className="flex justify-center -my-2 relative z-10">
      <motion.div
        whileHover={{ rotate: 180, scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-10 h-10 rounded-xl bg-background border-2 border-border/40 flex items-center justify-center cursor-pointer hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-all"
      >
        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </div>
  );
}

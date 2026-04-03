"use client";

import { motion } from "framer-motion";

interface SwapArrowProps {
  mode: "BUY" | "SELL";
  onClick: () => void;
}

export function SwapArrow({ mode, onClick }: SwapArrowProps) {
  return (
    <div className="flex justify-center -my-2 relative z-10">
      <motion.div
        animate={{ rotate: mode === "SELL" ? 180 : 0 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onClick={onClick}
        className="w-10 h-10 rounded-xl bg-background border-2 border-border/40 flex items-center justify-center cursor-pointer hover:border-violet-500/50 hover:shadow-lg hover:shadow-violet-500/10 transition-colors"
      >
        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      </motion.div>
    </div>
  );
}

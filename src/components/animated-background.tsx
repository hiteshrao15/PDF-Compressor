"use client";

import { motion } from "framer-motion";

export function AnimatedBackground() {
  return (
    <>
      <div className="animated-bg" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>
      <div className="bg-noise" aria-hidden="true" />
      {/* Floating particles */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: "absolute",
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "var(--accent)",
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              opacity: 0.3,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 6 + i * 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.8,
            }}
          />
        ))}
      </div>
    </>
  );
}

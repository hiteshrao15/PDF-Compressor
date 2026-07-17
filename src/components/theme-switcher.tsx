"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Check } from "lucide-react";

const THEMES = [
  { id: "dark", label: "Dark", color: "#6366f1" },
  { id: "light", label: "Light", color: "#818cf8" },
  { id: "ocean", label: "Ocean", color: "#00b4d8" },
  { id: "forest", label: "Forest", color: "#10b981" },
  { id: "sunset", label: "Sunset", color: "#f97316" },
  { id: "cyberpunk", label: "Cyberpunk", color: "#d946ef" },
  { id: "aurora", label: "Aurora", color: "#34d399" },
  { id: "space", label: "Space", color: "#a5b4fc" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

function getInitialTheme(): ThemeId {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem("theme") as ThemeId) || "dark";
}

export function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeId>("dark");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = getInitialTheme();
    setTheme(stored);
    document.documentElement.setAttribute("data-theme", stored);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function applyTheme(id: ThemeId) {
    setTheme(id);
    setOpen(false);
    localStorage.setItem("theme", id);
    // Animate transition
    document.documentElement.style.transition =
      "background-color 0.5s ease, color 0.3s ease, border-color 0.3s ease";
    document.documentElement.setAttribute("data-theme", id);
    setTimeout(() => {
      document.documentElement.style.transition = "";
    }, 600);
  }

  const current = THEMES.find((t) => t.id === theme) || THEMES[0];

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="btn-ghost"
        style={{ padding: "8px 12px", gap: 8 }}
        aria-label="Switch theme"
        id="theme-switcher-btn"
      >
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: current.color,
            display: "inline-block",
            boxShadow: `0 0 8px ${current.color}`,
          }}
        />
        <Palette size={16} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              right: 0,
              top: "calc(100% + 8px)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 8,
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "var(--shadow-card)",
              width: 180,
              zIndex: 100,
            }}
            role="menu"
            aria-label="Theme options"
          >
            {THEMES.map((t) => (
              <motion.button
                key={t.id}
                whileHover={{ x: 4 }}
                onClick={() => applyTheme(t.id)}
                role="menuitem"
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  borderRadius: 8,
                  border: "none",
                  background: theme === t.id ? "var(--accent-glow)" : "transparent",
                  color: theme === t.id ? "var(--accent)" : "var(--text-secondary)",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontFamily: "inherit",
                  fontWeight: 500,
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: t.color,
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${t.color}60`,
                  }}
                />
                {t.label}
                {theme === t.id && (
                  <Check size={14} style={{ marginLeft: "auto" }} />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

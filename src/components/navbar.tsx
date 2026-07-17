"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Upload,
  History,
  FileArchive,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/history", label: "History", icon: History },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--bg-card)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--gradient-hero)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FileArchive size={18} color="white" />
          </motion.div>
          <span
            style={{
              fontSize: "1.1rem",
              fontWeight: 700,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
            className="gradient-text"
          >
            PDF Squeeze
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }} className="desktop-nav">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link ${isActive ? "active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <motion.div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 999,
              background: "var(--success-glow)",
              border: "1px solid var(--success)",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--success)",
            }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap size={12} />
            Free
          </motion.div>
          <ThemeSwitcher />
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="btn-ghost mobile-menu-btn"
            aria-label="Toggle menu"
            style={{ padding: "8px", display: "none" }}
            id="mobile-menu-toggle"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: "fixed",
              top: 64,
              left: 0,
              right: 0,
              zIndex: 49,
              background: "var(--bg-card)",
              borderBottom: "1px solid var(--border)",
              padding: "12px 24px",
              backdropFilter: "blur(20px)",
            }}
          >
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link ${isActive ? "active" : ""}`}
                  onClick={() => setMobileOpen(false)}
                  style={{ marginBottom: 4 }}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
          #mobile-menu-toggle { display: flex !important; }
        }
      `}</style>
    </>
  );
}

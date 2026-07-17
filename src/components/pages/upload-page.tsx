"use client";

import { motion } from "framer-motion";
import { Upload, Zap, Shield, Clock } from "lucide-react";
import { UploadZone } from "@/components/upload-zone";

const FEATURES = [
  { icon: Zap, label: "Instant", desc: "Results in seconds" },
  { icon: Shield, label: "Secure", desc: "Files processed locally" },
  { icon: Clock, label: "History", desc: "All sessions saved" },
];

export function UploadPage() {
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center", marginBottom: 40 }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
          style={{
            width: 72,
            height: 72,
            borderRadius: 20,
            background: "var(--gradient-hero)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <Upload size={32} color="white" />
        </motion.div>
        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 2.8rem)",
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            marginBottom: 10,
          }}
          className="gradient-text"
        >
          Upload & Compress
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          Drop your PDF and watch the magic happen
        </p>

        {/* Feature Pills */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 20 }}>
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 999,
                background: "var(--bg-glass)",
                border: "1px solid var(--border)",
                fontSize: "0.82rem",
                color: "var(--text-secondary)",
              }}
            >
              <Icon size={14} style={{ color: "var(--accent)" }} />
              <strong style={{ color: "var(--text-primary)" }}>{label}</strong> — {desc}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Upload Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card"
        style={{ padding: 32 }}
      >
        <UploadZone />
      </motion.div>

      {/* Info Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          textAlign: "center",
          fontSize: "0.8rem",
          color: "var(--text-muted)",
          marginTop: 20,
        }}
      >
        Maximum file size: 50MB · Supported: PDF · 100% Free
      </motion.p>
    </div>
  );
}

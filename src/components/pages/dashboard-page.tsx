"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileArchive,
  HardDrive,
  TrendingDown,
  Clock,
  Upload,
  ArrowRight,
  FileText,
} from "lucide-react";
import { AnimatedCounter } from "@/components/animated-counter";
import { formatFileSize, formatDate } from "@/lib/utils";

interface Stats {
  totalCompressed: number;
  totalStorageSaved: number;
  avgCompressionPercentage: number;
  recentActivity: {
    id: string;
    fileName: string;
    compressionPercentage: number;
    uploadDate: string;
    originalSize: number;
    compressedSize: number;
  }[];
}

const STAT_CARDS = [
  {
    key: "totalCompressed" as const,
    label: "PDFs Compressed",
    icon: FileArchive,
    color: "#6366f1",
    format: (v: number) => v.toString(),
    suffix: "",
  },
  {
    key: "totalStorageSaved" as const,
    label: "Storage Saved",
    icon: HardDrive,
    color: "#10b981",
    format: (v: number) => formatFileSize(v),
    suffix: "",
  },
  {
    key: "avgCompressionPercentage" as const,
    label: "Avg. Compression",
    icon: TrendingDown,
    color: "#f59e0b",
    format: (v: number) => `${Math.round(v)}%`,
    suffix: "",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
};

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: 40 }}
      >
        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3rem)",
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            marginBottom: 12,
            lineHeight: 1.1,
          }}
          className="gradient-text"
        >
          Your Compression Hub
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.05rem" }}>
          Compress, track, and manage all your PDFs in one place.
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
          <motion.div
            key={key}
            variants={cardVariants}
            whileHover={{ y: -4, scale: 1.01 }}
            className="glass-card stat-card"
          >
            <div
              className="stat-icon"
              style={{ background: `${color}20`, borderColor: `${color}30` }}
            >
              <Icon size={22} style={{ color }} />
            </div>
            <div
              style={{
                fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
                fontWeight: 800,
                color: "var(--text-primary)",
                marginBottom: 4,
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {loading ? (
                <span style={{ color: "var(--text-muted)" }}>—</span>
              ) : key === "totalStorageSaved" ? (
                formatFileSize(stats?.[key] ?? 0)
              ) : key === "avgCompressionPercentage" ? (
                <AnimatedCounter value={stats?.[key] ?? 0} decimals={0} suffix="%" />
              ) : (
                <AnimatedCounter value={stats?.[key] ?? 0} />
              )}
            </div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", fontWeight: 500 }}>
              {label}
            </p>
          </motion.div>
        ))}

        {/* Quick Upload Card */}
        <motion.div variants={cardVariants} whileHover={{ y: -4, scale: 1.01 }}>
          <Link href="/upload" style={{ textDecoration: "none" }}>
            <div
              className="glass-card"
              style={{
                padding: 24,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 16,
                background: "var(--accent-glow)",
                borderColor: "var(--border-hover)",
                cursor: "pointer",
                minHeight: 140,
              }}
            >
              <div
                className="stat-icon"
                style={{ background: "var(--accent)", borderColor: "var(--accent)" }}
              >
                <Upload size={22} color="white" />
              </div>
              <div>
                <p
                  style={{
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "var(--text-primary)",
                    marginBottom: 4,
                  }}
                >
                  Quick Upload
                </p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Compress a new PDF
                </p>
              </div>
              <ArrowRight size={20} style={{ color: "var(--accent)", marginLeft: "auto" }} />
            </div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card"
        style={{ padding: 24 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Clock size={18} style={{ color: "var(--accent)" }} />
            <h2 style={{ fontWeight: 700, fontSize: "1.05rem" }}>Recent Activity</h2>
          </div>
          <Link
            href="/history"
            className="btn-ghost"
            style={{ padding: "6px 14px", fontSize: "0.8rem", textDecoration: "none" }}
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  height: 48,
                  borderRadius: 10,
                  background: "var(--bg-glass)",
                  animation: "fade-in 0.5s ease",
                }}
              />
            ))}
          </div>
        ) : !stats?.recentActivity?.length ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "var(--text-muted)",
            }}
          >
            <FileText size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
            <p style={{ fontSize: "0.95rem" }}>No activity yet</p>
            <p style={{ fontSize: "0.85rem", marginTop: 4 }}>
              Upload your first PDF to get started!
            </p>
            <Link href="/upload" className="btn-primary" style={{ marginTop: 16, display: "inline-flex", textDecoration: "none" }}>
              <Upload size={16} /> Upload PDF
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Original</th>
                  <th>Compressed</th>
                  <th>Saved</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivity.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <td style={{ color: "var(--text-primary)", fontWeight: 500, maxWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <FileText size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.fileName}
                        </span>
                      </div>
                    </td>
                    <td>{formatFileSize(item.originalSize)}</td>
                    <td>{formatFileSize(item.compressedSize)}</td>
                    <td>
                      <span className="badge badge-success">
                        {item.compressionPercentage.toFixed(1)}%
                      </span>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{formatDate(item.uploadDate)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

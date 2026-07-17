"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Download,
  Upload,
  History,
  FileText,
  TrendingDown,
  HardDrive,
  Clock,
  Zap,
} from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatFileSize, formatDuration } from "@/lib/utils";

export function ResultPage() {
  const router = useRouter();
  const { lastResult, reset } = useAppStore();

  useEffect(() => {
    if (!lastResult) {
      router.replace("/upload");
    }
  }, [lastResult, router]);

  if (!lastResult) return null;

  const compressionRatio = lastResult.compressionPercentage;
  const isGoodCompression = compressionRatio > 5;

  function handleDownload() {
    const a = document.createElement("a");
    a.href = lastResult!.downloadUrl;
    const ext = ".pdf";
    const base = lastResult!.fileName.replace(/\.pdf$/i, "");
    a.download = `${base}_compressed${ext}`;
    a.click();
  }

  const metrics = [
    {
      icon: FileText,
      label: "Original Size",
      value: formatFileSize(lastResult.originalSize),
      color: "var(--text-secondary)",
    },
    {
      icon: HardDrive,
      label: "Compressed Size",
      value: formatFileSize(lastResult.compressedSize),
      color: "var(--accent)",
    },
    {
      icon: TrendingDown,
      label: "Storage Saved",
      value: formatFileSize(lastResult.storageSaved),
      color: "var(--success)",
    },
    {
      icon: Clock,
      label: "Processing Time",
      value: formatDuration(lastResult.processingTime),
      color: "var(--warning)",
    },
  ];

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 24px" }}>
      {/* Success Header */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
        style={{ textAlign: "center", marginBottom: 40 }}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "var(--success-glow)",
            border: "2px solid var(--success)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <CheckCircle size={40} style={{ color: "var(--success)" }} />
        </motion.div>

        <h1
          style={{
            fontSize: "clamp(1.8rem, 5vw, 2.6rem)",
            fontWeight: 800,
            fontFamily: "'Space Grotesk', sans-serif",
            marginBottom: 8,
          }}
          className="gradient-text"
        >
          Compression Complete!
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem" }}>
          {lastResult.fileName}
        </p>
      </motion.div>

      {/* Big Compression % */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
        style={{ padding: 32, textAlign: "center", marginBottom: 20 }}
      >
        <motion.div
          initial={{ scale: 0.5 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
          style={{
            fontSize: "clamp(3rem, 10vw, 6rem)",
            fontWeight: 900,
            fontFamily: "'Space Grotesk', sans-serif",
            lineHeight: 1,
            marginBottom: 8,
          }}
          className="gradient-text"
        >
          {compressionRatio.toFixed(1)}%
        </motion.div>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", fontWeight: 500 }}>
          {isGoodCompression ? "File size reduced" : "Minimal reduction (PDF may already be optimized)"}
        </p>

        {/* Progress bar visual */}
        <div style={{ marginTop: 20 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              marginBottom: 6,
            }}
          >
            <span>Original</span>
            <span>Compressed</span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <motion.div
              className="progress-fill"
              initial={{ width: "100%" }}
              animate={{ width: `${100 - compressionRatio}%` }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {metrics.map(({ icon: Icon, label, value, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 + i * 0.08 }}
            whileHover={{ y: -2 }}
            className="glass-card"
            style={{ padding: "18px 20px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <Icon size={16} style={{ color }} />
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
                {label}
              </span>
            </div>
            <div
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "var(--text-primary)",
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {value}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Compression Level badge */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="badge badge-accent" style={{ textTransform: "capitalize" }}>
            <Zap size={12} style={{ marginRight: 4 }} />
            {lastResult.compressionLevel} compression
          </span>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{ display: "flex", gap: 12, flexWrap: "wrap" }}
      >
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="btn-primary"
          onClick={handleDownload}
          style={{ flex: 1, minWidth: 160, padding: "14px 20px", fontSize: "1rem" }}
          id="download-compressed-btn"
        >
          <Download size={18} />
          Download PDF
        </motion.button>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{ flex: 1, minWidth: 140 }}
        >
          <Link
            href="/upload"
            className="btn-ghost"
            onClick={reset}
            style={{
              width: "100%",
              padding: "14px 20px",
              fontSize: "1rem",
              justifyContent: "center",
              textDecoration: "none",
            }}
            id="compress-another-btn"
          >
            <Upload size={18} />
            Compress Another
          </Link>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          style={{ minWidth: 140 }}
        >
          <Link
            href="/history"
            className="btn-ghost"
            style={{
              padding: "14px 20px",
              fontSize: "1rem",
              justifyContent: "center",
              textDecoration: "none",
            }}
            id="view-history-btn"
          >
            <History size={18} />
            History
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}

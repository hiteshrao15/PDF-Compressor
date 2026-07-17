"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, X, Loader2, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { formatFileSize } from "@/lib/utils";
import { CompressionLevel } from "@/lib/validations";
import { toast } from "sonner";

const LEVELS: { id: CompressionLevel; label: string; desc: string }[] = [
  { id: "low", label: "Low", desc: "Fastest, minimal reduction" },
  { id: "auto", label: "Auto", desc: "Chooses the best setting for this PDF" },
  { id: "high", label: "High", desc: "Maximum compression" },
];

export function UploadZone() {
  const router = useRouter();
  const { compressionLevel, setCompressionLevel, setLastResult, isCompressing, setIsCompressing } = useAppStore();
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: { errors: { message: string }[] }[]) => {
    setError(null);
    if (rejected.length > 0) {
      setError("Only PDF files under 50MB are supported.");
      return;
    }
    if (accepted[0]) {
      setFile(accepted[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    maxSize: 50 * 1024 * 1024,
    multiple: false,
    disabled: isCompressing,
  });

  async function handleCompress() {
    if (!file) return;
    setIsCompressing(true);
    setError(null);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((p) => Math.min(p + 8, 85));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("compressionLevel", compressionLevel);

      const res = await fetch("/api/compress", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Compression failed");
      }

      const result = await res.json();
      setLastResult(result);
      toast.success("PDF compressed successfully!");
      router.push("/result");
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      const msg = err instanceof Error ? err.message : "Compression failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsCompressing(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Drop Zone */}
      <motion.div
        {...getRootProps()}
        className={`upload-zone ${isDragActive ? "drag-over" : ""}`}
        whileHover={{ scale: 1.01 }}
        animate={isDragActive ? { scale: 1.02 } : { scale: 1 }}
        style={{ cursor: isCompressing ? "not-allowed" : "pointer" }}
        role="button"
        aria-label="Upload PDF file"
        id="upload-dropzone"
      >
        <input {...getInputProps()} id="pdf-file-input" />
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}
            >
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: "var(--accent-glow)", border: "1px solid var(--border-hover)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FileText size={28} style={{ color: "var(--accent)" }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>{file.name}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                className="btn-ghost"
                style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                id="remove-file-btn"
              >
                <X size={14} /> Remove
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}
            >
              <motion.div
                animate={{ y: isDragActive ? -8 : 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: "var(--accent-glow)", border: "1px solid var(--border-hover)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <Upload size={28} style={{ color: "var(--accent)" }} />
              </motion.div>
              <div>
                <p style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--text-primary)", marginBottom: 6 }}>
                  {isDragActive ? "Drop your PDF here" : "Drag & drop your PDF"}
                </p>
                <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                  or <span style={{ color: "var(--accent)", fontWeight: 600 }}>browse files</span> — up to 50MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              display: "flex", alignItems: "center", gap: 10, padding: "12px 16px",
              borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "var(--danger)", fontSize: "0.875rem",
            }}
            role="alert"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compression Level */}
      <div className="glass-card" style={{ padding: 20 }}>
        <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>
          Compression Level
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {LEVELS.map((l) => (
            <button
              key={l.id}
              className={`level-btn ${compressionLevel === l.id ? "active" : ""}`}
              onClick={() => setCompressionLevel(l.id)}
              title={l.desc}
              id={`level-${l.id}`}
              disabled={isCompressing}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: 8 }}>
          {LEVELS.find((l) => l.id === compressionLevel)?.desc}
        </p>
      </div>

      {/* Progress */}
      <AnimatePresence>
        {isCompressing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: "hidden" }}
          >
            <div className="glass-card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.85rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Compressing...</span>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>{uploadProgress}%</span>
              </div>
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: "0%" }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compress Button */}
      <motion.button
        whileHover={!isCompressing && file ? { scale: 1.02, y: -2 } : {}}
        whileTap={!isCompressing && file ? { scale: 0.98 } : {}}
        className="btn-primary"
        onClick={handleCompress}
        disabled={!file || isCompressing}
        style={{
          width: "100%",
          padding: "14px",
          fontSize: "1rem",
          opacity: !file || isCompressing ? 0.5 : 1,
          cursor: !file || isCompressing ? "not-allowed" : "pointer",
        }}
        id="compress-btn"
      >
        {isCompressing ? (
          <>
            <Loader2 size={18} style={{ animation: "spin 0.8s linear infinite" }} />
            Compressing...
          </>
        ) : (
          <>
            <Zap size={18} />
            Compress PDF
          </>
        )}
      </motion.button>
    </div>
  );
}

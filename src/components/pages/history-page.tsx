"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Search,
  Download,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { formatFileSize, formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface HistoryItem {
  id: string;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  compressionPercentage: number;
  storageSaved: number;
  uploadDate: string;
  downloadUrl: string;
  compressionLevel: string;
}

type SortField = "uploadDate" | "fileName" | "compressionPercentage" | "originalSize";

export function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortField>("uploadDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        sortBy,
        sortOrder,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
      });
      const res = await fetch(`/api/history?${params}`);
      const data = await res.json();
      setItems(data.items || []);
      setTotal(data.pagination?.total ?? 0);
      setTotalPages(data.pagination?.totalPages ?? 1);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, debouncedSearch]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  async function handleDelete(id: string, fileName: string) {
    if (!confirm(`Delete "${fileName}" from history?`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Deleted successfully");
      fetchHistory();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  }

  function handleDownload(item: HistoryItem) {
    const a = document.createElement("a");
    a.href = item.downloadUrl;
    a.download = item.fileName.replace(/\.pdf$/i, "") + "_compressed.pdf";
    a.click();
  }

  function toggleSort(field: SortField) {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(1);
  }

  function SortIcon({ field }: { field: SortField }) {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp size={14} style={{ display: "inline", marginLeft: 4, color: "var(--accent)" }} />
    ) : (
      <ChevronDown size={14} style={{ display: "inline", marginLeft: 4, color: "var(--accent)" }} />
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 32 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--gradient-hero)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <History size={22} color="white" />
          </div>
          <h1
            style={{
              fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
              fontWeight: 800,
              fontFamily: "'Space Grotesk', sans-serif",
            }}
            className="gradient-text"
          >
            Compression History
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)" }}>
          {total} file{total !== 1 ? "s" : ""} compressed
        </p>
      </motion.div>

      {/* Search & Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
        style={{ padding: "16px 20px", marginBottom: 20 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
              }}
            />
            <input
              className="input"
              placeholder="Search by file name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 38 }}
              id="history-search"
              aria-label="Search history"
            />
          </div>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
        style={{ overflow: "hidden" }}
      >
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "60px 20px",
              gap: 12,
              color: "var(--text-secondary)",
            }}
          >
            <Loader2 size={24} style={{ animation: "spin 0.8s linear infinite", color: "var(--accent)" }} />
            Loading history...
          </div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)" }}>
            <FileText size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
            <p style={{ fontSize: "1rem", marginBottom: 6 }}>
              {debouncedSearch ? "No results found" : "No compression history yet"}
            </p>
            <p style={{ fontSize: "0.85rem", marginBottom: 20 }}>
              {debouncedSearch ? "Try a different search term" : "Upload a PDF to get started"}
            </p>
            {!debouncedSearch && (
              <Link href="/upload" className="btn-primary" style={{ textDecoration: "none", display: "inline-flex" }}>
                <Upload size={16} /> Upload PDF
              </Link>
            )}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th
                    style={{ cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleSort("fileName")}
                    id="sort-filename"
                  >
                    File Name <SortIcon field="fileName" />
                  </th>
                  <th
                    style={{ cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleSort("originalSize")}
                    id="sort-original"
                  >
                    Original <SortIcon field="originalSize" />
                  </th>
                  <th>Compressed</th>
                  <th
                    style={{ cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleSort("compressionPercentage")}
                    id="sort-compression"
                  >
                    Saved % <SortIcon field="compressionPercentage" />
                  </th>
                  <th>Level</th>
                  <th
                    style={{ cursor: "pointer", userSelect: "none" }}
                    onClick={() => toggleSort("uploadDate")}
                    id="sort-date"
                  >
                    Date <SortIcon field="uploadDate" />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {items.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <td style={{ maxWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <FileText size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              color: "var(--text-primary)",
                              fontWeight: 500,
                              maxWidth: 180,
                              display: "block",
                            }}
                            title={item.fileName}
                          >
                            {item.fileName}
                          </span>
                        </div>
                      </td>
                      <td>{formatFileSize(item.originalSize)}</td>
                      <td style={{ color: "var(--accent)" }}>{formatFileSize(item.compressedSize)}</td>
                      <td>
                        <span className="badge badge-success">
                          {item.compressionPercentage.toFixed(1)}%
                        </span>
                      </td>
                      <td>
                        <span
                          className="badge badge-accent"
                          style={{ textTransform: "capitalize" }}
                        >
                          {item.compressionLevel}
                        </span>
                      </td>
                      <td style={{ whiteSpace: "nowrap", fontSize: "0.82rem" }}>
                        {formatDate(item.uploadDate)}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDownload(item)}
                            className="btn-ghost"
                            style={{ padding: "6px 10px" }}
                            title="Download compressed PDF"
                            aria-label={`Download ${item.fileName}`}
                          >
                            <Download size={14} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDelete(item.id, item.fileName)}
                            disabled={deleting === item.id}
                            className="btn-danger"
                            style={{ padding: "6px 10px" }}
                            title="Delete from history"
                            aria-label={`Delete ${item.fileName}`}
                          >
                            {deleting === item.id ? (
                              <Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} />
                            ) : (
                              <Trash2 size={14} />
                            )}
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            marginTop: 20,
          }}
        >
          <button
            className="btn-ghost"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ padding: "8px 12px" }}
            aria-label="Previous page"
            id="pagination-prev"
          >
            <ChevronLeft size={16} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
            .map((p, i, arr) => (
              <span key={p}>
                {i > 0 && arr[i - 1] !== p - 1 && (
                  <span style={{ color: "var(--text-muted)", padding: "0 4px" }}>…</span>
                )}
                <button
                  className={p === page ? "btn-primary" : "btn-ghost"}
                  onClick={() => setPage(p)}
                  style={{ padding: "8px 14px", minWidth: 40 }}
                  aria-label={`Page ${p}`}
                  aria-current={p === page ? "page" : undefined}
                >
                  {p}
                </button>
              </span>
            ))}
          <button
            className="btn-ghost"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ padding: "8px 12px" }}
            aria-label="Next page"
            id="pagination-next"
          >
            <ChevronRight size={16} />
          </button>
        </motion.div>
      )}
    </div>
  );
}

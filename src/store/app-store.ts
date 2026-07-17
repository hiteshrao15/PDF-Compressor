import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CompressionLevel } from "@/lib/validations";

export interface CompressionResultData {
  id: string;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  compressionPercentage: number;
  storageSaved: number;
  processingTime: number;
  downloadUrl: string;
  compressionLevel: CompressionLevel;
}

interface AppState {
  // Upload state
  uploadedFile: File | null;
  compressionLevel: CompressionLevel;
  isCompressing: boolean;
  lastResult: CompressionResultData | null;

  // Actions
  setUploadedFile: (file: File | null) => void;
  setCompressionLevel: (level: CompressionLevel) => void;
  setIsCompressing: (v: boolean) => void;
  setLastResult: (result: CompressionResultData | null) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      uploadedFile: null,
      compressionLevel: "auto",
      isCompressing: false,
      lastResult: null,

      setUploadedFile: (file) => set({ uploadedFile: file }),
      setCompressionLevel: (level) => set({ compressionLevel: level }),
      setIsCompressing: (v) => set({ isCompressing: v }),
      setLastResult: (result) => set({ lastResult: result }),
      reset: () =>
        set({
          uploadedFile: null,
          isCompressing: false,
          lastResult: null,
        }),
    }),
    {
      name: "pdf-compressor-store",
      partialize: (state) => ({
        compressionLevel: state.compressionLevel,
      }),
    }
  )
);

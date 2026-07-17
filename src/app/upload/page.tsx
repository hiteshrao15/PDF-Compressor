import type { Metadata } from "next";
import { UploadPage } from "@/components/pages/upload-page";

export const metadata: Metadata = {
  title: "Upload PDF — PDF Squeeze",
  description: "Upload and compress your PDF files. Supports drag & drop with Low, Auto, and High compression levels.",
};

export default function UploadRoute() {
  return <UploadPage />;
}

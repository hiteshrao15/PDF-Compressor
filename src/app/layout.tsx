import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { AnimatedBackground } from "@/components/animated-background";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "PDF Squeeze — Free PDF Compressor Dashboard",
  description:
    "Compress PDF files instantly with PDF Squeeze. Reduce PDF file sizes with Low, Auto, and High compression levels. Track your compression history with our beautiful dashboard.",
  keywords: ["PDF compressor", "reduce PDF size", "PDF optimization", "free PDF tool"],
  openGraph: {
    title: "PDF Squeeze — Free PDF Compressor",
    description: "Compress PDF files instantly for free",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme') || 'dark';
                  document.documentElement.setAttribute('data-theme', t);
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <AnimatedBackground />
        <Navbar />
        <main
          style={{
            position: "relative",
            zIndex: 1,
            paddingTop: 64,
            minHeight: "100vh",
          }}
        >
          {children}
        </main>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              backdropFilter: "blur(20px)",
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Bowlby_One, Oswald, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ChatBox from "@/components/ChatBox";

const bowlbyOne = Bowlby_One({
  weight: '400',
  variable: "--font-bowlby",
  subsets: ["latin"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SemesterHub",
  description: "A neobrutalist class resource app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bowlbyOne.variable} ${oswald.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <div style={{
          background: 'var(--saffron)',
          color: 'var(--ink)',
          textAlign: 'center',
          padding: '8px 16px',
          fontFamily: 'var(--mono)',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          borderBottom: '3px solid var(--ink)',
          position: 'relative',
          zIndex: 100
        }}>
          Shoolini University ✦ ByteXL Batch 2025-29
        </div>
        {children}
        <footer style={{
          textAlign: 'center',
          padding: '32px 16px',
          fontFamily: 'var(--mono)',
          fontSize: '14px',
          color: 'var(--ink-3)',
          borderTop: '3px solid var(--ink)',
          background: 'var(--paper-2)'
        }}>
          &copy; {new Date().getFullYear()} Pranshu Pathak. 
          <br/>
          Built for the lazy, by the lazy.
        </footer>
        <ChatBox />
      </body>
    </html>
  );
}

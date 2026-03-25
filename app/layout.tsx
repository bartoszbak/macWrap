import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AgentationWrapper } from "@/components/agentation-wrapper";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "MacWrap",
  description: "Design your MacBook lid with custom stickers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={geist.variable}>
        {children}
        <AgentationWrapper />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ask Chef RamsAI!",
  description: "Explore a variety of recipes with this gourmet ChefBot",
  icons: {
    icon: 'public/ChefBotIcon2.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-200`}>{children}</body>
    </html>
  );
}

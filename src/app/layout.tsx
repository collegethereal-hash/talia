import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { AuthGuard } from "@/components/AuthGuard";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin", "cyrillic"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "Talia - Our Cozy Space",
  description: "A magical space for Polina and Me",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans text-foreground">
        <AuthGuard>
          <main className="min-h-screen pb-24">
            {children}
          </main>
          <Navbar />
        </AuthGuard>
      </body>
    </html>
  );
}

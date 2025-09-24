import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { MainNav } from "@/components/layout/main-nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Document Extractor - AI-Powered Invoice Processing",
  description: "Extract structured data from invoices using AI technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-slate-50 to-blue-50`}
        suppressHydrationWarning={true}
      >
        <div className="min-h-screen flex flex-col">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className=" flex h-14 items-center justify-center">
              <div className="mr-4 flex justify-center">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                  <div className="h-6 w-6 bg-primary rounded" />
                  <span className="hidden font-bold sm:inline-block">
                    Document Extractor
                  </span>
                </Link>
                <MainNav />
              </div>
            </div>
          </header>
          <main className="w-full flex justify-center pt-10">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}

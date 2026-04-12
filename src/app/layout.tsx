import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import DeviceSimulatorProvider from "@/components/DeviceSimulatorProvider";
import AuthProvider from "@/components/AuthProvider";
import UserMenu from "@/components/UserMenu";
import ForcePasswordChange from "@/components/ForcePasswordChange";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MiperAI - Matriz Inteligente",
  description: "Matriz Inteligente de Peligros y Riesgos asistida por IA",
  manifest: "/manifest.json",
  icons: {
    icon: '/icon-512.png',
    apple: '/icon-512.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900" suppressHydrationWarning>
        <AuthProvider>
          <DeviceSimulatorProvider>
            <UserMenu />
            <ForcePasswordChange />
            {children}
          </DeviceSimulatorProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

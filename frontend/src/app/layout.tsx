import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import {Toaster} from "@/components/ui/toaster";
import AuthProvider from "@/providers/AuthProvider";
import React from "react";
import NavBar from "@/components/base/nav-bar";
import {ThemeProvider} from "@/components/theme-provider";


const font = Montserrat({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SketchSpace",
  description: "Создавайте, исследуйте, вдохновляйте!",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={font.className}>
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
          <div className="h-screen">
              {/* Условный рендеринг NavBar */}

              <AuthProvider>
                  <NavBar/>
                  {children}
              </AuthProvider>
          </div>
      </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}

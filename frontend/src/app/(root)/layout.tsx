import React from "react";
import NavBar from "@/components/base/nav-bar";
import {SidebarProvider} from "@/components/ui/sidebar";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="h-screen overflow-y-scroll no-scrollbar">
              <NavBar/>
              {children}
      </div>
  );
}

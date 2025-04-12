import React from "react";


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
          <div className="h-screen overflow-y-scroll no-scrollbar">
                  {children}
          </div>
  );
}

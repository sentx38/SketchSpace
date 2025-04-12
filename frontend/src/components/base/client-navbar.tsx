// src/components/client-navbar.tsx
"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// Динамически импортируем NavBar с отключением SSR
const DynamicNavBar = dynamic(() => import("@/components/base/nav-bar"), {
    ssr: false,
});

export default function ClientNavBar() {
    const pathname = usePathname();
    const showNavBar = !pathname?.startsWith("/dashboard"); // Проверяем путь

    return showNavBar ? <DynamicNavBar /> : null;
}
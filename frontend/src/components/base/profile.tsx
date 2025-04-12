"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Home, Inbox, LogOutIcon, MoreVerticalIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTheme } from "next-themes";
import { UserModelTable } from "@/components/base/user-model-table";
import React, { useState } from "react";

// Пункты меню
const items = [
    {
        title: "Мои модели",
        key: "models",
        icon: Home,
    },
    {
        title: "Избранное",
        key: "favorites",
        icon: Inbox,
    },
    {
        title: "Профиль",
        key: "profile",
        icon: Calendar,
    },
];

export default function Profile() {
    const { setTheme } = useTheme();
    const { data } = useSession();
    const user = data?.user as {
        name: string;
        email: string;
        profile_image?: string;
    };

    // Состояние для активного вида внутри диалога
    const [activeView, setActiveView] = useState("models");

    // Функция для рендеринга контента в диалоге
    const renderContent = () => {
        switch (activeView) {
            case "models":
                return <UserModelTable />;
            case "favorites":
                return <div>Здесь будут отображаться избранные элементы</div>;
            case "profile":
                return (
                    <div>
                        <h2 className="text-lg font-medium">Профиль</h2>
                        <p>Имя: {user?.name}</p>
                        <p>Email: {user?.email}</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div>
            <Dialog>
                <DialogTrigger>Открыть профиль</DialogTrigger>
                <DialogContent className="max-w-[75vw] h-[75vh] p-0 overflow-hidden">
                    <SidebarProvider>
                        <div className="flex h-full w-full">
                            {/* Боковое меню */}
                            <Sidebar className="w-64 border-r h-full flex flex-col">
                                <SidebarContent className="flex-1 overflow-auto">
                                    <SidebarGroup>
                                        <SidebarGroupLabel>Приложение</SidebarGroupLabel>
                                        <SidebarGroupContent>
                                            <SidebarMenu>
                                                {items.map((item) => (
                                                    <SidebarMenuItem key={item.key}>
                                                        <SidebarMenuButton
                                                            onClick={() => setActiveView(item.key)}
                                                            className={activeView === item.key ? "bg-muted text-foreground" : ""}
                                                        >
                                                            <item.icon />
                                                            <span>{item.title}</span>
                                                        </SidebarMenuButton>
                                                    </SidebarMenuItem>
                                                ))}
                                            </SidebarMenu>
                                        </SidebarGroupContent>
                                    </SidebarGroup>
                                </SidebarContent>
                                {user && (
                                    <SidebarFooter className="border-t shrink-0">
                                        <SidebarMenu>
                                            <SidebarMenuItem>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <SidebarMenuButton size="lg">
                                                            <Avatar className="h-8 w-8 rounded-lg grayscale">
                                                                <AvatarImage src={user.profile_image} alt={user.name} />
                                                                <AvatarFallback className="rounded-lg">U</AvatarFallback>
                                                            </Avatar>
                                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                                <span className="truncate font-medium">{user.name}</span>
                                                                <span className="truncate text-xs text-muted-foreground">
                                  {user.email}
                                </span>
                                                            </div>
                                                            <MoreVerticalIcon className="ml-auto size-4" />
                                                        </SidebarMenuButton>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="center" sideOffset={8} className="min-w-56 rounded-lg">
                                                        <DropdownMenuLabel className="p-0 font-normal">
                                                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                                                <Avatar className="h-8 w-8 rounded-lg">
                                                                    <AvatarImage src={user.profile_image} alt={user.name} />
                                                                    <AvatarFallback className="rounded-lg">U</AvatarFallback>
                                                                </Avatar>
                                                                <div className="grid flex-1 text-left text-sm leading-tight">
                                                                    <span className="truncate font-medium">{user.name}</span>
                                                                    <span className="truncate text-xs text-muted-foreground">
                                    {user.email}
                                  </span>
                                                                </div>
                                                            </div>
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuSub>
                                                            <DropdownMenuSubTrigger>Тема</DropdownMenuSubTrigger>
                                                            <DropdownMenuPortal>
                                                                <DropdownMenuSubContent>
                                                                    <DropdownMenuItem onClick={() => setTheme("light")}>
                                                                        Светлая
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                                                                        Темная
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuSeparator />
                                                                    <DropdownMenuItem onClick={() => setTheme("system")}>
                                                                        Системная
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuSubContent>
                                                            </DropdownMenuPortal>
                                                        </DropdownMenuSub>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem>
                                                            <LogOutIcon className="mr-2 h-4 w-4" />
                                                            Выйти
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </SidebarMenuItem>
                                        </SidebarMenu>
                                    </SidebarFooter>
                                )}
                            </Sidebar>

                            {/* Контентная область */}
                            <div className="flex-1 h-full flex flex-col">
                                <DialogHeader className="px-5 pt-5 pb-2 shrink-0">
                                    <DialogTitle>{items.find((item) => item.key === activeView)?.title}</DialogTitle>
                                </DialogHeader>
                                <div className="flex-1 px-5 pb-5 overflow-auto">
                                    {renderContent()}
                                </div>
                            </div>
                        </div>
                    </SidebarProvider>
                </DialogContent>
            </Dialog>
        </div>
    );
}
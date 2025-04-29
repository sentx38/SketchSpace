"use client";

import { useEffect, useState } from "react";
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
    SidebarGroupLabel,
    SidebarGroupContent,
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
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Castle, FolderHeart, LogOutIcon, MoreVerticalIcon, User2 } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { UserModelTable } from "@/components/base/user-model-table";
import { UserFavorites } from "@/components/base/user-favorites";
import UserInfo from "@/components/base/user-info";
import { CustomUser } from "@/app/api/auth/[...nextauth]/authOptions";
import UserAvatar from "@/components/common/UserAvatar";
import myAxios from "@/lib/axios.config";
import { LOGOUT_URL } from "@/lib/apiEndPoints";
import { toast } from "sonner";
import { redirect } from "next/navigation";

// Пункты меню
const items = [
    {
        title: "Мои модели",
        key: "models",
        icon: Castle,
    },
    {
        title: "Избранное",
        key: "favorites",
        icon: FolderHeart,
    },
    {
        title: "Профиль",
        key: "profile",
        icon: User2,
    },
];

export default function Profile() {
    const [open, setOpen] = useState(false);
    const { setTheme } = useTheme();
    const { data } = useSession();
    const user = data?.user as CustomUser;

    const [userData, setUserData] = useState<CustomUser | null>(user ?? null);
    const [activeView, setActiveView] = useState("models");

    // Синхронизация userData с данными сессии
    useEffect(() => {
        if (user) {
            setUserData(user);
        }
    }, [user]);

    const renderContent = () => {
        switch (activeView) {
            case "models":
                return <UserModelTable />;
            case "favorites":
                return <UserFavorites />;
            case "profile":
                return (
                    <UserInfo
                        onUpdate={(updatedUser: Partial<CustomUser>) => {
                            setUserData((prev) => ({ ...prev!, ...updatedUser }));
                        }}
                    />
                );
            default:
                return null;
        }
    };

    const handleLogout = async () => {
        try {
            await myAxios.post(
                LOGOUT_URL,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                }
            );
            signOut({
                callbackUrl: "/auth",
                redirect: true,
            });
        } catch {
            toast.error("Ошибка при выходе. Попробуйте снова!");
        }
    };

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger>
                    <div
                        onClick={(e) => {
                            e.preventDefault();
                            if (!user) {
                                toast.info("Пожалуйста, войдите в аккаунт, чтобы загрузить модель");
                                redirect("/auth");
                            } else {
                                setOpen(true);
                            }
                        }}
                    >
                        {/* Отображаем UserAvatar с дефолтным изображением для неавторизованных */}
                        <UserAvatar image={userData?.profile_image ?? undefined} />
                    </div>
                </DialogTrigger>
                {/* Рендерим DialogContent только для авторизованных пользователей */}
                {userData && (
                    <DialogContent className="max-w-[75vw] h-[75vh] p-0 overflow-hidden">
                        <SidebarProvider>
                            <div className="flex h-full w-full">
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
                                    <SidebarFooter className="border-t shrink-0">
                                        <SidebarMenu>
                                            <SidebarMenuItem>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <SidebarMenuButton size="lg">
                                                            <UserAvatar image={userData.profile_image ?? undefined} />
                                                            <div className="grid flex-1 text-left text-sm leading-tight">
                                                                <span className="truncate font-medium">{userData.name}</span>
                                                                <span className="truncate text-xs text-muted-foreground">{userData.email}</span>
                                                            </div>
                                                            <MoreVerticalIcon className="ml-auto size-4" />
                                                        </SidebarMenuButton>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="center" sideOffset={8} className="min-w-56 rounded-lg">
                                                        <DropdownMenuLabel className="p-0 font-normal">
                                                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                                                <UserAvatar image={userData.profile_image ?? undefined} />
                                                                <div className="grid flex-1 text-left text-sm leading-tight">
                                                                    <span className="truncate font-medium">{userData.name}</span>
                                                                    <span className="truncate text-xs text-muted-foreground">{userData.email}</span>
                                                                </div>
                                                            </div>
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuLabel className="text-muted-foreground">Тема</DropdownMenuLabel>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("light")}>
                                                            Светлая
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("dark")}>
                                                            Темная
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="cursor-pointer" onClick={() => setTheme("system")}>
                                                            Системная
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                                                            <LogOutIcon className="mr-2 h-4 w-4" />
                                                            Выйти
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </SidebarMenuItem>
                                        </SidebarMenu>
                                    </SidebarFooter>
                                </Sidebar>

                                <div className="flex-1 h-full flex flex-col">
                                    <DialogHeader className="px-5 pt-5 pb-2 shrink-0">
                                        <DialogTitle>{items.find((item) => item.key === activeView)?.title}</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex-1 px-5 pb-5 overflow-auto">{renderContent()}</div>
                                </div>
                            </div>
                        </SidebarProvider>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    );
}
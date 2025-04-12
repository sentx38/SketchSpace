import { useEffect } from "react";
import { createLaraEcho } from "@/lib/echo.config";

type CategoriesType = {
    id: number;
    title: string;
    code: string;
};

type UserType = {
    id?: number;
    name?: string;
    profile_image?: string;
    username?: string;
    email?: string;
    role?: string;
};

interface CategoryBroadcastEvent {
    category: CategoriesType;
    action: "created" | "updated" | "deleted";
}

interface UserBroadcastEvent {
    user: UserType;
    action: "created" | "updated" | "deleted";
}

type UseCategoryAndUserBroadcastProps = {
    setCategories: (updater: (categories: CategoriesType[]) => CategoriesType[]) => void;
    setUsers: (updater: (users: UserType[]) => UserType[]) => void;
    isAdmin: boolean;
};

export const useCategoryAndUserBroadcast = ({ setCategories, setUsers, isAdmin }: UseCategoryAndUserBroadcastProps) => {
    useEffect(() => {
        if (!isAdmin) return;

        const laraEcho = createLaraEcho();

        laraEcho
            .channel("category-broadcast")
            .listen("CategoryBroadcastEvent", (event: CategoryBroadcastEvent) => {
                if (!event.category?.id) {
                    console.warn("Получена категория без id:", event.category);
                    return;
                }
                if (event.action === "created") {
                    setCategories(prev => {
                        if (prev.some(cat => cat.id === event.category.id)) return prev;
                        return [...prev, event.category];
                    });
                } else if (event.action === "updated") {
                    setCategories(prev => prev.map(cat => (cat.id === event.category.id ? event.category : cat)));
                } else if (event.action === "deleted") {
                    setCategories(prev => prev.filter(cat => cat.id !== event.category.id));
                }
            });

        laraEcho
            .channel("user-broadcast")
            .listen("UserBroadcastEvent", (event: UserBroadcastEvent) => {
                if (!event.user?.id) {
                    console.warn("Получен пользователь без id:", event.user);
                    return;
                }
                if (event.action === "created") {
                    setUsers(prev => [...prev, event.user]);
                } else if (event.action === "updated") {
                    setUsers(prev => prev.map(u => (u.id === event.user.id ? event.user : u)));
                } else if (event.action === "deleted") {
                    setUsers(prev => prev.filter(u => u.id !== event.user.id));
                }
            });

        return () => {
            laraEcho.leave("category-broadcast");
            laraEcho.leave("user-broadcast");
        };
    }, [setCategories, setUsers, isAdmin]);
};
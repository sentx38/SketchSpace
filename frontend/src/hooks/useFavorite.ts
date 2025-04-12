import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import myAxios from "@/lib/axios.config";
import { CustomUser } from "@/app/api/auth/[...nextauth]/authOptions";
import { FAVORITE_URL } from "@/lib/apiEndPoints";

export const useFavorite = (modelId: number, user: CustomUser | null, initialLikesCount: number = 0) => {
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [likesCount, setLikesCount] = useState<number>(initialLikesCount);

    const checkIfFavorited = useCallback(async () => {
        try {
            const response = await myAxios.get(`${FAVORITE_URL}/status/${modelId}`, {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            setIsLiked(response.data.isFavorited);
        } catch (error) {
            console.error("Error fetching favorite status", error);
            toast.error("Не удалось проверить статус избранного.");
        }
    }, [modelId, user?.token]);

    useEffect(() => {
        if (user?.token) {
            checkIfFavorited();
        }
    }, [checkIfFavorited, user?.token]);

    const toggleLike = async (): Promise<"liked" | "unliked" | "error"> => {
        if (!user) {
            toast.error("Пожалуйста, авторизуйтесь, чтобы добавить в избранное.");
            return "error";
        }

        setLoading(true);

        try {
            if (isLiked) {
                await myAxios.delete(`${FAVORITE_URL}/${modelId}`, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                setIsLiked(false);
                toast.success("Модель удалена из избранного.");
                return "unliked";
            } else {
                await myAxios.post(
                    FAVORITE_URL,
                    { model_id: modelId },
                    {
                        headers: {
                            Authorization: `Bearer ${user.token}`,
                        },
                    }
                );
                setIsLiked(true);
                toast.success("Модель добавлена в избранное.");
                return "liked";
            }
        } catch (error) {
            console.error("Error adding/removing from favorites", error);
            setIsLiked((prev) => !prev);
            toast.error("Что-то пошло не так. Пожалуйста, попробуйте позже!");
            return "error";
        } finally {
            setLoading(false);
        }
    };

    return { isLiked, toggleLike, likesCount, setLikesCount, loading };
};
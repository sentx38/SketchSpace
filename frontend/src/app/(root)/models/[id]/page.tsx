"use client";
import ShowModel from "@/components/model/ShowModel";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import myAxios from "@/lib/axios.config";
import { CustomUser } from "@/app/api/auth/[...nextauth]/authOptions";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import AddComment from "@/components/comment/AddComment";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, HeartIcon, LinkIcon, Send } from "lucide-react";
import { copyUrl } from "@/lib/utils";
import { toast } from "sonner";
import { MODEL_URL } from "@/lib/apiEndPoints";
import { useFavorite } from "@/hooks/useFavorite";
import CategoryModelsCarousel from "@/components/model/CategoryModelsCarousel";

export default function ModelPage({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession();
    const user = session?.user as CustomUser;

    const [model, setModel] = useState<ModelType | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [downloadLoading, setDownloadLoading] = useState<boolean>(false);
    const id = React.use(params).id;

    // Инициализация хука useFavorite с начальным количеством лайков
    const { isLiked, toggleLike, setLikesCount, loading: favoriteLoading } = useFavorite(
        Number(id),
        user,
        model?.favorite_count || 0
    );

    useEffect(() => {
        if (model) return;
        if (status === "loading") return;

        const fetchModel = async () => {
            setLoading(true);
            try {
                const response = await myAxios.get(`${MODEL_URL}/${id}`);
                const modelData: ModelType = response.data;
                console.log("API response:", modelData); // Для отладки
                setModel(modelData);
                setLikesCount(modelData.favorite_count || 0);
                toast.success("Модель успешно загружена!");
            } catch (err: any) {
                setLoading(false);
                if (err.response?.status === 404) {
                    setError("Модель не найдена.");
                    toast.error("Модель не найдена.");
                } else if (err.response?.status === 401) {
                    setError("Неавторизован. Пожалуйста, войдите в систему.");
                    toast.error("Неавторизован. Пожалуйста, войдите в систему.");
                } else {
                    setError("Что-то пошло не так. Пожалуйста, попробуйте позже.");
                    toast.error("Что-то пошло не так. Пожалуйста, попробуйте позже!");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchModel();
    }, [id, status, setLikesCount]);

    // Обработчик для переключения состояния избранного
    const handleToggleLike = async () => {
        const result = await toggleLike();
        if (result === "liked") {
            setLikesCount((prev) => prev + 1);
        } else if (result === "unliked") {
            setLikesCount((prev) => Math.max(0, prev - 1));
        }
    };

    // Обработчик для скачивания архива
    const handleDownload = async () => {
        if (!user) {
            toast.error("Пожалуйста, авторизуйтесь, чтобы скачать архив.");
            return;
        }

        if (!model?.file_url) {
            toast.error("Архив для этой модели недоступен.");
            return;
        }

        setDownloadLoading(true);
        try {

            // Извлекаем расширение файла из file_url
            const extensionMatch = model.file_url.match(/\.([a-zA-Z0-9]+)$/);
            const extension = extensionMatch ? `.${extensionMatch[1]}` : ".rar"; // Резервное расширение

            const response = await myAxios.get(model.file_url, {
                responseType: "blob",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });

            // Создаем Blob с правильным MIME-типом
            const mimeType = extension === ".rar" ? "application/x-rar-compressed" : "application/octet-stream";
            const url = window.URL.createObjectURL(new Blob([response.data], { type: mimeType }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `${model.title}${extension}`); // Динамическое расширение
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            // toast.success("Файл успешно скачан!");
        } catch (error: any) {
            console.error("Ошибка при скачивании архива:", error);
            console.error("Response:", error.response);
            console.error("Request:", error.request);
            toast.error(`Не удалось скачать архив: ${error.message || "Неизвестная ошибка"}. Попробуйте позже.`);
        } finally {
            setDownloadLoading(false);
        }
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!model) {
        return <div>Модель не найдена.</div>;
    }

    return (
        <div className="flex flex-row outline-4 h-screen p-5">
            <div className="flex-1 rounded-lg shadow-lg p-5 overflow-y-auto max-h-screen no-scrollbar border border-emerald-300">
                <div className="w-full h-0 pb-[56.25%] relative">
                    <div className="absolute top-0 left-0 w-full h-full">
                        <ShowModel modelUrl={model.model_glb_url} envMapUrl={model.envMap_url} />
                    </div>
                </div>
                <div className="pt-5">
                    <h1 className="text-3xl font-bold">{model.title}</h1>
                    <Link
                        className="text-muted-foreground text-sm underline-offset-4 hover:underline"
                        href={`/categories/${model.category?.code || ''}`}
                    >
                        {model.category?.title || "Без категории"}
                    </Link>
                </div>

                <Separator />
                <div className="mt-3 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-semibold">Автор: {model.author.username}</h3>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={() => copyUrl({ model })}
                            className="bg-blue-500 rounded-sm hover:bg-blue-500/80"
                            size="icon"
                        >
                            <Send size={18} />
                        </Button>
                        <Button
                            onClick={() => copyUrl({ model })}
                            className="border border-black rounded-sm hover:text-emerald-500"
                            size="icon"
                        >
                            <LinkIcon size={18} />
                        </Button>
                        <Button
                            onClick={handleToggleLike}
                            className="rounded-sm hover:text-emerald-500"
                            variant="primary"
                            size="icon"
                            disabled={favoriteLoading}
                        >
                            <HeartIcon
                                size={18}
                                className={isLiked ? "fill-emerald-500 stroke-emerald-500" : ""}
                            />
                        </Button>
                        <Button
                            onClick={handleDownload}
                            className="rounded-sm hover:text-emerald-500"
                            variant="primary"
                            size="icon"
                            disabled={downloadLoading}
                        >
                            <ArrowDownToLine size={18} />
                        </Button>
                    </div>
                </div>

                <div className="pt-2 pb-3">
                    <h3 className="text-lg font-semibold mb-2">Описание</h3>
                    <p className="text-muted-foreground">{model.description || "Описание отсутствует."}</p>
                </div>

                <AddComment model={model} />
            </div>

            <div className="w-[450px] p-5 rounded-lg shadow-lg ml-5 border border-emerald-300">
                <h3 className="text-center text-lg font-semibold mb-4">Рекомендации по категории</h3>
                <CategoryModelsCarousel
                    categoryCode={model.category?.code || ""}
                    currentModelId={model.id}
                />
            </div>
        </div>
    );
}
"use client";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import myAxios from "@/lib/axios.config";
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Image from "next/image";
import Link from "next/link";

interface CategoryModelsCarouselProps {
    categoryCode: string; // Код категории из model.category.code
    currentModelId: number; // ID текущей модели
}

export default function CategoryModelsCarousel({
                                                   categoryCode,
                                                   currentModelId,
                                               }: CategoryModelsCarouselProps) {
    const [models, setModels] = useState<ModelType[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchCategoryModels = useCallback(() => {
        if (!categoryCode) {
            setLoading(false);
            return;
        }
        setLoading(true);
        myAxios
            .get(`/models/category/${categoryCode}`, {
                params: { limit: 7, random: true }, // Добавляем random для случайного порядка
            })
            .then((res) => {
                // Фильтруем текущую модель
                const filteredModels = res.data.data.filter(
                    (model: ModelType) => model.id !== currentModelId
                );
                setModels(filteredModels.slice(0, 7)); // Убеждаемся, что не больше 7
            })
            .catch((err) => {
                console.error("Error fetching category models:", err);
                toast.error("Не удалось загрузить модели категории");
            })
            .finally(() => setLoading(false));
    }, [categoryCode, currentModelId]);

    useEffect(() => {
        fetchCategoryModels();
    }, [fetchCategoryModels]);

    if (loading) return <p className="text-center">Загрузка...</p>;
    if (!categoryCode || !models.length)
        return <p className="text-center">Модели в этой категории не найдены</p>;

    return (
        <div className="w-full h-full relative">
            <Carousel
                opts={{ align: "start", axis: "y" }}
                orientation="vertical"
                className="w-full h-[600px]"
            >
                <CarouselContent className="h-[600px]">
                    {models.map((model) => (
                        <CarouselItem key={model.id} className="basis-1/7">
                            <div className="p-2">
                                <Link href={`/models/${model.id}`}>
                                    <Card className="shadow-lg hover:scale-[1.03] transition-transform duration-300">
                                        <CardContent className="p-0">
                                            <div className="aspect-[16/9] w-full overflow-hidden rounded-xl">
                                                <Image
                                                    src={model.preview_image_url}
                                                    alt={model.title}
                                                    width={800}
                                                    height={450}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-1/2 top-2 -translate-x-1/2 z-10" />
                <CarouselNext className="absolute left-1/2 bottom-2 -translate-x-1/2 z-10" />
            </Carousel>
        </div>
    );
}
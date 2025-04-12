"use client";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import myAxios from "@/lib/axios.config";
import { MODEL_URL } from "@/lib/apiEndPoints";
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

export default function PopularModelsCarousel() {
    const [models, setModels] = useState<ModelType[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchPopularModels = useCallback(() => {
        setLoading(true);
        myAxios
            .get(`${MODEL_URL}/popular`, {
                params: { sort: "desc" }, // Сортировка по популярности в порядке убывания
            })
            .then((res) => {
                setModels(res.data);
            })
            .catch((err) => {
                toast.error("Не удалось загрузить популярные модели");
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchPopularModels();
    }, [fetchPopularModels]);

    if (loading) return <p className="text-center">Загрузка...</p>;
    if (!models.length) return <p className="text-center">Популярные модели не найдены</p>;

    return (
        <div className="w-full relative">
            <Carousel opts={{ align: "start" }} className="w-full">
                <CarouselContent>
                    {models.map((model) => (
                        <CarouselItem
                            key={model.id}
                            className="sm:basis-1/2 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
                        >
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
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10" />
            </Carousel>
        </div>
    );
}
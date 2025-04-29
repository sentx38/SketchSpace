"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchCategories } from "@/dateFetch/categoryFetch";
import myAxios from "@/lib/axios.config";
import ModelCard from "@/components/model/ModelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useModelBroadcast } from "@/hooks/useModelBroadcast";

export default function CategoryPage() {
    const { category_code } = useParams();
    const [categoryTitle, setCategoryTitle] = useState<string>("");
    const [models, setModels] = useState<ModelType[]>([]);
    const [loading, setLoading] = useState(true);

    useModelBroadcast({ setModels });

    useEffect(() => {
        const loadData = async () => {
            try {
                const [categories, modelsRes] = await Promise.all([
                    fetchCategories(),
                    myAxios.get(`/models/category/${category_code}`),
                ]);

                if (category_code === "all") {
                    setCategoryTitle("Все категории");
                } else {
                    const matched = categories.find((category: CategoriesType) => category.code === category_code);
                    setCategoryTitle(matched?.title || "Неизвестная категория");
                }

                setModels(modelsRes.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [category_code]);

    return (
        <div className="h-screen p-5">
            {loading ? (
                <div className="grid grid-cols-[repeat(auto-fill,330px)] gap-[25px] justify-between">
                    {Array.from({ length: 21 }).map((_, index) => (
                        <Skeleton key={index} className="w-[330px] h-[440px] rounded-xl" />
                    ))}
                </div>
            ) : (
                <div>
                    <h1 className="text-xl font-semibold mb-6">
                        Категория:{" "}
                        <span className="text-muted-foreground">{categoryTitle}</span>
                    </h1>

                    {models.length > 0 ? (
                        <div className="grid grid-cols-[repeat(auto-fill,330px)] gap-[25px] justify-between">
                            {models.map((model, index) => (
                                <ModelCard key={index} model={model} />
                            ))}
                        </div>
                    ) : (
                        <p>В этой категории пока нет моделей.</p>
                    )}
                </div>
            )}
        </div>
    );
}

"use client";

import React, {useEffect, useState} from "react";
import {useParams} from "next/navigation";
import myAxios from "@/lib/axios.config";
import ModelCard from "@/components/model/ModelCard";
import {Skeleton} from "@/components/ui/skeleton"
import {toast} from "sonner";
import {AxiosError} from "axios";

export default function SearchResults() {
    const params = useParams();
    const query = decodeURIComponent(params.query as string);

    const [results, setResults] = useState<ModelType[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;

            setLoading(true);
            setError(null);

            try {
                const res = await myAxios.get(`/models/search`, {
                    params: { query }
                });
                setResults(res.data.data);
            } catch (err) {
                const error = err as AxiosError;
                console.error("Ошибка запроса:", error);
                setError("Что-то пошло не так. Попробуйте позже.");
                toast.error("Ошибка при загрузке результатов.");
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);


    return (
        <div className="h-screen p-5">
            {loading ? (
                <div className="grid grid-cols-[repeat(auto-fill,330px)] gap-[25px] justify-between">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Skeleton
                            key={index}
                            className="w-[330px] h-[440px] rounded-xl"
                        />
                    ))}
                </div>) : (
                    <div>
                        <h1 className="text-xl font-semibold mb-6">
                            Результаты по запросу: <span className="text-muted-foreground">{query}</span>
                        </h1>

                        {error && <p className="text-red-500 mb-4">{error}</p>}

                        {results.length > 0 ? (
                            <div className="grid grid-cols-[repeat(auto-fill,330px)] gap-[25px] justify-between">
                                {results.map((model, index) => (
                                    <ModelCard key={index} model={model}/>
                                ))}
                            </div>
                        ) : (
                            <p>Ничего не найдено.</p>
                        )}
                    </div>
            )}
        </div>
    );
}

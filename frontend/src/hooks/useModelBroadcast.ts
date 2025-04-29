import { useEffect } from "react";
import { createLaraEcho } from "@/lib/echo.config";

type UseModelBroadcastProps = {
    setModels: (updater: (models: ModelType[]) => ModelType[]) => void;
};

interface ModelBroadCastEvent {
    model: ModelType | { id: number };
    action: "create" | "delete";
}

interface ModelFavoriteCountEvent {
    post_id: number;
}

export const useModelBroadcast = ({ setModels }: UseModelBroadcastProps) => {
    useEffect(() => {
        const laraEcho = createLaraEcho();

        laraEcho
            .channel("model-broadcast")
            .listen("ModelBroadCastEvent", (event: ModelBroadCastEvent) => {
                if (event.action === "create") {
                    // Добавляем новую модель в начало списка
                    setModels((prevModels) => [event.model as ModelType, ...prevModels]);
                } else if (event.action === "delete") {
                    // Удаляем модель из списка
                    setModels((prevModels) =>
                        prevModels.filter((model) => model.id !== event.model.id)
                    );
                }
            })
            .listen("ModelFavoriteCountEvent", (event: ModelFavoriteCountEvent) => {
                setModels((models) =>
                    models.map((item) =>
                        item.id === event.post_id
                            ? { ...item, likes_count: item.favorite_count + 1 }
                            : item
                    )
                );
            });

        return () => {
            laraEcho.leave("model-broadcast");
        };
    }, [setModels]);
};
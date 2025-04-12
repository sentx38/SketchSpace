import { useEffect } from "react";
import { createLaraEcho } from "@/lib/echo.config";

type UseModelBroadcastProps = {
    setModels: (updater: (models: ModelType[]) => ModelType[]) => void;
};

interface ModelBroadCastEvent {
    model: ModelType;
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
                const model = event.model;
                setModels((prevModels) => [model, ...prevModels]);
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

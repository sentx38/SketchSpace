"use client";
import React, {useState, useEffect} from "react";
import ModelCard from "@/components/model/ModelCard";
import {createLaraEcho} from "@/lib/echo.config";
import {useImmer} from "use-immer";
import {CustomUser} from "@/app/api/auth/[...nextauth]/authOptions";

export default function Models({data, user} :{data:APIResponseType<ModelType>, user:CustomUser}) {
    const [models, setModels] = useImmer<APIResponseType<ModelType>>(data);
    console.log(models.data)

    useEffect(() => {
        // const pvtLaraEcho = pvtLaralEcho(user.token!)
        // pvtLaraEcho.private(`App.Models.User.${user.id}`)
        //     .listen("TestEvent",(event:any) => {
        //         console.log('The private real time data is', event)
        //     })

        const laraEcho = createLaraEcho()
        laraEcho.channel("model-broadcast")
            .listen("ModelBroadCastEvent",(event:any) => {
                console.log('The public data is', event)
                const model:ModelType = event.model
                setModels((prevState) => {
                    prevState.data = [model, ...prevState.data]
                })
            })
        return () => {
            laraEcho.leave(`model-broadcast`)
        }
    }, []);

    return (
        <div className="grid grid-cols-[repeat(auto-fill,330px)] gap-[25px] justify-between">
            {models.data && models.data.length > 0 ? (
                models.data.map((item, index) => (
                    <ModelCard key={index} model={item} />
                ))
            ) : (
                <p>Моделей в этой категории нет</p>
            )}

        </div>
    )
}
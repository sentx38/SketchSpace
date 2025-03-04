"use client";
import React, {useState} from "react";
import ModelCard from "@/components/model/ModelCard";

export default function Models({data} : {data:APIResponseType<CategoriesType>}) {
    const [models, setModels] = useState<APIResponseType<CategoriesType>>(data);

    return (
        <div>
            {models.data && models.data.length > 0 && models.data.map((item, index) => <ModelCard category={item} key={index} />)}
        </div>
    )
}
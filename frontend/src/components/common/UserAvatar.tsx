
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import React from "react";
import {getImagesUrl} from "@/lib/utils";


export default function UserAvatar({image}:{image?:string}){
    return (
        <Avatar>
            {image ? <AvatarImage src={getImagesUrl(image)} alt="avatar"/> : <AvatarImage src="/avatar.png" alt="avatar" />}
            <AvatarFallback>RU</AvatarFallback>
        </Avatar>
    )
}
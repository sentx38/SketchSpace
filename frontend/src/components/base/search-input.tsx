import {Input} from "@/components/ui/input";
import React from "react";
import {Search} from "lucide-react";


export default function SearchInput(){
    return (
        <div className="relative w-[50vw]">
            <Search className="absolute left-2.5 top-2 h-6 w-6 stroke-neutral-400" />
            <Input
                className="w-full h-10 py-2 pl-10 outline-none bg-muted/30"
                type="text"
                placeholder="введите запрос"
            />
        </div>
    )
}
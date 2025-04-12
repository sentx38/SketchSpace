// components/SearchInput.tsx
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchInput() {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const router = useRouter();

    const handleSearch = () => {
        if (query) {
            setIsSearching(true);
            router.push(`/search/${encodeURIComponent(query)}`);

        }
    };

    return (
        <div className="relative w-[50vw]">
            <Search className="absolute left-2.5 top-2 h-6 w-6 stroke-neutral-400" />
            <Input
                className="w-full h-10 py-2 pl-10 outline-none bg-muted/30"
                type="text"
                placeholder="введите запрос"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                disabled={isSearching}
            />
        </div>
    );
}

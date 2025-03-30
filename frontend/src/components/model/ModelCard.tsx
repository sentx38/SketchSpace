import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import UserAvatar from "@/components/common/UserAvatar";
import Image from "next/image";
import {formatDate, getImagesUrl} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ArrowUpIcon, HeartIcon, LinkIcon} from "lucide-react";
import Link from "next/link";
import {useState} from "react";
import {useToast} from "@/hooks/use-toast";

export default function ModelCard({model}:{model:ModelType}) {
    const {toast} = useToast()
    const copyUrl = () => {
        const url = `${window.location.origin}/models/${model.title}`;
        navigator.clipboard.writeText(url)
        toast({
            variant: "success",
            description:"Ссылка скопирована!"})
    }

    const [isLiked, setIsLiked] = useState(false);
    const toggleLike = () => {
        setIsLiked((prev) => !prev); // Переключаем true/false
    };

    return (
        <div>
            <Card className="w-[330px] h-[440px] border-[1px] border-emerald-500 flex flex-col justify-between">
                <CardHeader>
                    <CardTitle>{model.title}</CardTitle>
                    <CardDescription><Link className="underline-offset-4 hover:underline" href={`/categories/${model.category?.code}`}>{model.category?.title}</Link></CardDescription>
                    <Image src={getImagesUrl(model.preview_image_url)} width={250} height={250} alt={`${model.title} preview`}
                           className="w-full h-40 object-cover rounded-lg"
                    />
                    <div className="pt-3 flex justify-between items-center">
                        <UserAvatar image={model.author.profile_image} />
                        <p className="text-neutral-600">{formatDate(model.created_at)}</p>
                    </div>
                </CardHeader>

                <CardContent>
                    <CardDescription className="line-clamp-2">{model.description}</CardDescription>
                </CardContent>
                <CardFooter className="flex flex-column justify-between items-center">

                    <Button onClick={toggleLike} className="rounded-full hover:text-emerald-500" variant="ghost" size="icon">
                        <HeartIcon
                            className={`size-18 transition-all duration-200 ${
                                isLiked
                                    ? "fill-emerald-500 stroke-emerald-500"
                                    : ""
                            }`}
                        />
                    </Button>
                    <Button className="rounded-full hover:text-emerald-500" variant="ghost" size="icon"><ArrowUpIcon className="" size={18} /></Button>
                    <Button onClick={() => copyUrl()} className="rounded-full hover:text-emerald-500" variant="ghost" size="icon"><LinkIcon size={18} /></Button>

                </CardFooter>
            </Card>
        </div>
    )
}
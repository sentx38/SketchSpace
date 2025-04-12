import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {useSession} from "next-auth/react";
import {CustomUser} from "@/app/api/auth/[...nextauth]/authOptions";
import {useFavorite} from "@/hooks/useFavorite";
import {useState} from "react";
import Link from "next/link";
import UserAvatar from "@/components/common/UserAvatar";
import {copyUrl, formatDate} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {ArrowUpIcon, HeartIcon, LinkIcon} from "lucide-react";
import Image from "next/image";

export default function ModelCard({model}: { model: ModelType }) {
    const {data} = useSession();
    const user: CustomUser = data?.user as CustomUser;

    const {isLiked, toggleLike} = useFavorite(model.id, user);
    const [likesCount, setLikesCount] = useState(model.favorite_count);

    const handleToggleLike = async () => {
        const result = await toggleLike();

        if (result === "liked") {
            setLikesCount((prev) => prev + 1);
        } else if (result === "unliked") {
            setLikesCount((prev) => Math.max(0, prev - 1));
        }
    };

    return (
        <div>
            <Card className="w-[330px] h-[440px] border-[1px] border-emerald-500 flex flex-col justify-between">
                <CardHeader>
                    <CardTitle>{model.title}</CardTitle>
                    <CardDescription>
                        <Link
                            className="underline-offset-4 hover:underline"
                            href={`/categories/${model.category?.code}`}
                        >
                            {model.category?.title}
                        </Link>
                    </CardDescription>
                    <Image
                        src={model.preview_image_url}
                        width={250}
                        height={250}
                        alt={`${model.title} preview`}
                        className="w-full h-40 object-cover rounded-lg"
                    />
                    <div className="pt-3 flex justify-between items-center">
                        <UserAvatar image={model.author.profile_image}/>
                        <p className="text-neutral-600">{formatDate(model.created_at)}</p>
                    </div>
                </CardHeader>

                <CardContent>
                    <CardDescription className="line-clamp-2">{model.description}</CardDescription>
                </CardContent>

                <CardFooter className="flex flex-column justify-between items-center">
                    <Button
                        onClick={handleToggleLike}
                        className="rounded-full hover:text-emerald-500"
                        variant="ghost"
                        size="icon"
                    >
                        <HeartIcon
                            className={`size-18 transition-all duration-200 ${
                                isLiked ? "fill-emerald-500 stroke-emerald-500" : ""
                            }`}
                        />
                    </Button>

                    <Link href={`/models/${model.id}`}>
                        <Button className="rounded-full hover:text-emerald-500" variant="ghost" size="icon">
                            <ArrowUpIcon size={18}/>
                        </Button>
                    </Link>

                    <Button
                        onClick={() => copyUrl({model})}
                        className="rounded-full hover:text-emerald-500"
                        variant="ghost"
                        size="icon"
                    >
                        <LinkIcon size={18}/>
                    </Button>

                    <p className="hidden">{likesCount}</p>
                </CardFooter>
            </Card>
        </div>
    );
}

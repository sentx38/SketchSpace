import {Button} from "@/components/ui/button";
import React from "react";
import Spline from '@splinetool/react-spline/next';
import Link from "next/link";

export default async function Home() {

    return (
        <div className="flex items-center justify-between w-full h-screen">
            <div className="ml-52 flex w-[900px] gap-10 items-start justify-center flex-col h-screen">
                <h1 className="font-bold text-2xl text-emerald-400 md:text-5xl mt-2">Создавайте, исследуйте,
                    вдохновляйте!</h1>
                <Link href="/">
                    <Button className="rounded-full border-2 border-emerald-400 w-[200px]" size="lg" variant="outline">За
                        покупками</Button>
                </Link>

                <p className="text-xl">Добро пожаловать в наш интернет-магазин — уникальную платформу для размещения,
                    просмотра и совместного использования 3D-моделей в реальном времени</p>
            </div>
            <div className="relative md:w-[1000px] md:h-screen object-contain">
                <Spline
                    scene="https://prod.spline.design/ERo3eQgh0sgxiPrN/scene.splinecode"
                />
                <div className="absolute transform right-3 bottom-[15px] h-[50px] w-[160px] bg-[#ffffff] dark:bg-[#09090b]"></div>
            </div>

        </div>

    );
}
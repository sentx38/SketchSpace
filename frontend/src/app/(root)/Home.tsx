import React from "react";
import Spline from '@splinetool/react-spline/next';
import Link from "next/link";

export default async function Home() {

    return (
        <div className="flex items-center justify-between w-full h-screen">
            <div className="ml-52 flex w-[900px] gap-10 items-start justify-center flex-col h-screen">
                <h1 className="font-bold text-2xl text-emerald-400 md:text-5xl mt-2">Создавайте, исследуйте,
                    вдохновляйте!</h1>
                    <Link href="/categories/all" className="border-2 pl-10 pr-10 p-3 shadow-[0px_0px_120px_0px_rgba(0,0,0,0.3)] border-emerald-500 rounded-bl-2xl rounded-tr-2xl text-primary underline-offset-4 transition-shadow duration-700 hover:shadow-emerald-400">За
                        покупками</Link>

                <p className="text-xl">Добро пожаловать на наш сайт — уникальную платформу для размещения,
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
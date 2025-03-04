import React from "react";
import Image from "next/image";
import {
	Tabs,
	TabsList,
	TabsTrigger,
} from "@/components/ui/tabs"
import RegisterCard from "@/components/auth/register-card";
import LoginCard from "@/components/auth/login-card";

export default function loginPage() {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
			<div className="hidden lg:flex justify-center items-center h-screen">
				<Image
					src="/auth_img.svg"
					width={500}
					height={500}
					alt="auth Image"
					className="w-full object-contain"
					/>
			</div>
			<div className="flex flex-col justify-center items-center h-screen w-ful md:w-[500px] px-4 mx-auto lg:justify-self-center">
				<div className="flex flex-col justify-start items-start mb-6 w-full">
					<Image src="/logo.svg" alt="logo_img" width={200} height={200} className="dark:invert" priority/>
					<h1 className="font-bold text-2xl text-emerald-300 md:text-3xl mt-2">Создавайте, исследуйте, вдохновляйте!</h1>
				</div>
				<Tabs defaultValue="login" className="w-full p-2 lg:w-[500px]">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="login">Вход</TabsTrigger>
						<TabsTrigger value="register">Регистрация</TabsTrigger>
					</TabsList>
					<LoginCard />
					<RegisterCard />
				</Tabs>
			</div>
		</div>
	);
}

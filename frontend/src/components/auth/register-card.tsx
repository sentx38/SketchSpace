"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TabsContent } from "@/components/ui/tabs"
import myAxios from "@/lib/axios.config";
import {REGISTER_URL} from "@/lib/apiEndPoints";
import {signIn} from "next-auth/react";
import {toast} from "sonner";

export default function RegisterCard() {
	const [authState, setAuthState] = useState({
		name: "",
		username: "",
		email: "",
		password: "",
		password_confirmation: ""
	});

	const [ loading, setLoading ] = useState(false);
	const [ errors, setErrors ] = useState({
		name:[],
		email:[],
		password:[],
		username:[],
	});

	const handleSubmit = (event:React.FormEvent) => {
		event.preventDefault();
		setLoading(true)
		myAxios.post(REGISTER_URL, authState)
			.then(() => {
				setLoading(false)
				toast.success("Учетная запись успешно создана")
				signIn("credentials", {
					email: authState.email,
					password: authState.password,
					redirect: true,
					callbackUrl: "/",
				});
			})
			.catch((err) => {
				setLoading(false)
				if (err.response?.status == 422) {
					setErrors(err.response?.data.errors)
					console.log(err.response?.data.errors)
				} else {
					toast.error("Что-то пошло не так. Пожалуйста попробуйте заново позже!")
				}
			})
	}

	return (
		<div>
			<TabsContent value="register">
				<Card>
					<CardHeader>
						<CardTitle>Регистрация</CardTitle>
						<CardDescription>
							Добро пожаловать в SketchSpace
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<form onSubmit={handleSubmit}>
							<div className="space-y-2">
								<Label htmlFor="name">Имя</Label>
								<Input
									id="name"
									type="text"
									placeholder="Иван"
									value={authState.name}
									onChange={(e) => setAuthState({...authState, name: e.target.value})}
								/>
								<span className="text-red-400">{(errors?.name?.[0])? 'Введите корректное имя' : ''}</span>
							</div>
							<div className="mt-3 space-y-2">
								<Label htmlFor="username">Имя пользователя</Label>
								<Input
									id="username"
									type="text"
									placeholder="user2025"
									value={authState.username}
									onChange={(e) => setAuthState({...authState, username: e.target.value})}
								/>
							</div>
							<span className="text-red-400">{errors?.username?.[0]}</span>

							<div className="mt-3 space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="example@gmail.com"
									value={authState.email}
									onChange={(e) => setAuthState({...authState, email: e.target.value})}
								/>
							</div>
							<span className="text-red-400">{errors?.email?.[0]}</span>
							<div className="mt-3 space-y-2">
								<Label htmlFor="password">Пароль</Label>
								<Input
									id="password"
									type="password"
									placeholder="Введите пароль"
									value={authState.password}
									onChange={(e) => setAuthState({...authState, password: e.target.value})}
								/>
							</div>
							<div className="mt-3 space-y-2">
								<Label htmlFor="сpassword">Подтверждение пароля</Label>
								<Input
									id="сpassword"
									type="password"
									placeholder="Подтвердите пароль"
									value={authState.password_confirmation}
									onChange={(e) => setAuthState({
										...authState,
										password_confirmation: e.target.value
									})}
								/>
							</div>
							<span className="text-red-400">{errors?.password?.[0]}</span>

							<div className="mt-6">
								<Button
									className="w-full"
									variant="destructive"
									disabled={loading}>
									{loading ? "Обработка..." : "Зарегистрироваться"}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</TabsContent>
		</div>
	);
}
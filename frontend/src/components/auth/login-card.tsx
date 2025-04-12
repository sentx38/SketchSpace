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
import { CHECK_CREDENTIALS } from "@/lib/apiEndPoints";
import { signIn } from "next-auth/react"
import { toast } from "sonner";

export default function LoginCard() {
	const [authState, setAuthState] = useState({
		email: "",
		password: ""
	});

	const [loading, setLoading] = useState(false);
	const [errors, setErrors] = useState({
		email: [],
		password: [],
	});


	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		setLoading(true);

		try {
			const checkRes = await myAxios.post(CHECK_CREDENTIALS, authState);
			setLoading(false);

			if (checkRes.data.status === 200) {
				const signInResponse = await signIn("credentials", {
					email: authState.email,
					password: authState.password,
					redirect: true,
					callbackUrl: '/'
				});

				if (signInResponse?.error) {
					toast.error("Ошибка при входе");
					return;
				}

				toast.success("Вы вошли в свою учетную запись");
			}
		} catch (err: any) {
			setLoading(false);
			if (err.response?.status === 422) {
				setErrors(err.response?.data?.errors);
			} else if (err.response?.status === 401) {
				toast.error("Неверное имя пользователя или пароль");
			} else {
				toast.error("Что-то пошло не так");
			}
		}
	};

	return (
		<div>
			<TabsContent value="login">
				<Card>
					<CardHeader>
						<CardTitle>Вход</CardTitle>
						<CardDescription>
							С возвращением в SketchSpace
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<form onSubmit={handleSubmit}>
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input
									id="email"
									type="email"
									placeholder="example@gmail.com"
									value={authState.email}
									onChange={(e) => setAuthState({...authState, email: e.target.value})}
								/>
								<span className="text-red-400">{errors?.email?.[0]}</span>
							</div>
							<div className="mt-3 space-y-2">
								<Label htmlFor="password">Пароль</Label>
								<Input
									id="password"
									type="password"
									placeholder="Введите пароль"
									onChange={(e) => setAuthState({...authState, password: e.target.value})}
								/>
								<span className="text-red-400">{errors?.password?.[0]}</span>
							</div>
							<div className="mt-6">
								<Button
									className="w-full"
									variant="destructive"
									disabled={loading}
									type="submit"
								>
									{loading ? "Обработка..." : "Войти"}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			</TabsContent>
		</div>
	);
}
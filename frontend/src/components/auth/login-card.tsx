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
import {useToast} from "@/hooks/use-toast";
import myAxios from "@/lib/axios.config";
import {CHECK_CREDENTIALS} from "@/lib/apiEndPoints";
import { signIn } from "next-auth/react"

export default function LoginCard() {
	const [authState, setAuthState] = useState({
		email: "",
		password: ""
	});

	const [ loading, setLoading ] = useState(false);
	const [ errors, setErrors ] = useState({
		email:[],
		password:[],
	});

	const { toast } = useToast();
	const handleSubmit = (event:React.FormEvent) => {
		event.preventDefault();
		setLoading(true)
		myAxios.post(CHECK_CREDENTIALS, authState)
			.then((res) => {
				setLoading(false)
				const response = res.data;
				if(response.status == 200){
					signIn("credentials", {
						email: authState.email,
						password: authState.password,
						redirect: true,
						callbackUrl: "/",
					});
					toast({
						variant: "success",
						description:"Вы вошли в свою учетную запись"})
				}
			})
			.catch((err) => {
				setLoading(false)
				if (err.response?.status == 422) {
					setErrors(err.response?.data?.errors)
				} else if(err.response?.status == 401){
					toast({
						variant: "destructive",
						description:"Неверное имя пользователя или пароль. Проверьте правильность введенных данных"})
				}
				else {
					toast({
						variant: "destructive",
						description:"Что-то пошло не так. Пожалуйста попробуйте заново позже!"})
				}
			})
	}


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
							</div>
							<span className="text-red-400">{errors?.email?.[0]}</span>
							<div className="mt-3 space-y-2">
								<Label htmlFor="password">Пароль</Label>
								<Input
									id="password"
									type="password"
									placeholder="Введите пароль"
									onChange={(e) => setAuthState({...authState, password: e.target.value})}
								/>
							</div>
							<span className="text-red-400">{errors?.password?.[0]}</span>
							<div className="mt-6">
								<Button
									className="w-full"
									variant="destructive"
									disabled={loading}>
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
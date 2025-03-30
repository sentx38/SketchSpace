import React from "react";
import Home from "@/app/(root)/Home";
import { getServerSession } from "next-auth";
import { authOptions, CustomSession } from "@/app/api/auth/[...nextauth]/authOptions";
import { fetchModels } from "@/dateFetch/modelFetch";
import Models from "@/components/model/Models";

export default async function App() {
	const session: CustomSession | null = await getServerSession(authOptions);

	// Проверяем, есть ли токен перед вызовом fetchModels
	const token = session?.user?.token;

	// Если токен отсутствует, можно обработать это, например, вернуть пустой массив или показать сообщение
	const models: APIResponseType<ModelType> = token ? await fetchModels(token) : { data: [] }; // Предполагаем, что fetchModels возвращает объект с полем data

	return (
		<div className="p-5 ">
			<Home />
			<Models data={models} user={session?.user!} />
		</div>
	);
}
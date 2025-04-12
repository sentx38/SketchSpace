import React from "react";
import Home from "@/app/(root)/Home";
import PopularModelsCarousel from "@/components/model/PopularModelsCarousel";

export default async function App() {
	return (
		<div className="p-5">
			<Home />
			<PopularModelsCarousel />
		</div>
	);
}

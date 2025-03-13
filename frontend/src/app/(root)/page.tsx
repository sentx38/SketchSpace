import React from "react";
import Home from "@/app/(root)/Home";
import {getServerSession} from "next-auth";
import {authOptions} from "@/app/api/auth/[...nextauth]/authOptions";

export default async function App() {
	const session = await getServerSession(authOptions)
  return (
		<div className="p-5 ">
			<Home />
			<p>{JSON.stringify(session)}</p>
		</div>
  );
}

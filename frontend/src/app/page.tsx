import { Button } from "@/components/ui/button";
import React from "react";
import {getServerSession} from "next-auth";
import {authOptions, CustomSession} from "@/app/api/auth/[...nextauth]/authOptions";

export default async function App() {
	const session:CustomSession | null = await getServerSession(authOptions)


  return (
		<div className="p-5">
			App Page
			<Button>Click Me</Button>
			<p>{JSON.stringify(session)}</p>

		</div>
  );
}

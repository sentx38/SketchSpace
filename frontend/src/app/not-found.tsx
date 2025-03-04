import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function notFound() {
  return (
		<div className="flex justify-center items-center h-screen flex-col">
			<Image src="/404.svg" alt="404" width={700} height={700}
			className="object-contain" />

			<Link href="/">
			<Button variant="link">Вернуться на домашнюю страницу</Button>
			</Link>
		</div>
  );
}

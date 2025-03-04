import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Env from "@/lib/env";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImagesUrl = (image: string):string => {
  return `${Env.API_URL}/storage/${image}`
}
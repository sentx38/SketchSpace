import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Env from "@/lib/env";
import { format } from "date-fns"; // Основная функция форматирования
import { ru } from "date-fns/locale"; // Локализация для русского языка

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getImagesUrl = (image: string):string => {
  return `${Env.API_URL}/storage/${image}`
}

export const formatDate = (date: string): string => {
  return format(new Date(date), "dd MMMM yyyy", { locale: ru });
};
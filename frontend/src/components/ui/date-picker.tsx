"use client";

import * as React from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale"; // Импортируем русскую локаль
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    date: Date | null; // Оставляем null для совместимости с AddModel
    setDate: (date: Date | null) => void; // Оставляем null для совместимости
}

export function DatePicker({ date, setDate }: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-[220px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon />
                    {date ? format(date, "PPP", { locale: ru }) : <span>Выбрать дату</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={date || undefined} // Преобразуем null в undefined для react-day-picker
                    onSelect={(newDate) => setDate(newDate || null)} // Преобразуем undefined в null для AddModel
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}
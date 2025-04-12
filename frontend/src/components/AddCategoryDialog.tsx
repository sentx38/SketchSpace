import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import myAxios from "@/lib/axios.config";
import { useSession } from "next-auth/react";
import { CustomUser } from "@/app/api/auth/[...nextauth]/authOptions";
import { toast } from "sonner";

type AddCategoryDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
};

export function AddCategoryDialog({ open, onOpenChange }: AddCategoryDialogProps) {
    const { data: session } = useSession();
    const user: CustomUser | undefined = session?.user as CustomUser;
    const [title, setTitle] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ title: [], code: [] });

    // Сбрасываем форму при открытии/закрытии диалога
    useEffect(() => {
        if (!open) {
            setTitle("");
            setCode("");
            setErrors({ title: [], code: [] });
            setLoading(false);
        }
    }, [open]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (loading) return;

        setLoading(true);
        setErrors({ title: [], code: [] });

        try {
            console.log("Отправка запроса POST /categories:", { title, code });
            const response = await myAxios.post(
                '/categories',
                { title, code },
                {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                }
            );
            console.log("Ответ от сервера:", response.data);
            toast.success("Категория успешно создана!");
            onOpenChange(false);
        } catch (err: any) {
            console.error("Ошибка создания категории:", err);
            if (err.response?.status === 422) {
                setErrors(err.response?.data.errors || { title: [], code: [] });
            } else {
                toast.error("Что-то пошло не так. Пожалуйста, попробуйте снова!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={loading}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">Добавить категорию</span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Добавить категорию</DialogTitle>
                    <DialogDescription>Введите название и код для новой категории.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="title">Название</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Введите название"
                                disabled={loading}
                            />
                            {errors.title?.length > 0 && (
                                <span className="text-red-400 text-sm">{errors.title[0]}</span>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="code">Код</Label>
                            <Input
                                id="code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Введите уникальный код"
                                disabled={loading}
                            />
                            {errors.code?.length > 0 && (
                                <span className="text-red-400 text-sm">{errors.code[0]}</span>
                            )}
                        </div>
                    </div>
                    <DialogFooter className="mt-4">
                        <Button type="submit" disabled={loading}>
                            {loading ? "Создание..." : "Создать"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
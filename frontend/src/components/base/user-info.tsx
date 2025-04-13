// user-info.tsx
"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import myAxios from "@/lib/axios.config";
import { UPDATE_PROFILE_URL } from "@/lib/apiEndPoints";
import UserAvatar from "@/components/common/UserAvatar";
import {CustomUser} from "@/app/api/auth/[...nextauth]/authOptions";



export default function UserInfo() {
    const { data, update } = useSession();
    const user = data?.user as CustomUser | undefined;

    // Отдельные состояния для name и email
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState<string>(user?.name ?? "");
    const [email, setEmail] = useState<string>(user?.email ?? "");
    const [image, setImage] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        name: string[];
        email: string[];
        profile_image: string[];
    }>({
        name: [],
        email: [],
        profile_image: [],
    });

    // Проверка, если пользователь ещё не загружен
    if (!user) {
        return <div>Загрузка...</div>;
    }

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImage(file);
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setErrors({ name: [], email: [], profile_image: [] });

        try {
            const formData = new FormData();
            let hasChanges = false;

            if (name && name !== user.name) {
                formData.append("name", name);
                hasChanges = true;
            }
            if (email && email !== user.email) {
                formData.append("email", email);
                hasChanges = true;
            }
            if (image) {
                formData.append("profile_image", image);
                hasChanges = true;
            }

            if (!hasChanges) {
                toast.info("Нет изменений для сохранения");
                setLoading(false);
                setIsEditing(false);
                return;
            }

            const response = await myAxios.post(UPDATE_PROFILE_URL, formData, {
                headers: {
                    Authorization: `Bearer ${user.token ?? ""}`,
                },
            });

            const responseData = response.data;

            await update({
                user: {
                    name: name && name !== user.name ? name : user.name ?? "",
                    email: email && email !== user.email ? email : user.email ?? "",
                    profile_image: responseData.image || user.profile_image,
                },
            });

            toast.success("Профиль успешно обновлен!");
            setIsEditing(false);
            setImage(null);
        } catch (err: any) {
            if (err.response?.status === 422) {
                setErrors(err.response?.data.errors || { name: [], email: [], profile_image: [] });
            } else {
                toast.error("Что-то пошло не так. Попробуйте позже!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4">
            <div className="space-y-4">
                {isEditing ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="name">Имя</Label>
                            <Input
                                id="name"
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Введите имя"
                            />
                            {errors.name.length > 0 && (
                                <span className="text-red-400">{errors.name[0]}</span>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Введите email"
                            />
                            {errors.email.length > 0 && (
                                <span className="text-red-400">{errors.email[0]}</span>
                            )}
                        </div>
                        <div>
                            <Label htmlFor="profile_image">Изображение профиля</Label>
                            <Input
                                id="profile_image"
                                type="file"
                                accept="image/png,image/svg,image/jpg,image/jpeg,image/gif,image/webp"
                                onChange={handleImageChange}
                            />
                            {errors.profile_image.length > 0 && (
                                <span className="text-red-400">{errors.profile_image[0]}</span>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            <Button type="submit" disabled={loading}>
                                {loading ? "Сохранение..." : "Сохранить"}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsEditing(false);
                                    setName(user.name ?? "");
                                    setEmail(user.email ?? "");
                                    setImage(null);
                                    setErrors({ name: [], email: [], profile_image: [] });
                                }}
                            >
                                Отмена
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <UserAvatar image={user.profile_image ?? undefined} />
                            <div>
                                <p className="font-medium">Имя: {user.name}</p>
                                <p className="text-muted-foreground">Email: {user.email}</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button onClick={() => setIsEditing(true)}>Редактировать</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
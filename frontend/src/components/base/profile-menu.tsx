import React, {useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuPortal,
    DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import {useTheme} from "next-themes";
import UserAvatar from "@/components/common/UserAvatar";
import {Button} from "@/components/ui/button";
import myAxios from "@/lib/axios.config";
import {LOGOUT_URL, UPDATE_PROFILE_URL} from "@/lib/apiEndPoints";
import {CustomUser} from "@/app/api/auth/[...nextauth]/authOptions";
import {signOut, useSession} from "next-auth/react"
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {toast} from "sonner";


export default function ProfileMenu(){
    const { setTheme } = useTheme();
    const [logoutOpen, setLogoutOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [image, setImage] = useState<File|null>(null);
    const [errors, setErrors] = useState({
        profile_image:[]
    })
    const { data, update } = useSession();
    const user = data?.user as CustomUser;

    const handleImageChange = (event:React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        console.log("Выбранный файл: ", file);
        if (file) {
            setImage(file);
        }
    }
    const logoutUser = async () => {
        myAxios.post(LOGOUT_URL,{}, {headers:{
            Authorization: `Bearer ${user.token}`,
            }}).then(() => {
                signOut({
                    callbackUrl: "/auth",
                    redirect: true,
                })
        })
            .catch(() => {
                toast.error("Что-то пошло не так. Пожалуйста попробуйте заново позже!")
            })
    }

    const updateProfile = (event:React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData();
        formData.append("profile_image", image ?? "");
        myAxios.post(UPDATE_PROFILE_URL, formData, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        }).then((res) => {
            const response = res.data
            update({profile_image: response.image});
            toast.success("Профиль успешно обновлен!")
            setLoading(false);
            setProfileOpen(false)
        })
        .catch((err)=>{
            setLoading(false)
            if (err.response?.status == 422) {
                setErrors(err.response?.data.errors)
                console.log(err.response?.data.errors)
            } else {
                toast.error("Что-то пошло не так. Пожалуйста попробуйте заново позже!")
            }
        })
    }
    return (
        <>
            {/* Logout Dialog */}
            <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Вы абсолютно уверены?</DialogTitle>
                        <DialogDescription>
                            Это действие завершает срок действия вашей текущей сессии, и для доступа к домашней странице вам необходимо снова войти в систему!
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={logoutUser}>Выйти</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Update profile dialog */}
            <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Изменение профиля</DialogTitle>
                        <DialogDescription>
                            Обновите свой профиль в мгновение ока!
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={updateProfile}>
                        <div >
                            <Label htmlFor="profile">Изображение профиля</Label>
                            <Input
                                type="file"
                                className="file:text-white"
                                accept="image/png,image/svg,image/jpg,image/jpeg,image/gif,image/webp"
                                onChange={handleImageChange}
                            />
                            <span className="text-red-400">{errors.profile_image?.[0]}</span>
                        </div>

                    </form>
                    <DialogFooter>
                        <Button variant="outline" onClick={updateProfile} disabled={loading}>{loading ? "Обработка.." : "Сохранить"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <DropdownMenu>
                <DropdownMenuTrigger>
                    <UserAvatar image={user?.profile_image ?? undefined} />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Мой аккаунт</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setProfileOpen(true)}>
                            Профиль
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Мои модели
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>Тема</DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => setTheme("light")}>Светлая</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("dark")}>Темная</DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => setTheme("system")}>Системная</DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setLogoutOpen(true)}>
                        Выйти
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    )
}
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/common/UserAvatar";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { CustomUser } from "@/app/api/auth/[...nextauth]/authOptions";
import myAxios from "@/lib/axios.config";
import { COMMENT_URL } from "@/lib/apiEndPoints";
import CommentCard from "@/components/comment/CommentCard";
import { toast } from "sonner";
import Link from "next/link"; // Для кнопки входа

export default function AddComment({ model }: { model: ModelType }) {
    const [showBox, setShowBox] = useState(true);
    const { data } = useSession();
    const user: CustomUser = data?.user as CustomUser;
    const [comment, setComment] = useState("");
    const [comments, setComments] = useState<APIResponseType<CommentType>>();
    const [errors, setErrors] = useState({
        "model_id": [],
        "comment": []
    });
    const [loading, setLoading] = useState(false);

    const fetchComments = useCallback(() => {
        myAxios.get(`${COMMENT_URL}?model_id=${model.id}`).then((res) => {
            setComments(res.data);
        }).catch(() => {
            toast.error("Что-то пошло не так. Пожалуйста попробуйте заново позже!");
        });
    }, [model.id]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const addComment = (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        myAxios.post(COMMENT_URL, {
            comment,
            model_id: model.id
        }, {
            headers: {
                Authorization: `Bearer ${user.token}`
            }
        }).then((res) => {
            const response = res.data;
            setLoading(false);
            setComments((prevState) => {
                if (prevState) {
                    if (prevState?.data.length === 0) {
                        return {
                            ...prevState,
                            data: [response.comment],
                        };
                    } else {
                        return {
                            ...prevState,
                            data: [response.comment, ...prevState.data],
                        };
                    }
                }
            });
            setComment("");
            setShowBox(true);
            toast.success("Комментарий успешно добавлен!");
        })
            .catch((err) => {
                setLoading(false);
                if (err.response?.status == 422) {
                    setErrors(err.response?.data?.errors);
                } else {
                    toast.error("Что-то пошло не так. Пожалуйста попробуйте заново позже!");
                }
            });
    };
    const handleShowBoxClick = () => {
        if (user) {
            setShowBox(false); // Скрыть поле для ввода, если пользователь авторизован
        } else {
            toast.info("Для добавления комментария нужно войти.");
        }
    };

    return (
        <div className="justify-between items-center">
            {showBox ? (
                <div className="border flex justify-between items-center rounded-md p-2" onClick={handleShowBoxClick}>
                    <div className="flex space-x-4 items-center">
                        <UserAvatar image={model.author.profile_image} />
                        <p className="text-muted-foreground text-sm">Поделитесь своими мыслями</p>
                    </div>
                    {user ? (
                        <Button variant="outline">Post</Button>
                    ) : (
                        <Link href="/auth">
                            <Button variant="outline">Войти</Button>
                        </Link>
                    )}
                </div>
            ) : (
                <div>
                    <form onSubmit={addComment}>
                        <div className="mb-4">
                            <Textarea
                                placeholder="Введите комментарий"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                disabled={!user} // Если пользователь не авторизован, поле будет заблокировано
                            />
                            <span className="text-red-500">{errors.comment?.[0]}</span>
                        </div>
                        <div className="mb-2 flex justify-end">
                            <Button
                                disabled={loading || !user} // Если нет пользователя или идет загрузка, кнопка будет заблокирована
                                variant="outline"
                            >
                                {loading ? "Обработка..." : "Отправить"}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
            <div className="mt-4 flex flex-col gap-4">
                {comments?.data &&
                    comments.data.length > 0 &&
                    comments.data.map((item, index) => (
                        <CommentCard comment={item} key={index} />
                    ))}
            </div>
        </div>
    );
}

import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useSession } from "next-auth/react";
import { CustomUser } from "@/app/api/auth/[...nextauth]/authOptions";
import { fetchCategories } from "@/dateFetch/categoryFetch";
import myAxios from "@/lib/axios.config";
import { MODEL_URL } from "@/lib/apiEndPoints";
import { useToast } from "@/hooks/use-toast";

export default function AddModel() {
    const { toast } = useToast();
    const { data } = useSession();
    const user = data?.user as CustomUser;
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<CategoriesType[]>([]);
    const [modelState, setModelState] = useState<IModelFormState>({
        title: "",
        description: "",
        file: null,
        preview_image_url: null,
        price: 0,
        category_id: 0,
        end_date: null,
        texture_url: null,
        model_fbx: null,
    });
    const [errors, setErrors] = useState<IValidationErrors>({});

    useEffect(() => {
        const getCategories = async () => {
            if (user?.token) {
                const fetchedCategories = await fetchCategories(user.token);
                setCategories(fetchedCategories);
            }
        };
        getCategories();
    }, [user]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();

        // Проверка обязательных полей перед отправкой
        const newErrors: IValidationErrors = {};
        if (!modelState.title) newErrors.title = ["Название обязательно"];
        if (!modelState.description) newErrors.description = ["Описание обязательно"];
        if (modelState.price <= 0) newErrors.price = ["Цена должна быть больше 0"];
        if (!modelState.category_id) newErrors.category_id = ["Категория обязательна"];
        if (!modelState.end_date) newErrors.end_date = ["Дата окончания обязательна"];
        if (!modelState.file) newErrors.file = ["Архив модели обязателен"];
        if (!modelState.preview_image_url) newErrors.preview_image_url = ["Превью изображения обязательно"];
        if (!modelState.texture_url) newErrors.texture_url = ["Текстура модели обязательна"];
        if (!modelState.model_fbx) newErrors.model_fbx = ["FBX-модель обязательна"];

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast({
                variant: "destructive",
                description: "Пожалуйста, заполните все обязательные поля!",
            });
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append("title", modelState.title);
        formData.append("description", modelState.description);
        formData.append("price", modelState.price.toString());
        formData.append("category_id", modelState.category_id.toString());
        const year = modelState.end_date!.getFullYear();
        const month = String(modelState.end_date!.getMonth() + 1).padStart(2, '0');
        const day = String(modelState.end_date!.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        formData.append("end_date", formattedDate);
        formData.append("file", modelState.file!);
        formData.append("preview_image_url", modelState.preview_image_url!);
        formData.append("texture_url", modelState.texture_url!);
        formData.append("model_fbx", modelState.model_fbx!);

        // Логируем содержимое formData
        console.log("FormData entries:", Array.from(formData.entries()));
        console.log("Model FBX file:", {
            name: modelState.model_fbx!.name,
            type: modelState.model_fbx!.type,
            size: modelState.model_fbx!.size,
        });

        myAxios
            .post(MODEL_URL, formData, {
                headers: {
                    "Authorization": `Bearer ${user?.token}`,
                },
            })
            .then((res) => {
                setLoading(false);
                setModelState({
                    title: "",
                    description: "",
                    file: null,
                    preview_image_url: null,
                    price: 0,
                    category_id: 0,
                    end_date: null,
                    texture_url: null,
                    model_fbx: null,
                });
                setErrors({});
                setOpen(false);
                toast({
                    variant: "success",
                    description: "Модель успешно добавлена!",
                });
            })
            .catch((err) => {
                setLoading(false);
                if (err.response?.status === 422) {
                    console.log("Validation errors:", err.response?.data?.errors);
                    setErrors(err.response?.data?.errors || {});
                } else {
                    toast({
                        variant: "destructive",
                        description: "Что-то пошло не так. Пожалуйста, попробуйте заново позже!",
                    });
                }
            });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" onClick={() => setOpen(true)}>
                    <UploadCloud />
                    Загрузить
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Добавить модель</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="mb-2">
                        <Label htmlFor="title" className="label">Название</Label>
                        <Input
                            id="title"
                            value={modelState.title}
                            onChange={(e) => setModelState({ ...modelState, title: e.target.value })}
                            type="text"
                            placeholder="Введите название модели.."
                            className="input"
                        />
                        <span className="text-red-400">{errors.title?.[0]}</span>
                    </div>
                    <div className="mb-2">
                        <Label htmlFor="description" className="label">Описание</Label>
                        <Textarea
                            id="description"
                            value={modelState.description}
                            onChange={(e) => setModelState({ ...modelState, description: e.target.value })}
                            placeholder="Введите описание модели.."
                            rows={5}
                            className="textarea"
                        />
                        <span className="text-red-400">{errors.description?.[0]}</span>
                    </div>
                    <div className="mb-2">
                        <Label htmlFor="price" className="label">Цена</Label>
                        <Input
                            id="price"
                            value={modelState.price}
                            onChange={(e) => setModelState({ ...modelState, price: parseFloat(e.target.value) || 0 })}
                            type="number"
                            placeholder="Введите цену модели.."
                            min="0"
                            className="input"
                            // Убираем disabled, так как поле теперь обязательно
                        />
                        <span className="text-red-400">{errors.price?.[0]}</span>
                    </div>
                    <div className="mb-2">
                        <div className="flex justify-between space-x-5 items-center">
                            <Label htmlFor="category_id" className="label">Категория</Label>
                            <Select
                                onValueChange={(value) => setModelState({ ...modelState, category_id: Number(value) })}
                                value={modelState.category_id?.toString() || ""}
                            >
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue placeholder="Выберите категорию" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Категории</SelectLabel>
                                        {categories.map((category) => (
                                            <SelectItem key={category.code} value={category.id.toString()}>
                                                {category.title}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                        <span className="text-red-400">{errors.category_id?.[0]}</span>
                    </div>
                    <div className="mb-2">
                        <div className="flex justify-between space-x-5 items-center">
                            <Label htmlFor="end_date">Дата окончания</Label>
                            <DatePicker
                                date={modelState.end_date}
                                setDate={(date) => setModelState({ ...modelState, end_date: date || null })}
                            />
                        </div>
                        <span className="text-red-400">{errors.end_date?.[0]}</span>
                    </div>
                    <div className="mb-2">
                        <Label htmlFor="file" className="label">Архив модели (ZIP, RAR)</Label>
                        <Input
                            type="file"
                            accept=".zip,.rar"
                            className="input"
                            onChange={(e) => setModelState({ ...modelState, file: e.target.files?.[0] || null })}
                        />
                        <span className="text-red-400">{errors.file?.[0]}</span>
                    </div>
                    <div className="mb-2">
                        <Label htmlFor="preview_image_url">Превью изображения</Label>
                        <Input
                            type="file"
                            accept="image/png,image/jpg,image/jpeg"
                            onChange={(e) =>
                                setModelState({ ...modelState, preview_image_url: e.target.files?.[0] || null })
                            }
                        />
                        <span className="text-red-400">{errors.preview_image_url?.[0]}</span>
                    </div>
                    <div className="mb-2">
                        <Label htmlFor="texture_url" className="label">Текстура модели</Label>
                        <Input
                            type="file"
                            className="input"
                            accept="image/png,image/jpg,image/jpeg"
                            onChange={(e) => setModelState({ ...modelState, texture_url: e.target.files?.[0] || null })}
                        />
                        <span className="text-red-400">{errors.texture_url?.[0]}</span>
                    </div>
                    <div className="mb-6">
                        <Label htmlFor="model_fbx" className="label">FBX-модель</Label>
                        <Input
                            type="file"
                            accept=".fbx"
                            className="input"
                            onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                if (file && !file.name.toLowerCase().endsWith('.fbx')) {
                                    setErrors({ ...errors, model_fbx: ["Файл должен иметь расширение .fbx"] });
                                    setModelState({ ...modelState, model_fbx: null });
                                } else {
                                    setErrors({ ...errors, model_fbx: undefined });
                                    setModelState({ ...modelState, model_fbx: file });
                                }
                            }}
                        />
                        <span className="text-red-400">{errors.model_fbx?.[0]}</span>
                    </div>
                    <div>
                        <Button variant="destructive" type="submit" className="button w-full" disabled={loading}>
                            {loading ? "Обработка..." : "Отправить"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
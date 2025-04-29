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
import { useSession } from "next-auth/react";
import { CustomUser } from "@/app/api/auth/[...nextauth]/authOptions";
import { fetchCategories } from "@/dateFetch/categoryFetch";
import myAxios from "@/lib/axios.config";
import { MODEL_URL } from "@/lib/apiEndPoints";
import { toast } from "sonner";

export default function AddModel() {
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
    category_id: 0,
    envMap_url: null,
    model_glb: null,
  });
  const [errors, setErrors] = useState<IValidationErrors>({});

  useEffect(() => {
    const getCategories = async () => {
      if (user?.token) {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      }
    };
    getCategories();
  }, [user]);

  // Функция для сброса состояния формы
  const resetForm = () => {
    setModelState({
      title: "",
      description: "",
      file: null,
      preview_image_url: null,
      category_id: 0,
      envMap_url: null,
      model_glb: null,
    });
    setErrors({});
    setLoading(false);
  };

  // Обработка закрытия диалога
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm(); // Сбрасываем форму при закрытии диалога
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const newErrors: IValidationErrors = {};
    if (!modelState.title) newErrors.title = ["Название обязательно"];
    if (!modelState.description)
      newErrors.description = ["Описание обязательно"];
    if (!modelState.category_id)
      newErrors.category_id = ["Категория обязательна"];
    if (!modelState.file) newErrors.file = ["Архив модели обязателен"];
    if (!modelState.preview_image_url)
      newErrors.preview_image_url = ["Превью изображения обязательно"];
    if (!modelState.envMap_url)
      newErrors.envMap_url = ["Текстура модели обязательна"];
    if (!modelState.model_glb)
      newErrors.model_glb = ["GLB-модель обязательна"];

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Пожалуйста, заполните все обязательные поля!");
      return;
    }

    const formData = new FormData();
    formData.append("title", modelState.title);
    formData.append("description", modelState.description);
    formData.append("category_id", modelState.category_id.toString());
    formData.append("file", modelState.file!);
    formData.append("preview_image_url", modelState.preview_image_url!);
    formData.append("envMap_url", modelState.envMap_url!);
    formData.append("model_glb", modelState.model_glb!);
    setLoading(true);

    const uploadPromise = async () => {
      const response = await myAxios.post(MODEL_URL, formData, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      return response.data;
    };

    toast.promise(uploadPromise(), {
      loading: "Загрузка модели...",
      success: (data) => {
        resetForm(); // Сбрасываем форму при успехе
        setOpen(false);
        return `Модель «${data.model?.title || "без названия"}» успешно добавлена!`;
      },
      error: (err) => {
        setLoading(false); // Сбрасываем loading при ошибке
        if (err.response?.status === 422) {
          setErrors(err.response.data.errors || {});
          return "Проверьте правильность заполнения формы";
        } else {
          return "Произошла ошибка при загрузке модели";
        }
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          onClick={(e) => {
            e.preventDefault();
            if (!user) {
              toast.info("Пожалуйста, войдите в аккаунт, чтобы загрузить модель");
            } else {
              setOpen(true);
            }
          }}
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          Загрузить
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить модель</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="mb-2">
            <Label htmlFor="title" className="label">
              Название
            </Label>
            <Input
              id="title"
              value={modelState.title}
              onChange={(e) =>
                setModelState({ ...modelState, title: e.target.value })
              }
              type="text"
              placeholder="Введите название модели.."
              className="input"
            />
            <span className="text-red-400">{errors.title?.[0]}</span>
          </div>
          <div className="mb-2">
            <Label htmlFor="description" className="label">
              Описание
            </Label>
            <Textarea
              id="description"
              value={modelState.description}
              onChange={(e) =>
                setModelState({ ...modelState, description: e.target.value })
              }
              placeholder="Введите описание модели.."
              rows={5}
              className="textarea"
            />
            <span className="text-red-400">{errors.description?.[0]}</span>
          </div>
          <div className="mb-2">
            <div className="flex justify-between space-x-5 items-center">
              <Label htmlFor="category_id" className="label">
                Категория
              </Label>
              <Select
                onValueChange={(value) =>
                  setModelState({ ...modelState, category_id: Number(value) })
                }
                value={modelState.category_id?.toString() || ""}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Выберите категорию" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Категории</SelectLabel>
                    {categories.map((category) => (
                      <SelectItem
                        key={category.code}
                        value={category.id.toString()}
                      >
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
            <Label htmlFor="file" className="label">
              Архив модели (ZIP, RAR)
            </Label>
            <Input
              type="file"
              accept=".zip,.rar"
              className="input"
              onChange={(e) =>
                setModelState({ ...modelState, file: e.target.files?.[0] || null })
              }
            />
            <span className="text-red-400">{errors.file?.[0]}</span>
          </div>
          <div className="mb-2">
            <Label htmlFor="preview_image_url">Превью изображения</Label>
            <Input
              type="file"
              accept="image/png,image/jpg,image/jpeg"
              onChange={(e) =>
                setModelState({
                  ...modelState,
                  preview_image_url: e.target.files?.[0] || null,
                })
              }
            />
            <span className="text-red-400">{errors.preview_image_url?.[0]}</span>
          </div>
          <div className="mb-2">
            <Label htmlFor="envMap_url" className="label">
              Текстура окружения
            </Label>
            <Input
              type="file"
              className="input"
              accept=".hdr"
              onChange={(e) =>
                setModelState({
                  ...modelState,
                  envMap_url: e.target.files?.[0] || null,
                })
              }
            />
            <span className="text-red-400">{errors.envMap_url?.[0]}</span>
          </div>
          <div className="mb-6">
            <Label htmlFor="model_glb" className="label">
              GLB-модель
            </Label>
            <Input
              type="file"
              accept=".glb"
              className="input"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                if (!file) {
                  setErrors({
                    ...errors,
                    model_glb: ["GLB-модель обязательна"],
                  });
                  setModelState({ ...modelState, model_glb: null });
                } else if (!file.name.toLowerCase().endsWith(".glb")) {
                  setErrors({
                    ...errors,
                    model_glb: ["Файл должен иметь расширение .glb"],
                  });
                  setModelState({ ...modelState, model_glb: null });
                } else if (!file.type && file.size > 0) {
                  console.warn("Файл .glb не имеет MIME-типа:", file.name);
                  setModelState({ ...modelState, model_glb: file });
                  setErrors({ ...errors, model_glb: undefined });
                } else {
                  setErrors({ ...errors, model_glb: undefined });
                  setModelState({ ...modelState, model_glb: file });
                }
              }}
            />
            <span className="text-red-400">{errors.model_glb?.[0]}</span>
          </div>
          <div>
            <Button
              variant="destructive"
              type="submit"
              className="button w-full"
              disabled={loading}
            >
              {loading ? "Обработка..." : "Отправить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
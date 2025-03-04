type CategoriesType =  {
    id: number
    title: string
    code: string
}

type UserType = {
    id?: number
    name?: string
    profile_image?: string
    username?: string
    email?: string
}

type APIResponseType<T> = {
    data: Array<T>;
    path: string;
    per_page: number;
    next_cursor: string;
    next_page_url?: string;
    prev_cursor?: string;
    prev_page_url?: string;
};

// Тип состояния формы модели
type IModelFormState = {
    title: string;
    description: string;
    file: File | null;
    preview_image_url: File | null;
    price: number;
    category_id: number;
    end_date: Date | null;
    texture_url: File | null;
    model_fbx: File | null;
}

// Тип модели, возвращаемой с бэкенда
type IModel = {
    id: number;
    author_id: number;
    title: string;
    description: string | null;
    price: number | null;
    preview_image_url: string;
    file_url: string;
    texture_url: string | null;
    model_fbx_url: string | null;
    category_id: number | null;
    end_date: string | null;
    created_at: string;
    updated_at: string;
    author: UserType;
    category: CategoriesType | null;
}

// Тип ошибок валидации
type IValidationErrors = {
    title?: string[];
    description?: string[];
    file?: string[];
    preview_image_url?: string[];
    price?: string[];
    category_id?: string[];
    end_date?: string[];
    texture_url?: string[];
    model_fbx?: string[];
}


type UserType = {
    id?: number
    name?: string
    profile_image?: string
    username?: string
    email?: string
}

type APIResponseType<T> = {
    data: Array<T> | [];
    path: string;
    per_page: number;
    next_cursor?: string;
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

type ModelStateType = {
    title: string;
    description: string;
    preview_image_url: File | null;
    price: number;
    category_id: number;
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

type ModelType = {
    id: number;
    author_id: number;
    title: string;
    description: string;
    likes_count: number;
    price: number;
    preview_image_url: string;
    file_url: string;
    created_at: string;
    end_date: string;
    category_id: number;
    author: AuthorType;
    category?: CategoriesType;
}

interface AuthorType {
    id: number;
    name: string;
    username: string;
    email: string;
    profile_image: string;
}
type CategoriesType =  {
    id: number
    title: string
    code: string
}
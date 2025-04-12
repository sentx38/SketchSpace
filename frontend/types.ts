

type UserType = {
    id?: number
    name?: string
    profile_image?: string
    username?: string
    email?: string
    role?: string
    created_at: string;
}

type RoleType = {
    id: number;
    title: string;
};

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
    category_id: number;
    envMap_url: File | null;
    model_glb: File | null;
}

type ModelStateType = {
    title: string;
    description: string;
    preview_image_url: File | null;
    category_id: number;
}

// Тип ошибок валидации
type IValidationErrors = {
    title?: string[];
    description?: string[];
    file?: string[];
    preview_image_url?: string[];
    category_id?: string[];
    envMap_url?: string[];
    model_glb?: string[];
}

type ModelType = {
    id: number;
    author_id: number;
    title: string;
    description: string;
    favorite_count: number;
    model_glb_url: string;
    envMap_url: string;
    preview_image_url: string;
    file_url: string;
    created_at: string;
    category_id: number;
    author: AuthorType;
    category?: CategoriesType;
}

type CommentType = {
    id: number;
    user_id: number;
    model_id: number;
    comment: string;
    created_at: string;
    user:UserType
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
type CategoryResponseType = {
    data: CategoriesType;
};
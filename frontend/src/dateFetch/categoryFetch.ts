// dateFetch/categoryFetch.ts
import { API_URL, GET_CATEGORIES } from "@/lib/apiEndPoints";
import myAxios from "@/lib/axios.config";

export async function fetchCategories(): Promise<CategoriesType[]> {
    const res = await myAxios.get(GET_CATEGORIES);

    if (!res.data) {
        throw new Error("Failed to fetch categories");
    }

    return res.data as CategoriesType[]; // Explicitly cast to CategoriesType[]
}
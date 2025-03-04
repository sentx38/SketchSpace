import {API_URL, GET_CATEGORIES} from "@/lib/apiEndPoints";

export async function fetchCategories(token:string) {
    const res = await fetch(API_URL+GET_CATEGORIES, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!res.ok) {
        throw new Error('Failed to fetch categories')
    }

    return res.json();
}
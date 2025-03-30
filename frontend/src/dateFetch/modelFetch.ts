import {API_URL, MODEL_URL} from "@/lib/apiEndPoints";

export async function fetchModels(token: string) {
    const res = await fetch(API_URL + MODEL_URL, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })

    if (!res.ok) {
        throw new Error('Failed to fetch data')
    }

    return await res.json()
}
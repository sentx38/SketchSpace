import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import Env from "@/lib/env";

declare global {
    interface Window {
        Pusher: typeof Pusher;
        Echo: Echo;
    }
}

// Устанавливаем Pusher только в браузере
if (typeof window !== 'undefined') {
    window.Pusher = Pusher;
}

export const pvtLaralEcho = (token: string) => new Echo({
    broadcaster: 'reverb',
    encrypted: false,
    authEndpoint: `${Env.API_URL}/api/broadcasting/auth`,
    auth: {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    },
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
    wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
    wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});

// Экспортируем функцию для создания laraEcho
export const createLaraEcho = () =>
    new Echo({
        broadcaster: 'reverb',
        encrypted: false,
        key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
        wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
        wsPort: process.env.NEXT_PUBLIC_REVERB_PORT,
        wssPort: process.env.NEXT_PUBLIC_REVERB_PORT,
        forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'https') === 'https',
        enabledTransports: ['ws', 'wss'],
    });
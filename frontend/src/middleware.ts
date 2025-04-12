import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    // Если токен не найден — редирект на страницу логина
    if (!token) {
        return NextResponse.redirect(new URL("/auth", req.url));
    }

    // Если роль не админ — редирект на главную или другую страницу
    if (token?.user?.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    // Если всё ок — продолжаем
    return NextResponse.next();
}

// Применяем middleware только к /admin-dashboard и вложенным маршрутам
export const config = {
    matcher: ["/dashboard/:path*", "/admin/:path*"],
};

import { LOGIN_URL } from "@/lib/apiEndPoints";
import myAxios from "@/lib/axios.config";
import { AuthOptions, ISODateString } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getSession } from "next-auth/react";

export interface CustomSession {
    user?: CustomUser;
    expires: ISODateString;
}

export interface CustomUser {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    profile_image?: string | null;
    token?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    role?: string | null;
}

async function getSessionUser() {
    const session = await getSession();
    return session?.user as CustomUser;
}

export const authOptions: AuthOptions = {
    pages: {
        signIn: "/auth",
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
					if (trigger === "update" && session?.user) {
						const userData: CustomUser = token.user as CustomUser;
						// Обновляем все поля, переданные в session.user
						token.user = {
								...userData,
								name: session.user.name ?? userData.name,
								email: session.user.email ?? userData.email,
								profile_image: session.user.profile_image ?? userData.profile_image,
						};
						console.log("Updated token:", token);
				}

            if (user) {
                token.user = user;
            }
            return token;
        },

        async session({ session, token }) {
            session.user = token.user as CustomUser;
            return session;
        },

        async redirect({ url, baseUrl }) {
            const user = await getSessionUser();
            if (user?.role === 'admin') {
                return `${baseUrl}/dashboard`;
            }
            return url;
        }
    },

    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password: {},
            },
            async authorize(credentials, req) {
                try {
                    const res = await myAxios.post(LOGIN_URL, credentials);
                    const response = res.data;
                    const user = response?.user;
                    if (user) {
                        return {
                            ...user,
                            role: user.role?.name || user.role
                        };
                    }
                    return null;
                } catch (error) {
                    console.error("Authorize error:", error);
                    return null;
                }
            },
        }),
    ],
};
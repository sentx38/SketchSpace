"use client";
import React, {useEffect, useState} from "react";
import Image from "next/image";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {cn} from "@/lib/utils";
import SearchInput from "@/components/base/search-input";
import ProfileMenu from "@/components/base/profile-menu";
import Link from "next/link";
import AddModel from "@/components/model/AddModel";
import {fetchCategories} from "@/dateFetch/categoryFetch";
import {useSession} from "next-auth/react";
import {CustomUser} from "@/app/api/auth/[...nextauth]/authOptions";
import {Separator} from "@/components/ui/separator";

export default function NavBar() {
    const [categories, setCategories] = useState<CategoriesType[]>([]);
    const { data } = useSession();
    const user = data?.user as CustomUser ;

    useEffect(() => {
        const getCategories = async () => {
            if (user?.token) {
                const fetchedCategories = await fetchCategories(user.token);
                setCategories(fetchedCategories);
            }
        };

        getCategories();
    }, [user]);

    return(
        <div>
            <nav className="relative flex justify-between items-center h-[5vh] p-4">
                <div className="flex justify-between space-x-5 items-center">
                    <Link href="/">
                        <Image src="/logo.svg" alt="logo_img" width={100} height={100} className="dark:invert"/>
                    </Link>
                    <NavigationMenu>
                        <NavigationMenuList>
                            <NavigationMenuItem>
                                <NavigationMenuTrigger >Категории</NavigationMenuTrigger>
                                <NavigationMenuContent className="">
                                    <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                                        {categories.map((category) => (
                                            <ListItem key={category.id} title={category.title} href={`/categories/${category.code}`}>
                                            </ListItem>
                                        ))}
                                    </ul>
                                </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <SearchInput/>
                <div className="flex justify-between space-x-5 items-center">
                    <AddModel />
                    <ProfileMenu/>
                </div>

            </nav>
            <Separator />
        </div>
    )
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-medium leading-none">{title}</div>
                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    )
})
ListItem.displayName = "ListItem"
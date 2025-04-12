"use client";

import * as React from "react";
import {useEffect, useState} from "react";
import {ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, TrashIcon,} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {fetchCategories} from "@/dateFetch/categoryFetch";
import myAxios from "@/lib/axios.config";
import {flexRender, getCoreRowModel, getPaginationRowModel, useReactTable,} from "@tanstack/react-table";
import {useSession} from "next-auth/react";
import {CustomUser} from "@/app/api/auth/[...nextauth]/authOptions";
import {AddCategoryDialog} from "@/components/AddCategoryDialog";
import {useCategoryAndUserBroadcast} from '@/hooks/useCategoryAndUserBroadcast';
import {Skeleton} from "@/components/ui/skeleton";

// Типы данных
type UserType = {
    id?: number;
    name?: string;
    profile_image?: string;
    username?: string;
    email?: string;
    role?: string;
};

export function DataTable() {
    const [categories, setCategories] = useState<CategoriesType[]>([]);
    const [models, setModels] = useState<ModelType[]>([]);
    const [users, setUsers] = useState<UserType[]>([]);
    const [roles, setRoles] = useState<RoleType[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [loadingModels, setLoadingModels] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [errorCategories, setErrorCategories] = useState<string | null>(null);
    const [errorModels, setErrorModels] = useState<string | null>(null);
    const [errorUsers, setErrorUsers] = useState<string | null>(null);
    const [errorRoles, setErrorRoles] = useState<string | null>(null);
    const [usersPagination, setUsersPagination] = useState({pageIndex: 0, pageSize: 10});
    const [categoriesPagination, setCategoriesPagination] = useState({pageIndex: 0, pageSize: 10});
    const [modelsPagination, setModelsPagination] = useState({pageIndex: 0, pageSize: 10});
    const [isAdmin, setIsAdmin] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const loadingSkeleton = Array.from({length: 5}).map((_, index) => (
        <TableRow key={index}>
            <TableCell colSpan={5} className="text-center">
                <Skeleton className="h-[50px] w-full rounded-sm"/>
            </TableCell>
        </TableRow>
    ));

    // Получение текущего пользователя через useSession
    const {data: session, status} = useSession();
    const user: CustomUser | undefined = session?.user as CustomUser;

    // Проверка роли администратора
    useEffect(() => {
        if (status === "authenticated" && user) {
            setIsAdmin(user.role === "admin");
        } else if (status === "unauthenticated") {
            setIsAdmin(false);
            setLoadingUsers(false);
            setLoadingRoles(false);
        }
    }, [status, user]);

    // Подписка на события категорий и пользователей
    useCategoryAndUserBroadcast({setCategories, setUsers, isAdmin});

    // Загрузка пользователей
    useEffect(() => {
        if (!isAdmin) {
            setLoadingUsers(false);
            return;
        }

        const loadUsers = async () => {
            try {
                setLoadingUsers(true);
                const response = await myAxios.get<APIResponseType<UserType>>('/users', {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });
                setUsers(response.data.data);
            } catch (err: any) {
                console.error("Ошибка загрузки пользователей:", err);
                setErrorUsers(
                    err.response?.status === 403
                        ? "Доступ запрещен. Требуются права администратора."
                        : "Не удалось загрузить пользователей."
                );
            } finally {
                setLoadingUsers(false);
            }
        };

        loadUsers();
    }, [isAdmin, user?.token]);

    // Загрузка ролей
    useEffect(() => {
        if (!isAdmin) {
            setLoadingRoles(false);
            return;
        }

        const loadRoles = async () => {
            try {
                setLoadingRoles(true);
                const response = await myAxios.get<APIResponseType<RoleType>>('/roles', {
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });
                setRoles(response.data.data);
            } catch (err: any) {
                console.error("Ошибка загрузки ролей:", err);
                setErrorRoles(
                    err.response?.status === 403
                        ? "Доступ запрещен. Требуются права администратора."
                        : "Не удалось загрузить роли."
                );
            } finally {
                setLoadingRoles(false);
            }
        };

        loadRoles();
    }, [isAdmin, user?.token]);

    // Загрузка категорий
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setLoadingCategories(true);
                const fetchedCategories = await fetchCategories();
                setCategories(fetchedCategories);
            } catch (err) {
                console.error("Ошибка загрузки категорий:", err);
                setErrorCategories("Не удалось загрузить категории.");
            } finally {
                setLoadingCategories(false);
            }
        };

        loadCategories();
    }, []);

    // Загрузка моделей
    useEffect(() => {
        const loadModels = async () => {
            try {
                setLoadingModels(true);
                const response = await myAxios.get<APIResponseType<ModelType>>("/models");
                setModels(response.data.data);
            } catch (err) {
                console.error("Ошибка загрузки моделей:", err);
                setErrorModels("Не удалось загрузить модели.");
            } finally {
                setLoadingModels(false);
            }
        };

        loadModels();
    }, []);

    // Таблица пользователей
    const usersTable = useReactTable({
        data: users,
        columns: [
            {
                accessorKey: "id",
                header: "ID",
                cell: ({row}) => row.original.id || "-",
            },
            {
                accessorKey: "username",
                header: "Пользователь",
                cell: ({row}) => row.original.username || "-",
            },
            {
                accessorKey: "email",
                header: "Почта",
                cell: ({row}) => row.original.email || "-",
            },
            {
                accessorKey: "role",
                header: "Роль",
                cell: ({row}) => (
                    <Select
                        value={row.original.role || ""}
                        onValueChange={(value) => {
                            if (row.original.id && user?.token) {
                                myAxios.patch<APIResponseType<UserType>>(
                                    `/users/${row.original.id}`,
                                    {role: value},
                                    {
                                        headers: {
                                            Authorization: `Bearer ${user.token}`,
                                        },
                                    }
                                )
                                    .then((response) => {
                                        const updatedUser = response.data.data as UserType;
                                        setUsers(users.map(u =>
                                            u.id === row.original.id ? updatedUser : u
                                        ));
                                    })
                                    .catch(err => console.error("Ошибка обновления роли:", err));
                            }
                        }}
                    >
                        <SelectTrigger className="w-full p-0 border-none text-neutral-400 hover:text-accent-foreground">
                            <SelectValue placeholder="Выберите роль"/>
                        </SelectTrigger>
                        <SelectContent className="min-w-[200px]">
                            {loadingRoles ? (
                                <SelectItem value="loading" disabled>Загрузка...</SelectItem>
                            ) : errorRoles ? (
                                <SelectItem value="error" disabled>Ошибка загрузки ролей</SelectItem>
                            ) : roles.length > 0 ? (
                                roles.map(role => (
                                    <SelectItem key={role.id} value={role.title}>
                                        {role.title}
                                    </SelectItem>
                                ))
                            ) : (
                                <SelectItem value="no-roles" disabled>Нет ролей</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                ),
            },
            {
                id: "action",
                header: "Действие",
                cell: ({row}) => (
                    <div className="flex justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (row.original.id && user?.token) {
                                    myAxios.delete(`/users/${row.original.id}`, {
                                        headers: {
                                            Authorization: `Bearer ${user.token}`,
                                        },
                                    })
                                        .then(() => {
                                            setUsers(users.filter(u => u.id !== row.original.id));
                                        })
                                        .catch(err => console.error("Ошибка удаления пользователя:", err));
                                }
                            }}
                        >
                            <TrashIcon/>
                        </Button>
                    </div>
                ),
            },
        ],
        state: {pagination: usersPagination},
        onPaginationChange: setUsersPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // Таблица категорий
    const categoriesTable = useReactTable({
        data: categories,
        columns: [
            {
                accessorKey: "id",
                header: "ID",
                cell: ({row}) => row.original.id ?? "N/A", // Обработка отсутствия id
            },
            {
                accessorKey: "title",
                header: "Название",
                cell: ({row}) => row.original.title ?? "Без названия",
            },
            {
                accessorKey: "code",
                header: "Код категории",
                cell: ({row}) => row.original.code ?? "Без кода",
            },
            {
                id: "action",
                header: "Действие",
                cell: ({row}) => (
                    <div className="flex justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (row.original.id && user?.token) {
                                    myAxios.delete(`/categories/${row.original.id}`, {
                                        headers: {
                                            Authorization: `Bearer ${user.token}`,
                                        },
                                    })
                                        .then(() => {
                                            setCategories(categories.filter(cat => cat.id !== row.original.id));
                                        })
                                        .catch(err => console.error("Ошибка удаления категории:", err));
                                }
                            }}
                            disabled={!row.original.id} // Отключаем кнопку, если id отсутствует
                        >
                            <TrashIcon/>
                        </Button>
                    </div>
                ),
            },
        ],
        state: {pagination: categoriesPagination},
        onPaginationChange: setCategoriesPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    // Таблица моделей
    const modelsTable = useReactTable({
        data: models,
        columns: [
            {accessorKey: "id", header: "ID"},
            {accessorKey: "title", header: "Название"},
            {
                accessorKey: "author",
                header: "Автор",
                cell: ({row}) => row.original.author?.username ?? "Неизвестно",
            },
            {
                accessorKey: "favorite_count",
                header: "Лайки",
                cell: ({row}) => row.original.favorite_count ?? 0,
            },
            {
                id: "action",
                header: "Действие",
                cell: ({row}) => (
                    <div className="flex justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                if (row.original.id && user?.token) {
                                    myAxios.delete(`/models/${row.original.id}`, {
                                        headers: {
                                            Authorization: `Bearer ${user.token}`,
                                        },
                                    })
                                        .then(() => {
                                            setModels(models.filter(u => u.id !== row.original.id));
                                        })
                                        .catch(err => console.error("Ошибка удаления модели:", err));
                                }
                            }}
                        >
                            <TrashIcon/>
                        </Button>
                    </div>
                ),
            },
        ],
        state: {pagination: modelsPagination},
        onPaginationChange: setModelsPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <Tabs defaultValue="users" className="flex w-full flex-col justify-start gap-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <Label htmlFor="view-selector" className="sr-only">
                    View
                </Label>
                <TabsList>
                    <TabsTrigger value="users">Пользователи</TabsTrigger>
                    <TabsTrigger value="categories">Категории</TabsTrigger>
                    <TabsTrigger value="models">Модели</TabsTrigger>
                </TabsList>
                <div className="flex items-center gap-2">
                    {isAdmin && (
                        <AddCategoryDialog
                            open={dialogOpen}
                            onOpenChange={setDialogOpen}
                        />
                    )}
                </div>
            </div>

            {/* Вкладка "Пользователи" */}
            <TabsContent value="users" className="px-4">
                {isAdmin ? (
                    <div className="overflow-hidden rounded-lg border">
                        <Table>
                            <TableHeader className="sticky top-0 z-10 bg-muted">
                                {usersTable.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead key={header.id}
                                                       className={header.column.id === "action" ? "text-center" : ""}>
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {loadingUsers ? (
                                    loadingSkeleton

                                ) : errorUsers ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">{errorUsers}</TableCell>
                                    </TableRow>
                                ) : usersTable.getRowModel().rows.length > 0 ? (
                                    usersTable.getRowModel().rows.map((row) => (
                                        <TableRow key={row.id}>
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">Нет пользователей</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center p-4">
                        Доступ запрещен. Требуются права администратора.
                    </div>
                )}
                {!loadingUsers && !errorUsers && isAdmin && <PaginationControls table={usersTable}/>}
            </TabsContent>

            {/* Вкладка "Категории" */}
            <TabsContent value="categories" className="px-4">
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-muted">
                            {categoriesTable.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}
                                                   className={header.column.id === "action" ? "text-center" : ""}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loadingCategories ? (
                                loadingSkeleton
                            ) : errorCategories ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">{errorCategories}</TableCell>
                                </TableRow>
                            ) : categoriesTable.getRowModel().rows.length > 0 ? (
                                categoriesTable.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center">Нет категорий</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {!loadingCategories && !errorCategories && <PaginationControls table={categoriesTable}/>}
            </TabsContent>

            {/* Вкладка "Модели" */}
            <TabsContent value="models" className="px-4">
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-muted">
                            {modelsTable.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}
                                                   className={header.column.id === "action" ? "text-center" : ""}>
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loadingModels ? (
                                loadingSkeleton
                            ) : errorModels ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">{errorModels}</TableCell>
                                </TableRow>
                            ) : modelsTable.getRowModel().rows.length > 0 ? (
                                modelsTable.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Нет моделей</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {!loadingModels && !errorModels && <PaginationControls table={modelsTable}/>}
            </TabsContent>
        </Tabs>
    );
}

// Компонент пагинации
function PaginationControls({table}: any) {
    return (
        <div className="flex items-center justify-between px-4 mt-4">
            <div className="flex w-full items-center gap-8 lg:w-fit">
                <div className="hidden items-center gap-2 lg:flex">
                    <Label htmlFor="rows-per-page" className="text-sm font-medium">
                        Строк на странице
                    </Label>
                    <Select
                        value={`${table.getState().pagination.pageSize}`}
                        onValueChange={(value) => table.setPageSize(Number(value))}
                    >
                        <SelectTrigger className="w-20" id="rows-per-page">
                            <SelectValue placeholder={table.getState().pagination.pageSize}/>
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 40, 50].map((pageSize) => (
                                <SelectItem key={pageSize} value={`${pageSize}`}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex w-fit items-center justify-center text-sm font-medium">
                    Страница {table.getState().pagination.pageIndex + 1} из {table.getPageCount()}
                </div>
                <div className="ml-auto flex items-center gap-2 lg:ml-0">
                    <Button
                        variant="outline"
                        className="hidden h-8 w-8 p-0 lg:flex"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Перейти на первую страницу</span>
                        <ChevronsLeftIcon/>
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Перейти на предыдущую страницу</span>
                        <ChevronLeftIcon/>
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Перейти на следующую страницу</span>
                        <ChevronRightIcon/>
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden size-8 lg:flex"
                        size="icon"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Перейти на последнюю страницу</span>
                        <ChevronsRightIcon/>
                    </Button>
                </div>
            </div>
        </div>
    );
}
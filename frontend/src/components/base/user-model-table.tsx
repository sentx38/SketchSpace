"use client";

import * as React from "react";
import {useEffect, useState} from "react";
import {ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, TrashIcon,} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Skeleton} from "@/components/ui/skeleton";
import {flexRender, getCoreRowModel, getPaginationRowModel, useReactTable,} from "@tanstack/react-table";
import myAxios from "@/lib/axios.config";
import {useSession} from "next-auth/react";
import {CustomUser} from "@/app/api/auth/[...nextauth]/authOptions";
import {toast} from "sonner";

// Типы данных
type ModelType = {
    id: number;
    title: string;
    favorite_count: number;
    author_id?: number; // Добавляем author_id для проверки
    author?: {
        username: string;
    };
};

type APIResponseType<T> = {
    data: T[];
};

export function UserModelTable() {
    const [models, setModels] = useState<ModelType[]>([]);
    const [loadingModels, setLoadingModels] = useState(true);
    const [errorModels, setErrorModels] = useState<string | null>(null);
    const [pagination, setPagination] = useState({pageIndex: 0, pageSize: 10});

    // Получение текущего пользователя
    const {data: session, status} = useSession();
    const user: CustomUser | undefined = session?.user as CustomUser;

    // Загрузка моделей пользователя
    useEffect(() => {
        const loadUserModels = async () => {
            if (status !== "authenticated" || !user?.token || !user?.id) {
                setLoadingModels(false);
                setErrorModels("Требуется авторизация");
                return;
            }

            try {
                setLoadingModels(true);
                const response = await myAxios.get<APIResponseType<ModelType>>("/models", {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                    params: {
                        author_id: user.id, // Фильтрация по ID пользователя
                    },
                });
                setModels(response.data.data);
            } catch (err: any) {
                console.error("Ошибка загрузки моделей:", err);
                setErrorModels("Не удалось загрузить модели.");
            } finally {
                setLoadingModels(false);
            }
        };

        loadUserModels();
    }, [status, user?.token, user?.id]);

    // Скелетон для загрузки
    const loadingSkeleton = Array.from({length: 5}).map((_, index) => (
        <TableRow key={index}>
            <TableCell colSpan={4} className="text-center">
                <Skeleton className="h-[50px] w-full rounded-sm"/>
            </TableCell>
        </TableRow>
    ));

    // Конфигурация таблицы
    const table = useReactTable({
        data: models,
        columns: [
            {
                accessorKey: "id",
                header: "ID",
                cell: ({row}) => row.original.id || "-",
            },
            {
                accessorKey: "title",
                header: "Название",
                cell: ({row}) => row.original.title || "Без названия",
            },
            {
                accessorKey: "favorite_count",
                header: "Лайки",
                cell: ({row}) => row.original.favorite_count ?? 0,
            },
            {
                accessorKey: "action",
                header: "Действие",
                cell: ({row}) => (
                    <div className="flex justify-center">
                        {row.original.author_id === user?.id && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    if (!row.original.id || !user?.token) {
                                        toast.error("Требуется авторизация.");
                                        return;
                                    }

                                    myAxios
                                        .delete(`/models/${row.original.id}`, {
                                            headers: {
                                                Authorization: `Bearer ${user.token}`,
                                            },
                                        })
                                        .then(() => {
                                            setModels(models.filter((m) => m.id !== row.original.id));
                                            toast.success("Модель успешно удалена.");
                                        })
                                        .catch((err: any) => {
                                            console.error("Ошибка удаления модели:", err);
                                            toast.error(err.response?.status === 403
                                                ? "У вас нет прав для удаления этой модели."
                                                : "Не удалось удалить модель. Попробуйте снова.",);
                                        });
                                }}
                                title="Удалить модель"
                            >
                                <TrashIcon className="h-4 w-4"/>
                            </Button>
                        )}
                    </div>
                ),
            },
        ],
        state: {pagination},
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    return (
        <div className="flex flex-col w-full gap-4">
            {/* Контейнер таблицы с прокруткой */}
            <div className="flex-1 overflow-auto rounded-lg border">
                <Table className="w-full">
                    <TableHeader className="sticky top-0 z-10 bg-muted">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
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
                                <TableCell colSpan={4} className="text-center">
                                    {errorModels}
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length > 0 ? (
                            table.getRowModel().rows.map((row) => (
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
                                <TableCell colSpan={4} className="text-center">
                                    У вас пока нет моделей
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Пагинация */}
            {!loadingModels && !errorModels && <PaginationControls table={table}/>}
        </div>
    );
}

// Компонент пагинации
function PaginationControls({table}: { table: any }) {
    return (
        <div className="flex items-center justify-between px-4">
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
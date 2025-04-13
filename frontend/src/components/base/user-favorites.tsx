"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ChevronsLeftIcon,
    ChevronsRightIcon,
    TrashIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from "@tanstack/react-table";
import myAxios from "@/lib/axios.config";
import { useSession } from "next-auth/react";
import { CustomUser } from "@/app/api/auth/[...nextauth]/authOptions";
import Link from "next/link";
import { useFavorite } from "@/hooks/useFavorite";

// Типы данных
type FavoriteModelType = {
    id: number;
    title: string;
    author_id: number;
    author?: {
        username: string;
    };
};

type APIResponseType<T> = {
    data: T[];
};

// Компонент для ячейки "Действие"
function ActionCell({modelId, user, onRemove,}: {
    modelId: number;
    user: CustomUser | null;
    onRemove: (id: number) => void;
}) {
    const { toggleLike, loading } = useFavorite(modelId, user, 0);
    return (
        <div className="flex justify-center">
            <Button
                variant="ghost"
                size="icon"
                onClick={async () => {
                    const result = await toggleLike();
                    if (result === "unliked") {
                        onRemove(modelId);
                    }
                }}
                disabled={loading}
                title="Удалить из избранного"
            >
                <TrashIcon className="h-4 w-4" />
            </Button>
        </div>
    );
}

export function UserFavorites() {
    const [favorites, setFavorites] = useState<FavoriteModelType[]>([]);
    const [loadingFavorites, setLoadingFavorites] = useState(true);
    const [errorFavorites, setErrorFavorites] = useState<string | null>(null);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    // Получение текущего пользователя
    const { data: session, status } = useSession();
    const user: CustomUser | null = session?.user as CustomUser | null;

    // Загрузка избранных моделей
    useEffect(() => {
        const loadFavorites = async () => {
            if (status !== "authenticated" || !user?.token || !user?.id) {
                setLoadingFavorites(false);
                setErrorFavorites("Требуется авторизация");
                return;
            }

            try {
                setLoadingFavorites(true);
                const response = await myAxios.get<APIResponseType<FavoriteModelType>>("/favorites", {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                setFavorites(response.data.data);
            } catch (err: any) {
                console.error("Ошибка загрузки избранных моделей:", err);
                setErrorFavorites("Не удалось загрузить избранные модели.");
            } finally {
                setLoadingFavorites(false);
            }
        };

        loadFavorites();
    }, [status, user?.token, user?.id]);

    // Обработчик удаления модели из избранного
    const handleRemoveFavorite = (id: number) => {
        setFavorites((prev) => prev.filter((m) => m.id !== id));
    };

    // Скелетон для загрузки
    const loadingSkeleton = Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
            <TableCell colSpan={3} className="text-center">
                <Skeleton className="h-[50px] w-full rounded-sm" />
            </TableCell>
        </TableRow>
    ));

    // Конфигурация таблицы
    const table = useReactTable({
        data: favorites,
        columns: [
            {
                accessorKey: "title",
                header: "Название",
                cell: ({ row }) => (
                    <Link
                        href={`/models/${row.original.id}`}
                        className="hover:underline"
                    >
                        {row.original.title || "Без названия"}
                    </Link>
                ),
            },
            {
                accessorKey: "author",
                header: "Автор",
                cell: ({ row }) => row.original.author?.username ?? "Неизвестно",
            },
            {
                accessorKey: "action",
                header: "Действие",
                cell: ({ row }) => (
                    <ActionCell
                        modelId={row.original.id}
                        user={user}
                        onRemove={handleRemoveFavorite}
                    />
                ),
            },
        ],
        state: { pagination },
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
                                        className={header.column.id === "action" ? "text-center" : ""}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {loadingFavorites ? (
                            loadingSkeleton
                        ) : errorFavorites ? (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center">
                                    {errorFavorites}
                                </TableCell>
                            </TableRow>
                        ) : favorites.length > 0 ? (
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
                                <TableCell colSpan={3} className="text-center">
                                    У вас пока нет избранных моделей
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Пагинация */}
            {!loadingFavorites && !errorFavorites && favorites.length > 0 && (
                <PaginationControls table={table} />
            )}
        </div>
    );
}

// Компонент пагинации
function PaginationControls({ table }: { table: any }) {
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
                            <SelectValue placeholder={table.getState().pagination.pageSize} />
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
                        <ChevronsLeftIcon />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        <span className="sr-only">Перейти на предыдущую страницу</span>
                        <ChevronLeftIcon />
                    </Button>
                    <Button
                        variant="outline"
                        className="size-8"
                        size="icon"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Перейти на следующую страницу</span>
                        <ChevronRightIcon />
                    </Button>
                    <Button
                        variant="outline"
                        className="hidden size-8 lg:flex"
                        size="icon"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                    >
                        <span className="sr-only">Перейти на последнюю страницу</span>
                        <ChevronsRightIcon />
                    </Button>
                </div>
            </div>
        </div>
    );
}
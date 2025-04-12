"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { format } from "date-fns"
import { ru } from "date-fns/locale"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import myAxios from "@/lib/axios.config"
import { useSession } from "next-auth/react"
import { CustomUser } from "@/app/api/auth/[...nextauth]/authOptions"

type DataPoint = {
  date: string
  users: number
  models: number
}

const chartConfig = {
  users: {
    label: "Пользователи",
    color: "hsl(var(--chart-1))",
  },
  models: {
    label: "Модели",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function ChartAreaInteractive () {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")
  const [data, setData] = React.useState<DataPoint[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const { data: session } = useSession()
  const user: CustomUser | undefined = session?.user as CustomUser

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const [usersRes, modelsRes] = await Promise.all([
          myAxios.get<{ data: any[] }>("/users", {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
          myAxios.get<{ data: any[] }>("/models", {
            headers: { Authorization: `Bearer ${user?.token}` },
          }),
        ])

        const map: Record<string, DataPoint> = {}

        usersRes.data.data.forEach((u) => {
          if (!u.created_at) return
          const date = format(new Date(u.created_at), "yyyy-MM-dd")
          if (!map[date]) map[date] = { date, users: 0, models: 0 }
          map[date].users++
        })

        modelsRes.data.data.forEach((m) => {
          if (!m.created_at) return
          const date = format(new Date(m.created_at), "yyyy-MM-dd")
          if (!map[date]) map[date] = { date, users: 0, models: 0 }
          map[date].models++
        })

        const result = Object.values(map).sort((a, b) =>
            a.date.localeCompare(b.date)
        )

        setData(result)
      } catch (err: any) {
        console.error(err)
        setError("Ошибка загрузки данных.")
      } finally {
        setLoading(false)
      }
    }

    if (user?.token) fetchData()
  }, [user?.token])

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date()
    let daysToSubtract = 90
    if (timeRange === "30d") daysToSubtract = 30
    if (timeRange === "7d") daysToSubtract = 7
    const startDate = new Date(referenceDate)
    startDate.setDate(referenceDate.getDate() - daysToSubtract)
    return data.filter((item) => new Date(item.date) >= startDate)
  }, [data, timeRange])

  return (
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardTitle>Статистика пользователей и моделей</CardTitle>
          <CardDescription>
          <span className="@[540px]/card:block hidden">
            Количество регистраций и загрузок по дням
          </span>
            <span className="@[540px]/card:hidden">Статистика за период</span>
          </CardDescription>
          <div className="absolute right-4 top-4">
            <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={setTimeRange}
                variant="outline"
                className="@[767px]/card:flex hidden"
            >
              <ToggleGroupItem value="90d" className="h-8 px-2.5">
                Последние 3 месяца
              </ToggleGroupItem>
              <ToggleGroupItem value="30d" className="h-8 px-2.5">
                Последние 30 дней
              </ToggleGroupItem>
              <ToggleGroupItem value="7d" className="h-8 px-2.5">
                Последние 7 дней
              </ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                  className="@[767px]/card:hidden flex w-40"
                  aria-label="Выбор периода"
              >
                <SelectValue placeholder="Выбрать период" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="90d" className="rounded-lg">
                  Последние 3 месяца
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  Последние 30 дней
                </SelectItem>
                <SelectItem value="7d" className="rounded-lg">
                  Последние 7 дней
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
          {loading ? (
              <div className="text-center">Загрузка...</div>
          ) : error ? (
              <div className="text-center text-red-500">{error}</div>
          ) : (
              <ChartContainer
                  config={chartConfig}
                  className="aspect-auto h-[250px] w-full"
              >
                <AreaChart data={filteredData}>
                  <defs>
                    <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop
                          offset="5%"
                          stopColor="var(--color-users)"
                          stopOpacity={1.0}
                      />
                      <stop
                          offset="95%"
                          stopColor="var(--color-users)"
                          stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillModels" x1="0" y1="0" x2="0" y2="1">
                      <stop
                          offset="5%"
                          stopColor="var(--color-models)"
                          stopOpacity={0.8}
                      />
                      <stop
                          offset="95%"
                          stopColor="var(--color-models)"
                          stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      minTickGap={32}
                      tickFormatter={(value) => {
                        const date = new Date(value)
                        return date.toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "short",
                        })
                      }}
                  />
                  <ChartTooltip
                      cursor={false}
                      content={
                        <ChartTooltipContent
                            labelFormatter={(value) =>
                                new Date(value).toLocaleDateString("ru-RU", {
                                  day: "2-digit",
                                  month: "long",
                                  year: "numeric",
                                })
                            }
                            indicator="dot"
                        />
                      }
                  />
                  <Area
                      dataKey="users"
                      type="natural"
                      fill="url(#fillUsers)"
                      stroke="var(--color-users)"
                      stackId="a"
                  />
                  <Area
                      dataKey="models"
                      type="natural"
                      fill="url(#fillModels)"
                      stroke="var(--color-models)"
                      stackId="a"
                  />
                </AreaChart>
              </ChartContainer>
          )}
        </CardContent>
      </Card>
  )
}

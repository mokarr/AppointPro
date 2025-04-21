import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import type { LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const statsCardVariants = cva(
    "transition-all duration-200 hover:shadow-md",
    {
        variants: {
            variant: {
                default: "",
                primary: "border-primary/10 hover:border-primary/30",
                secondary: "border-secondary/10 hover:border-secondary/30",
                accent: "border-accent/10 hover:border-accent/30",
                info: "border-blue-500/10 hover:border-blue-500/30",
                success: "border-green-500/10 hover:border-green-500/30",
                warning: "border-yellow-500/10 hover:border-yellow-500/30",
                danger: "border-red-500/10 hover:border-red-500/30",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
)

type TrendDirection = "up" | "down" | "neutral"

interface StatsCardProps extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statsCardVariants> {
    title: string
    value: string | number
    icon?: LucideIcon
    previousValue?: string | number
    trendDirection?: TrendDirection
    trendValue?: string
    trendLabel?: string
    iconColor?: string
    valuePrefix?: string
    valueSuffix?: string
    footer?: React.ReactNode
}

export function StatsCard({
    title,
    value,
    icon: Icon,
    trendDirection,
    trendValue,
    trendLabel,
    iconColor,
    valuePrefix = "",
    valueSuffix = "",
    footer,
    variant,
    className,
    ...props
}: StatsCardProps) {
    const renderTrend = () => {
        if (!trendDirection || !trendValue) return null

        const trendColors = {
            up: "text-green-500",
            down: "text-red-500",
            neutral: "text-gray-500"
        }

        const trendArrow = {
            up: "↑",
            down: "↓",
            neutral: "→"
        }

        return (
            <div className="flex items-center mt-1">
                <span className={cn("text-xs font-medium", trendColors[trendDirection])}>
                    {trendArrow[trendDirection]} {trendValue} {trendLabel}
                </span>
            </div>
        )
    }

    const getIconColorClass = () => {
        const colorMap: Record<string, string> = {
            primary: "text-primary",
            secondary: "text-secondary",
            accent: "text-accent",
            info: "text-blue-500",
            success: "text-green-500",
            warning: "text-yellow-500",
            danger: "text-red-500",
            default: "text-gray-500"
        }

        return colorMap[iconColor || "default"] || "text-gray-500";
    }

    return (
        <Card className={cn(statsCardVariants({ variant }), className)} {...props}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && (
                    <div className={cn("p-2 rounded-full", getIconColorClass())}>
                        <Icon className="w-4 h-4" />
                    </div>
                )}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {valuePrefix}{value}{valueSuffix}
                </div>
                {renderTrend()}
            </CardContent>
            {footer && <CardFooter>{footer}</CardFooter>}
        </Card>
    )
} 
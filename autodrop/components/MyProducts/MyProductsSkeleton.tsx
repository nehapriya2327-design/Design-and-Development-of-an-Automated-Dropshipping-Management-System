import { Skeleton } from '@/components/ui/skeleton';

interface ProductSkeletonListProps {
    count?: number; // Number of skeleton rows to show
}

export default function MyProductsSkeleton({ count = 10 }: ProductSkeletonListProps) {
    return (
        <div className="space-y-4">
            {[...Array(count)].map((_, index) => (
                <div
                    key={index}
                    className="w-full rounded-md bg-background shadow-md border border-border overflow-hidden"
                >
                    {/* Product Row Skeleton */}
                    <div className="flex items-center p-4 bg-muted/20">
                        <Skeleton className="h-4 w-4 rounded bg-muted animate-shimmer mr-4" />
                        <div className="flex-1 flex items-center gap-4">
                            <Skeleton className="h-16 w-16 rounded-md bg-muted animate-shimmer" />
                            <Skeleton className="h-5 w-3/4 rounded bg-muted animate-shimmer" />
                        </div>
                        <Skeleton className="h-4 w-16 rounded-full bg-muted animate-shimmer mr-4" />
                        <div className="flex items-center gap-2">
                            <Skeleton className="h-5 w-5 rounded bg-muted animate-shimmer" />
                            <Skeleton className="h-5 w-5 rounded bg-muted animate-shimmer" />
                        </div>
                    </div>

                    {/* Variant Table Skeleton for first two rows */}
                    {index < 2 && (
                        <div className="p-4">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-muted-foreground bg-muted/30">
                                        {[...Array(10)].map((_, i) => (
                                            <th key={i} className="p-4">
                                                <Skeleton className="h-4 w-20 rounded bg-muted animate-shimmer" />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...Array(2)].map((_, rowIndex) => (
                                        <tr key={rowIndex} className="border-t border-border bg-muted/20">
                                            <td className="p-4">
                                                <Skeleton className="h-4 w-4 rounded bg-muted animate-shimmer" />
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <Skeleton className="h-10 w-10 rounded-md bg-muted animate-shimmer" />
                                                    <Skeleton className="h-4 w-32 rounded bg-muted animate-shimmer" />
                                                </div>
                                            </td>
                                            {[...Array(7)].map((_, cellIndex) => (
                                                <td key={cellIndex} className="p-4">
                                                    <Skeleton className="h-8 w-20 rounded bg-muted animate-shimmer" />
                                                </td>
                                            ))}
                                            <td className="p-4">
                                                <Skeleton className="h-8 w-20 rounded bg-muted animate-shimmer" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
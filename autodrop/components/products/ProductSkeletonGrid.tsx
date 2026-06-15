import { Skeleton } from '@/components/ui/skeleton';

interface ProductSkeletonGridProps {
    count?: number; // Number of skeleton cards to show
}

export default function ProductSkeletonGrid({ count = 20 }: ProductSkeletonGridProps) {
    return (
        <div className="flex items-center flex-wrap gap-6">
            {[...Array(count)].map((_, index) => (
                <div key={index} className="mx-auto w-72 h-[248px]">
                    <Skeleton
                        className="h-36 w-full rounded-t-md bg-gray-200 dark:bg-gray-700 animate-shimmer"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
                            backgroundSize: '200% 100%',
                        }}
                    />
                    <Skeleton
                        className="h-5 w-3/4 mx-auto mt-2 bg-gray-200 dark:bg-gray-700 animate-shimmer"
                        style={{
                            backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%)',
                            backgroundSize: '200% 100%',
                        }}
                    />
                </div>
            ))}
        </div>
    );
}
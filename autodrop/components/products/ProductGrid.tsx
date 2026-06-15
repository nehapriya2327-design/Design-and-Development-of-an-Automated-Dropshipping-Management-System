'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils'; // Utility for combining class names
import { motion } from 'framer-motion';
import Image from 'next/image';

// Interface for Shopify Product
interface PriceRangeV2 {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
}

// Interface for Shopify Product
interface ShopifyProduct {
    formattedId: string;
    title: string;
    imageUrl: string;
    productType: string;
    priceRangeV2: PriceRangeV2;
    inventory: number;
}

interface EnhancedProduct extends ShopifyProduct {
    category: string;
    priceRange: string;
    shippingTime: string;
}

interface ProductGridProps {
    products: EnhancedProduct[];
    onCardClick: (id: string) => void;
    onAddToMyProducts: (productId: string, productTitle: string) => void;
    cardVariants: { hover: { scale: number; transition: { duration: number } } };
    buttonVariants: { hidden: { opacity: number; scale: number }; visible: { opacity: number; scale: number; transition: { duration: number; ease: string } } };
}

export default function ProductGrid({
    products,
    onCardClick,
    onAddToMyProducts,
    cardVariants,
    buttonVariants,
}: ProductGridProps) {
    return (
        <div className="flex flex-wrap items-center gap-6">
            {products.map((product) => {
                const isOutOfStock = product.inventory === 0;
                return (
                    <motion.div
                        key={product.formattedId}
                        className={cn(
                            "relative group mx-auto w-72",
                            isOutOfStock && "opacity-70" // Slightly higher opacity for better visibility
                        )}
                        variants={cardVariants}
                        whileHover={isOutOfStock ? undefined : "hover"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                        <Card
                            className={cn(
                                "bg-gradient-to-br from-gray-100 to-white dark:from-gray-800 dark:to-gray-900 border relative overflow-hidden rounded-xl",
                                isOutOfStock
                                    ? "border-gray-300 dark:border-gray-600 grayscale brightness-95" // Grayscale and slight brightness reduction for faded effect
                                    : "border-gray-200 dark:border-gray-700 hover:shadow-xl",
                                "transition-shadow duration-200 w-full h-[450px]"
                            )}
                            onClick={() => onCardClick(product.formattedId)}
                        >
                            <CardHeader className="p-0">
                                <div className="relative w-full aspect-square h-56">
                                    <Image
                                        src={product.imageUrl || 'https://via.placeholder.com/200'}
                                        alt={product.title}
                                        fill
                                        className="rounded-t-xl object-contain"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-5 text-left h-[180px] space-y-2">
                                <span className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-xs font-medium px-2 py-1 rounded-full">
                                    {product.category}
                                </span>
                                <h3 className="text-lg font-semibold text-foreground line-clamp-2 leading-tight">{product.title}</h3>
                                <p className="text-md font-medium mt-2 text-gray-900 dark:text-gray-100">{product.priceRange}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Shipping Time: {product.shippingTime}</p>
                            </CardContent>
                            {/* Add to My Products Button - Visible on Hover */}
                            <motion.div
                                className="absolute inset-x-0 bottom-0 bg-gray-100 dark:bg-gray-800 p-3 h-[60px] border-t border-gray-200 dark:border-gray-700"
                                initial="hidden"
                                whileHover={"visible"}
                                variants={buttonVariants}
                            >
                                <Button
                                    variant="default"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isOutOfStock) {
                                            onAddToMyProducts(product.formattedId, product.title);
                                        }
                                    }}
                                    className={cn(
                                        "w-full rounded-md h-10 transition-opacity",
                                        isOutOfStock
                                            ? "bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white hover:opacity-90"
                                    )}
                                >
                                    {isOutOfStock ? "Out of Stock" : "Add to My Products"}
                                </Button>
                            </motion.div>
                        </Card>
                    </motion.div>
                );
            })}
        </div>
    );
}
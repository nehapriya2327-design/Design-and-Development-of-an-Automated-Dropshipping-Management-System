'use client';

import ProductGrid from '@/components/products/ProductGrid';
import ProductSkeletonGrid from '@/components/products/ProductSkeletonGrid';
import { useToast } from '@/components/Toast';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { request } from '@/lib/api/handler';
import { Gem, Globe, Home, Monitor, Search, Shirt, ShoppingBag } from 'lucide-react';
// import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface PriceRangeV2 {
    minVariantPrice: { amount: string; currencyCode: string };
    maxVariantPrice: { amount: string; currencyCode: string };
}

interface ShopifyProduct {
    formattedId: string;
    title: string;
    imageUrl: string;
    productType: string;
    priceRangeV2: PriceRangeV2;
    inventory: number;
    createdAt: string;
    updatedAt: string;
    price: number;
}

interface EnhancedProduct extends ShopifyProduct {
    category: string;
    priceRange: string;
    shippingTime: string;
}

export default function Products() {
    const [products, setProducts] = useState<EnhancedProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<EnhancedProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('title-asc');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [priceFilter, setPriceFilter] = useState('All');
    const [availabilityFilter, setAvailabilityFilter] = useState('All');
    const { addToast } = useToast();
    // const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await request<ShopifyProduct[]>({
                    method: 'GET',
                    url: '/shopify/products/all',
                });
                const enhancedProducts = res.map(product => ({
                    ...product,
                    category: product.productType || 'Category not available',
                    priceRange: product.priceRangeV2.minVariantPrice.amount === product.priceRangeV2.maxVariantPrice.amount
                        ? `${product.priceRangeV2.minVariantPrice.amount} ${product.priceRangeV2.minVariantPrice.currencyCode}`
                        : `${product.priceRangeV2.minVariantPrice.amount}-${product.priceRangeV2.maxVariantPrice.amount} ${product.priceRangeV2.minVariantPrice.currencyCode}`,
                    shippingTime: 'Not Available',
                }));
                setProducts(enhancedProducts);
                setFilteredProducts(enhancedProducts);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        let updatedProducts = [...products];

        if (searchQuery) {
            updatedProducts = updatedProducts.filter(product =>
                product.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (categoryFilter !== 'All') {
            updatedProducts = updatedProducts.filter(product =>
                product.category === categoryFilter
            );
        }

        if (priceFilter !== 'All') {
            const [min, max] = priceFilter.split('-').map(Number);

            updatedProducts = updatedProducts.filter(product => {
                const [productMinStr, productMaxStr] = product.priceRange.split('-');
                const productMin = Number(productMinStr.replace(/[^0-9.]/g, ''));
                const productMax = productMaxStr ? Number(productMaxStr.replace(/[^0-9.]/g, '').split(' ')[0]) : Infinity;

                return productMin >= min && (!max || productMax <= max);
            });
        }

        if (availabilityFilter !== 'All') {
            updatedProducts = updatedProducts.filter(product =>
                availabilityFilter === 'In Stock' ? product.inventory > 0 : product.inventory === 0
            );
        }

        updatedProducts.sort((a, b) => {
            if (sortOption === 'title-asc') {
                return compareTitles(a.title, b.title, 'asc');
            }
            if (sortOption === 'title-desc') {
                return compareTitles(a.title, b.title, 'desc');
            }
            if (sortOption === 'price-asc') return a.price - b.price;
            if (sortOption === 'price-desc') return b.price - a.price;
            if (sortOption === 'date-added') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            return 0;
        });

        setFilteredProducts(updatedProducts);
    }, [searchQuery, sortOption, categoryFilter, priceFilter, availabilityFilter, products]);

    // Helper function to strip leading numbers and compare titles
    function compareTitles(titleA: string, titleB: string, order: string) {
        // Function to remove leading numbers from titles
        function stripLeadingNumbers(title: string) {
            return title.replace(/^\d+/g, ''); // Removes digits from the start of the title
        }

        // Remove leading numbers from both titles for character-based sorting
        const strippedA = stripLeadingNumbers(titleA);
        const strippedB = stripLeadingNumbers(titleB);

        // Now compare the stripped titles lexicographically
        const result = strippedA.localeCompare(strippedB);

        // If sorting is descending, reverse the result
        return order === 'asc' ? result : -result;
    }

    const handleCardClick = (id: string) => {
        window.open(`/products/${id}`, '_blank');
    };

    const handleAddToMyProducts = async (productId: string) => {
        try {
            const { message } = await request<{ message: string }>({
                method: 'POST',
                url: '/products/save',
                data: { productId },
            });
            addToast(message, 'success');
        } catch (error: unknown) {
            if (typeof error === 'object' && error !== null && 'error' in error) {
                addToast(String(error.error), 'error');
            } else if (typeof error === 'string') {
                addToast(error, 'error');
            } else {
                addToast('An error occurred', 'error');
            }
            console.error('Failed to add product:', error);
        }
    };

    const buttonVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    };

    const cardVariants = {
        hover: { scale: 1.03, transition: { duration: 0.2 } },
    };

    const handleCategoryClick = (category: string) => {
        setCategoryFilter(category);
    };

    return (
        <div className="flex-1 p-6 lg:pl-8 lg:pr-8 lg:pt-8 lg:pb-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Find Products</h1>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full bg-white border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                />
            </div>

            {/* Category Row */}
            <div className="mb-6">
                <div className="grid grid-cols-6 gap-4">
                    <button
                        onClick={() => handleCategoryClick('All')}
                        className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${categoryFilter === 'All' ? 'border-blue-500 bg-gray-100 dark:bg-gray-800 text-blue-700 dark:text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Globe className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        <p className="text-sm mt-1 text-gray-900 dark:text-white">All</p>
                    </button>
                    <button
                        onClick={() => handleCategoryClick('Jewelry')}
                        className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${categoryFilter === 'Jewelry' ? 'border-blue-500 bg-gray-100 dark:bg-gray-800 text-blue-700 dark:text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Gem className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        <p className="text-sm mt-1 text-gray-900 dark:text-white">Jewelry</p>
                    </button>
                    <button
                        onClick={() => handleCategoryClick('Clothing')}
                        className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${categoryFilter === 'Clothing' ? 'border-blue-500 bg-gray-100 dark:bg-gray-800 text-blue-700 dark:text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Shirt className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        <p className="text-sm mt-1 text-gray-900 dark:text-white">Clothing</p>
                    </button>
                    <button
                        onClick={() => handleCategoryClick('Footwear')}
                        className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${categoryFilter === 'Footwear' ? 'border-blue-500 bg-gray-100 dark:bg-gray-800 text-blue-700 dark:text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <ShoppingBag className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        <p className="text-sm mt-1 text-gray-900 dark:text-white">Footwear</p>
                    </button>
                    <button
                        onClick={() => handleCategoryClick('Electronics')}
                        className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${categoryFilter === 'Electronics' ? 'border-blue-500 bg-gray-100 dark:bg-gray-800 text-blue-700 dark:text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Monitor className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        <p className="text-sm mt-1 text-gray-900 dark:text-white">Electronics</p>
                    </button>
                    <button
                        onClick={() => handleCategoryClick('Home')}
                        className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${categoryFilter === 'Home' ? 'border-blue-500 bg-gray-100 dark:bg-gray-800 text-blue-700 dark:text-white' : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <Home className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        <p className="text-sm mt-1 text-gray-900 dark:text-white">Home</p>
                    </button>
                </div>
            </div>

            {/* Filters (Fixed Header) */}
            <div className="mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md p-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Sort By */}
                    <div className="flex items-center space-x-4">
                        <label className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">Sort By:</label>
                        <Select value={sortOption} onValueChange={setSortOption}>
                            <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                                <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                                <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                                <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                                <SelectItem value="date-added">Newest Arrivals</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">Price Range:</label>
                        <Select value={priceFilter} onValueChange={setPriceFilter}>
                            <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Price Range" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <SelectItem value="All">All</SelectItem>
                                <SelectItem value="0-20">Under $20</SelectItem>
                                <SelectItem value="20-50">$20 - $50</SelectItem>
                                <SelectItem value="50-100">$50 - $100</SelectItem>
                                <SelectItem value="100-999">$100 and More</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="w-32 text-sm font-medium text-gray-700 dark:text-gray-300">Availability:</label>
                        <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                            <SelectTrigger className="w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500">
                                <SelectValue placeholder="Availability" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                <SelectItem value="All">All</SelectItem>
                                <SelectItem value="In Stock">In Stock</SelectItem>
                                <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <ProductSkeletonGrid />
            ) : filteredProducts.length === 0 ? (
                <p className="text-muted-foreground text-center">No products found.</p>
            ) : (
                <ProductGrid
                    products={filteredProducts}
                    onCardClick={handleCardClick}
                    onAddToMyProducts={handleAddToMyProducts}
                    cardVariants={cardVariants}
                    buttonVariants={buttonVariants}
                />
            )}
        </div>
    );
}
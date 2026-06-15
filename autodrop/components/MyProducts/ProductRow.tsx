'use client';

import VariantRow from '@/components/MyProducts/VariantRow';
import { Product, Variant } from '@/components/MyProducts/types';
import { Button } from '@/components/ui/button';
import { request } from '@/lib/api/handler';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, ChevronUp, MoreHorizontal } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useToast } from '../Toast';
import ProductTab from './ProductEditor/ProductTab';

interface ProductRowProps {
    product: Product;
    expanded: boolean;
    isSelected: boolean;
    selectedVariants: Record<string, Set<string>>;
    onToggleProduct: (productId: number) => void;
    onToggle: (productId: number) => void;
    onList?: (productId: string) => void;
    onSync?: (productId: string, status: boolean) => void;
    onRemove: (productId: string, status: boolean) => void;
    onUpdateVariant: (productId: number, variantId: string, updates: Partial<Variant>) => void;
    onSaveVariant: (productId: number, variantId: string) => void;
    onToggleVariant: (productId: number, variantId: string) => void;
    onOpenModal: (field: string) => void;
    isReadyToSyncTab: boolean;
    categories?: string[];
    onSelectCategory?: (productId: string, category: string) => void;
}

interface ProductForm {
    title: string;
    category: string;
    tags: string;
    shippingMethod: string;
    country: string;
    city: string;
    brand: string;
    stockMonitoring: boolean;
    priceMonitoring: boolean;
    autoOrder: boolean;
}

const ProductRow: React.FC<ProductRowProps> = ({
    product,
    expanded,
    isSelected,
    selectedVariants,
    onToggleProduct,
    onToggle,
    onList,
    onSync,
    onRemove,
    onUpdateVariant,
    onSaveVariant,
    onToggleVariant,
    onOpenModal,
    isReadyToSyncTab,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [suggestedCategories, setSuggestedCategories] = useState<
        { productId: number; suggestedId: string; suggestedName: string }[]
    >([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('Product');
    const [moreOptionsVisible, setMoreOptionsVisible] = useState(false);

    const { addToast } = useToast();

    // Static values for prototyping
    const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Sports'];
    const tags = ['New', 'Sale', 'Organic'];
    const shippingMethods = ['Standard', 'Express', 'Overnight'];
    const countries = ['United States', 'Canada', 'India', 'Germany'];
    const cities = ['New York', 'Toronto', 'Mumbai', 'Berlin'];
    const brands = ['Nike', 'Apple', 'Samsung', 'LG'];

    const initialData = {
        title: product.title,
        category: categories[0],
        tags: tags.join(', '),
        shippingMethod: shippingMethods[0],
        country: countries[0],
        city: cities[0],
        brand: brands[0],
        stockMonitoring: true,
        priceMonitoring: false,
        autoOrder: true,
    };

    // Form setup with react-hook-form
    const { handleSubmit } = useForm<ProductForm>({
        defaultValues: {
            title: product.title,
            category: categories[0],
            tags: tags.join(', '),
            shippingMethod: shippingMethods[0],
            country: countries[0],
            city: cities[0],
            brand: brands[0],
            stockMonitoring: true,
            priceMonitoring: false,
            autoOrder: true,
        },
    });

    useEffect(() => {
        // Simulate fetching categories for prototyping
        const fetchCategories = async () => {
            try {
                // Mock API response for prototyping
                const mockResponse = {
                    success: true,
                    data: categories.map((cat, index) => ({
                        productId: product.id,
                        suggestedId: `${index + 1}`,
                        suggestedName: cat,
                    })),
                };
                const response = mockResponse; // Replace with real request when API is available
                if (!response.data || response.data.length === 0) return;
                const filteredCategories = Array.isArray(response.data)
                    ? response.data.filter((item) => item.productId === Number(product.id))
                    : [];
                setSuggestedCategories(filteredCategories);
                const selected = filteredCategories.find(
                    (item) => Number(item.suggestedId) === product.category?.categoryId,
                );
                setSelectedCategory(selected ? selected.suggestedId : null);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setSelectedCategory(null);
            }
        };

        fetchCategories();
    }, []);

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

    const handleCategorySelect = (categoryId: string) => {
        if (selectedCategory === categoryId) {
            console.log(`Category ${categoryId} reselected for product ${product.id}`);
        } else {
            setSelectedCategory(categoryId);
        }
        setIsDropdownOpen(false);
    };

    const handleDeleteProduct = async (id: number) => {
        setLoading(true);
        try {
            // Mock API response for prototyping
            const response: {
                data: { result: string };
                message: string;
            } = await request({
                method: 'DELETE',
                url: `/products/delete_by_id?id=${id}`,
            })
            if (response.data.result === 'Error') addToast(response.message, 'error');
            else {
                addToast(response.message, 'success');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            addToast('Failed to delete product', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = async (category: {
        productId: number;
        suggestedId: string;
        suggestedName: string;
    }) => {
        try {
            // Mock API response for prototyping
            console.log('Creating category:', category);
            addToast('Category created successfully (prototype)', 'success');
        } catch (error) {
            console.error('Error creating category:', error);
            addToast('Failed to create category', 'error');
        }
    };

    // Placeholder form submission handler
    const onSubmit = (data: ProductForm) => {
        console.log('Product Form Data:', data);
        addToast('Product details saved (prototype)', 'success');
    };



    return (
        <div className="rounded-lg bg-surface shadow-md hover:shadow-lg transition-shadow duration-300 mb-4 border border-stroke dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center p-4 bg-subtle/10 dark:bg-gray-700/50">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleProduct(product.id)}
                    className="h-4 w-4 rounded border-stroke text-accent focus:ring-accent mr-4 dark:border-gray-600 dark:bg-gray-800"
                />
                <div className="flex-1 flex items-center gap-4 cursor-pointer" onClick={() => onToggle(product.id)}>
                    <div className="relative w-16 h-16">
                        <Image
                            src={product.imageUrl || 'https://via.placeholder.com/300'}
                            alt={product.title}
                            fill
                            className="object-cover rounded-md"
                        />
                    </div>
                    <div className="flex flex-col items-start justify-center flex-1">
                        <div className="flex items-center gap-2 w-full flex-wrap max-w-[600px]">
                            <h3 className="text-sm font-medium text-foreground truncate flex-1 dark:text-gray-200 max-w-fit">{product.title}</h3>
                            <div className="relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors rounded-md"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDropdown();
                                    }}
                                >
                                    <span className="text-xs">
                                        {suggestedCategories.find((cat) => cat.suggestedId === selectedCategory)?.suggestedName || 'Select Category'}
                                    </span>
                                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                                </Button>
                                <AnimatePresence>
                                    {isDropdownOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.2, ease: 'easeOut' }}
                                            className="absolute top-full left-0 mt-2 w-48 bg-surface border border-stroke rounded-lg shadow-lg z-[1000] overflow-hidden dark:bg-gray-800 dark:border-gray-700"
                                        >
                                            <ul className="py-1">
                                                {suggestedCategories.map((category) => (
                                                    <li
                                                        key={category.suggestedId}
                                                        className="px-4 py-2 text-sm text-foreground hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors flex items-center gap-2 dark:text-gray-200"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCategorySelect(category.suggestedId);
                                                            handleCreateCategory(category);
                                                        }}
                                                    >
                                                        {selectedCategory === category.suggestedId && <Check className="h-4 w-4 text-accent" />}
                                                        {category.suggestedName}
                                                    </li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {expanded && (
                                <Button
                                    size="sm"
                                    className="bg-accent text-white hover:bg-accent/90 ml-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleSubmit(onSubmit)();
                                    }}
                                >
                                    Save
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1 dark:text-gray-400">
                            <span>
                                {product.variants.length} Variant{product.variants.length !== 1 ? 's' : ''}
                            </span>
                            <a href={`/products/${product.formattedShopifyId}`} target="_blank" rel="noopener noreferrer" className="hover:underline text-muted-foreground dark:hover:text-gray-200">
                                View Source
                            </a>
                        </div>
                    </div>
                </div>
                <span
                    className={`px-2 py-1 text-xs font-medium rounded-full mr-4 ${isReadyToSyncTab ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}
                >
                    {isReadyToSyncTab ? 'Ready to Sync' : 'Linked'}
                </span>
                {!isReadyToSyncTab && (
                    <span
                        className={`px-2 py-1 text-xs font-medium rounded-full mr-4 ${!isReadyToSyncTab ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'}`}
                    >
                        {product.usesCustomConfig ? 'Custom Config' : 'Default Config'}
                    </span>
                )}
                <div className="relative group">
                    <MoreHorizontal onMouseEnter={() => setMoreOptionsVisible(true)} onMouseLeave={() => setMoreOptionsVisible(false)} className="h-5 w-5 cursor-pointer text-subtle dark:text-gray-400" />
                    {moreOptionsVisible && (
                        <div onMouseEnter={() => setMoreOptionsVisible(true)} onMouseLeave={() => setMoreOptionsVisible(false)} className="absolute bg-surface shadow-lg rounded-md p-2 right-0 top-full z-[1000] border border-stroke min-w-[120px] dark:bg-gray-800 dark:border-gray-700">
                            {!isReadyToSyncTab && onSync && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-left hover:bg-subtle text-black dark:text-gray-200 hover:bg-gray-500 dark:hover:bg-gray-700"
                                    onClick={() => onSync(product.formattedShopifyId, true)}
                                >
                                    Sync
                                </Button>
                            )}
                            {isReadyToSyncTab && onList && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-left hover:bg-subtle text-black dark:text-gray-200 hover:bg-gray-500 dark:hover:bg-gray-700"
                                    onClick={() => onList(product.formattedShopifyId)}
                                >
                                    List
                                </Button>
                            )}
                            <Button
                                loading={loading}
                                variant="ghost"
                                size="sm"
                                className="w-full text-left hover:bg-subtle text-black dark:text-gray-200 hover:bg-gray-500 dark:hover:bg-gray-700"
                                onClick={() => (isReadyToSyncTab ? onRemove(product.shopifyId, false) : handleDeleteProduct(product.id))}
                            >
                                Remove
                            </Button>
                        </div>
                    )}
                </div>
                {product.variants.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2 text-foreground hover:bg-subtle dark:text-gray-200 dark:hover:bg-gray-700"
                        onClick={() => onToggle(product.id)}
                    >
                        {expanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </Button>
                )}
            </div>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="overflow-hidden"
                    >
                        {/* Tabs Navigation */}
                        <div className="border-b border-stroke bg-muted/10 px-6 py-4 dark:bg-gray-700/50 dark:border-gray-600">
                            <div className="flex space-x-8 text-sm font-medium text-muted-foreground dark:text-gray-400">
                                {['Product', 'Description', `Variants (${product.variants.length})`, 'Item Specification'].map((tab) => (
                                    <button
                                        key={tab}
                                        className={cn(
                                            'pb-3 border-b-2 transition-colors duration-200',
                                            activeTab === tab ? 'border-accent text-accent' : 'border-transparent hover:text-foreground dark:hover:text-gray-200',
                                        )}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="max-h-[600px] p-6 bg-surface dark:bg-gray-800 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
                            {activeTab === 'Product' && (
                                <ProductTab
                                    productId={product.id}
                                    initialData={initialData}
                                    categories={categories}
                                    tags={tags}
                                    shippingMethods={shippingMethods}
                                    countries={countries}
                                    cities={cities}
                                    brands={brands}
                                />
                            )}
                            {activeTab === `Variants (${product.variants.length})` && (
                                <table className="w-full text-left flex-1">
                                    <thead>
                                        <tr className="text-subtle bg-muted/30 text-sm dark:bg-gray-700/50 dark:text-gray-400">
                                            <th className="p-4 w-12"></th>
                                            <th className="p-4">Variant</th>
                                            <th className="p-4">Original Price</th>
                                            <th
                                                className="p-4 cursor-pointer"
                                                onClick={() => !isReadyToSyncTab && onOpenModal('salesTax')}
                                            >
                                                Sales Tax ({product.salesTax}%)
                                            </th>
                                            <th
                                                className="p-4 cursor-pointer"
                                                onClick={() => !isReadyToSyncTab && onOpenModal('categoryFee')}
                                            >
                                                Category Fee ({product.categoryFee}%)
                                            </th>
                                            <th
                                                className="p-4 cursor-pointer"
                                                onClick={() => !isReadyToSyncTab && onOpenModal('fixedFee')}
                                            >
                                                Fixed Fee
                                            </th>
                                            <th className="p-4">Adjusted Price</th>
                                            <th
                                                className="p-4 cursor-pointer"
                                                onClick={() => !isReadyToSyncTab && onOpenModal('profitMargin')}
                                            >
                                                Profit Margin ({product.profitMargin}%)
                                            </th>
                                            <th className="p-4">Final Price</th>
                                            {!isReadyToSyncTab && <th className="p-4">Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {product.variants.map((variant) => (
                                            <VariantRow
                                                key={variant.id}
                                                variant={variant}
                                                productId={product.id}
                                                isSelected={selectedVariants[product.id]?.has(String(variant.id)) || false}
                                                onToggleVariant={onToggleVariant}
                                                onUpdate={onUpdateVariant}
                                                onSave={onSaveVariant}
                                                isEditable={isReadyToSyncTab}
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {activeTab === 'Description' && (
                                <div className="p-4">
                                    <p className="text-sm text-muted-foreground dark:text-gray-400">Description content placeholder.</p>
                                </div>
                            )}
                            {activeTab === 'Item Specification' && (
                                <div className="p-4">
                                    <p className="text-sm text-muted-foreground dark:text-gray-400">Item Specification content placeholder.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProductRow;
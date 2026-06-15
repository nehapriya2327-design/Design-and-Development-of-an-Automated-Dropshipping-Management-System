'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { motion } from 'framer-motion';
import { DollarSign, MapPin, Package, Star, Tag, Truck } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';

// Define ProductForm interface for form data
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

// Define ProductProps interface for component props
interface ProductProps {
    productId?: number;
    initialData: ProductForm;
    categories: string[];
    tags: string[];
    shippingMethods: string[];
    countries: string[];
    cities: string[];
    brands: string[];
}

// Animation variants for form fields and container
const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.4, ease: 'easeOut' },
    }),
};

const containerVariants = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

const ProductTab: React.FC<ProductProps> = ({
    initialData,
    categories,
    tags,
    shippingMethods,
    countries,
    cities,
    brands,
}) => {
    // Initialize react-hook-form
    const { control } = useForm<ProductForm>({
        defaultValues: initialData,
    });

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col space-y-6 min-h-fit p-6 bg-subtle/5 rounded-xl border border-transparent bg-clip-padding backdrop-filter backdrop-blur-sm dark:bg-gray-700/30 relative z-[1000] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
            style={{
                backgroundImage:
                    'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            }}
        >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Product Title and AI write */}
                <motion.div className='flex col-span-2 items-end gap-6' variants={containerVariants} initial="hidden" animate="visible">
                    <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible" className='w-[85%]'>
                        <label className="block text-sm font-medium text-foreground mb-2 dark:text-gray-200">Product Title</label>
                        <div className="relative flex items-center group">
                            <Controller
                                name="title"
                                control={control}
                                render={({ field }) => (
                                    <input
                                        {...field}
                                        className="min-w-full w-full h-10 bg-surface border border-stroke rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 dark:placeholder-opacity-60 transition-all duration-200 group-hover:shadow-md group-hover:border-accent/50"
                                        placeholder="Enter product title"
                                    />
                                )}
                            />
                            <Tag className="absolute right-3 h-4 w-4 text-muted-foreground dark:text-gray-400 transition-colors duration-200 group-hover:text-accent" />
                        </div>
                    </motion.div>
                    <motion.div>
                        <p className='cursor-pointer min-w-full w-full h-10 bg-surface border border-stroke rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 dark:placeholder-opacity-60 transition-all duration-200 group-hover:shadow-md group-hover:border-accent/50'>Optimize Title With AI</p>
                    </motion.div>
                </motion.div>


                {/* Category */}
                <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-foreground mb-2 dark:text-gray-200">Category</label>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="min-w-full w-full h-10 bg-surface border border-stroke rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 transition-all duration-200 hover:shadow-md hover:border-accent/50">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent
                                    className="bg-surface border border-stroke rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600 z-[10000]"
                                    position="popper"
                                >
                                    {categories.map((category) => (
                                        <SelectItem
                                            key={category}
                                            value={category}
                                            className="px-4 py-2 text-sm text-foreground hover:bg-subtle cursor-pointer dark:hover:bg-gray-700 dark:text-gray-200 transition-colors duration-200"
                                        >
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </motion.div>

                {/* Tags */}
                <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-foreground mb-2 dark:text-gray-200">Tags</label>
                    <Controller
                        name="tags"
                        control={control}
                        render={({ field }) => (
                            <div className="flex flex-col gap-3">
                                <div className="relative group">
                                    <input
                                        {...field}
                                        className="min-w-full w-full h-10 bg-surface border border-stroke rounded-lg px-4 py-2.5 text-sm text-foreground placeholder-muted-foreground placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:placeholder-gray-400 dark:placeholder-opacity-60 transition-all duration-200 group-hover:shadow-md group-hover:border-accent/50"
                                        placeholder="Enter tags separated by commas"
                                    />
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-accent/20 to-accent/10 text-accent dark:from-accent/30 dark:to-accent/15 transition-transform duration-200 hover:scale-105"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    />
                </motion.div>

                {/* Brand */}
                <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-foreground mb-2 dark:text-gray-200">Brand</label>
                    <Controller
                        name="brand"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="min-w-full w-full h-10 bg-surface border border-stroke rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 transition-all duration-200 hover:shadow-md hover:border-accent/50">
                                    <SelectValue placeholder="Select brand" />
                                </SelectTrigger>
                                <SelectContent
                                    className="bg-surface border border-stroke rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600 z-[10000]"
                                    position="popper"
                                >
                                    {brands.map((brand) => (
                                        <SelectItem
                                            key={brand}
                                            value={brand}
                                            className="px-4 py-2 text-sm text-foreground hover:bg-subtle cursor-pointer dark:hover:bg-gray-700 dark:text-gray-200 transition-colors duration-200"
                                        >
                                            {brand}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </motion.div>

                {/* Shipping Method */}
                <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-foreground mb-2 dark:text-gray-200">Shipping Method</label>
                    <Controller
                        name="shippingMethod"
                        control={control}
                        render={({ field }) => (
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="min-w-full w-full h-10 bg-surface border border-stroke rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 transition-all duration-200 hover:shadow-md hover:border-accent/50">
                                    <SelectValue placeholder="Select shipping method" />
                                </SelectTrigger>
                                <SelectContent
                                    className="bg-surface border border-stroke rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600 z-[10000]"
                                    position="popper"
                                >
                                    {shippingMethods.map((method) => (
                                        <SelectItem
                                            key={method}
                                            value={method}
                                            className="px-4 py-2 text-sm text-foreground hover:bg-subtle cursor-pointer dark:hover:bg-gray-700 dark:text-gray-200 transition-colors duration-200"
                                        >
                                            {method}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    />
                </motion.div>

                {/* Country */}
                <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-foreground mb-2 dark:text-gray-200">Country Location</label>
                    <div className="relative flex items-center group">
                        <Controller
                            name="country"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="min-w-full w-full h-10 bg-surface border border-stroke rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 transition-all duration-200 hover:shadow-md hover:border-accent/50">
                                        <SelectValue placeholder="Select country" />
                                    </SelectTrigger>
                                    <SelectContent
                                        className="bg-surface border border-stroke rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600 z-[10000]"
                                        position="popper"
                                    >
                                        {countries.map((country) => (
                                            <SelectItem
                                                key={country}
                                                value={country}
                                                className="px-4 py-2 text-sm text-foreground hover:bg-subtle cursor-pointer dark:hover:bg-gray-700 dark:text-gray-200 transition-colors duration-200"
                                            >
                                                {country}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <MapPin className="absolute right-3 h-4 w-4 text-muted-foreground dark:text-gray-400 transition-colors duration-200 group-hover:text-accent" />
                    </div>
                </motion.div>

                {/* City */}
                <motion.div custom={7} variants={fieldVariants} initial="hidden" animate="visible">
                    <label className="block text-sm font-medium text-foreground mb-2 dark:text-gray-200">Default City</label>
                    <div className="relative flex items-center group">
                        <Controller
                            name="city"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger className="min-w-full w-full h-10 bg-surface border border-stroke rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 transition-all duration-200 hover:shadow-md hover:border-accent/50">
                                        <SelectValue placeholder="Select city" />
                                    </SelectTrigger>
                                    <SelectContent
                                        className="bg-surface border border-stroke rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600 z-[10000]"
                                        position="popper"
                                    >
                                        {cities.map((city) => (
                                            <SelectItem
                                                key={city}
                                                value={city}
                                                className="px-4 py-2 text-sm text-foreground hover:bg-subtle cursor-pointer dark:hover:bg-gray-700 dark:text-gray-200 transition-colors duration-200"
                                            >
                                                {city}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <Package className="absolute right-3 h-4 w-4 text-muted-foreground dark:text-gray-400 transition-colors duration-200 group-hover:text-accent" />
                    </div>
                </motion.div>
            </div>

            {/* Monitoring Settings Heading */}
            <h4 className="text-lg font-semibold text-foreground mb-4 dark:text-gray-200">Monitoring Settings</h4>

            <div className="space-y-5">
                {/* Stock Monitoring */}
                <motion.div
                    custom={8}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex justify-between items-center p-3 bg-surface/50 rounded-lg dark:bg-gray-800/50 backdrop-filter backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02]"
                >
                    <div className="flex items-center gap-3">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-medium text-foreground dark:text-gray-200">Stock Monitoring</span>
                    </div>
                    <Controller
                        name="stockMonitoring"
                        control={control}
                        render={({ field }) => (
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer dark:bg-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600"></div>
                            </label>
                        )}
                    />
                </motion.div>

                {/* Price Monitoring */}
                <motion.div
                    custom={9}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex justify-between items-center p-3 bg-surface/50 rounded-lg dark:bg-gray-800/50 backdrop-filter backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02]"
                >
                    <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-medium text-foreground dark:text-gray-200">Price Monitoring</span>
                    </div>
                    <Controller
                        name="priceMonitoring"
                        control={control}
                        render={({ field }) => (
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer dark:bg-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600"></div>
                            </label>
                        )}
                    />
                </motion.div>

                {/* Auto Order */}
                <motion.div
                    custom={10}
                    variants={fieldVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex justify-between items-center p-3 bg-surface/50 rounded-lg dark:bg-gray-800/50 backdrop-filter backdrop-blur-sm transition-transform duration-200 hover:scale-[1.02]"
                >
                    <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-blue-500" />
                        <span className="text-sm font-medium text-foreground dark:text-gray-200">Auto Order</span>
                    </div>
                    <Controller
                        name="autoOrder"
                        control={control}
                        render={({ field }) => (
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={field.value}
                                    onChange={(e) => field.onChange(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer dark:bg-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-gray-600"></div>
                            </label>
                        )}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default ProductTab;
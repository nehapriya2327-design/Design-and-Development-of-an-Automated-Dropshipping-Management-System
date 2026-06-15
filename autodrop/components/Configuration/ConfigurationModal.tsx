'use client';

import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { yupResolver } from '@hookform/resolvers/yup';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';

// Mock user (replace with your auth system later)
const mockUser = { id: 1, name: 'Mukund Kumar' };

// Interface for eBay Category
interface EbayCategory {
    name: string;
    finalValueFee: string;
}

// Interface for Configuration
interface ConfigForm {
    category: string;
    salesTax: number;
    categoryFee: number;
    profitMargin: number;
}

// Validation Schema
const schema = yup.object({
    category: yup.string().required('Category is required'),
    salesTax: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? 0 : value))
        .min(0, 'Sales tax cannot be negative')
        .max(100, 'Sales tax cannot exceed 100%')
        .required('Sales tax is required'),
    categoryFee: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? 0 : value))
        .min(0, 'Category fee cannot be negative')
        .max(100, 'Category fee cannot exceed 100%')
        .required('Category fee is required'),
    profitMargin: yup
        .number()
        .transform((value, originalValue) => (originalValue === '' ? 0 : value))
        .min(0, 'Profit margin cannot be negative')
        .max(100, 'Profit margin cannot exceed 100%')
        .required('Profit margin is required')
        .default(6),
});

// Animation Variants
const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.2 } },
};

const errorVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.2 } },
};

interface ConfigurationModalProps {
    isOpen: boolean;
    onClose: () => void;
    categories: EbayCategory[];
    initialData?: ConfigForm;
    onSubmit: (data: ConfigForm) => Promise<void>;
}

export default function ConfigurationModal({
    isOpen,
    onClose,
    categories,
    initialData,
    onSubmit,
}: ConfigurationModalProps) {
    const [selectedCategory, setSelectedCategory] = useState<EbayCategory | null>(null);
    const [loading, setLoading] = useState(false);
    const { addToast } = useToast();

    // UseFomr hook for form handling
    const {
        register,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useForm<ConfigForm>({
        resolver: yupResolver(schema),
        defaultValues: initialData || { profitMargin: 6 }, // Default profit margin
    });

    // useEffect to handle modal open state and reset form
    useEffect(() => {
        if (!isOpen) {
            reset(); // Reset to default values when modal opens
        }
    }, [isOpen, reset]);

    // Set Values
    useEffect(() => {
        if (initialData) {
            reset(initialData);
            const matchedCategory = categories.find(c => c.name === initialData.category);
            setSelectedCategory(matchedCategory || null);
        } else {
            reset({ profitMargin: 6 }); // or whatever your default values are
        }
    }, [initialData, reset, categories]);

    const handleFormSubmit = async (data: ConfigForm) => {
        try {
            setLoading(true);
            await onSubmit(data);
            reset({ profitMargin: 6 });
            setLoading(false);
            onClose();
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : 'Failed to save configuration';
            addToast(errorMessage, 'error');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="bg-surface/80 backdrop-blur-md border border-border rounded-xl shadow-2xl p-8 w-full max-w-md"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-2xl font-semibold text-foreground mb-2">
                            {initialData ? 'Update Configuration' : 'Create Configuration'}
                        </h2>
                        <p className="text-sm text-muted-foreground mb-6">for {mockUser.name}</p>
                        <form onSubmit={handleSubmit(handleFormSubmit)} className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Category
                                </label>
                                <Select
                                    onValueChange={(value) => {
                                        setValue('category', value);
                                        const matched = categories.find(c => c.name === value);
                                        setSelectedCategory(matched || null);
                                    }}
                                    defaultValue={initialData?.category}
                                >
                                    <SelectTrigger
                                        className="bg-surface border-border focus:ring-2 focus:ring-primary rounded-md"
                                        aria-label="Select category"
                                    >
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-gray-100 dark:bg-gray-800 border-border rounded-md">
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.name}
                                                value={category.name}
                                                className="hover:bg-muted focus:bg-muted rounded-md"
                                            >
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <AnimatePresence>
                                    {errors.category && (
                                        <motion.p
                                            variants={errorVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            id="category-error"
                                            className="text-destructive text-sm mt-1"
                                            role="alert"
                                        >
                                            {errors.category.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Sales Tax (%)
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register('salesTax')}
                                    className={`bg-surface border-border focus:ring-2 focus:ring-primary rounded-md ${errors.salesTax ? 'border-destructive' : ''
                                        }`}
                                    placeholder="Enter sales tax"
                                    aria-invalid={errors.salesTax ? 'true' : 'false'}
                                    aria-describedby={errors.salesTax ? 'salesTax-error' : undefined}
                                />
                                {selectedCategory && (
                                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                        <p><span className="font-medium">Suggestion:</span> ~8.5% (Varies by buyer location. e.g., 6%-10%)</p>
                                    </div>
                                )}
                                <AnimatePresence>
                                    {errors.salesTax && (
                                        <motion.p
                                            variants={errorVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            id="salesTax-error"
                                            className="text-destructive text-sm mt-1"
                                            role="alert"
                                        >
                                            {errors.salesTax.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Category Fee (%)
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register('categoryFee')}
                                    className={`bg-surface border-border focus:ring-2 focus:ring-primary rounded-md ${errors.categoryFee ? 'border-destructive' : ''
                                        }`}
                                    placeholder="Enter category fee"
                                    aria-invalid={errors.categoryFee ? 'true' : 'false'}
                                    aria-describedby={errors.categoryFee ? 'categoryFee-error' : undefined}
                                />
                                {selectedCategory && (
                                    <div className="text-sm text-muted-foreground mt-2 space-y-1">
                                        <p><span className="font-medium">Suggesttion:</span> {selectedCategory.finalValueFee}</p>
                                    </div>
                                )}
                                <AnimatePresence>
                                    {errors.categoryFee && (
                                        <motion.p
                                            variants={errorVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            id="categoryFee-error"
                                            className="text-destructive text-sm mt-1"
                                            role="alert"
                                        >
                                            {errors.categoryFee.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-1">
                                    Profit Margin (%)
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...register('profitMargin')}
                                    className={`bg-surface border-border focus:ring-2 focus:ring-primary rounded-md ${errors.profitMargin ? 'border-destructive' : ''
                                        }`}
                                    placeholder="Enter profit margin"
                                    onBlur={(e) => {
                                        if (!e.target.value) setValue('profitMargin', 6);
                                    }}
                                    aria-invalid={errors.profitMargin ? 'true' : 'false'}
                                    aria-describedby={errors.profitMargin ? 'profitMargin-error' : undefined}
                                />
                                <AnimatePresence>
                                    {errors.profitMargin && (
                                        <motion.p
                                            variants={errorVariants}
                                            initial="hidden"
                                            animate="visible"
                                            exit="hidden"
                                            id="profitMargin-error"
                                            className="text-destructive text-sm mt-1"
                                            role="alert"
                                        >
                                            {errors.profitMargin.message}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={onClose}
                                    className="bg-surface border-border text-foreground hover:bg-muted rounded-md hover:scale-105 transition-transform"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    loading={loading}
                                    type="submit"
                                    className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-md hover:scale-105 transition-transform"
                                >
                                    {initialData ? 'Update' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
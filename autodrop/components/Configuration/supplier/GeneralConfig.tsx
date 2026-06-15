'use client';

import { cn } from '@/lib/utils'; // Utility for combining class names
import { Label } from '@radix-ui/react-label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@radix-ui/react-select';
import { Switch } from '@radix-ui/react-switch';
import { motion } from 'framer-motion';
import { useState } from 'react';

const weightUnits = ['kg', 'lb', 'oz', 'g'];

export default function GeneralSettings() {
    const [weightUnit, setWeightUnit] = useState(weightUnits[0]);
    const [autoSku, setAutoSku] = useState(false);
    const [minQuantity, setMinQuantity] = useState('');
    const [minShippingDays, setMinShippingDays] = useState('');

    const handleSave = () => {
        // Placeholder for save functionality
        console.log({
            weightUnit,
            autoSku,
            minQuantity,
            minShippingDays,
        });
        alert('Settings saved successfully!');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-4xl mx-auto p-4 sm:p-6 md:p-8 lg:p-10 bg-white dark:bg-gray-800 rounded-lg shadow-md min-h-screen md:min-h-0 flex flex-col"
        >
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">General</h2>

            {/* Default Weight Unit */}
            <div className="mb-6">
                <Label htmlFor="weight-unit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Default Weight Unit
                </Label>
                <Select value={weightUnit} onValueChange={(value) => setWeightUnit(value)}>
                    <SelectTrigger
                        id="weight-unit"
                        className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base flex items-center"
                    >
                        <SelectValue placeholder="Select weight unit">
                            {weightUnit || 'Select weight unit'}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto z-50">
                        {weightUnits.map((unit) => (
                            <SelectItem
                                key={unit}
                                value={unit}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer text-sm sm:text-base"
                            >
                                {unit}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Automatic SKU Filling */}
            <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
                <Label htmlFor="auto-sku" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Automatic SKU Filling
                </Label>
                <Switch
                    id="auto-sku"
                    checked={autoSku}
                    onCheckedChange={setAutoSku}
                    className={cn(
                        'relative inline-flex h-6 w-11 items-center rounded-full',
                        autoSku ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                    )}
                >
                    <span
                        className={cn(
                            'inline-block h-4 w-4 transform rounded-full bg-white transition',
                            autoSku ? 'translate-x-6' : 'translate-x-1'
                        )}
                    />
                </Switch>
            </div>

            {/* Monitoring Section */}
            <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Monitoring</h3>
                <div className="space-y-4">
                    {/* Minimum Product Quantity */}
                    <div>
                        <Label htmlFor="min-quantity" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Minimum Product Quantity
                        </Label>
                        <input
                            id="min-quantity"
                            type="number"
                            value={minQuantity}
                            onChange={(e) => setMinQuantity(e.target.value)}
                            className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            placeholder="Enter minimum quantity"
                        />
                    </div>
                    {/* Minimum Shipping Days */}
                    <div>
                        <Label htmlFor="min-shipping-days" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Minimum Shipping Days
                        </Label>
                        <input
                            id="min-shipping-days"
                            type="number"
                            value={minShippingDays}
                            onChange={(e) => setMinShippingDays(e.target.value)}
                            className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                            placeholder="Enter minimum shipping days"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button and Disclaimer */}
            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    These settings will only apply to new products.
                </p>
                <button
                    onClick={handleSave}
                    className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm sm:text-base"
                >
                    Save
                </button>
            </div>
        </motion.div>
    );
}
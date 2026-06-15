'use client';

import ConfigurationModal from '@/components/Configuration/ConfigurationModal';
import GeneralConfig from '@/components/Configuration/supplier/GeneralConfig';
import { useToast } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { ebayCategories } from '@/data';
import { request } from '@/lib/api/handler';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Mock user context (replace with your auth system)
const mockUser = { id: 1, name: 'Mukund Kumar' };

// Interface for Configuration
interface ConfigForm {
    id?: number;
    category: string;
    salesTax: number;
    categoryFee: number;
    profitMargin: number;
}

// Animation Variants
const tableRowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

export default function ConfigurationSection() {
    const { addToast } = useToast();
    const [configuration, setConfiguration] = useState<ConfigForm | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('Supplier Settings');
    const [activeSubTab, setActiveSubTab] = useState('Pricing Configuration');

    // Fetch user's configuration
    useEffect(() => {
        const fetchConfiguration = async () => {
            try {
                const configs = await request<ConfigForm[]>({
                    method: 'GET',
                    url: '/configurations',
                    headers: { 'X-User-Id': mockUser.id.toString() },
                });
                if (configs.length > 0) {
                    setConfiguration(configs[0]);
                }
            } catch (error) {
                console.log(error);
                addToast('Failed to fetch configuration', 'error');
            }
        };
        fetchConfiguration();
    }, [addToast]);

    // Handle form submission for Pricing Configuration
    const handleSubmit = async (data: ConfigForm) => {
        try {
            if (configuration) {
                // Update existing configuration
                await request<{ message: string }>({
                    method: 'PUT',
                    url: `/configurations?id=${configuration.id}`,
                    data: { ...data, userId: mockUser.id },
                    headers: { 'X-User-Id': mockUser.id.toString() },
                });
            } else {
                // Create new configuration
                await request<{ message: string }>({
                    method: 'POST',
                    url: '/configurations',
                    data: { ...data, userId: mockUser.id },
                    headers: { 'X-User-Id': mockUser.id.toString() },
                });
            }
            // Refresh configuration
            const configs = await request<ConfigForm[]>({
                method: 'GET',
                url: '/configurations',
                headers: { 'X-User-Id': mockUser.id.toString() },
            });
            setConfiguration(configs[0] || null);
            addToast(configuration ? 'Configuration updated successfully' : 'Configuration created successfully', 'success');
        } catch (error) {
            throw error; // Handled in ConfigurationModal
        }
    };

    const tabs = [
        'Supplier Settings',
        'Automations',
        'Templates',
        'Keywords',
        'Account & Billing',
        'User',
        'Notifications',
    ];

    const supplierSubTabs = [
        'Listing Configuration',
        'Pricing Configuration',
        'Order Configuration',
        'General',
    ];

    return (
        <div className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Configuration Settings</h1>

            {/* Main Tabs Navigation */}
            <div className="border-b border-stroke bg-muted/10 px-4 sm:px-6 py-4 dark:bg-gray-700/50 dark:border-gray-600">
                <div className="flex space-x-4 sm:space-x-8 text-xs sm:text-sm font-medium text-muted-foreground dark:text-gray-400 overflow-x-auto">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            className={cn(
                                'pb-3 border-b-2 transition-colors duration-200 whitespace-nowrap',
                                activeTab === tab ? 'border-accent text-accent' : 'border-transparent hover:text-foreground dark:hover:text-gray-200',
                            )}
                            onClick={() => {
                                setActiveTab(tab);
                                if (tab !== 'Supplier Settings') setActiveSubTab('');
                            }}
                        >
                            {tab}
                            {tab === 'Templates' || tab === 'User' ? ' (Optional)' : ''}
                        </button>
                    ))}
                </div>
            </div>

            {/* Supplier Settings Sub-Tabs */}
            <AnimatePresence>
                {activeTab === 'Supplier Settings' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="border-b border-stroke bg-muted/10 px-4 sm:px-6 py-4 dark:bg-gray-700/50 dark:border-gray-600"
                    >
                        <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm font-medium text-muted-foreground dark:text-gray-400 overflow-x-auto">
                            {supplierSubTabs.map((subTab) => (
                                <button
                                    key={subTab}
                                    className={cn(
                                        'pb-3 border-b-2 transition-colors duration-200 whitespace-nowrap',
                                        activeSubTab === subTab ? 'border-accent text-accent' : 'border-transparent hover:text-foreground dark:hover:text-gray-200',
                                    )}
                                    onClick={() => setActiveSubTab(subTab)}
                                >
                                    {subTab}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tab Content */}
            <motion.div
                key={activeTab + activeSubTab}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="mt-6 bg-surface/80 backdrop-blur-md rounded-xl shadow-md p-4 sm:p-6 z-0 dark:bg-gray-800 dark:border-gray-700"
            >
                {activeTab === 'Supplier Settings' && activeSubTab === 'Pricing Configuration' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                            Pricing Configuration
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-4">for {mockUser.name}</p>
                        {configuration ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-border">
                                    <thead>
                                        <tr className="bg-surface">
                                            <th className="border border-border p-3 text-left text-foreground font-medium">
                                                Category
                                            </th>
                                            <th className="border border-border p-3 text-left text-foreground font-medium">
                                                Sales Tax
                                            </th>
                                            <th className="border border-border p-3 text-left text-foreground font-medium">
                                                Category Fee
                                            </th>
                                            <th className="border border-border p-3 text-left text-foreground font-medium">
                                                Profit Margin
                                            </th>
                                            <th className="border border-border p-3 text-left text-foreground font-medium">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <motion.tr
                                            variants={tableRowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="hover:bg-muted"
                                        >
                                            <td className="border border-border p-3">{configuration.category}</td>
                                            <td className="border border-border p-3">
                                                {configuration.salesTax.toFixed(2)}%
                                            </td>
                                            <td className="border border-border p-3">
                                                {configuration.categoryFee.toFixed(2)}%
                                            </td>
                                            <td className="border border-border p-3">
                                                {configuration.profitMargin.toFixed(2)}%
                                            </td>
                                            <td className="border border-border p-3">
                                                <Button
                                                    onClick={() => setIsModalOpen(true)}
                                                    className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-md hover:scale-105 transition-transform"
                                                >
                                                    Update
                                                </Button>
                                            </td>
                                        </motion.tr>
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <Button
                                onClick={() => setIsModalOpen(true)}
                                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-md hover:scale-105 transition-transform"
                            >
                                Create Configuration
                            </Button>
                        )}
                        <div className="mt-8">
                            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">eBay Category Fees</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-border">
                                    <thead>
                                        <tr className="bg-surface">
                                            <th className="border border-border p-3 text-left text-foreground font-medium">
                                                Category
                                            </th>
                                            <th className="border border-border p-3 text-left text-foreground font-medium">
                                                Final Value Fee
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ebayCategories.map((category, index) => (
                                            <motion.tr
                                                key={category.name}
                                                variants={tableRowVariants}
                                                initial="hidden"
                                                animate="visible"
                                                transition={{ delay: index * 0.1 }}
                                                className="hover:bg-muted"
                                            >
                                                <td className="border border-border p-3">{category.name}</td>
                                                <td className="border border-border p-3">{category.finalValueFee}</td>
                                            </motion.tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'Supplier Settings' && activeSubTab === 'Listing Configuration' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">Listing Configuration</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Configure settings for product listings, such as title formats, image requirements, and description templates. (Placeholder)
                        </p>
                    </div>
                )}
                {activeTab === 'Supplier Settings' && activeSubTab === 'Order Configuration' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">Order Configuration</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Manage order processing settings, including shipping methods, fulfillment options, and return policies. (Placeholder)
                        </p>
                    </div>
                )}
                {activeTab === 'Supplier Settings' && activeSubTab === 'General' && (
                    <GeneralConfig />
                )}
                {activeTab === 'Automations' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">Automations</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Set up automation rules for product syncing, pricing adjustments, and order fulfillment. (Placeholder)
                        </p>
                    </div>
                )}
                {activeTab === 'Templates' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">Templates (Optional)</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Create and manage templates for product listings and descriptions. (Placeholder)
                        </p>
                    </div>
                )}
                {activeTab === 'Keywords' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">Keywords</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Configure keywords for product search optimization and marketing campaigns. (Placeholder)
                        </p>
                    </div>
                )}
                {activeTab === 'Account & Billing' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">Account & Billing</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Manage account details, billing information, and subscription plans. (Placeholder)
                        </p>
                    </div>
                )}
                {activeTab === 'User' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">User (Optional)</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Manage user profiles, permissions, and team settings. (Placeholder)
                        </p>
                    </div>
                )}
                {activeTab === 'Notifications' && (
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">Notifications</h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            Configure notification preferences for orders, sync status, and system alerts. (Placeholder)
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Configuration Modal for Pricing Configuration */}
            <ConfigurationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categories={ebayCategories}
                initialData={configuration!}
                onSubmit={handleSubmit}
            />
        </div>
    );
}
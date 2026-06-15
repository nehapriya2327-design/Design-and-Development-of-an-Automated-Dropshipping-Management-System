'use client';
import { motion } from 'framer-motion';
import React from 'react';

interface TabsNavigationProps {
    activeTab: 'import' | 'readyToSync' | 'ebay' | 'issues';
    setActiveTab: (tab: 'import' | 'readyToSync' | 'ebay' | 'issues') => void;
}

const tabButtonVariants = {
    inactive: { scale: 1, backgroundColor: 'transparent' },
    active: { scale: 1.05, backgroundColor: 'rgba(0, 0, 0, 0.1)' },
};

const TabsNavigation: React.FC<TabsNavigationProps> = ({ activeTab, setActiveTab }) => {
    return (
        <div className="flex items-center gap-4 mb-6 text-subtle font-medium">
            <motion.button
                variants={tabButtonVariants}
                animate={activeTab === 'import' ? 'active' : 'inactive'}
                className="px-4 py-2 rounded-md hover:text-foreground transition-colors"
                onClick={() => setActiveTab('import')}
            >
                Import List (6)
            </motion.button>
            <motion.button
                variants={tabButtonVariants}
                animate={activeTab === 'readyToSync' ? 'active' : 'inactive'}
                className="px-4 py-2 rounded-md hover:text-foreground transition-colors"
                onClick={() => setActiveTab('readyToSync')}
            >
                Ready to Sync (1)
            </motion.button>
            <motion.button
                variants={tabButtonVariants}
                animate={activeTab === 'ebay' ? 'active' : 'inactive'}
                className="px-4 py-2 rounded-md hover:text-foreground transition-colors"
                onClick={() => setActiveTab('ebay')}
            >
                eBay Listing (10)
            </motion.button>
            <motion.button
                variants={tabButtonVariants}
                animate={activeTab === 'issues' ? 'active' : 'inactive'}
                className="px-4 py-2 rounded-md hover:text-foreground transition-colors"
                onClick={() => setActiveTab('issues')}
            >
                Issues (2)
            </motion.button>
        </div>
    );
};

export default TabsNavigation;
'use client';
import BulkActionsBar from '@/components/MyProducts/BulkActionsBar';
import Pagination from '@/components/MyProducts/Pagination';
import ProductList from '@/components/MyProducts/ProductList';
import SearchAndSort from '@/components/MyProducts/SearchAndSort';
import { Product, Variant } from '@/components/MyProducts/types';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

interface ImportReadyTabsProps {
    activeTab: 'import' | 'readyToSync';
    products: Product[];
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    sortOption: 'title-asc' | 'title-desc' | 'sales-asc' | 'sales-desc';
    setSortOption: (option: 'title-asc' | 'title-desc' | 'sales-asc' | 'sales-desc') => void;
    selectedProducts: Set<number>;
    selectedVariants: Record<string, Set<string>>;
    selectedCount: number;
    expandedProducts: Set<string>;
    handleSelectAll: () => void;
    handleToggleProduct: (productId: number) => void;
    toggleProduct: (productId: number) => void;
    handleListProduct?: (productId: string) => void;
    handleSyncProduct?: (productId: string, status: boolean) => void;
    handleRemoveProduct: (productId: string, status: boolean) => void;
    handleUpdateVariant: (productId: number, variantId: string, updates: Partial<Variant>) => void;
    handleSaveVariant: (productId: number, variantId: string) => void;
    handleToggleVariant: (productId: number, variantId: string) => void;
    handleBulkList: () => void;
    handleBulkSync: () => void;
    handleBulkRemove: () => void;
    clearSelection: () => void;
    setModal: (modal: { field: string; productId: string } | null) => void;
    totalPages: number;
}

const ImportReadyTabs: React.FC<ImportReadyTabsProps> = ({
    activeTab,
    products,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    sortOption,
    setSortOption,
    selectedProducts,
    selectedVariants,
    selectedCount,
    expandedProducts,
    handleSelectAll,
    handleToggleProduct,
    toggleProduct,
    handleListProduct,
    handleSyncProduct,
    handleRemoveProduct,
    handleUpdateVariant,
    handleSaveVariant,
    handleToggleVariant,
    handleBulkList,
    handleBulkSync,
    handleBulkRemove,
    clearSelection,
    setModal,
    totalPages,
}) => {
    return (
        <motion.div className="space-y-4">
            <SearchAndSort
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                setCurrentPage={setCurrentPage}
                sortOption={sortOption}
                setSortOption={setSortOption}
            />
            <AnimatePresence>
                {selectedCount > 0 && (
                    <BulkActionsBar
                        selectedCount={selectedCount}
                        onBulkList={handleBulkList}
                        onBulkSync={handleBulkSync}
                        onBulkRemove={handleBulkRemove}
                        onClearSelection={clearSelection}
                        isReadyToSyncTab={activeTab === 'readyToSync'}
                    />
                )}
            </AnimatePresence>
            <ProductList
                products={products}
                expandedProducts={expandedProducts}
                selectedProducts={selectedProducts}
                selectedVariants={selectedVariants}
                handleSelectAll={handleSelectAll}
                handleToggleProduct={handleToggleProduct}
                toggleProduct={toggleProduct}
                handleListProduct={handleListProduct}
                handleSyncProduct={handleSyncProduct}
                handleRemoveProduct={handleRemoveProduct}
                handleUpdateVariant={handleUpdateVariant}
                handleSaveVariant={handleSaveVariant}
                handleToggleVariant={handleToggleVariant}
                setModal={setModal}
                isReadyToSyncTab={activeTab === 'readyToSync'}
            />
            <Pagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} />
        </motion.div>
    );
};

export default ImportReadyTabs;
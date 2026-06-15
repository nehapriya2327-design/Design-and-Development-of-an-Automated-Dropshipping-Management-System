'use client';
import ProductRow from '@/components/MyProducts/ProductRow';
import { Product, Variant } from '@/components/MyProducts/types';
import { CalendarClock, Expand, History, PencilLine, Sparkles, Trash2, UploadCloud } from 'lucide-react';
import React from 'react';

interface ProductListProps {
    products: Product[];
    expandedProducts: Set<string>;
    selectedProducts: Set<number>;
    selectedVariants: Record<string, Set<string>>;
    handleSelectAll: () => void;
    handleToggleProduct: (productId: number) => void;
    toggleProduct: (productId: number) => void;
    handleListProduct?: (productId: string) => void;
    handleSyncProduct?: (productId: string, status: boolean) => void;
    handleRemoveProduct: (productId: string, status: boolean) => void;
    handleUpdateVariant: (productId: number, variantId: string, updates: Partial<Variant>) => void;
    handleSaveVariant: (productId: number, variantId: string) => void;
    handleToggleVariant: (productId: number, variantId: string) => void;
    setModal: (modal: { field: string; productId: string } | null) => void;
    isReadyToSyncTab: boolean;
}

const ProductList: React.FC<ProductListProps> = ({
    products,
    expandedProducts,
    selectedProducts,
    selectedVariants,
    handleSelectAll,
    handleToggleProduct,
    toggleProduct,
    handleListProduct,
    handleSyncProduct,
    handleRemoveProduct,
    handleUpdateVariant,
    handleSaveVariant,
    handleToggleVariant,
    setModal,
    isReadyToSyncTab,
}) => {
    return (
        <div className="space-y-4 pt-4 relative">
            {/* Bulk Actions Toolbar */}
            <div className="flex flex-wrap items-center justify-between p-4 bg-muted/20 rounded-md shadow-sm border text-sm text-muted-foreground">
                {/* Left Section */}
                <div className="flex items-center gap-4 flex-wrap">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={selectedProducts.size === products.length && products.length > 0}
                            onChange={handleSelectAll}
                            className="h-4 w-4 rounded border-stroke text-accent focus:ring-accent"
                        />
                        <span className="font-medium">
                            {selectedProducts.size} Selected
                        </span>
                    </label>

                    <button className="flex items-center gap-1 hover:text-primary transition">
                        <PencilLine size={16} />
                        Bulk Edit
                    </button>

                    <span className="text-muted">|</span>

                    <button className="flex items-center gap-1 hover:text-destructive transition">
                        <Trash2 size={16} />
                        Remove
                    </button>

                    <span className="text-muted">|</span>

                    <button className="flex items-center gap-1 hover:text-blue-500 transition">
                        <UploadCloud size={16} />
                        Import All
                    </button>

                    <span className="text-muted">|</span>

                    <button className="flex items-center gap-1 hover:text-purple-500 transition">
                        <Sparkles size={16} />
                        AI Rewrite
                    </button>

                    <span className="text-muted">|</span>

                    <button className="flex items-center gap-1 hover:text-green-600 transition">
                        <CalendarClock size={16} />
                        Schedule
                    </button>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1 hover:text-muted-foreground transition">
                        <History size={16} />
                        View History
                    </button>

                    <button className="flex items-center gap-1 hover:text-muted-foreground transition">
                        <Expand size={16} />
                        Expand All
                    </button>
                </div>
            </div>
            {products.map((product) => (
                <ProductRow
                    key={product.id}
                    product={product}
                    expanded={expandedProducts.has(String(product.id))}
                    isSelected={selectedProducts.has(product.id)}
                    selectedVariants={selectedVariants}
                    onToggleProduct={handleToggleProduct}
                    onToggle={toggleProduct}
                    onList={isReadyToSyncTab ? handleListProduct : undefined}
                    onSync={isReadyToSyncTab ? undefined : handleSyncProduct}
                    onRemove={handleRemoveProduct}
                    onUpdateVariant={handleUpdateVariant}
                    onSaveVariant={handleSaveVariant}
                    onToggleVariant={handleToggleVariant}
                    onOpenModal={(field) => setModal({ field, productId: String(product.id) })}
                    isReadyToSyncTab={isReadyToSyncTab}
                />
            ))}
        </div>
    );
};

export default ProductList;
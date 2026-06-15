'use client';
import ConfirmationModal from '@/components/MyProducts/ConfirmationModal';
import EbayTable from '@/components/MyProducts/EbayTable';
import ImportReadyTabs from '@/components/MyProducts/ImportReadyTabs';
import IssuesTable from '@/components/MyProducts/IssuesTable';
import MyProductsSkeleton from '@/components/MyProducts/MyProductsSkeleton';
import NoProducts from '@/components/MyProducts/NoProducts';
import PercentageModal from '@/components/MyProducts/PercentageModal';
import TabsNavigation from '@/components/MyProducts/TabsNavigation';
import { Product, Variant } from '@/components/MyProducts/types';
import { useToast } from '@/components/Toast';
import { request } from '@/lib/api/handler';
import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';

const tabVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: 20, transition: { duration: 0.2, ease: 'easeIn' } },
};

const MyProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [activeTab, setActiveTab] = useState<'import' | 'readyToSync' | 'ebay' | 'issues'>('import');
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
    const [modal, setModal] = useState<{ field: string; productId: string } | null>(null);
    const [confirmationModal, setConfirmationModal] = useState<{
        title: string;
        message: string;
        action: () => void;
    } | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage] = useState<number>(10);
    const [sortOption, setSortOption] = useState<'title-asc' | 'title-desc' | 'sales-asc' | 'sales-desc'>('title-asc');
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
    const [selectedVariants, setSelectedVariants] = useState<Record<string, Set<string>>>({});
    const { addToast } = useToast();
    // For reload
    const [reload, setReload] = useState(0);

    useEffect(() => {
        const fetchMyProducts = async () => {
            try {
                const res = await request<{ data: Product[] }>({
                    method: 'GET',
                    url: '/products/all',
                });

                const enrichedData = res.data.map((product) => ({
                    ...product,
                    salesLast7Days: Math.floor(Math.random() * 10), // still mock data
                    issueDescription: Math.random() < 0.3 ? 'Sync error with Shopify' : undefined,
                }));

                setProducts(enrichedData);
            } catch (error) {
                addToast('Failed to load your products.', 'error');
                console.error('Error fetching my products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyProducts();
    }, [addToast, reload]);

    const handleRemoveProduct = async (productId: string, status: boolean) => {
        try {
            const res = await request<{ success: boolean; data: { alreadySynced: boolean }; message: string }>({
                method: 'PUT',
                url: '/products/readyToSync',
                data: { productId, status },
            });
            if (!res.success) throw new Error(res.message);

            addToast(res.message, 'success');
            setReload(prev => prev + 1);
        } catch (error) {
            console.error('Error removing product:', error);
            addToast('Failed to remove product.', 'error');
        }
    };

    const handleListProduct = async (shopifyId: string) => {
        try {
            const res = await request({
                method: 'POST',
                url: '/ebay/listing',
                data: { shopifyId },
            });
            // setProducts((prev) =>
            //     prev.map((product) => (product.id === productId ? { ...product, readyToSync: 0 } : product))
            // );
            addToast((res as { message: string }).message, 'success');
        } catch (error) {
            console.error('Error listing product:', error);
            addToast(
                error && typeof error === 'object' && 'message' in error
                    ? String((error as { message?: unknown }).message)
                    : 'Failed to list product.',
                'error'
            );
        }
    };

    const handleSyncProduct = async (productId: string, status: boolean) => {
        try {
            const res = await request<{ success: boolean; data: { alreadySynced: boolean }; message: string }>({
                method: 'PUT',
                url: '/products/readyToSync',
                data: { productId, status },
            });
            if (!res.success) throw new Error(res.message);
            addToast(res.message, 'success');
            setReload((prev) => prev + 1); // Trigger reload to fetch updated products
        } catch (error) {
            console.error('Error syncing product:', error);
            addToast('Failed to sync product.', 'error');
        }
    };

    const handleUpdateVariant = useCallback(
        (productId: number, variantId: string, updates: Partial<Variant>) => {
            setProducts((prev) =>
                prev.map((product) =>
                    product.id === +productId
                        ? {
                            ...product,
                            variants: product.variants.map((v) =>
                                String(v.id) === String(variantId) ? { ...v, ...updates } : v
                            ),
                        }
                        : product
                )
            );
        },
        []
    );

    // For single variant update
    const handleSaveVariant = async (productId: number, variantShopifyId: string) => {
        console.log("variantShopifyId", variantShopifyId)
        try {
            const product = products.find((p) => p.id === +productId);
            const variant = product?.variants.find((v) => v.shopifyId === variantShopifyId);
            if (!variant) return;
            await request({
                method: 'PATCH',
                url: '/products/update_variants',
                data: { variantId: variantShopifyId, updates: { ...variant } },
            });
            addToast('Variant updated successfully.', 'success');
        } catch (error) {
            console.error('Error updating variant:', error);
            addToast('Failed to update variant.', 'error');
        }
    };

    // For Multiple Variant Update
    // const handleSaveVariants = async (updates: Array<{ productId: string; variantShopifyId: string }>) => {
    //     try {
    //         const variants = updates.map(({ productId, variantShopifyId }) => {
    //             const product = products.find((p) => p.id === productId);
    //             const variant = product?.variants.find((v) => v.shopifyId === variantShopifyId);
    //             if (!variant) throw new Error(`Variant ${variantShopifyId} not found`);
    //             return { variantId: variantShopifyId, updates: { ...variant } };
    //         });
    //         await request({
    //             method: 'PATCH',
    //             url: '/api/user/products/variants',
    //             data: { variants },
    //         });
    //         addToast('Variants updated successfully.', 'success');
    //     } catch (error) {
    //         console.error('Error updating variants:', error);
    //         addToast('Failed to update variants.', 'error');
    //     }
    // };

    const handleApplyPercentage = (productId: string, field: string, value: number) => {
        setProducts((prev) =>
            prev.map((product) =>
                product.id === +productId
                    ? {
                        ...product,
                        variants: product.variants.map((variant) => ({
                            ...variant,
                            [field]: value,
                        })),
                    }
                    : product
            )
        );
    };

    const toggleProduct = (productId: number) => {
        setExpandedProducts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(productId.toString())) {
                newSet.delete(productId.toString());
            } else {
                newSet.add(productId.toString());
            }
            return newSet;
        });
    };

    const handleToggleProduct = (productId: number) => {
        setSelectedProducts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(+productId)) {
                newSet.delete(+productId);
                setSelectedVariants((prev) => {
                    const newVariants = { ...prev };
                    delete newVariants[productId];
                    return newVariants;
                });
            } else {
                newSet.add(+productId);
                setSelectedVariants((prev) => ({
                    ...prev,
                    [productId]: new Set(
                        (products.find((p) => p.id === +productId)?.variants.map((v) => String(v.id)) || [])
                    ),
                }));
            }
            return newSet;
        });
    };

    const handleToggleVariant = (productId: number, variantId: string) => {
        setSelectedVariants((prev) => {
            const productVariants = prev[productId] ? new Set(prev[productId]) : new Set<string>();
            if (productVariants.has(variantId)) {
                productVariants.delete(variantId);
            } else {
                productVariants.add(variantId);
            }
            const updatedVariants = { ...prev, [productId]: productVariants };
            if (productVariants.size === 0) {
                setSelectedProducts((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(+productId);
                    return newSet;
                });
            } else if (!selectedProducts.has(+productId)) {
                setSelectedProducts((prev) => new Set(prev).add(+productId));
            }
            return updatedVariants;
        });
    };

    const handleSelectAll = () => {
        if (selectedProducts.size === filteredProducts.length) {
            setSelectedProducts(new Set());
            setSelectedVariants({});
        } else {
            const newSelectedProducts = new Set(filteredProducts.map((p) => p.id));
            const newSelectedVariants = filteredProducts.reduce(
                (acc, product) => {
                    acc[product.id] = new Set(product.variants.map((v) => String(v.id)));
                    return acc;
                },
                {} as Record<string, Set<string>>
            );
            setSelectedProducts(newSelectedProducts);
            setSelectedVariants(newSelectedVariants);
        }
    };

    const handleBulkList = () => {
        setConfirmationModal({
            title: 'Confirm Bulk Listing',
            message: `Are you sure you want to list ${selectedCount} item(s)?`,
            action: async () => {
                try {
                    const promises = Array.from(selectedProducts).flatMap((productId) =>
                        Array.from(selectedVariants[productId] || []).map((variantId) =>
                            request({
                                method: 'POST',
                                url: '/api/user/products/list',
                                data: { productId, variantId },
                            })
                        )
                    );
                    await Promise.all(promises);
                    // setProducts((prev) =>
                    //     prev.map((product) => (selectedProducts.has(product.id) ? { ...product, readyToSync: 0 } : product))
                    // );
                    addToast(`${selectedCount} item(s) listed successfully.`, 'success');
                    setSelectedProducts(new Set());
                    setSelectedVariants({});
                } catch (error) {
                    console.error('Error bulk listing:', error);
                    addToast('Failed to list items.', 'error');
                }
                setConfirmationModal(null);
            },
        });
    };

    const handleBulkSync = () => {
        setConfirmationModal({
            title: 'Confirm Bulk Sync',
            message: `Are you sure you want to sync ${selectedCount} item(s)?`,
            action: async () => {
                try {
                    const promises = Array.from(selectedProducts).map((productId) =>
                        request({
                            method: 'POST',
                            url: '/api/user/products/sync',
                            data: { productId },
                        })
                    );
                    await Promise.all(promises);
                    // setProducts((prev) =>
                    //     prev.map((product) => (selectedProducts.has(product.id) ? { ...product, readyToSync: 1 } : product))
                    // );
                    addToast(`${selectedCount} item(s) marked as ready to sync.`, 'success');
                    setSelectedProducts(new Set());
                    setSelectedVariants({});
                } catch (error) {
                    console.error('Error bulk syncing:', error);
                    addToast('Failed to sync items.', 'error');
                }
                setConfirmationModal(null);
            },
        });
    };

    const handleBulkRemove = () => {
        setConfirmationModal({
            title: 'Confirm Bulk Removal',
            message: `Are you sure you want to remove ${selectedCount} item(s)?`,
            action: async () => {
                try {
                    const promises = Array.from(selectedProducts).map((productId) =>
                        request({
                            method: 'DELETE',
                            url: '/api/user/products',
                            data: { productId },
                        })
                    );
                    await Promise.all(promises);
                    setProducts((prev) => prev.filter((product) => !selectedProducts.has(product.id)));
                    setSelectedProducts(new Set());
                    setSelectedVariants({});
                    addToast(`${selectedCount} item(s) removed successfully.`, 'success');
                } catch (error) {
                    console.error('Error bulk removing:', error);
                    addToast('Failed to remove items.', 'error');
                }
                setConfirmationModal(null);
            },
        });
    };

    const clearSelection = () => {
        setSelectedProducts(new Set());
        setSelectedVariants({});
    };

    const filteredProducts = useMemo(() => {
        let result = products.filter((product) =>
            product.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (activeTab === 'import') {
            result = result.filter((product) => product.readyToSync === false);
            console.log('Filtered import products:', result);
            console.log("products:", products);
        } else if (activeTab === 'readyToSync') {
            result = result.filter((product) => product.readyToSync === true);
        }

        result.sort((a, b) => {
            switch (sortOption) {
                case 'title-asc':
                    return a.title.localeCompare(b.title);
                case 'title-desc':
                    return b.title.localeCompare(a.title);
                case 'sales-asc':
                    return (a.salesLast7Days || 0) - (b.salesLast7Days || 0);
                case 'sales-desc':
                    return (b.salesLast7Days || 0) - (a.salesLast7Days || 0);
                default:
                    return 0;
            }
        });

        const selected = result.filter((p) => selectedProducts.has(p.id));
        const unselected = result.filter((p) => !selectedProducts.has(p.id));
        return [...selected, ...unselected];
    }, [products, searchQuery, sortOption, selectedProducts, activeTab]);

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );
    const selectedCount = Array.from(selectedProducts).reduce(
        (count, productId) => count + (selectedVariants[productId]?.size || 0),
        0
    );

    if (loading) {
        return <MyProductsSkeleton count={10} />;
    }

    if (products.length === 0) {
        return <NoProducts />;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-foreground">My Products ({products.length})</h1>
            <div className="border border-stroke p-4 rounded bg-surface shadow-md">
                <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
                <AnimatePresence mode="wait">
                    {(activeTab === 'import' || activeTab === 'readyToSync') && (
                        <motion.div
                            key={activeTab}
                            variants={tabVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <ImportReadyTabs
                                activeTab={activeTab}
                                products={paginatedProducts}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                currentPage={currentPage}
                                setCurrentPage={setCurrentPage}
                                sortOption={sortOption}
                                setSortOption={setSortOption}
                                selectedProducts={selectedProducts}
                                selectedVariants={selectedVariants}
                                selectedCount={selectedCount}
                                expandedProducts={expandedProducts}
                                handleSelectAll={handleSelectAll}
                                handleToggleProduct={handleToggleProduct}
                                toggleProduct={toggleProduct}
                                handleListProduct={activeTab === 'readyToSync' ? handleListProduct : undefined}
                                handleSyncProduct={activeTab === 'import' ? handleSyncProduct : undefined}
                                handleRemoveProduct={handleRemoveProduct}
                                handleUpdateVariant={handleUpdateVariant}
                                handleSaveVariant={handleSaveVariant}
                                handleToggleVariant={handleToggleVariant}
                                handleBulkList={handleBulkList}
                                handleBulkSync={handleBulkSync}
                                handleBulkRemove={handleBulkRemove}
                                clearSelection={clearSelection}
                                setModal={setModal}
                                totalPages={totalPages}
                            />
                        </motion.div>
                    )}
                    {activeTab === 'ebay' && (
                        <motion.div
                            key="ebay"
                            variants={tabVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <EbayTable products={products} handleRemoveProduct={handleRemoveProduct} />
                        </motion.div>
                    )}
                    {activeTab === 'issues' && (
                        <motion.div
                            key="issues"
                            variants={tabVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <IssuesTable products={products} handleRemoveProduct={handleRemoveProduct} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {modal && (
                <PercentageModal
                    field={modal.field}
                    onApply={(value) => handleApplyPercentage(modal.productId, modal.field, value)}
                    onClose={() => setModal(null)}
                />
            )}
            {confirmationModal && (
                <ConfirmationModal
                    title={confirmationModal.title}
                    message={confirmationModal.message}
                    onConfirm={confirmationModal.action}
                    onCancel={() => setConfirmationModal(null)}
                />
            )}
        </div>
    );
};

export default MyProducts;
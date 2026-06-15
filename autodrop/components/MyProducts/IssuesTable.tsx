'use client';
import { Button } from '@/components/ui/button';
import { AlertCircle, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { Product } from './types';

interface IssuesTableProps {
    products: Product[];
    handleRemoveProduct: (productId: string, status: boolean) => void;
}

const IssuesTable: React.FC<IssuesTableProps> = ({ products, handleRemoveProduct }) => {
    const filteredProducts = products.filter((product) => product.issueDescription);

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="text-subtle bg-subtle/30">
                        <th className="p-4">Product</th>
                        <th className="p-4">Last 7 Days Sales</th>
                        <th className="p-4">Connection Status</th>
                        <th className="p-4">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredProducts.map((product) => (
                        <tr key={product.id} className="border-t border-stroke">
                            <td className="p-4">
                                <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-12">
                                        <Image
                                            src={product.imageUrl || 'https://via.placeholder.com/300'}
                                            alt={product.title}
                                            fill
                                            className="object-cover rounded-md"
                                        />
                                    </div>
                                    <span className="text-sm font-medium text-foreground truncate">{product.title}</span>
                                </div>
                            </td>
                            <td className="p-4">{product.salesLast7Days || 0} units</td>
                            <td className="p-4">
                                <div className="group relative">
                                    <span className="px-2 py-1 bg-red-500/20 text-red-500 text-xs font-medium rounded-full flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" />
                                        Issue
                                    </span>
                                    <div className="absolute hidden group-hover:block bg-surface shadow-lg rounded-md p-2 z-10 max-w-xs border border-stroke">
                                        <p className="text-sm text-subtle">{product.issueDescription}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-4">
                                <div className="relative group">
                                    <MoreVertical className="h-5 w-5 cursor-pointer text-subtle" />
                                    <div className="absolute hidden group-hover:block bg-surface shadow-lg rounded-md p-2 right-0 z-10 border border-stroke">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-left text-foreground hover:bg-subtle"
                                            onClick={() => handleRemoveProduct(String(product.id), false)}
                                        >
                                            Remove
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-left text-sm font-semibold text-foreground hover:bg-subtle"
                                        >
                                            View Details
                                        </Button>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default IssuesTable;
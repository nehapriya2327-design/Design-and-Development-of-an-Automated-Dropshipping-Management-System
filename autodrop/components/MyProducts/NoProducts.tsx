'use client';
import { Package } from 'lucide-react';
import React from 'react';

const NoProducts: React.FC = () => {
    return (
        <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-surface p-6 rounded-md shadow-md text-center max-w-md border border-stroke">
                <Package className="h-12 w-12 text-subtle mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">No Products Added</h2>
                <p className="text-subtle">
                    You haven’t added any products yet. Browse products and add them to your list!
                </p>
            </div>
        </div>
    );
};

export default NoProducts;
'use client';

import { Variant } from '@/components/MyProducts/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

const FIXED_FEE_LOW = 0.35;
const FIXED_FEE_HIGH = 0.45;
const FIXED_FEE_THRESHOLD = 10;

interface VariantRowProps {
    variant: Variant;
    productId: number;
    isSelected: boolean;
    onToggleVariant: (productId: number, variantId: string) => void;
    onUpdate: (productId: number, variantId: string, updates: Partial<Variant>) => void;
    onSave: (productId: number, variantId: string) => void;
    isEditable?: boolean;
}

const VariantRow: React.FC<VariantRowProps> = ({
    variant,
    productId,
    isSelected,
    onToggleVariant,
    onUpdate,
    onSave,
    isEditable = true,
}) => {
    const calculatePrices = (
        base: number,
        salesTax: number,
        categoryFee: number,
        fixedFee: number,
        profitMargin: number
    ): FeeCalculations => {
        const salesTaxAmount = base * (salesTax / 100);
        const categoryFeeAmount = (base + salesTaxAmount) * (categoryFee / 100);
        const adjustedPrice = base + salesTaxAmount + categoryFeeAmount + fixedFee;
        const profitMarginAmount = (adjustedPrice - salesTaxAmount) * (profitMargin / 100);
        const finalPrice = (adjustedPrice - salesTaxAmount) + profitMarginAmount;

        return {
            salesTaxAmount,
            categoryFeeAmount,
            adjustedPrice,
            profitMarginAmount,
            finalPrice,
            fixedFee, // ✅ Include fixedFee in return
        };
    };

    const basePrice = variant.price || 0;
    const salesTax = variant.salesTax ?? (basePrice <= 5 ? 7 : basePrice > 50 ? 10 : 8.5);
    const categoryFee = variant.categoryFee ?? (basePrice <= 10 ? 10 : basePrice > 100 ? 12 : 15);
    const fixedFee = variant.fixedFee ?? (basePrice <= FIXED_FEE_THRESHOLD ? FIXED_FEE_LOW : FIXED_FEE_HIGH);
    const profitMargin = variant.profitMargin ?? 0;

    const [localVariant, setLocalVariant] = useState<Variant>(() => {
        const { adjustedPrice, finalPrice } = calculatePrices(basePrice, salesTax, categoryFee, fixedFee, profitMargin);
        return {
            ...variant,
            salesTax,
            categoryFee,
            fixedFee,
            profitMargin,
            adjustedPrice,
            finalPrice,
        };
    });

    useEffect(() => {
        const { adjustedPrice, finalPrice } = calculatePrices(basePrice, salesTax, categoryFee, fixedFee, profitMargin);

        const isPriceChanged =
            adjustedPrice !== localVariant.adjustedPrice ||
            finalPrice !== localVariant.finalPrice ||
            profitMargin !== localVariant.profitMargin;

        if (!isPriceChanged) return;

        const updated = {
            ...variant,
            salesTax,
            categoryFee,
            fixedFee,
            profitMargin,
            adjustedPrice,
            finalPrice,
        };

        setLocalVariant(updated);

        onUpdate(productId, variant.id.toString(), {
            salesTax,
            categoryFee,
            fixedFee,
            profitMargin,
            adjustedPrice,
            finalPrice,
        });
    }, [
        basePrice,
        salesTax,
        categoryFee,
        fixedFee,
        profitMargin,
        localVariant.adjustedPrice,
        localVariant.finalPrice,
        localVariant.profitMargin,
        productId,
        variant,
        onUpdate
    ]);

    const {
        adjustedPrice: adj,
        finalPrice: fin,
        fixedFee: fee,
        salesTaxAmount,
        categoryFeeAmount,
        profitMarginAmount,
    } = calculatePrices(localVariant.price || 0, salesTax, categoryFee, fixedFee, profitMargin);

    return (
        <tr className="border-t border-stroke bg-subtle/10 hover:bg-subtle/20 transition-colors text-sm">
            <td className="p-4 w-12">
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleVariant(productId, variant.id.toString())}
                    className="h-4 w-4 rounded border-stroke text-accent focus:ring-accent"
                    disabled={isEditable}
                />
            </td>
            <td className="p-4">
                <div className="flex items-center gap-4">
                    <div className="relative w-10 h-10">
                        <Image
                            src={variant.imageUrl || 'https://via.placeholder.com/150'}
                            alt={variant.title}
                            fill
                            className="object-cover rounded-md"
                        />
                    </div>
                    <span className="text-foreground truncate max-w-xs">{variant.title}</span>
                </div>
            </td>
            <td className="p-4">${(localVariant.price || 0).toFixed(2)}</td>
            <td className="p-4">${salesTaxAmount.toFixed(2)}</td>
            <td className="p-4">${categoryFeeAmount.toFixed(2)}</td>
            <td className="p-4">${fee.toFixed(2)}</td>
            <td className="p-4">${adj.toFixed(2)}</td>
            <td className="p-4">${profitMarginAmount.toFixed(2)}</td>
            <td className="p-4">${fin.toFixed(2)}</td>
            {!isEditable && (
                <td className="p-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSave(productId, variant.shopifyId.toString())}
                        className="border-stroke text-accent hover:bg-accent/10"
                        disabled={isEditable}
                    >
                        Update
                    </Button>
                </td>
            )}
        </tr>
    );
};

export default VariantRow;

type FeeCalculations = {
    salesTaxAmount: number;
    categoryFeeAmount: number;
    adjustedPrice: number;
    profitMarginAmount: number;
    finalPrice: number;
    fixedFee: number;
};
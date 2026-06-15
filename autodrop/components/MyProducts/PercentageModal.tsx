'use client';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';

interface PercentageModalProps {
    field: string;
    onApply: (value: number) => void;
    onClose: () => void;
}

const PercentageModal: React.FC<PercentageModalProps> = ({ field, onApply, onClose }) => {
    const [value, setValue] = useState<string>('');

    const handleApply = () => {
        const numValue = Number(value);
        if (!isNaN(numValue) && numValue >= 0) {
            onApply(numValue);
            onClose();
        } else {
            alert('Please enter a valid number');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface text-foreground p-6 rounded-md shadow-lg max-w-sm w-full border border-stroke">
                <h3 className="text-lg font-semibold mb-4">Set {field} (%)</h3>
                <input
                    type="number"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
                    placeholder={`Enter ${field} percentage`}
                    className="w-full p-2 border-b rounded focus:border-b-2 border-stroke bg-surface text-foreground focus:outline-none"
                />
                <div className="flex gap-2 mt-4">
                    <Button onClick={handleApply} className="bg-accent text-white hover:bg-accent/90">
                        Apply
                    </Button>
                    <Button variant="outline" onClick={onClose} className="border-stroke text-foreground hover:bg-subtle">
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default PercentageModal;
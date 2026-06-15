'use client';
import { Button } from '@/components/ui/button';
import React from 'react';

interface ConfirmationModalProps {
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-surface text-foreground p-6 rounded-md shadow-lg max-w-sm w-full border border-stroke">
                <h3 className="text-lg font-semibold mb-4">{title}</h3>
                <p className="text-sm text-subtle mb-4">{message}</p>
                <div className="flex gap-2">
                    <Button onClick={onConfirm} className="bg-accent text-white hover:bg-accent/90">
                        Confirm
                    </Button>
                    <Button variant="outline" onClick={onCancel} className="border-stroke text-foreground hover:bg-subtle">
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
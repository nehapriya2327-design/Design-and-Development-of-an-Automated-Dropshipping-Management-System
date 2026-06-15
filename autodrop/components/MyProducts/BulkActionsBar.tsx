'use client';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import React from 'react';

interface BulkActionsBarProps {
    selectedCount: number;
    onBulkList: () => void;
    onBulkSync: () => void;
    onBulkRemove: () => void;
    onClearSelection: () => void;
    isReadyToSyncTab: boolean;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
    selectedCount,
    onBulkList,
    onBulkSync,
    onBulkRemove,
    onClearSelection,
    isReadyToSyncTab,
}) => (
    <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-0 left-0 right-0 bg-surface border-b border-stroke p-4 shadow-md z-[2000] flex items-center justify-between"
    >
        <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground">{selectedCount} items selected</span>
            {isReadyToSyncTab ? (
                <Button onClick={onBulkList} className="bg-accent text-white hover:bg-accent/90">
                    List Selected
                </Button>
            ) : (
                <Button onClick={onBulkSync} className="bg-accent text-white hover:bg-accent/90">
                    Sync Selected
                </Button>
            )}
            <Button onClick={onBulkRemove} variant="outline" className="border-stroke text-foreground hover:bg-subtle">
                Remove Selected
            </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={onClearSelection} className="text-foreground hover:bg-subtle">
            <X className="h-5 w-5" />
        </Button>
    </motion.div>
);

export default BulkActionsBar;
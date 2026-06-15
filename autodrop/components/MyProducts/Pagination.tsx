'use client';
import { Button } from '@/components/ui/button';
import React from 'react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    setCurrentPage: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, setCurrentPage }) => {
    if (totalPages <= 1) return null;

    // Calculate the range of page buttons to display (max 5 buttons)
    const maxButtons = 5;
    const startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons - 1);
    const adjustedStartPage = Math.max(1, endPage - maxButtons + 1);
    const pageNumbers = Array.from(
        { length: endPage - adjustedStartPage + 1 },
        (_, i) => adjustedStartPage + i
    );

    return (
        <div className="flex justify-center items-center gap-2 mt-4">
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="border-stroke text-foreground hover:bg-subtle"
            >
                Previous
            </Button>
            {pageNumbers.map((page) => (
                <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? 'bg-accent text-white' : 'border-stroke text-foreground hover:bg-subtle'}
                >
                    {page}
                </Button>
            ))}
            <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="border-stroke text-foreground hover:bg-subtle"
            >
                Next
            </Button>
        </div>
    );
};

export default Pagination;
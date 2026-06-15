'use client';
import { Search } from 'lucide-react';
import React from 'react';

interface SearchAndSortProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    setCurrentPage: (page: number) => void;
    sortOption: 'title-asc' | 'title-desc' | 'sales-asc' | 'sales-desc';
    setSortOption: (option: 'title-asc' | 'title-desc' | 'sales-asc' | 'sales-desc') => void;
}

const SearchAndSort: React.FC<SearchAndSortProps> = ({
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    sortOption,
    setSortOption,
}) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-subtle" />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="w-full pl-10 pr-4 py-2 border-b rounded focus:border-b-2 border-stroke bg-surface text-foreground focus:outline-none"
                />
            </div>
            <select
                value={sortOption}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSortOption(e.target.value as 'title-asc' | 'title-desc' | 'sales-asc' | 'sales-desc')
                }
                className="p-2 border-b rounded focus:border-b-2 border-stroke bg-surface text-foreground focus:outline-none"
            >
                <option value="title-asc">Title (A-Z)</option>
                <option value="title-desc">Title (Z-A)</option>
                <option value="sales-asc">Sales (Low to High)</option>
                <option value="sales-desc">Sales (High to Low)</option>
            </select>
        </div>
    );
};

export default SearchAndSort;
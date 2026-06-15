'use client';

import Sidebar from '@/components/products/Sidebar';
import { ToastProvider } from '@/components/Toast';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(false);

    // Detect screen size
    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <ToastProvider>
            <div className="flex min-h-screen bg-background ">
                {/* Sidebar */}
                <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                    isDesktop={isDesktop}
                />

                {/* Main Content */}
                <div
                    className={`flex-1 max-h-screen no-scrollbar overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800 ${isDesktop ? 'lg:pl-64' : 'p-6'
                        }`}
                >
                    {/* Mobile Sidebar Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden mb-4"
                        onClick={() => setIsSidebarOpen(true)}
                        aria-label="Open sidebar"
                    >
                        <svg
                            className="h-6 w-6 text-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </Button>

                    {children}
                </div>
            </div>
        </ToastProvider>
    );
}
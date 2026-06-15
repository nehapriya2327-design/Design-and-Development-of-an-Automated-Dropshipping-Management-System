'use client'
import { useTheme } from '@/app/ThemeProvider';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion } from 'framer-motion';
import { LogOut, Menu, Moon, Sun, User, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    };

    // Animation variants for nav links
    const linkVariants = {
        hover: { scale: 1.05, color: 'hsl(from var(--primary) h s l / 0.9)', transition: { duration: 0.2 } },
    };

    // Animation variants for mobile menu
    const menuVariants = {
        closed: { opacity: 0, x: '100%' },
        open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    };

    // Animation for theme switcher button
    const buttonVariants = {
        hover: { scale: 1.05 },
        tap: { scale: 0.95 },
    };

    const navItems = [
        { name: 'Dashboard', href: '/dashboard' },
        { name: 'Products', href: '/products' },
        { name: 'Orders', href: '/orders' },
        { name: 'AI Mapping', href: '/ai-mapping' },
        { name: 'Settings', href: '/settings' },
    ];

    return (
        <motion.nav
            className="bg-surface/90 backdrop-blur-sm shadow-md sticky top-0 z-50"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center space-x-2">
                            <Image
                                src="/images/logo.png" // Replace with your AutoDrop logo
                                alt="AutoDrop Logo"
                                width={32}
                                height={32}
                                className="object-contain"
                                priority
                            />
                            <motion.span
                                className="text-xl font-semibold text-primary"
                                variants={linkVariants}
                                whileHover="hover"
                            >
                                AutoDrop
                            </motion.span>
                        </Link>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navItems.map((item) => (
                            <motion.div key={item.name} variants={linkVariants} whileHover="hover">
                                <Link
                                    href={item.href}
                                    className="text-foreground hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                                >
                                    {item.name}
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Theme Switcher and Mobile Menu Trigger */}
                    <div className="flex items-center space-x-4">
                        <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                            <Button
                                variant="outline"
                                onClick={toggleTheme}
                                aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                                className="flex items-center space-x-2"
                            >
                                {theme === 'light' ? (
                                    <Moon className="h-5 w-5 text-foreground" />
                                ) : (
                                    <Sun className="h-5 w-5 text-foreground" />
                                )}
                                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                            </Button>
                        </motion.div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                    <User className="h-5 w-5 text-foreground" />
                                    <span className="sr-only">User menu</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-surface/90 backdrop-blur-sm">
                                <DropdownMenuItem asChild>
                                    <Link href="/profile" className="flex items-center space-x-2">
                                        <User className="h-4 w-4" />
                                        <span>Profile</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/logout" className="flex items-center space-x-2">
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </Link>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="md:hidden">
                                    <Menu className="h-5 w-5 text-foreground" />
                                    <span className="sr-only">Open menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-[240px] bg-surface/90 backdrop-blur-sm">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xl font-semibold text-primary">AutoDrop</span>
                                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                        <X className="h-5 w-5 text-foreground" />
                                    </Button>
                                </div>
                                <motion.div
                                    className="flex flex-col space-y-4"
                                    variants={menuVariants}
                                    initial="closed"
                                    animate="open"
                                >
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className="text-foreground hover:text-primary px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                    ))}
                                </motion.div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
"use client";

import { useTheme } from "@/app/ThemeProvider";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Brain,
  ChartArea,
  Moon,
  Search,
  Settings,
  Shirt,
  Sun,
  Truck,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isDesktop: boolean;
}

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  isDesktop,
}: SidebarProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  const sidebarItems = [
    { name: "Dashboard", href: "/dashboard", icon: ChartArea },
    { name: "Trending Products", href: "/zendrop/products", icon: Search },
    { name: "Find Products", href: "/products", icon: Search },
    { name: "Configuration", href: "/configuration", icon: Search },
    { name: "My Products", href: "/my-products", icon: Shirt },
    { name: "Orders", href: "/orders", icon: Truck },
    { name: "AI Mapping", href: "/ai-mapping", icon: Brain },
    { name: "Return/Refund Order", href: "/order-return", icon: Truck },
    { name: "Fulfillment", href: "/shopify-fulfillments", icon: Truck },
    { name: "Feedback", href: "/feedback", icon: Truck },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  // Animation variants for sidebar
  const sidebarVariants = {
    closed: {
      x: "-100%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    open: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  // Animation for theme switcher button
  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  // Backdrop animation for mobile
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5, transition: { duration: 0.3 } },
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && !isDesktop && (
        <motion.div
          className="fixed inset-0 bg-black z-30 lg:hidden"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={backdropVariants}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className="fixed inset-y-0 left-0 z-40 w-64 bg-surface/90 backdrop-blur-sm shadow-md border-r border-border h-screen"
        initial={{ x: "-100%", opacity: 0 }}
        animate={isSidebarOpen || isDesktop ? "open" : "closed"}
        variants={sidebarVariants}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="text-xl font-semibold text-primary">AutoDrop</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5 text-foreground" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>
        {/* Theme Switcher and Mobile Menu Trigger */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            style={{ width: "100%" }}
          >
            <Button
              variant="outline"
              onClick={toggleTheme}
              aria-label={
                theme === "light"
                  ? "Switch to dark theme"
                  : "Switch to light theme"
              }
              className="w-full flex items-center justify-start space-x-3 p-3 cursor-pointer transition-colors duration-200"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5 text-foreground" />
              ) : (
                <Sun className="h-5 w-5 text-foreground" />
              )}
              <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>
            </Button>
          </motion.div>
        </div>
        <nav className="p-4 space-y-2">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 p-3 rounded-md transition-colors duration-200 ${isActive
                    ? "bg-secondary text-primary border-l-4 border-primary"
                    : "text-foreground hover:bg-secondary hover:text-primary"
                  }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </motion.aside>
    </>
  );
}
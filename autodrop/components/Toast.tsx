'use client';

import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

// Define toast types
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
}

// Toast context
interface ToastContextType {
    addToast: (message: string, type: ToastType, duration?: number) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Toast Provider
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const addToast = useCallback((message: string, type: ToastType, duration = 5000) => {
        const id = Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-3">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <Toast key={toast.id} {...toast} onDismiss={removeToast} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

// Hook to use toast
export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

// Toast Component
interface ToastProps extends ToastMessage {
    onDismiss: (id: string) => void;
}

function Toast({ id, message, type, duration = 5000, onDismiss }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(id);
        }, duration);

        return () => clearTimeout(timer);
    }, [id, duration, onDismiss]);

    const icons = {
        success: <CheckCircle className="h-5 w-5 text-primary" />,
        error: <XCircle className="h-5 w-5 text-destructive" />,
        info: <Info className="h-5 w-5 text-accent" />,
        warning: <AlertTriangle className="h-5 w-5 text-muted-foreground" />,
    };

    const styles = {
        success: 'bg-surface/90 border-primary/20 text-primary',
        error: 'bg-surface/90 border-destructive/20 text-destructive',
        info: 'bg-surface/90 border-accent/20 text-accent',
        warning: 'bg-surface/90 border-muted/20 text-muted-foreground',
    };

    // Animation variants
    const toastVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
        exit: { opacity: 0, x: 50, transition: { duration: 0.2, ease: 'easeIn' } },
    };

    return (
        <motion.div
            className={`flex items-center space-x-3 p-4 rounded-md shadow-md backdrop-blur-sm max-w-sm w-full ${styles[type]}`}
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
        >
            <div className="flex-shrink-0">{icons[type]}</div>
            <p className="flex-1 text-sm">{message}</p>
            <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 text-foreground hover:bg-secondary"
                onClick={() => onDismiss(id)}
            >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </Button>
        </motion.div>
    );
}
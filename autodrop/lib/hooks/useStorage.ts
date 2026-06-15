import { useEffect, useState } from 'react';

type StorageType = 'local' | 'session';

export function useStorage<T>(key: string, type: StorageType = 'local') {
    const [storedValue, setStoredValue] = useState<T | null>(null);

    useEffect(() => {
        if (typeof window === 'undefined') return; // server guard

        const storage = type === 'local' ? window.localStorage : window.sessionStorage;

        try {
            const item = storage.getItem(key);
            setStoredValue(item ? JSON.parse(item) : null);
        } catch (error) {
            console.error(`Error reading storage key "${key}":`, error);
            setStoredValue(null);
        }
    }, [key, type]);

    const setValue = (value: T) => {
        if (typeof window === 'undefined') return;

        try {
            const storage = type === 'local' ? window.localStorage : window.sessionStorage;
            storage.setItem(key, JSON.stringify(value));
            setStoredValue(value);
        } catch (error) {
            console.error(`Error setting storage key "${key}":`, error);
        }
    };

    const remove = () => {
        if (typeof window === 'undefined') return;

        try {
            const storage = type === 'local' ? window.localStorage : window.sessionStorage;
            storage.removeItem(key);
            setStoredValue(null);
        } catch (error) {
            console.error(`Error removing storage key "${key}":`, error);
        }
    };

    return { storedValue, setValue, remove };
}

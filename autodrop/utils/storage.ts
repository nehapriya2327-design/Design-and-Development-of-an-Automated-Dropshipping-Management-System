type StorageType = 'local' | 'session';

class StorageHelper {
    private storage: Storage;

    constructor(type: StorageType = 'local') {
        this.storage = type === 'local' ? localStorage : sessionStorage;
    }

    set<T>(key: string, value: T): void {
        try {
            this.storage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Storage set error [${key}]`, error);
        }
    }

    get<T>(key: string): T | null {
        try {
            const item = this.storage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error(`Storage get error [${key}]`, error);
            return null;
        }
    }

    remove(key: string): void {
        try {
            this.storage.removeItem(key);
        } catch (error) {
            console.error(`Storage remove error [${key}]`, error);
        }
    }

    clear(): void {
        try {
            this.storage.clear();
        } catch (error) {
            console.error(`Storage clear error`, error);
        }
    }
}

export const local = new StorageHelper('local');
export const session = new StorageHelper('session');

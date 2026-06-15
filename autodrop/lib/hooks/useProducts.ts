import { fetchProducts } from '@/lib/api/products';
import { useEffect, useState } from 'react';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts()
            .then(setProducts)
            .finally(() => setLoading(false));
    }, []);

    return { products, loading, setProducts };
};

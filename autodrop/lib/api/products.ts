import axios from 'axios';

export const fetchProducts = async () => {
    const res = await axios.get('/api/products');
    return res.data;
};

export const updateTaxRate = async (productId: string, rate: number) => {
    return await axios.patch(`/api/products/${productId}/tax`, { rate });
};

export const updateVariant = async (variantId: string, updates: string) => {
    return await axios.patch(`/api/variants/${variantId}`, updates);
};

export const syncProduct = async (productId: string) => {
    return await axios.post(`/api/products/${productId}/sync`);
};

export const listProduct = async (productId: string) => {
    return await axios.post(`/api/products/${productId}/list`);
};

export const removeProduct = async (productId: string) => {
    return await axios.delete(`/api/products/${productId}`);
};

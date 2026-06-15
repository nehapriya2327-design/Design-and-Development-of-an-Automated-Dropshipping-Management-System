interface Endpoint {
    [key: string]: {
        method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
        url: string;
    }
}

export const ebayEndpoints: Endpoint = {
    get_category_suggestions: { method: 'GET', url: 'https://api.ebay.com/commerce/taxonomy/v1/category_tree/0/get_category_suggestions' },
}
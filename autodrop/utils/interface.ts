export interface LoginResponse {
    user: {
        id: number;
        email: string;
        role: string;
        name: string;
    };
    token: string;
    error: string | null;
}

export type InventoryData = {
    availability: {
        shipToLocationAvailability: {
            quantity: string | number;
        };
    };
    condition: string;
    product: {
        title: string;
        description: string;
        imageUrls: string[];
        aspects: { [key: string]: string[] };
        ean?: string[];
        mpn?: string[];
    };
    packageWeightAndSize: {
        dimensions: {
            height: string | number;
            length: string | number;
            width: string | number;
            unit: string;
        };
        weight: {
            value: string | number;
            unit: string;
        };
        packageType: string;
        shippingIrregular?: boolean;
    };
};
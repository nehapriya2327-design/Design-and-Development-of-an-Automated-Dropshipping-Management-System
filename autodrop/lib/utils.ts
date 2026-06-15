import { InventoryData } from "@/utils/interface";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function buildInventoryPayload(raw: InventoryData) {
  return {
    availability: {
      shipToLocationAvailability: {
        // quantity: typeof raw.availability.shipToLocationAvailability.quantity === "string"
        //   ? parseInt(raw.availability.shipToLocationAvailability.quantity)
        //   : raw.availability.shipToLocationAvailability.quantity,
        quantity: 10
      },
    },
    condition: raw.condition.toUpperCase(), // "NEW", "USED", etc.
    product: {
      title: raw.product.title,
      description: raw.product.description,
      aspects: raw.product.aspects,
      imageUrls: raw.product.imageUrls,
      ...(raw.product.ean ? { ean: raw.product.ean } : {}),
      ...(raw.product.mpn ? { mpn: raw.product.mpn } : {}),
    },
    packageWeightAndSize: {
      dimensions: {
        height: typeof raw.packageWeightAndSize.dimensions.height === "string"
          ? parseFloat(raw.packageWeightAndSize.dimensions.height)
          : raw.packageWeightAndSize.dimensions.height,
        length: typeof raw.packageWeightAndSize.dimensions.length === "string"
          ? parseFloat(raw.packageWeightAndSize.dimensions.length)
          : raw.packageWeightAndSize.dimensions.length,
        width: typeof raw.packageWeightAndSize.dimensions.width === "string"
          ? parseFloat(raw.packageWeightAndSize.dimensions.width)
          : raw.packageWeightAndSize.dimensions.width,
        unit: raw.packageWeightAndSize.dimensions.unit,
      },
      weight: {
        value: typeof raw.packageWeightAndSize.weight.value === "string"
          ? parseFloat(raw.packageWeightAndSize.weight.value)
          : raw.packageWeightAndSize.weight.value,
        unit: raw.packageWeightAndSize.weight.unit,
      },
      packageType: raw.packageWeightAndSize.packageType,
      ...(raw.packageWeightAndSize.shippingIrregular !== undefined
        ? { shippingIrregular: raw.packageWeightAndSize.shippingIrregular }
        : {}),
    },
  };
}
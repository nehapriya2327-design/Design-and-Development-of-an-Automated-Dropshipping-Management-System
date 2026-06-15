"use client";

import { useToast } from "@/components/Toast";
import { Button } from "@/components/ui/button";
import { request } from "@/lib/api/handler";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import sanitizeHtml from "sanitize-html";

interface Variant {
  id: string;
  title: string;
  price: string;
  formattedId?: string;
  inventory?: number;
  imageUrl?: string;
}

interface ProductDetail {
  formattedId: string;
  title: string;
  imageUrl: string;
  descriptionHtml: string;
  variants: Variant[];
  images?: { id: string; src: string; alt: string }[];
  body_html: string;
}

export default function ProductDetails() {
  const params = useParams();
  const id = params.id as string;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsViewMore, setNeedsViewMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Variant; direction: "asc" | "desc" } | null>(null);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await request<ProductDetail>({
          method: "GET",
          url: `/shopify/products/${id}`,
        });
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  useEffect(() => {
    if (contentRef.current) {
      const isOverflowing = contentRef.current.scrollHeight > 128;
      setNeedsViewMore(isOverflowing);
    }
  }, [product]);

  const sanitizedDescription = useMemo(() => {
    return sanitizeHtml(product?.descriptionHtml || "", {
      allowedTags: sanitizeHtml.defaults.allowedTags,
      allowedAttributes: {},
    });
  }, [product?.descriptionHtml]);

  const handleAddToMyProducts = async () => {
    if (!product?.formattedId || isAdding) return;
    setIsAdding(true);
    try {
      const { message } = await request<{ message: string }>({
        method: "POST",
        url: "/products/save-product",
        data: { productId: product.formattedId },
      });
      addToast(message, "success");
    } catch (error) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message: string }).message
          : "An error occurred";
      addToast(errorMessage, "error");
      console.error("Failed to add product:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const sortedVariants = useMemo(() => {
    if (!product?.variants) return [];
    const sorted = [...product.variants];
    if (sortConfig) {
      sorted.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (sortConfig.key === "price") {
          aValue = aValue || "0";
          bValue = bValue || "0";
          return sortConfig.direction === "asc"
            ? Number(aValue) - Number(bValue)
            : Number(bValue) - Number(aValue);
        }
        if (sortConfig.key === "inventory") {
          aValue = aValue || 0;
          bValue = bValue || 0;
          return sortConfig.direction === "asc"
            ? (aValue as number) - (bValue as number)
            : (bValue as number) - (aValue as number);
        }
        if (sortConfig.key === "title") {
          aValue = aValue || "";
          bValue = bValue || "";
          return sortConfig.direction === "asc"
            ? (aValue as string).localeCompare(bValue as string)
            : (bValue as string).localeCompare(aValue as string);
        }
        return 0;
      });
    }
    return sorted;
  }, [product?.variants, sortConfig]);

  const handleSort = (key: keyof Variant) => {
    setSortConfig((prev) =>
      prev?.key === key && prev.direction === "asc"
        ? { key, direction: "desc" }
        : { key, direction: "asc" }
    );
  };

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground animate-pulse">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return <div className="p-6 text-destructive">Product not found.</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-foreground">{product.title}</h1>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="flex flex-row space-x-4">
          <div className="w-20 flex flex-col space-y-2 max-h-96">
            {product.images && product.images.length > 1 && (
              product.images.map((img) => (
                <Image
                  key={img.id}
                  src={img.src}
                  alt={img.alt || product.title}
                  width={84}
                  height={84}
                  className="object-cover rounded-md cursor-pointer border border-gray-300 dark:border-gray-700 hover:border-primary"
                  onClick={() => setProduct({ ...product, imageUrl: img.src })}
                />
              ))
            )}
          </div>
          <div className="relative flex-1 min-h-96 rounded-md ">
            <Image
              src={product.imageUrl || "https://via.placeholder.com/300"}
              alt={product.title}
              fill
              loading="lazy"
              className="object-contain rounded-md overflow-hidden"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Product Description
            </h2>
            <div
              ref={contentRef}
              className={`text-sm md:text-base text-muted-foreground transition-all duration-300 ease-in-out ${isExpanded ? "h-auto" : "max-h-32 overflow-hidden"
                }`}
              dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
            />
            {needsViewMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-primary hover:underline text-sm cursor-pointer"
                aria-expanded={isExpanded}
              >
                {isExpanded ? "View Less" : "View More"}
              </button>
            )}
          </div>

          {product.variants?.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Variants</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm md:text-base border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th
                        className="p-3 border-b cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => handleSort("title")}
                      >
                        Title {sortConfig?.key === "title" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="p-3 border-b cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => handleSort("price")}
                      >
                        Price {sortConfig?.key === "price" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th
                        className="p-3 border-b cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                        onClick={() => handleSort("inventory")}
                      >
                        Inventory {sortConfig?.key === "inventory" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="p-3 border-b">Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedVariants.map((variant) => (
                      <tr
                        key={variant.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => variant.imageUrl && setProduct({ ...product, imageUrl: variant.imageUrl })}
                      >
                        <td className="p-3 border-b">{variant.title}</td>
                        <td className="p-3 border-b">${variant.price || "N/A"}</td>
                        <td className="p-3 border-b">{variant.inventory !== undefined ? variant.inventory : "N/A"}</td>
                        <td className="p-3 border-b">
                          {variant.imageUrl && (
                            <Image
                              src={variant.imageUrl}
                              alt={variant.title}
                              width={50}
                              height={50}
                              className="object-cover rounded"
                            />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <Button
            onClick={handleAddToMyProducts}
            disabled={isAdding}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            aria-label="Add to My Products"
          >
            {isAdding ? "Adding..." : "Add to My Products"}
          </Button>
        </div>
      </div>
    </div>
  );
}
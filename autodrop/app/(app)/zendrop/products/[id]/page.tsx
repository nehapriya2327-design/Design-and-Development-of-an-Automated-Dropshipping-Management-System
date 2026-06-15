"use client";


import { Button } from "@/components/ui/button";
import { request } from "@/lib/api/handler";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import LoaderButton from "@/components/Btn";
import Image from 'next/image';
import { useToast } from "@/components/Toast";

interface ApiResponse {
    status: string;
    is_supplier_active: boolean;
    data: {
      in_stock_notification: boolean;
      product: Product;
    };
    shippings: Shipping[];
    syncedProduct:{id:number}|null
  }
  
  interface Product {
    id: number;
    name: string;
    description: string;
    sku: string;
    inventory_tracking: boolean;
    base_selling_price: number | null;
    base_cost_price: string;
    base_profit_margin: string;
    product_type: string | null;
    featured_image: number;
    status: number;
    created_by: number;
    quotable: boolean | null;
    isPrivate: boolean;
    shipping_info: string;
    featured: number;
    supplier_id: number;
    supplier_fee: number;
    use_new_shipping: boolean;
    shipping_adapter: string;
    display_price: string;
    is_quoting: boolean;
    not_quotable: boolean;
    ready_for_quote: boolean;
    is_quoted: boolean;
    supplier: Supplier;
    product_variant: ProductVariant[];
    product_image: ProductImage[];
    featured_image_url: string;
    featuredProductImage: ProductImage;
    similar_product: string|null;
    shippingCountries: string[];
    tiktok_product_data: {
      is_available: boolean;
    };
    shipping_discount_rules: string[]|null;
  }
  
  interface Supplier {
    id: number;
    type: string;
    name: string;
    processing_time: string;
    is_disabled_marketplaces: boolean;
    user: {
      id: number;
    };
    country_info: CountryInfo;
    average_shipping_times: AverageShippingTime[];
  }
  
  interface CountryInfo {
    id: number;
    name: string;
    code: string;
    phonecode: number;
  }
  
  interface AverageShippingTime {
    id: number;
    supplier_id: number;
    country_code: string;
    average_days: number;
    updated_by: number;
    created_at: string;
    updated_at: string;
  }
  
  interface ProductVariant {
    id: number;
    product_id: number;
    variant_combination_id: number | null;
    variant_sku: string;
    variant_selling_price: string;
    variant_cost_price: number;
    variant_profit_margin: number;
    variant_size: string;
    variant_color: string;
    profit_percentage: number;
    variant_product_type: string;
    variant_weight: number;
    map: string;
    variant_inventory: number;
    variant_image: string;
    variant_image_info: {
      variant_image_url: string;
    };
    shipping_costs: ShippingCost[];
    originalCost: number | null;
    discount: number | null;
  }
  
  interface ShippingCost {
    variant_id: number;
    country_code: string;
    handling_fee: number;
    shipping_cost: number;
    shipping_profit_margin: number;
    variant_profit_margin: number;
    profit_percentage: number;
  }
  
  interface ProductImage {
    id: number;
    full_image: string;
    medium_image: string | null;
    small_image: string | null;
    webp_image: string;
    big?: string;
  }
  
  interface Shipping {
    product_id: number;
    variant_id: number;
    country_code: string;
    price: number;
    time: string;
    type: string;
    handling_fee: number;
  }
  
  interface ImportResponse {
    status: string|null;
    message: string|null;
    data: { id: number}|null;
  }

  interface UnlinkResponse {
    status: string|null;
    message: string|null;
    data: { id: number}|null;
  }
  

export default function ProductDetails() {

  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [productData, setProductData] = useState<ApiResponse | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsViewMore, setNeedsViewMore] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const [isClickable, setIsClickable] = useState(true);
  const [isSynced, setIsSynced] = useState(false);

  const [syncing, setSyncing] = useState(false);
  const [unlinking, setUnlinking] = useState(false);

  const { addToast } = useToast();
  

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await request<ApiResponse>({
          method: "GET",
          url: `/zendrop/products/${id}`,
        });
        setProductData(data);
        setProduct(data.data.product);

        if(data?.syncedProduct?.id){
          setIsClickable(false);
          setIsSynced(true);
        }

        if(data.is_supplier_active == false){
          setIsClickable(false);
        }

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
      const isOverflowing = contentRef.current.scrollHeight > 64;
      setNeedsViewMore(isOverflowing);
    }
  }, [product]);

  

  if (loading) {
    return (
      <div className="p-6 text-muted-foreground">
        Loading product details...
      </div>
    );
  }

  if (!product) {
    return <div className="p-6 text-destructive">Product not found.</div>;
  }

  const getShippingCost = (variantId:number) => {
    
    const shipping = productData?.shippings.find(s => s.variant_id === variantId);

    if(shipping){
        return shipping.price.toFixed(2);
    }

    return '';
  }


  const getTotalCost = (variant:ProductVariant) => {
    
    const shipping = productData?.shippings.find(s => s.variant_id === variant.id);

    if(shipping){
        return   (variant.variant_cost_price + variant.variant_profit_margin + shipping.price).toFixed(2);
    }

    return '';
  }



  const addToShopify = async (productId:number) => {
    
    setSyncing(true);
    setIsClickable(false);
    
    try {
      const resData = await request<ImportResponse>({
        method: "POST",
        url: `/zendrop/products/import`,
        data:{productId: productId}
      });

      if(resData?.data?.id){
        setIsSynced(true);
        addToast('Product added to store successfully.', "success");
      }
     
    } catch (error) {
      console.error("Error: ", error);
    } finally {
      setSyncing(false);
    }
    
  }


  const unlinkToShopify = async (productId:string) => {
    
    setUnlinking(true);
    
    
    try {
      const resData = await request<UnlinkResponse>({
        method: "POST",
        url: `/zendrop/products/unlink`,
        data:{productId: productId}
      });

      if(resData?.data?.id){
        setIsSynced(false);
        setIsClickable(true);
        addToast('Product unlink from store successfully.', "success");
      }
     
    } catch (error) {
      console.error("Error: ", error);
    } finally {
      setUnlinking(false);
    }
    
  }



  const imageChange = (img:string) => {
    setActiveImage(img);
  }

  return (
    <div className="p-6 w-full mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-foreground">
        {product.name}
      </h1>

      <div className="mb-5 text-right">
          { isClickable && <Button  className="bg-primary cursor-pointer text-primary-foreground" onClick={()=>{ addToShopify(product.id)}}> Add to Shopify Store </Button>}
          {syncing && <LoaderButton/>}
          { isSynced && <Button  className="bg-gray-300 text-black px-4 py-2 rounded cursor-not-allowed mx-2"> Product Linked </Button> }
          { isSynced && !unlinking && <Button  className="bg-primary cursor-pointer text-primary-foreground mx-2" onClick={()=>{unlinkToShopify(product.id.toString())}}> Unlink Product </Button> }
          {unlinking && <LoaderButton/>}

  
      </div>

      <div className="mb-6 flex flex-col md:flex-row items-start justify-between gap-6">
        <div className="relative md:w-1/3 w-full h-80 mx-auto">
          <div className="flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="md:w-1/4 w-full">
              {product.product_image.map((image, i)=>{
                return (<div key={i} className="mb-2" onClick={()=>{imageChange(image?.webp_image)}}><Image alt={product.name} width={75} height={75} src={`https://file.zendrop.com/product_images/${image?.webp_image}`} className="rounded-md"/></div>)
              })}
            </div>

            <div className="md:w-3/4 w-full">
              <Image
                src={`https://file.zendrop.com/product_images/${activeImage ? activeImage : product.product_image?.[0]?.webp_image}`}
                alt={product.name}
                className="object-contain rounded-md"
                width={300}
                height={300}
              />
            </div>
            
          </div>

        </div>


        <div className="w-full md:w-2/3">
          <div className="">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Product Description
            </h2>
            <div
              ref={contentRef}
              className={`text-sm md:text-lg text-muted-foreground transition-all duration-300 ease-in-out ${
                isExpanded ? "h-auto" : "h-14 overflow-hidden"
              }`}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
            {needsViewMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="mt-2 text-primary hover:underline text-sm cursor-pointer"
              >
                {isExpanded ? "View Less" : "View More"}
              </button>
            )}

            {/* Variants */}
            {product.product_variant?.length > 0 && (
              <div className="mb-6 mt-[50px]">
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Variants
                </h2>
                <table className="table w-full text-left">
                    <thead>
                        <tr className="bg-gray-100 dark:bg-gray-600">
                            <th className="px-4 py-2 border">Image</th> 
                            <th className="px-4 py-2 border">SKU</th> 
                            <th className="px-4 py-2 border">Variant</th> 
                            <th className="px-4 py-2 border">Product Cost</th> 
                            <th className="px-4 py-2 border">Shipping</th> 
                            <th className="px-4 py-2 border">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                    {product.product_variant.map((variant) => (
                    
                        <tr key={variant.id}>
                            <td className="px-4 py-2 border">
                              <Image
                              src={`https://file.zendrop.com/product_images/${variant.variant_image}`}
                              alt={product.name}
                              className="rounded-md"
                              width={75}
                              height={75}
                              />
                            </td>
                            <td className="px-4 py-2 border">{variant.variant_sku}</td>
                            <td className="px-4 py-2 border">{variant?.variant_color} / {variant?.variant_size}</td>
                            <td className="px-4 py-2 border">${(variant.variant_cost_price + variant.variant_profit_margin).toFixed(2)}</td>
                            <td className="px-4 py-2 border">${getShippingCost(variant.id)}</td>
                            <td className="px-4 py-2 border">${getTotalCost(variant)}</td>
                        </tr>
                    
                    ))}
                   </tbody>
                </table>
              </div>
            )}

            
          </div>
        </div>
      </div>
    </div>
  );
}

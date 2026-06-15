import axios, { AxiosError } from "axios";
import { zendropToken } from './zendropToken';
import prisma from "@/lib/prisma";
import { deleteShopifyProduct } from "./shopify";


interface TrendingResponse<T = unknown> {
    status: "success" | "error";
    data?: T;
    message?: string;
}


interface ProductResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  message?: string;
}


interface ApiResponse<T = unknown> {
  status: "success" | "error";
  data?: T;
  message?: string;
}


interface ImportData {
  id: number;
  product_id: number;
  status: number;
  us_shipping_type: string;
  international_shipping_type: string;
  express_shipping: boolean;
  product_type: string;
  current_import_status: string;
  is_imported: boolean;
  is_in_import_list: boolean;
  is_ready_to_import: boolean;
  is_adding_to_platform: boolean;
  is_error_in_import: boolean;
  is_importing: boolean;
  is_daily_limit_exceeded: boolean;
  product: Product;
}

interface Product {
  id: number;
  name: string;
  description: string;
  source: string | null;
  shipping_info: string;
  featured_image: number;
  supplier_id: number;
  product_type: number;
  shipping_adapter: string;
  featured_image_url: ImageUrl;
  display_price: string;
  is_quoting: boolean;
  not_quotable: boolean;
  ready_for_quote: boolean;
  is_quoted: boolean;
  product_meta: ProductMeta;
  product_variant: ProductVariant[];
  product_image: Image[];
  productcategoryrelation: ProductCategoryRelation[];
  supplier_details: SupplierDetails;
  shippingCountries: string[];
}

interface ImageUrl {
  id: number;
  webp_image: string;
  full_image: string;
  big: string;
}

interface ProductMeta {
  product_id: number;
  tags: string[] | null;
}

interface ProductVariant {
  id: number;
  product_id: number;
  variant_image_id: number;
  variant_cost_price: number;
  variant_selling_price: number | null;
  variant_weight: number | null;
  variant_product_type: string;
  variant_sku: string;
  variant_size: string | null;
  variant_color: string | null;
  variant_inventory: number;
  variant_profit_margin: number;
  profit_percentage: number;
  variant_image_url: ImageUrl;
}

interface Image {
  product_id: number;
  id: number;
  full_image: string;
  webp_image: string;
  big: string;
}

interface ProductCategoryRelation {
  category_id: number;
  product_id: number;
}

interface SupplierDetails {
  id: number;
  express_shipping: boolean;
  type: string;
  is_sumai_supplier: boolean;
  is_us_supplier: boolean;
}



interface VariantResult {
  id: number;
  sellingPrice: number;
}



interface ShippingEntry {
  product_id: number;
  variant_id: number;
  country_code: string;
  price: number;
  time: string;
  type: string;
  handling_fee: number;
}


interface VariantInterface {
  zendropId: number;
  zendropProductId: number;
  sku: string;
  costPrice: number;
  weight: number|null;
  size: string|null;
  color: string|null;
  inventory: number;
  profitMargin: number;
  profitPercentage: number;
  shippingprice: number;
  shippingTime: string;
  shippingType: string;
}

interface ZendropCategory {
  id: number;
  name: string;
  slug: string;
}



export async function fetchTrendingProducts(page:string): Promise<TrendingResponse> {
    try {
  
      const syncedProducts = await prisma.zendropProduct.findMany();

      const zendropIds = [];

      if(syncedProducts){
        for(const syncedProduct of syncedProducts){
          zendropIds.push(parseInt(syncedProduct.productId));
        }
      }

      const response = await axios.get(
        `https://app.zendrop.com/api/get-trending-products?page=${page}&webp=true`,
        {
          headers: {
            Authorization: `Bearer ${zendropToken}`,
            Accept: "application/json",
          },
        }
      );

   
      for(let i=0;  i <  response.data?.products?.length; i++){
          if(zendropIds.includes(response.data.products[i].id)){
            response.data.products[i].synced = 1;
          }else{
            response.data.products[i].synced = 0;
          }
      }
  
      return response.data ;
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        const axiosError = error as AxiosError;
  
        console.error( "zendrop Returns Error:",  axiosError.response?.data || axiosError.message );
  
        return {
          status: "error",
          message: axiosError.message || "Failed to fetch zendrop returns.",
        };
      } else {
        console.error("zendrop Returns Error:", error);
        return {
          status: "error",
          message: "Failed to fetch zendrop returns.",
        };
      }
    }
}




export async function fetchProductDetail(id: string): Promise<ProductResponse> {
  try {

    const response = await axios.post(
      `https://app.zendrop.com/api/get-product`, {id:id, webp:true}, 
      {
        headers: {
          Authorization: `Bearer ${zendropToken}`,
          Accept: "application/json",
        },
      }
    );


    const shippingRes = await axios.get(
      `https://app.zendrop.com/api/shipping/estimate-product?item_id=${id}&country_codes[]=us`, 
      {
        headers: {
          Authorization: `Bearer ${zendropToken}`,
          Accept: "application/json",
        },
      }
    );
    
    if(shippingRes.data){
      response.data.shippings = shippingRes.data.data || [];
    }

    const syncedProduct = await prisma.zendropProduct.findFirst({where:{ productId: id}});

    response.data.syncedProduct = syncedProduct; 

    return response.data ;
    
  } catch (error: unknown) {
    if (error instanceof Error) {
      const axiosError = error as AxiosError;

      console.error( "zendrop Returns Error:",  axiosError.response?.data || axiosError.message );

      return {
        status: "error",
        message: axiosError.message || "Failed to fetch zendrop returns.",
      };
    } else {
      console.error("zendrop Returns Error:", error);
      return {
        status: "error",
        message: "Failed to fetch zendrop returns.",
      };
    }
  }
}



export async function importProduct(productId: number): Promise<ApiResponse> {
  try {

    const response = await axios.post(
      `https://app.zendrop.com/api/stores/2551142/products/add-to-import-list`, {"id":productId, "user_id":3703800}, 
      {
        headers: {
          Authorization: `Bearer ${zendropToken}`,
          Accept: "application/json",
        },
      }
    );

    const shippingRes = await axios.get(
      `https://app.zendrop.com/api/shipping/estimate-product?item_id=${productId}&country_codes[]=us`, 
      {headers: {Authorization: `Bearer ${zendropToken}`,   Accept: "application/json",} }
    );

    if(response.data.status == 'success' && response.data.user_import_list && shippingRes?.data?.data?.length){

      const importId = response.data.user_import_list.id;
      const res = await axios.get(
        `https://app.zendrop.com/api/stores/2551142/get-single-import-list?id=${importId}&type=product`,
        { headers: { Authorization: `Bearer ${zendropToken}`,  Accept: "application/json", } }
      );


      if(!res?.data?.data){ 
          return {status:'error', message:"product not imported successfully."}
      }
      const productData:ImportData = res.data.data;

      const variants: VariantResult[] = [];
      const productVariants: VariantInterface[] = [];

      productData.product.product_variant.map((variant:ProductVariant)=>{
        
          const shiping = shippingRes.data.data.find((s:ShippingEntry) => s.variant_id === variant.id);

          if(shiping){
            const price = (variant.variant_cost_price + variant.variant_profit_margin + shiping.price);
            const sellPrice = parseFloat((price * 3.13).toFixed(2));

            if(sellPrice > 2){
                variants.push({"id":variant.id, "sellingPrice":sellPrice});

                productVariants.push({
                    zendropId : variant.id,
                    zendropProductId : productId,   
                    sku      : variant.variant_sku,                  
                    costPrice : variant.variant_cost_price,                 
                    weight   : variant.variant_weight,                   
                    size     : variant.variant_size,                   
                    color     : variant.variant_color,                  
                    inventory : variant.variant_inventory,              
                    profitMargin  : variant.variant_profit_margin,              
                    profitPercentage : variant.profit_percentage,       
                    shippingprice :     shiping.price,    
                    shippingTime : shiping.time,             
                    shippingType : shiping.type
                });
            }
            
          }
          
      });


      const categoryId = productData.product.productcategoryrelation[0].category_id;

      const category = await prisma.zendropCategory.findFirst({where:{zendropId:categoryId}});


      if(variants.length > 0 && category){
        const importRes = await axios.post(
          `https://app.zendrop.com/api/stores/2551142/products/import`, 
          {
            "importId":importId,
            "variants":variants,
            "description":productData.product.description,
            "tags":[],
            "productImagesToImport":[productData.product.featured_image],
            "collections":[{"id":category.zendropId,"name":category.name,"slug":category.slug,}],
            "customProductType":null,
            "customProductName":productData.product.name
          },
          {headers: {Authorization: `Bearer ${zendropToken}`,   Accept: "application/json",} }
        );



        if(importRes.status == 200 && importRes.statusText == 'OK'){

          const pdData = {
            productId  : `${productId}`,                
            importId    : `${importId}`,                 
            usShippingType  : productData.us_shipping_type,             
            internationalShippingType : productData.international_shipping_type,   
            importStatus  : productData.current_import_status,               
            featuredImage  : `${productData.product.featured_image}`,              
            productName    : productData.product.name,              
            description    : productData.product.description,              
            shippingInfo    : productData.product.shipping_info,             
            supplierId   : productData.product.supplier_id, 
            categotyId   :     categoryId    
          }

          const zendropProduct = await prisma.zendropProduct.create({data:pdData});

          if(zendropProduct){

            for(const variant of productVariants){


              const vrData = {
                productId: zendropProduct.id,
                zendropId    : variant.zendropId,
                zendropProductId : productId,   
                sku      : variant.sku,                  
                costPrice : `${variant.costPrice}`,                 
                weight   : `${variant.weight}`,                   
                size     : variant.size,                   
                color     : variant.color,                  
                inventory : variant.inventory,              
                profitMargin  : `${variant.profitMargin}`,              
                profitPercentage  : `${variant.profitPercentage}`,       
                shippingprice     : `${variant.shippingprice}`,       
                shippingTime      : `${variant.shippingTime}`,         
                shippingType      : `${variant.shippingType}`
              }

              await prisma.zendropVariation.create({data:vrData});

            }
            
            return {data:zendropProduct, status:'success', message:'Product added in store successfully.'}
          }
        }        

      }

  
    }

    return {status:"error", message:"something went wrong"};

  } catch (error: unknown) {
    if (error instanceof Error) {
      const axiosError = error as AxiosError;

      console.error( "zendrop Returns Error:",  axiosError.response?.data || axiosError.message );

      return {
        status: "error",
        message: axiosError.message || "Failed to fetch zendrop returns.",
      };
    } else {
      console.error("zendrop Returns Error:", error);
      return {
        status: "error",
        message: "Failed to fetch zendrop returns.",
      };
    }
  }
}









export async function fetchCategoriess() {
  try {

    const response = await axios.get(
      `https://app.zendrop.com/api/stores/2551142/get-collections-and-categories`,
      {
        headers: {
          Authorization: `Bearer ${zendropToken}`,
          Accept: "application/json",
        },
      }
    );

    const categories: ZendropCategory[] = response.data.categories;
 
    for(const category of categories){
        const data = {zendropId:category.id, name:category.name, slug:category.slug}
        await prisma.zendropCategory.create({data:data});
    }
    
  } catch (error: unknown) {
     
      console.error("zendrop Returns Error:", error);
  
  }
}


export async function fetchShopifyImports() {
  try {

    const zendropProducts = await prisma.zendropProduct.findMany({where:{ShopifyProductId:null}});

    if(zendropProducts){

      for(const zendropProduct of zendropProducts){

        const importRes = await axios.get(
          `https://app.zendrop.com/api/stores/2551142/import-lists?productIds[]=${zendropProduct.productId}`, 
          {headers: {Authorization: `Bearer ${zendropToken}`,   Accept: "application/json",} }
        );

        console.log('importRes', importRes.data);
        if(importRes.data && importRes.data.data?.length){
            for(const importData of importRes.data.data){
              if(importData.id == zendropProduct.importId){
                const shopifyProductId = importData.shopify_product_id;
                await prisma.zendropProduct.update({ where: {id: zendropProduct.id,}, data: { ShopifyProductId: shopifyProductId, },});
              }
              
            }
            return {data:[], status:'success',}
        }

      }

    }
    
    return {data:null, status:'error',}
    
  } catch (error: unknown) {
     
      console.error("Error:", error);
  
  }
}




export async function unlinkProduct(productId:string) {
  try {


    const zendropProduct = await prisma.zendropProduct.findFirst({where:{productId:productId}});


    const importRes = await axios.get(
      `https://app.zendrop.com/api/stores/2551142/import-lists?productIds[]=${productId}`, 
      {headers: {Authorization: `Bearer ${zendropToken}`,   Accept: "application/json",} }
    );


    const response = await axios.post(
      `https://app.zendrop.com/api/stores/2551142/products/remove-from-import-list`, {"id":zendropProduct?.importId}, 
      {
        headers: {
          Authorization: `Bearer ${zendropToken}`,
          Accept: "application/json",
        },
      }
    );

    if(importRes.data && importRes.data.data?.length){
      for(const importData of importRes.data.data){
        
        if(importData.id == zendropProduct?.importId){
          const shopifyProductId = importData.shopify_product_id;
          await deleteShopifyProduct(shopifyProductId);

        }
        
      }
    }

    if(response.status == 200){
      await prisma.zendropVariation.deleteMany({where:{productId:zendropProduct?.id}});
      const deletedProduct = await prisma.zendropProduct.delete({where:{id:zendropProduct?.id}});
        return {data:deletedProduct};
    }

    return {status:'error', message:'Product not unlink successfully.'}
    
  } catch (error: unknown) {
     
      console.error("zendrop Returns Error:", error);
  
  }
}

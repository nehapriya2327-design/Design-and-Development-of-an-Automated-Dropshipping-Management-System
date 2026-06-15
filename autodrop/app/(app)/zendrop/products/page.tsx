'use client';

import ProductSkeletonGrid from '@/components/products/ProductSkeletonGrid';
import { request } from '@/lib/api/handler';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { motion } from 'framer-motion';
import Image from 'next/image';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {  Search } from 'lucide-react';
import { useToast } from "@/components/Toast";

interface ZendropProducts {
    total: string;
    status: string;
    products: ZendropProduct[];
}

// Interface for Shopify Product
interface ZendropProduct {
    id: number;
    name: string;
    featured_image_url: string;
    display_price: number;
    synced:number;
}


interface ImportResponse {
    status: string|null;
    message: string|null;
    data: { id: number}|null;
}
  

export default function Products() {

    const [products, setProducts] = useState<ZendropProduct[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<ZendropProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOption, setSortOption] = useState('title-asc');
    const [priceRange, setPriceRange] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('0');
    const [activePage, setActivePage] = useState(1);

    const [syncing, setSyncing] = useState(0);
  
    const { addToast } = useToast();

    // Fetch products
    useEffect(() => {

        const fetchProducts = async (page:number) => {
            
            try {
                const res = await request<ZendropProducts>({
                    method: 'GET',
                    url: '/zendrop/products/trending?page=' + page,
                });
                setProducts(res.products);
              

                fetchMoreProducts(res.products);
            } catch (error) {
                console.error('Failed to fetch products:', error);
            } finally {
                setLoading(false);
            }
        };


        const fetchMoreProducts = async (current: ZendropProduct[]) => {
            try {

                let newProducts = [...current];
                for(let i=2; i<4; i++){

                    const res = await request<ZendropProducts>({
                        method: 'GET',
                        url: '/zendrop/products/trending?page=' + i,
                    });

                    newProducts = [...newProducts, ...res.products];
                }

                const trendingProducts = { products: newProducts, fetchTime: Date.now()}
                localStorage.setItem('trendingProducts', JSON.stringify(trendingProducts));

                setProducts(newProducts);

            } catch (error) {
                console.error('Failed to fetch products:', error);
            } 
        };


        const trendingProducts = localStorage.getItem('trendingProducts');

        if (trendingProducts) {
            const parsed = JSON.parse(trendingProducts);

            const now = Date.now();
            if(now - parsed.fetchTime < 300000 ){
                setProducts(parsed.products);
                setLoading(false);
            }else{
                fetchProducts(1);
            }

        } else {
            fetchProducts(1);
        }
    }, []);




    useEffect(() => {

        let updatedProducts = [...products];

        if (searchQuery) {
            updatedProducts = updatedProducts.filter(product =>
                product.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);

            updatedProducts = updatedProducts.filter(product => {
                return (product.display_price >= min && product.display_price <= max);
            });
        }

        updatedProducts.sort((a, b) => {
            if (sortOption === 'title-asc') return a.name.localeCompare(b.name);
            if (sortOption === 'title-desc') return b.name.localeCompare(a.name);
            return 0;
        });

        

        if(activePage == 1){
            updatedProducts = updatedProducts.slice(0, 40);
        }else if(activePage == 2){
            updatedProducts = updatedProducts.slice(40, 80);
        }else if(activePage == 3){
            updatedProducts = updatedProducts.slice(80, 120);
        }

        setFilteredProducts(updatedProducts);

    }, [searchQuery, sortOption, priceRange, products, activePage]);




    const addToShopify = async (productId:number) => {
        
        setSyncing(productId);
 
        
        try {
          const resData = await request<ImportResponse>({
            method: "POST",
            url: `/zendrop/products/import`,
            data:{productId: productId}
          });
    
          if(resData?.data?.id){

            addToast('Product added to store successfully.', "success");

            const updatedProduct = products.map((product)=>{
                if(product.id == productId){
                    return {...product, synced : 1}
                }
                return product;
            });

            setProducts(updatedProduct);
            localStorage.setItem('trendingProducts', JSON.stringify({fetchTime:0, products:updatedProduct}))


          }
         
        } catch (error) {
          console.error("Error: ", error);
        } finally {
          setSyncing(0);
        }
        
      }
   

    const handleCardClick = (id: number) => {
        window.open(`/zendrop/products/${id}`, '_blank');
    };

    


    // Animation variants for the button
    const buttonVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    };

    // Animation variants for the card
    const cardVariants = {
        hover: { scale: 1.03, transition: { duration: 0.2 } },
    };

    return (
        // Main Layout
        <div className="flex-1 p-6 lg:pl-8 lg:pr-8 lg:pt-8 lg:pb-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Trending Products</h1>



            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-surface/90 backdrop-blur-sm border-border"
                    />
                </div>
                <div className="flex items-center gap-2">
                    

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[180px] bg-surface/90 backdrop-blur-sm border-border">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent className='bg-white dark:bg-gray-600'>
                            <SelectItem value="0"> All Categories</SelectItem>
                            <SelectItem value="1"> Apparel & Accessories</SelectItem>
                            <SelectItem value="2">Business & Industrial</SelectItem>
                            <SelectItem value="3">Electronics</SelectItem>
                            <SelectItem value="4">Food, Beverages</SelectItem>
                            <SelectItem value="5">Furniture</SelectItem>
                            <SelectItem value="6">Hardware</SelectItem>
                            <SelectItem value="7">Gift Cards</SelectItem>
                        </SelectContent>
                    </Select>


                    <label>Sort By: </label>

                    <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-[180px] bg-surface/90 backdrop-blur-sm border-border">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className='bg-white dark:bg-gray-600'>
                            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
                            <SelectItem value="title-desc">Title (Z-A)</SelectItem>
                        </SelectContent>
                    </Select>

                    <label>Price Filter: </label>
                    <Select value={priceRange} onValueChange={setPriceRange}>
                        <SelectTrigger className="w-[180px] bg-surface/90 backdrop-blur-sm border-border">
                            <SelectValue placeholder="Price Range" />
                        </SelectTrigger>
                        <SelectContent className='bg-white dark:bg-gray-600'>
                            <SelectItem value="all">All Range</SelectItem>
                            <SelectItem value="0-10">Range (0-10)</SelectItem>
                            <SelectItem value="10-20">Range (10-20)</SelectItem>
                            <SelectItem value="20-30">Range (20-30)</SelectItem>
                            <SelectItem value="30-40">Range (30-40)</SelectItem>
                            <SelectItem value="40-50">Range (40-50)</SelectItem>
                            <SelectItem value="50-100">Range (50-100)</SelectItem>
                            <SelectItem value="100-200">Range (100-200)</SelectItem>
                            <SelectItem value="200+">Range (200+)</SelectItem>
                        </SelectContent>
                    </Select>                    
                </div>
            </div>

            {/* Product Grid */}
            {loading ? (
                <ProductSkeletonGrid />
            ) : filteredProducts.length === 0 ? (
                <p className="text-muted-foreground text-center">No products found.</p>
            ) : (
            <div className="flex flex-wrap items-center gap-6">
                {filteredProducts.map((product) => (
                    <motion.div
                        key={product.id}
                        className="relative group cursor-pointer mx-auto w-72"
                        variants={cardVariants}
                        whileHover="hover"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                    >
                        <Card
                            className="bg-surface/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 w-full h-[310px] relative overflow-hidden"
                           
                        >
                            <CardHeader className="p-0">
                                <div className="relative w-full aspect-square h-36"  onClick={() => handleCardClick(product.id)}>
                                    <Image
                                        src={ `https://file.zendrop.com/product_images/${product.featured_image_url}` }
                                        alt={product.name}
                                        fill
                                        className="rounded-t-md object-contain"
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    />
                                </div>
                            </CardHeader>
                            <CardContent className="p-3 text-center h-14">
                                <h3 className="text-base font-semibold text-foreground truncate"  onClick={() => handleCardClick(product.id)}>{product.name}</h3>
                                <p><strong>${product.display_price}</strong></p>
                            </CardContent>
                            
                            <motion.div
                                className="absolute inset-x-0 bottom-0 bg-surface/90 backdrop-blur-sm p-1 h-[50px]"
                                initial="hidden"
                                whileHover="visible"
                                variants={buttonVariants}
                            >
                                {product.synced == 0 && syncing != product.id && <Button variant="default" className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 h-9" onClick={()=>{addToShopify(product.id)}}>
                                    Add to Shopify Store
                                </Button>}
                                
                                {product.id == syncing && <Button variant="default" className="w-full cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 h-9">
                                    Processing...
                                </Button>}

                                {product.synced == 1 && <Button variant="default" className="w-full cursor-pointer bg-gray-100 text-primary-foreground hover:bg-gray-600 h-9">
                                    Added to Store
                                </Button>}
                            </motion.div>
                        </Card>
                    </motion.div>
                ))}

                <div className='text-center w-full'>
                    <button className={`border px-3 py-1 mx-2 ${activePage == 1?'bg-primary':''}`} onClick={()=>{setActivePage(1)}}>1</button>
                    <button className={`border px-3 py-1 mx-2 ${activePage == 2?'bg-primary':''}`} onClick={()=>{setActivePage(2)}}>2</button>
                    <button className={`border px-3 py-1 mx-2 ${activePage == 3?'bg-primary':''}`} onClick={()=>{setActivePage(3)}}>3</button>
                </div>
            </div>
            )}

        </div>
    );
}
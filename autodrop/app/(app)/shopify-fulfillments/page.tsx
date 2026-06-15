'use client';

import { request } from '@/lib/api/handler';
import { RefreshCw } from 'lucide-react';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

import PopupModel from '@/components/PopupModel';
import { SquareArrowOutUpRight } from 'lucide-react';
import Image from 'next/image';


interface ShopifyShipment {
    id: number;
    shopifyShipmentId: string;
    orderId: number;
    carrier: string;
    trackingNumber: string;
    trackingUrl: string;
    status: string;
    displayStatus: string;
    estimatedDeliveryAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    deliveredAt?: Date;
    fulfillmentLineItems?: unknown;
    ebayShipment: { fulfillmentId: string }[];
    order: { 
        ebayOrderid:string; 
        orderItem: VariantInterface[]; 
    };
}

interface VariantInterface {
    variant:{
        imageUrl:string;
        product:{title:string};
    }
}


export default function Fulfillments() {

    const [shipments, setShipments] = useState<ShopifyShipment[]>([]);
    const [filterShipments, setFilterShipments] = useState<ShopifyShipment[]>([]);
    const [fulfillment, setFulfillment] = useState<ShopifyShipment|null>(null);
    
    const [sortOption, setSortOption] = useState('order-asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showModel, setShowModel] = useState(false);

    const getShopifyFulfillments = async () => {
        try {
            const res = await request<ShopifyShipment[]>({
                method: 'GET',
                url: '/shopify/fulfillments/all',
            });
            setShipments(res);

        } catch (error) {
            console.error('Failed to fetch fulfillments:', error);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        getShopifyFulfillments();
    }, []);



    useEffect(() => {
        let updatedShipments = [...shipments];

        if (searchQuery) {
            updatedShipments = updatedShipments.filter(shipment =>
                (shipment.orderId.toString().includes(searchQuery.toLowerCase()) || shipment.trackingNumber.includes(searchQuery.toLowerCase()) || shipment.carrier.toLowerCase().includes(searchQuery.toLowerCase()) || shipment.order?.orderItem[0]?.variant?.product?.title?.toString()?.toLowerCase().includes(searchQuery.toLowerCase()))
            );

        }

       

        if (filterStatus !== 'all') {           
            updatedShipments = updatedShipments.filter(shipment => {
                return (shipment.status.toLowerCase() == filterStatus.toLocaleLowerCase());
            });
        }

       

        updatedShipments.sort((a, b) => {
            if (sortOption === 'order-asc') return a.orderId - b.orderId;
            if (sortOption === 'order-desc') return b.orderId - a.orderId;
            return 0;
        });

        setFilterShipments(updatedShipments);

    }, [searchQuery, sortOption, filterStatus, shipments]);


    const createEbayShipment = async (orderId: number) => {
        try {
            await request({
                method: 'GET',
                url: '/ebay/fulfillments/' + orderId,
            });

            getShopifyFulfillments();

        } catch (error) {
            console.error('Failed to create fulfillment:', error);
        } finally {
            // setLoading(false);
        }
    };


    const fetchShopifyFulfillments = async () => {
        try {
            await request({
                method: 'GET',
                url: '/shopify/fulfillments/fetch-all',
            });

            getShopifyFulfillments();

        } catch (error) {
            console.error('Failed to create fulfillment:', error);
        } finally {
            // setLoading(false);
        }
    };


    const syncFulfillments = async () => {
        try {
            await request({
                method: 'GET',
                url: '/ebay/fulfillments/create',
            });

            getShopifyFulfillments();

        } catch (error) {
            console.error('Failed to create fulfillment:', error);
        } finally {
            // setLoading(false);
        }
    };


    const fulfillmentView = async (fulfillmentItem:ShopifyShipment) => {
        setFulfillment(fulfillmentItem);
        setShowModel(true);
    };


    return (

        <div className="flex-1 p-6 rounded lg:pl-8 lg:pr-8 lg:pt-8 lg:pb-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Shopify Fulfillments</h1>

            <div className="flex space-x-4 mb-6">
                <div className='w-1/2'>
                    <Link href="/shopify-fulfillments" className='inline-block py-2 px-5 border bg-blue-600 text-white rounded'>Shopify Fulfillments</Link>
                    <Link href="/ebay-fulfillments" className='inline-block py-2 px-5 border mx-5 bg-gray-200 text-gray-700 rounded'>Ebay Fulfillments</Link>
                </div>

                <div className='w-1/2 text-right'>
                    <button className=' py-2 px-5 border rounded' onClick={() => { fetchShopifyFulfillments() }}>Fetch Fulfillments From Shopify</button>
                    <button className=' py-2 px-5 border mx-3 rounded' onClick={() => { syncFulfillments() }}>Sync Fulfillments In Ebay</button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-surface/90 backdrop-blur-sm border-border"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <label>Sort By: </label>
                    <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-[180px] bg-surface/90 backdrop-blur-sm border-border">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent className='bg-white dark:bg-gray-600'>
                            <SelectItem value="order-asc">Earliest</SelectItem>
                            <SelectItem value="order-desc">Latest</SelectItem>
                        </SelectContent>
                    </Select>

                    <label>Status: </label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px] bg-surface/90 backdrop-blur-sm border-border">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className='bg-white dark:bg-gray-600'>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="SUCCESS">Success</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            <SelectItem value="ERROR">Error</SelectItem>
                            <SelectItem value="FAILURE">Failure</SelectItem>
                        </SelectContent>
                    </Select>                 
                </div>
            </div>

            <div>
                <table className='table w-full text-left'>
                    <thead>
                        <tr className='bg-gray-100 dark:bg-gray-600'>
                            <th className='px-4 py-2 border'>Product</th>
                            <th className='px-4 py-2 border'>Order Id</th>
                            <th className='px-4 py-2 border'>Carrier Name</th>
                            <th className='px-4 py-2 border'>Tracking Number</th>
                            <th className='px-4 py-2 border'>Status</th>
                            <th className='px-4 py-2 border'>Estimated Delivery</th>
                            <th className='px-4 py-2 border'>Shopify Fulfillment Id</th>
                            <th className='px-4 py-2 border'>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterShipments.length > 0 && filterShipments.map((shipment) => {
                            return (<tr key={shipment.id}>
                                <td className='px-4 py-2 border'>
                                    <div className="flex items-center space-x-2">
                                        <Image
                                            src={shipment.order.orderItem?.[0].variant.imageUrl}
                                            alt={'Product'}
                                            className="w-12 h-12 object-contain border rounded"
                                            width={50}
                                            height={50}
                                        />
                                        
                                        <span>{shipment.order?.orderItem?.[0].variant?.product?.title ||  "No Title"}</span>
                                    </div>
                                </td>
                                <td className='px-4 py-2 border'>{shipment.orderId}</td>
                                <td className='px-4 py-2 border'>{shipment.carrier}</td>
                                <td className='px-4 py-2 border'>{shipment.trackingNumber}</td>
                                <td className='px-4 py-2 border'>{shipment.status}</td>
                                <td className='px-4 py-2 border'>{shipment.estimatedDeliveryAt ? new Date(shipment.estimatedDeliveryAt).toLocaleDateString() : 'N/A'}</td>
                                <td className='px-4 py-2 border'>{shipment.shopifyShipmentId}</td>

                                <td className='px-4 py-2 border action-td'>                                    
                                    <button className='btn-simple' title='View Fulfillment' onClick={() => { fulfillmentView(shipment) }}><Eye /></button>
                                    <Link href={`/orders/${shipment?.order?.ebayOrderid}`} title='View Order'><SquareArrowOutUpRight/></Link>
                                    {shipment.ebayShipment.length === 0 && <button className='btn-simple' title='Create shipment in Ebay ' onClick={() => { createEbayShipment(shipment.id) }}><RefreshCw /></button>}
                                </td>
                            </tr>)
                        })}
                    </tbody>
                </table>
            </div>



            {showModel && <PopupModel onClose={() => setShowModel(false)}>
                <div className='item-fulfillment'>
                    <div className='fulfillment-dv'>
                        <h2 className='heading-2 mb-4'>Fulfillment Details</h2>
                        <p><strong>Shopify Shipment ID : </strong> <span>{fulfillment?.shopifyShipmentId}</span></p>
                        <p><strong>Order ID : </strong> <span>{fulfillment?.orderId}</span></p>
                        <p><strong>Carrier Name: </strong> <span>{fulfillment?.carrier}</span></p>
                        <p><strong>Tracking Number : </strong> <span>{fulfillment?.trackingNumber}</span></p>
                        <p><strong>Status : </strong> <span>{fulfillment?.status}</span></p>
                        <p><strong>Display Status : </strong> <span>{fulfillment?.displayStatus}</span></p>
                        <p><strong>Estimated Delivery At : </strong> <span>{fulfillment?.deliveredAt?.toLocaleString()?.split('T')?.[0] || null}</span></p>
                        <p><strong>Delivered At : </strong> <span>{fulfillment?.deliveredAt?.toLocaleString()?.split('T')?.[0]}</span></p>
                        <p><strong>Created At : </strong> <span>{fulfillment?.createdAt?.toLocaleString()?.split('T')?.[0]}</span></p>
                        {fulfillment?.trackingUrl && <Link href={fulfillment.trackingUrl} target='_blank' className='bg-primary rounded-sm px-4 py-2'>View Tracking</Link>}
                    </div>
                </div>
            </PopupModel>}

        </div>
    )
}
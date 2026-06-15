'use client';

import { request } from '@/lib/api/handler';
import { useEffect, useState } from 'react';
import Link from 'next/link';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {  Search } from 'lucide-react';
import PopupModel from '@/components/PopupModel';
import { SquareArrowOutUpRight } from 'lucide-react';
import { Eye } from 'lucide-react';
import Image from 'next/image';

interface EbayShipment {
    id: number;
    shopifyShipmentId: string;
    orderId: number;
    carrier: string;
    trackingNumber: string;
    fulfillmentId: string;
    status: string;
    displayStatus: string;
    estimatedDeliveryAt?: Date;
    createdAt: Date;
    updatedAt: Date;
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


export default function EbayFulfillments() {

    const [shipments, setShipments] = useState<EbayShipment[]>([]);
    const [filterShipments, setFilterShipments] = useState<EbayShipment[]>([]);
    const [showModel, setShowModel] = useState(false);

    const [sortOption, setSortOption] = useState('order-asc');
    const [searchQuery, setSearchQuery] = useState('');

     const [fulfillment, setFulfillment] = useState<EbayShipment|null>(null);

    const getEbayFulfillments = async () => {
        try {
            const res = await request<EbayShipment[]>({
                method: 'GET',
                url: '/ebay/fulfillments/all',
            });
            setShipments(res);

        } catch (error) {
            console.error('Failed to fetch fulfillments:', error);
        } finally {
            // setLoading(false);
        }
    };

    useEffect(() => {
        getEbayFulfillments();
    }, []);


    useEffect(() => {
        let updatedShipments = [...shipments];

        if (searchQuery) {
            updatedShipments = updatedShipments.filter(shipment =>
                (shipment.orderId.toString().includes(searchQuery.toLowerCase()) || shipment.trackingNumber.includes(searchQuery.toLowerCase()) || shipment.carrier.toLowerCase().includes(searchQuery.toLowerCase()) || shipment.order?.orderItem[0]?.variant?.product?.title?.toString()?.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }


       

        updatedShipments.sort((a, b) => {
            if (sortOption === 'order-asc') return a.orderId - b.orderId;
            if (sortOption === 'order-desc') return b.orderId - a.orderId;
            return 0;
        });

        setFilterShipments(updatedShipments);

    }, [searchQuery, sortOption, shipments]);



    const fulfillmentView = async (fulfillmentItem:EbayShipment) => {
        setFulfillment(fulfillmentItem);
        setShowModel(true);
    };

    return (

        <div className="flex-1 p-6 lg:pl-8 lg:pr-8 lg:pt-8 lg:pb-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Ebay Fulfillments</h1>

            <div className="flex space-x-4 mb-6">
                <div className='w-1/2'>
                    <Link href="/shopify-fulfillments" className='inline-block py-2 px-5 border bg-gray-200 text-gray-700 rounded'>Shopify Fulfillments</Link>
                    <Link href="/ebay-fulfillments" className='inline-block py-2 px-5 border mx-5 bg-blue-600 text-white rounded'>Ebay Fulfillments</Link>
                </div>

                <div className='w-1/2 text-right'>
                    
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

                                  
                </div>
            </div>

            <div>
                <table className='table w-full text-left'>
                    <thead>
                        <tr className='bg-gray-100 dark:bg-gray-600'>
                            <th className='px-4 py-2 border'>Product</th>
                            <th className='px-4 py-2 border'>Order Id</th>
                            <th className='px-4 py-2 border'>Ebay Fulfillment Id</th>
                            <th className='px-4 py-2 border'>Carrier Name</th>
                            <th className='px-4 py-2 border'>Tracking Number</th>
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
                                <td className='px-4 py-2 border'>{shipment.fulfillmentId}</td>
                                <td className='px-4 py-2 border'>{shipment.carrier}</td>
                                <td className='px-4 py-2 border'>{shipment.trackingNumber}</td>
                                <td className='px-4 py-2 border action-td'>
                                    <button className='btn-simple' title='View Fulfillment' onClick={() => { fulfillmentView(shipment) }}><Eye /></button>
                                    <Link href={`/orders/${shipment?.order?.ebayOrderid}`} title='View Order'><SquareArrowOutUpRight/></Link>
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
                        <p><strong>Ebay Shipment ID : </strong> <span>{fulfillment?.fulfillmentId}</span></p>
                        <p><strong>Order ID : </strong> <span>{fulfillment?.orderId}</span></p>
                        <p><strong>Ebay Order ID : </strong> <span>{fulfillment?.order?.ebayOrderid}</span></p>
                        <p><strong>Carrier Name: </strong> <span>{fulfillment?.carrier}</span></p>
                        <p><strong>Tracking Number : </strong> <span>{fulfillment?.trackingNumber}</span></p>
                        <p><strong>Created At : </strong> <span>{fulfillment?.createdAt?.toLocaleString()?.split('T')?.[0]}</span></p>
                        
                    </div>
                </div>
            </PopupModel>}

        </div>
    )
}
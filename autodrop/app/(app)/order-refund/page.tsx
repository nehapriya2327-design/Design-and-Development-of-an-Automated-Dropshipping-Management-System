'use client';

import { request } from '@/lib/api/handler';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';


interface OrderRefund {
    id: number;
    ebayReturnId: string;
    currentType: string;
    orderId: string;
    creationDate: string;
    itemId: string;
    transactionId: string;
    returnQuantity: number;
    reason: string;
    type: string;
    status: string;
    createdAt: Date;
    ebayOrder: {
        orderItem: VariantInterface[];
    }
}

interface VariantInterface {
    variant:{
        imageUrl:string;
        product:{title:string};
    }
}

export default function Fulfillments() {

    const [returnOrders, setReturnOrders] = useState<OrderRefund[]>([]);
    const [filterOrders, setFilterOrders] = useState<OrderRefund[]>([]);

    const [sortOption, setSortOption] = useState('order-asc');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');




    const getOrderReturns = async () => {
        try {
            const res = await request<OrderRefund[]>({
                method: 'GET',
                url: '/ebay/orderreturn/all',
            });
            setReturnOrders(res);

        } catch (error) {
            console.error('Failed to fetch:', error);
        } 
    };

    useEffect(() => {
        getOrderReturns();
    }, []);



    useEffect(() => {
        let datas = [...returnOrders];

        if (searchQuery) {
            datas = datas.filter(data =>
                (data.orderId.toString().toLowerCase().includes(searchQuery.toLowerCase()) || data.ebayOrder?.orderItem[0]?.variant?.product?.title?.toString()?.toLowerCase().includes(searchQuery.toLowerCase()))
            );

        }

       

        if (filterStatus !== 'all') {           
            datas = datas.filter(data => {
                return (data.status.toLowerCase() == filterStatus.toLocaleLowerCase());
            });
        }

       

        datas.sort((a, b) => {
            if (sortOption === 'order-asc') return a.id - b.id;
            if (sortOption === 'order-desc') return b.id - a.id;
            return 0;
        });

        setFilterOrders(datas);

    }, [searchQuery, sortOption, filterStatus, returnOrders]);
    



    return (

        <div className="flex-1 p-6 lg:pl-8 lg:pr-8 lg:pt-8 lg:pb-8">
            <h1 className="text-3xl font-bold text-foreground mb-6">Order Refunds</h1>

            <div className="flex space-x-4 mb-6">
                <div className='w-1/2'>
                    <Link href="/order-return" className='inline-block py-2 px-5 border mx-5 bg-gray-200 text-gray-700 rounded'>Return</Link>
                    <Link href="/order-refund" className='inline-block py-2 px-5 border bg-blue-600 text-white rounded'> Refund</Link>
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

                    <label>Status: </label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-[180px] bg-surface/90 backdrop-blur-sm border-border">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className='bg-white dark:bg-gray-600'>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                    </Select>                 
                </div>
            </div>

            <div className='w-full overflow-x-auto'>
                <table className='table w-full text-left'>
                    <thead>
                        <tr className='bg-gray-100 dark:bg-gray-600'>
                            <th className='px-4 py-2 border'>Product</th>
                            <th className='px-4 py-2 border'>Order Id</th>
                            <th className='px-4 py-2 border'>Status</th>
                            <th className='px-4 py-2 border'>Reason</th>
                            <th className='px-4 py-2 border'>Refund Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterOrders.length > 0 && filterOrders.map((returnOrder) => {
                            return (<tr key={returnOrder.id}>
                                <td className='px-4 py-2 border'>
                                    <div className="flex items-center space-x-2">
                                        <Image
                                            src={returnOrder.ebayOrder.orderItem?.[0].variant.imageUrl}
                                            alt={'Product'}
                                            className="w-12 h-12 object-contain border rounded"
                                            width={50}
                                            height={50}
                                        />
                                       
                                        <span>{returnOrder.ebayOrder?.orderItem?.[0].variant?.product?.title ||  "No Title"}</span>
                                    </div>
                                </td>
                                <td className='px-4 py-2 border'>{returnOrder.orderId}</td>
                                <td className='px-4 py-2 border'>{returnOrder.status}</td>
                                <td className='px-4 py-2 border'>Returned order</td>
                                <td className='px-4 py-2 border'>{returnOrder.creationDate?.replace('T', ' ')?.substr(0, 16)}</td>
                            </tr>)
                        })}
                    </tbody>
                </table>
            </div>

        </div>
    )
}
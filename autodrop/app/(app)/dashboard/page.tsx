'use client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { motion } from 'framer-motion';
import { DollarSign, LineChart as LineChartIcon, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Area, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Mock data
const salesData = [
    { date: '2025-05-13', revenue: 100, productCost: 50, profit: 50 },
    { date: '2025-05-14', revenue: 150, productCost: 70, profit: 80 },
    { date: '2025-05-15', revenue: 200, productCost: 100, profit: 100 },
    { date: '2025-05-16', revenue: 180, productCost: 90, profit: 90 },
    { date: '2025-05-17', revenue: 250, productCost: 120, profit: 130 },
    { date: '2025-05-18', revenue: 220, productCost: 110, profit: 110 },
    { date: '2025-05-19', revenue: 300, productCost: 150, profit: 150 },
];

const topSellingProductsData = [
    { id: 1, title: 'Product A', sold: [10, 20, 30, 40, 47], dates: ['2025-05-13', '2025-05-14', '2025-05-15', '2025-05-16', '2025-05-17'] },
    { id: 2, title: 'Product B', sold: [15, 25, 35, 45, 47], dates: ['2025-05-13', '2025-05-14', '2025-05-15', '2025-05-16', '2025-05-17'] },
    { id: 3, title: 'Product C', sold: [20, 30, 40, 50, 33], dates: ['2025-05-13', '2025-05-14', '2025-05-15', '2025-05-16', '2025-05-17'] },
    { id: 4, title: 'Product D', sold: [25, 35, 45, 55, 72], dates: ['2025-05-13', '2025-05-14', '2025-05-15', '2025-05-16', '2025-05-17'] },
    { id: 5, title: 'Product E', sold: [30, 40, 50, 60, 61], dates: ['2025-05-13', '2025-05-14', '2025-05-15', '2025-05-16', '2025-05-17'] },
];

const recentActivity = [
    { id: 'ORD-001', type: 'Order', status: 'Fulfilled', date: '2025-05-19' },
    { id: 'LST-001', type: 'Listing', status: 'Active', date: '2025-05-18' },
    { id: 'ORD-002', type: 'Order', status: 'Pending', date: '2025-05-17' },
];

export default function Dashboard() {
    const [startDate, setStartDate] = useState<Date | null>(new Date('2025-05-01'));
    const [endDate, setEndDate] = useState<Date | null>(new Date('2025-05-19'));
    const [topStartDate, setTopStartDate] = useState<Date | null>(new Date('2025-05-01'));
    const [topEndDate, setTopEndDate] = useState<Date | null>(new Date('2025-05-17'));

    // Mock metrics data
    const metrics = {
        profit: { value: 2456, change: 3.3, icon: LineChartIcon },
        orders: { value: 224, change: -2.4, icon: ShoppingCart },
        totalRevenue: { value: 8365, change: 5.6, icon: DollarSign },
        newProducts: { value: 330, change: 3.2, icon: Plus },
    };

    const overview = {
        avgProfit: 10.96,
        avgSellOrderCost: 19.35,
        avgBuyOrderCost: 18.48,
        maxProfitOnOrder: 4452.95,
        totalProductCost: 5000,
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    };

    return (
        <div className="flex-1 p-6 lg:pl-8 lg:pr-8 lg:pt-8 lg:pb-8">
            <motion.h1
                className="text-3xl font-bold text-foreground mb-6"
                initial="hidden"
                animate="visible"
                variants={cardVariants}
            >
                Dashboard
            </motion.h1>

            {/* Date Range Filter */}
            <motion.div
                className="mb-6 flex space-x-4"
                initial="hidden"
                animate="visible"
                variants={cardVariants}
            >
                <DatePicker
                    selected={startDate}
                    onChange={(date: Date | null) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    className="p-2 border rounded"
                    dateFormat="MM/dd/yyyy"
                />
                <DatePicker
                    selected={endDate}
                    onChange={(date: Date | null) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate!}
                    className="p-2 border rounded"
                    dateFormat="MM/dd/yyyy"
                />
            </motion.div>

            {/* Metrics Tiles */}
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                initial="hidden"
                animate="visible"
                variants={cardVariants}
            >
                {Object.entries(metrics).map(([key, { value, change, icon: Icon }]) => (
                    <motion.div key={key} variants={cardVariants}>
                        <Card className="bg-surface/90 backdrop-blur-sm hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                                    <Icon className="mr-2" /> {key.charAt(0).toUpperCase() + key.slice(1)}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <motion.p
                                    className="text-2xl font-bold text-foreground"
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    ${value.toFixed(2)}
                                </motion.p>
                                <motion.span
                                    className={change >= 0 ? 'text-green-500' : 'text-red-500'}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2, duration: 0.3 }}
                                >
                                    {change >= 0 ? '↑' : '↓'}{change}%
                                </motion.span>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Sales Overview Graph and Overview Section */}
            <motion.div
                className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8"
                initial="hidden"
                animate="visible"
                variants={cardVariants}
            >
                <motion.div variants={cardVariants}>
                    <Card className="bg-surface/90 backdrop-blur-sm">
                        <CardHeader className="flex justify-between items-center">
                            <CardTitle className="text-lg font-semibold text-foreground">Sales Overview</CardTitle>
                            <span className="text-sm text-muted-foreground">
                                *Revenue: Sales income, Product Cost: Expenses, Profit: Net earnings
                            </span>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={salesData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                        <XAxis dataKey="date" stroke="var(--foreground)" />
                                        <YAxis stroke="var(--foreground)" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--surface)',
                                                color: 'var(--surface-foreground)',
                                                border: '1px solid var(--border)',
                                                borderRadius: 'var(--radius)',
                                            }}
                                        />
                                        <Legend />
                                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                                        <Line type="monotone" dataKey="productCost" stroke="#82ca9d" name="Product Cost" />
                                        <Line type="monotone" dataKey="profit" stroke="#ff7300" name="Profit" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={cardVariants}>
                    <Card className="bg-surface/90 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-foreground">Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <motion.div
                                className="grid grid-cols-1 gap-4"
                                initial="hidden"
                                animate="visible"
                                variants={cardVariants}
                            >
                                <p className="flex justify-between">
                                    <span>Average Profit <span className="text-green-500">↑4%</span></span> <span>${overview.avgProfit.toFixed(2)}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Average Sell Order Cost <span className="text-green-500">↑2%</span></span> <span>${overview.avgSellOrderCost.toFixed(2)}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Average Buy Order Cost <span className="text-red-500">↓3%</span></span> <span>${overview.avgBuyOrderCost.toFixed(2)}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Max Profit on Order <span className="text-green-500">↑5%</span></span> <span>${overview.maxProfitOnOrder.toFixed(2)}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span>Total Product Cost <span className="text-red-500">↓1%</span></span> <span>${overview.totalProductCost.toFixed(2)}</span>
                                </p>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Top Selling Products */}
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="relative"
            >
                <Card className="bg-surface/90 backdrop-blur-sm" style={{ position: 'relative', zIndex: 1 }}>
                    <CardHeader className="flex justify-between items-center">
                        <CardTitle className="text-lg font-semibold text-foreground">Top Selling Products</CardTitle>
                        <div className="flex space-x-2" style={{ position: 'relative', zIndex: 2000 }}>
                            <DatePicker
                                selected={topStartDate}
                                onChange={(date: Date | null) => setTopStartDate(date)}
                                selectsStart
                                startDate={topStartDate}
                                endDate={topEndDate}
                                className="p-2 border rounded text-sm"
                                dateFormat="yyyy-MM-dd"
                                popperProps={{ strategy: 'fixed' }}
                            />
                            <DatePicker
                                selected={topEndDate}
                                onChange={(date: Date | null) => setTopEndDate(date)}
                                selectsEnd
                                startDate={topStartDate}
                                endDate={topEndDate}
                                minDate={topStartDate!}
                                className="p-2 border rounded text-sm"
                                dateFormat="yyyy-MM-dd"
                                popperProps={{ strategy: 'fixed' }}
                            />
                        </div>
                    </CardHeader>
                    <CardContent style={{ overflow: 'visible' }}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>S.No.</TableHead>
                                    <TableHead>Product Title</TableHead>
                                    <TableHead>No. of Products Sold</TableHead>
                                    <TableHead>Graph</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topSellingProductsData.map((product, index) => {
                                    const filteredData = product.sold.map((value, i) => ({
                                        sold: value,
                                        date: product.dates[i],
                                    })).filter(d => {
                                        const dDateObj = new Date(d.date);
                                        return (!topStartDate || (!isNaN(dDateObj.getTime()) && dDateObj >= topStartDate)) &&
                                            (!topEndDate || (!isNaN(dDateObj.getTime()) && dDateObj <= topEndDate));
                                    });

                                    return (
                                        <motion.tr
                                            key={product.id}
                                            variants={rowVariants}
                                            initial="hidden"
                                            animate="visible"
                                            className="relative"
                                            style={{ position: 'relative', zIndex: 10 }}
                                        >
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{product.title}</TableCell>
                                            <TableCell>{product.sold.reduce((a, b) => a + b, 0)}</TableCell>
                                            <TableCell>
                                                <div className="relative h-16 w-32" style={{ position: 'relative', zIndex: 20, overflow: 'visible' }}>
                                                    {filteredData.length > 0 ? (
                                                        <div className="h-full w-full">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <LineChart data={filteredData}>
                                                                    <XAxis dataKey="date" hide />
                                                                    <YAxis hide />
                                                                    <Tooltip
                                                                        contentStyle={{
                                                                            backgroundColor: 'var(--surface)',
                                                                            color: 'var(--surface-foreground)',
                                                                            border: '1px solid var(--border)',
                                                                            borderRadius: 'var(--radius)',
                                                                            zIndex: 3000,
                                                                        }}
                                                                        position={{ x: 0, y: index < 1 ? 40 : -60 }} // Move tooltip above the graph
                                                                    />
                                                                    <Area type="monotone" dataKey="sold" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.1} />
                                                                    <Line type="monotone" dataKey="sold" stroke="var(--primary)" dot={{ r: 4 }} />
                                                                </LineChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    ) : (
                                                        <p className="text-sm text-muted-foreground">No data available</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                className="mt-8"
            >
                <Card className="bg-surface/90 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentActivity.map((activity) => (
                                    <TableRow key={activity.id}>
                                        <TableCell>{activity.id}</TableCell>
                                        <TableCell>{activity.type}</TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    activity.status === 'Fulfilled'
                                                        ? 'default'
                                                        : activity.status === 'Active'
                                                            ? 'secondary'
                                                            : 'destructive'
                                                }
                                            >
                                                {activity.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{activity.date}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
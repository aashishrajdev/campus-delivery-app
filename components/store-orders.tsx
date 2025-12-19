"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { settleOrders } from "@/app/actions/order-actions";

interface StoreOrderProps {
    orders: any[];
    storeId: string;
}

export function StoreOrders({ orders, storeId }: StoreOrderProps) {
    const [loading, setLoading] = useState(false);

    const pendingOrders = orders.filter(
        (o) =>
            o.items.some(
                (i: any) =>
                    i.sourceId === storeId && i.source === "STORE" && !i.isSettled
            )
    );

    const calculateStoreTotal = (order: any) => {
        return order.items
            .filter((i: any) => i.sourceId === storeId)
            .reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                    <CardDescription>Orders containing items from this store</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Items</TableHead>
                                <TableHead>Total (Store)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Settlement</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        className="text-center text-muted-foreground h-24"
                                    >
                                        No orders found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                orders.map((order) => {
                                    const storeItems = order.items.filter(
                                        (i: any) => i.sourceId === storeId
                                    );
                                    if (storeItems.length === 0) return null;

                                    const isSettled = storeItems.every((i: any) => i.isSettled);
                                    const storeTotal = calculateStoreTotal(order);

                                    return (
                                        <TableRow key={order._id}>
                                            <TableCell className="font-mono text-xs">
                                                {order._id.slice(-6)}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    {storeItems.map((item: any, idx: number) => (
                                                        <div key={idx} className="text-xs">
                                                            {item.quantity}x {item.name}
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell>₹{storeTotal}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        order.status === "DELIVERED"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {isSettled ? (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-green-50 text-green-700 border-green-200"
                                                    >
                                                        Settled
                                                    </Badge>
                                                ) : (
                                                    <Badge
                                                        variant="outline"
                                                        className="bg-yellow-50 text-yellow-700 border-yellow-200"
                                                    >
                                                        Pending
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

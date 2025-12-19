"use client";

import { settleOrders } from "@/app/actions/order-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useState } from "react";
import { Loader2, CheckCircle, Download } from "lucide-react";

interface StatItem {
    _id: string; // sourceId
    name: string;
    totalRevenue: number;
    settledAmount: number;
    unsettledAmount: number;
}

interface AdminOrderStatsProps {
    stats: {
        storeStats: StatItem[];
        vendingStats: StatItem[];
    };
}

export function AdminOrderStats({ stats }: AdminOrderStatsProps) {
    const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

    const handleSettle = async (sourceId: string, name: string) => {
        if (!confirm(`Are you sure you want to settle all pending orders for ${name}?`)) return;

        setLoadingMap(prev => ({ ...prev, [sourceId]: true }));
        try {
            const res = await settleOrders(sourceId);
            if (res.success) {
                toast.success(`Settled orders for ${name}!`);
                // Refresh to show updated data
                window.location.reload();
            } else {
                toast.error("Failed to settle: " + res.error);
            }
        } catch (e) {
            console.error(e);
            toast.error("Error settling orders");
        } finally {
            setLoadingMap(prev => ({ ...prev, [sourceId]: false }));
        }
    };

    const handleExport = () => {
        const rows: any[] = [];

        stats.storeStats.forEach((s) => {
            rows.push({
                Type: "Store",
                Name: s.name,
                "Total Revenue": s.totalRevenue,
                "Settled Amount": s.settledAmount,
                "Unsettled (Pending)": s.unsettledAmount
            });
        });

        stats.vendingStats.forEach((s) => {
            rows.push({
                Type: "Vending Machine",
                Name: s.name,
                "Total Revenue": s.totalRevenue,
                "Settled Amount": s.settledAmount,
                "Unsettled (Pending)": s.unsettledAmount
            });
        });

        const ws = XLSX.utils.json_to_sheet(rows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Balance Sheet");
        XLSX.writeFile(wb, `Campus_Delivery_Balance_Sheet_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const renderStatRow = (item: StatItem) => (
        <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg mb-3 gap-4 hover:bg-muted/30 transition-colors">
            <div className="flex-1">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <div className="flex gap-4 mt-1 text-sm">
                    <div>
                        <span className="text-muted-foreground">Total:</span>
                        <span className="font-semibold ml-1">₹{item.totalRevenue}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Settled:</span>
                        <span className="font-semibold text-green-600 ml-1">₹{item.settledAmount}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Pending:</span>
                        <span className="font-semibold text-red-600 ml-1">₹{item.unsettledAmount}</span>
                    </div>
                </div>
            </div>

            {item.unsettledAmount > 0 ? (
                <Button
                    onClick={() => handleSettle(item._id, item.name)}
                    disabled={loadingMap[item._id]}
                    size="sm"
                    className="bg-primary hover:bg-primary/90"
                >
                    {loadingMap[item._id] ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <CheckCircle className="w-4 h-4 mr-2" />
                    )}
                    Settle ₹{item.unsettledAmount}
                </Button>
            ) : (
                <Button variant="outline" size="sm" disabled className="opacity-50 cursor-not-allowed">
                    All Settled
                </Button>
            )}
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in-50 slide-in-from-bottom-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold">Financial Overview</h2>
                <Button onClick={handleExport} variant="outline" className="gap-2">
                    <Download className="w-4 h-4" /> Export to Excel
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Stores Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.storeStats.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No data available</p>
                        ) : (
                            <div className="max-h-[400px] overflow-y-auto pr-2">
                                {stats.storeStats.map(renderStatRow)}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Vending Machines Revenue</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.vendingStats.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No data available</p>
                        ) : (
                            <div className="max-h-[400px] overflow-y-auto pr-2">
                                {stats.vendingStats.map(renderStatRow)}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import dbConnect from "@/app/db";
import Store from "@/app/models/store.model";
import { getStoreOrders } from "@/app/actions/order-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { StoreOrders } from "@/components/store-orders";
import { ArrowLeft } from "lucide-react";

async function getAuth() {
    const cookieStore = await cookies();
    return cookieStore.get("admin_auth")?.value === "1";
}

export default async function StoreAdminDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const isAuthed = await getAuth();
    if (!isAuthed) redirect("/admin/login");

    await dbConnect();

    let store;
    try {
        store = await Store.findById(id).lean();
    } catch (e) {
        return <div>Store not found</div>;
    }

    if (!store) return <div>Store not found</div>;

    const orders = await getStoreOrders(id);

    return (
        <div className="min-h-screen p-4 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" asChild size="icon">
                    <Link href="/admin/stores"><ArrowLeft className="w-5 h-5" /></Link>
                </Button>
                <h1 className="text-2xl font-semibold">Store: {store.name}</h1>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Orders</CardTitle></CardHeader>
                    <CardContent><div className="text-2xl font-bold">{orders.length}</div></CardContent>
                </Card>
                {/* Add more stats? */}
            </div>

            <StoreOrders orders={orders} storeId={id} />
        </div>
    );
}

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import dbConnect from "@/app/db";
import Store from "@/app/models/store.model";
import VendingMachine from "@/app/models/vendingMachine.model";
import { StoreDashboardClient } from "./client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { logoutAction } from "./actions";

async function getOwnerAuth() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("store_owner_auth");
  if (!authCookie) return null;
  try {
    return JSON.parse(authCookie.value);
  } catch {
    return null;
  }
}

export default async function StoreDashboardPage() {
  const auth = await getOwnerAuth();
  if (!auth) redirect("/admin/store/login");

  const conn = await dbConnect();
  if (!conn) return <div>Database error</div>;

  let data = null;
  if (auth.type === "store") {
    const store = await Store.findById(auth.dbId).lean();
    if (store) data = JSON.parse(JSON.stringify(store));
  } else {
    const vm = await VendingMachine.findById(auth.dbId).lean();
    if (vm) data = JSON.parse(JSON.stringify(vm));
  }

  if (!data) {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold text-red-600">
          Entity not found. Please contact admin.
        </h1>
        <form action={logoutAction}>
          <Button variant="outline" className="mt-4">
            Logout
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div>
          <h1 className="text-xl font-bold">
            {data.name || data.names || "Dashboard"}
          </h1>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            {auth.type === "store" ? "Store Portal" : "Vending Machine Portal"}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{data.username}</span>
          <form action={logoutAction}>
            <Button variant="ghost" size="sm">
              Logout
            </Button>
          </form>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6">
        <StoreDashboardClient data={data} type={auth.type} />
      </main>
    </div>
  );
}

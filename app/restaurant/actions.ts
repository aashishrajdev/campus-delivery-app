"use server";

import dbConnect from "@/app/db";
import Store from "@/app/models/store.model";
import VendingMachine from "@/app/models/vendingMachine.model";
import { unstable_cache } from "next/cache";
import Product from "@/app/models/product.model";

const getCachedStores = unstable_cache(
  async () => {
    await dbConnect();
    // Ensure Product model is registered
    if (!Product) {
      // no-op, just ensuring import
    }
    const stores = await Store.find({}).populate("items.productId").lean();
    return JSON.parse(JSON.stringify(stores)).map((store: any) => ({
      ...store,
      id: store.id || store._id,
    }));
  },
  ["stores-list"],
  { revalidate: 60, tags: ["stores"] }
);

export async function getStoresAction(timestamp?: number) {
  return getCachedStores();
}

const getCachedVendingMachines = unstable_cache(
  async () => {
    await dbConnect();
    const vms = await VendingMachine.find({}).lean();
    return JSON.parse(JSON.stringify(vms)).map((vm: any) => ({
      ...vm,
      id: vm.id || vm._id,
      name: vm.names,
      location: vm.location,
      hostel: vm.hostel,
      building: vm.building,
      image: vm.image, // Pass image to client
    }));
  },
  ["vending-list"],
  { revalidate: 300, tags: ["vending-machines"] } // Cache full list for 5 mins, since we poll status separately
);

export async function getVendingMachinesAction(timestamp?: number) {
  return getCachedVendingMachines();
}

const getCachedVendingStatus = unstable_cache(
  async () => {
    await dbConnect();
    const vms = await VendingMachine.find({}).select("id names location type").lean();
    return JSON.parse(JSON.stringify(vms)).map((vm: any) => ({
      id: vm.id || vm._id,
      name: vm.names,
      location: vm.location,
      type: vm.type,
    }));
  },
  ["vending-status"],
  { revalidate: 30, tags: ["vending-status"] } // Cache status for 30s matching client poll
);

export async function getVendingMachinesStatus() {
  return getCachedVendingStatus();
}
export async function getVendingMachineById(id: string) {
  await dbConnect();
  // Ensure Product model is registered
  if (!Product) {
    // no-op
  }
  const vm = await VendingMachine.findOne({ id })
    .populate("items.productId")
    .lean();

  if (!vm) return null;

  return JSON.parse(JSON.stringify(vm));
}

// Optimization: Lightweight action for polling stock
export async function getVendingMachineStock(id: string) {
  await dbConnect();
  const vm = await VendingMachine.findOne({ id }).select('items.productId items.quantity').lean();

  if (!vm) return null;
  const items = vm.items || [];

  // Return minimal data: productId and quantity
  return items.map((item: any) => ({
    productId: item.productId ? item.productId.toString() : null, // Handle ObjectId
    quantity: item.quantity
  })).filter((item: any) => item.productId);
}

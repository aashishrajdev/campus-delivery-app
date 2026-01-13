"use server";

import dbConnect from "@/app/db";
import Store from "@/app/models/store.model";
import VendingMachine from "@/app/models/vendingMachine.model";
import { unstable_cache } from "next/cache";
import Product from "@/app/models/product.model";

const getCachedStores = unstable_cache(
  async () => {
    const conn = await dbConnect();
    if (!conn) return [];

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
    const conn = await dbConnect();
    if (!conn) return [];
    const vms = await VendingMachine.find({}).lean();
    return JSON.parse(JSON.stringify(vms)).map((vm: any) => ({
      ...vm,
      id: vm.id || vm._id,
      name: vm.names,
      location: vm.location,
      hostel: vm.hostel,
      building: vm.building,
      image: vm.image,
    }));
  },
  ["vending-list"],
  { revalidate: 300, tags: ["vending-machines"] }
);

export async function getVendingMachinesAction(timestamp?: number) {
  return getCachedVendingMachines();
}

const getCachedVendingStatus = unstable_cache(
  async () => {
    const conn = await dbConnect();
    if (!conn) return [];
    const vms = await VendingMachine.find({}).select("id names location type").lean();
    return JSON.parse(JSON.stringify(vms)).map((vm: any) => ({
      id: vm.id || vm._id,
      name: vm.names,
      location: vm.location,
      type: vm.type,
    }));
  },
  ["vending-status"],
  { revalidate: 30, tags: ["vending-status"] }
);

export async function getVendingMachinesStatus() {
  return getCachedVendingStatus();
}

export async function getVendingMachineById(id: string) {
  const conn = await dbConnect();
  if (!conn) return null;

  const vm = await VendingMachine.findOne({ id })
    .populate("items.productId")
    .lean();

  if (!vm) return null;

  return JSON.parse(JSON.stringify(vm));
}

export async function getVendingMachineStock(id: string) {
  const conn = await dbConnect();
  if (!conn) return null;
  const vm = await VendingMachine.findOne({ id }).select('items.productId items.quantity').lean();

  if (!vm) return null;
  const items = vm.items || [];

  return items.map((item: any) => ({
    productId: item.productId ? item.productId.toString() : null,
    quantity: item.quantity
  })).filter((item: any) => item.productId);
}

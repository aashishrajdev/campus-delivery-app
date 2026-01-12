"use server";

import dbConnect from "@/app/db";
import VendingMachine from "@/app/models/vendingMachine.model";
import "@/app/models/product.model"; // Ensure Product model is registered

export async function getVendingMachineById(id: string) {
  try {
    const conn = await dbConnect();
    if (!conn) return null;

    const machine = await VendingMachine.findOne({ id })
      .populate({
        path: "items.productId",
        model: "Product",
      })
      .lean();

    if (!machine) return null;

    // Serialize to ensure it can be passed to client
    return JSON.parse(JSON.stringify(machine));
  } catch (error) {
    console.error("Error fetching vending machine:", error);
    return null;
  }
}

export async function getAllVendingMachines() {
  try {
    const conn = await dbConnect();
    if (!conn) return [];

    const machines = await VendingMachine.find({}).lean();
    return JSON.parse(JSON.stringify(machines));
  } catch (error) {
    console.error("Error fetching vending machines:", error);
  }
}

export async function getVendingMachineStock(id: string) {
  try {
    await dbConnect();

    const vm = await VendingMachine.findOne({ id }).select('items.productId items.quantity').lean();

    if (!vm) return null;
    const items = vm.items || [];

    // Return minimal data: productId and quantity
    return items.map((item: any) => ({
      productId: item.productId ? item.productId.toString() : null,
      quantity: item.quantity
    })).filter((item: any) => item.productId);
  } catch (error) {
    console.error("Error fetching vending machine stock:", error);
    return null;
  }
}

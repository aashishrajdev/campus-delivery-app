"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/app/db";
import VendingMachine from "@/app/models/vendingMachine.model";

export async function addVendingMachineItemAction(formData: FormData) {
  try {
    const conn = await dbConnect();
    if (!conn) return { ok: false, error: "Database not configured." };

    const machineId = String(formData.get("machineId") || "").trim();
    const machineName = String(formData.get("machineName") || "").trim();
    const hostel = String(formData.get("hostel") || "").trim();
    const location = String(formData.get("location") || "").trim();

    if (!machineId || !machineName || !hostel || !location)
      return { ok: false, error: "All fields are required." };

    // Check if machine already exists
    const existingMachine = await VendingMachine.findById(machineId);
    if (existingMachine) {
      return { ok: false, error: "Machine ID already exists." };
    }

    // Create new machine
    const machine = await VendingMachine.create({
      id: machineId,
      names: machineName,
      hostel,
      location,
      items: [],
    });

    revalidatePath("/admin");
    revalidatePath("/admin/products");
    revalidatePath("/api/vending-machines");
    console.log(`Created vending machine: ${machineName}`);
    return { ok: true, machineId: machine._id };
  } catch (err) {
    console.error("addVendingMachineItemAction error:", err);
    return { ok: false, error: "Failed to create machine." };
  }
}

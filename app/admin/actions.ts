"use server";

import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");

  const ENV_USER = process.env.ADMIN_USERNAME || "";
  const ENV_PASS = process.env.ADMIN_PASSWORD || "";

  if (username === ENV_USER && password === ENV_PASS) {
    const cookieStore = await cookies();
    cookieStore.set("admin_auth", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 1/2, //  30 minutes
    });
    return { ok: true };
  }
  return { ok: false, error: "Invalid credentials" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_auth");
}

// --- App-aligned admin commands ---
import dbConnect from "@/app/db";
import Product from "@/app/models/product.model";
import EventModel from "@/app/models/events.model";
import VendingMachine from "@/app/models/vendingMachine.model";
import {
  deliveryItems,
  events as staticEvents,
  vendingMachines as staticVendingMachines,
} from "@/lib/data";

export async function syncProductsAction() {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return { ok: false, error: "Database not configured. Set MONGO_URI." };
    }
    for (const item of deliveryItems) {
      const availability =
        item.availability === "unavailable" ? "outOfStock" : "inStock";
      await Product.findOneAndUpdate(
        { name: item.name },
        {
          name: item.name,
          Description: item.description,
          price: item.price,
          availability,
          image: "/icon.svg",
        },
        { upsert: true, new: true }
      );
    }
    return { ok: true };
  } catch (err) {
    console.error("syncProductsAction error:", err);
    return { ok: false, error: "Failed to sync products" };
  }
}

export async function syncEventsAction() {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return { ok: false, error: "Database not configured. Set MONGO_URI." };
    }
    for (const ev of staticEvents) {
      await EventModel.findOneAndUpdate(
        { id: ev.id },
        {
          id: ev.id,
          name: ev.name,
          date: new Date(ev.date),
          time: ev.time,
          venue: ev.venue,
          registrationLink: ev.registrationLink,
        },
        { upsert: true, new: true }
      );
    }
    return { ok: true };
  } catch (err) {
    console.error("syncEventsAction error:", err);
    return { ok: false, error: "Failed to sync events" };
  }
}

export async function syncVendingMachinesAction() {
  try {
    const conn = await dbConnect();
    if (!conn) {
      return { ok: false, error: "Database not configured. Set MONGO_URI." };
    }
    for (const machine of staticVendingMachines) {
      const items = machine.items.map((item: any) => ({
        name: item.name,
        price: item.price,
        quantity: 20, // Default initial stock
        emoji: item.emoji,
      }));
      await VendingMachine.findOneAndUpdate(
        { id: machine.id },
        {
          id: machine.id,
          names: machine.name,
          hostel: machine.hostel,
          location: machine.location,
          items,
        },
        { upsert: true, new: true }
      );
    }
    return { ok: true };
  } catch (err) {
    console.error("syncVendingMachinesAction error:", err);
    return { ok: false, error: "Failed to sync vending machines" };
  }
}

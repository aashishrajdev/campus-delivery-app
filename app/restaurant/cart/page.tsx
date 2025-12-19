"use client";

import { CartScreen } from "@/components/cart-screen";
import { useCart } from "@/components/cart-context";
import { useRouter } from "next/navigation";

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    totals,
    selectedHostel,
    setSelectedHostel,
    roomNumber,
    setRoomNumber,
  } = useCart();

  const updateAddress = async (hostel: string, room: string) => {
    // Persist logic duplicated here or lifted to context? Lifted to context is better but let's keep it simple.
    // Since context doesn't expose the setter directly that saves API, we can just do it here.
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address: hostel,
          roomNumber: room,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartScreen
      cartItems={cartItems}
      onUpdateQuantity={updateQuantity}
      totals={totals}
      onGoToDelivery={() => router.push("/restaurant")}
      selectedHostel={selectedHostel}
      setSelectedHostel={setSelectedHostel}
      roomNumber={roomNumber}
      setRoomNumber={setRoomNumber}
      onSaveAddress={updateAddress}
    />
  );
}

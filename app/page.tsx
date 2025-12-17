"use client";

import { useMemo, useState } from "react";
import { DeliveryScreen } from "@/components/delivery-screen";
import { VendingScreen } from "@/components/vending-screen";
import { EventsScreen } from "@/components/events-screen";
import { BottomNav, type Screen } from "@/components/bottom-nav";
import { CartScreen } from "@/components/cart-screen";
import { deliveryItems } from "@/lib/data";

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<Screen>("delivery");
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [selectedHostel, setSelectedHostel] = useState("");
  const [roomNumber, setRoomNumber] = useState("");

  const updateQuantity = (itemId: string, change: number) => {
    setCartItems((prev) => {
      const current = prev[itemId] || 0;
      const nextQty = Math.max(0, current + change);
      if (nextQty === 0) {
        const { [itemId]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: nextQty };
    });
  };

  const totals = useMemo(() => {
    const totalItems = Object.values(cartItems).reduce(
      (sum, qty) => sum + qty,
      0
    );
    const totalPrice = deliveryItems.reduce((sum, item) => {
      const qty = cartItems[item.id] || 0;
      return sum + qty * item.price;
    }, 0);
    return { totalItems, totalPrice };
  }, [cartItems]);

  return (
    <div className="min-h-screen bg-background pb-20 max-w-[480px] mx-auto">
      {activeScreen === "delivery" && (
        <DeliveryScreen
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          onProceedToCart={() => setActiveScreen("cart")}
          totals={totals}
          selectedHostel={selectedHostel}
          setSelectedHostel={setSelectedHostel}
          roomNumber={roomNumber}
          setRoomNumber={setRoomNumber}
        />
      )}
      {activeScreen === "vending" && <VendingScreen />}
      {activeScreen === "events" && <EventsScreen />}
      {activeScreen === "cart" && (
        <CartScreen
          cartItems={cartItems}
          onUpdateQuantity={updateQuantity}
          totals={totals}
          onGoToDelivery={() => setActiveScreen("delivery")}
          selectedHostel={selectedHostel}
          setSelectedHostel={setSelectedHostel}
          roomNumber={roomNumber}
          setRoomNumber={setRoomNumber}
        />
      )}

      <BottomNav activeScreen={activeScreen} onScreenChange={setActiveScreen} />
    </div>
  );
}

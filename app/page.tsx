"use client";

import { useMemo, useState, useEffect } from "react";
import { DeliveryScreen } from "@/components/delivery-screen";
import { VendingScreen } from "@/components/vending-screen";
import { EventsScreen } from "@/components/events-screen";
import { BottomNav, type Screen } from "@/components/bottom-nav";
import { CartScreen } from "@/components/cart-screen";

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<Screen>("delivery");
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [selectedHostel, setSelectedHostel] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [deliveryItems, setDeliveryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from DB on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log("Fetching products from /api/products...");
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          console.log("Fetched products:", data);
          // Transform DB products to match static format
          const formatted = data.map((p: any) => ({
            id: p._id,
            name: p.name,
            description: p.Description,
            price: p.price,
            availability:
              p.availability === "outOfStock" ? "unavailable" : "available",
            emoji: "🛒",
            image: p.image,
          }));
          console.log("Formatted products:", formatted);
          setDeliveryItems(formatted);
        } else {
          console.error("API returned status:", res.status);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        // If fetch fails, show empty list (no fallback to static)
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

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
  }, [cartItems, deliveryItems]);

  return (
    <div className="min-h-screen bg-background pb-20 max-w-[480px] mx-auto">
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      ) : (
        <>
          {activeScreen === "delivery" && (
            <DeliveryScreen
              deliveryItems={deliveryItems}
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

          <BottomNav
            activeScreen={activeScreen}
            onScreenChange={setActiveScreen}
          />
        </>
      )}
    </div>
  );
}

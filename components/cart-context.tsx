"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";

interface CartContextType {
  cartItems: Record<string, number>;
  updateQuantity: (itemId: string, change: number) => void;
  totals: { totalItems: number; totalPrice: number };
  selectedHostel: string;
  roomNumber: string;
  setSelectedHostel: (hostel: string) => void;
  setRoomNumber: (room: string) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [selectedHostel, setSelectedHostel] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Store items price map for calculation - in a real app this might need to be fetched or passed better
  // For now, we calculate totals based on valid items if we can, or just count items.
  // The original code calculated totals based on 'activeStore' or 'stores' list.
  // We'll need a way to look up prices globally or just store prices in cart too.
  // Storing just IDs is efficient but requires price lookup.
  // Let's store a price map or rely on components to calculate line items, but context needs total.
  // Actually, let's fetch stores here or allow components to register items?
  // Simplest: The original code fetched stores in the page. We should probably fetch them here to know prices for the global cart.
  const [allProducts, setAllProducts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Restore cart from local storage if we wanted persistence, but for now just fresh session.
    // Fetch profile for address
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.address) setSelectedHostel(data.address);
          if (data.roomNumber) setRoomNumber(data.roomNumber);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    // Also fetch all products to build a price map for the cart logic
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products");
        if (res.ok) {
          const data = await res.json();
          const map: Record<string, number> = {};
          data.forEach((p: any) => {
            map[p._id] = p.price;
          });
          setAllProducts(map);
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchProfile();
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
    const totalPrice = Object.entries(cartItems).reduce((sum, [id, qty]) => {
      const price = allProducts[id] || 0;
      return sum + qty * price;
    }, 0);
    return { totalItems, totalPrice };
  }, [cartItems, allProducts]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        updateQuantity,
        totals,
        selectedHostel,
        roomNumber,
        setSelectedHostel,
        setRoomNumber,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

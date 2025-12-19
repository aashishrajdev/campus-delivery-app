"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { toast } from "sonner";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  source: "STORE" | "VENDING";
  sourceId: string;
  sourceModel: "Store" | "VendingMachine";
  image?: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  totals: { totalItems: number; totalPrice: number };
  selectedHostel: string;
  roomNumber: string;
  setSelectedHostel: (hostel: string) => void;
  setRoomNumber: (room: string) => void;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedHostel, setSelectedHostel] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Restore cart
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) { console.error(e); }
    }

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

    fetchProfile();
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isClient]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.productId === item.productId && i.sourceId === item.sourceId
      );

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        toast.success("Updated quantity in cart");
        return updated;
      }

      toast.success("Added to cart");
      return [...prev, item];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) => {
      return prev.map(item => {
        if (item.productId === productId) {
          const newQty = Math.max(0, item.quantity + delta);
          // If 0, it will be filtered out below? No, map keeps length.
          // We should filter after or handle 0 removal in removeFromCart?
          // existing logic in simple cart usually removes on 0.
          // But let's keep it simple: min 0. If 0, UI might show "Add".
          // Actually better to remove if 0.
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const totals = useMemo(() => {
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
    return { totalItems, totalPrice };
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
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

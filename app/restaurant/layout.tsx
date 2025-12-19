import { CartProvider } from "@/components/cart-context";
import { RestaurantLayoutNav } from "@/components/restaurant-layout-nav";

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="min-h-screen bg-background pb-20 max-w-[480px] mx-auto overflow-hidden">
        {children}
        <RestaurantLayoutNav />
      </div>
    </CartProvider>
  );
}

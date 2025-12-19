"use client";

import { BottomNav, type Screen } from "@/components/bottom-nav";
import { usePathname, useRouter } from "next/navigation";

export function RestaurantLayoutNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Map pathname to 'Screen' type
  // /restaurant or /restaurant/[storeId] -> 'delivery'
  // /restaurant/vending -> 'vending'
  // /restaurant/events -> 'events'
  // /restaurant/profile -> 'profile'
  // /restaurant/cart -> 'cart'

  let activeScreen: Screen = "delivery";
  if (pathname.includes("/vending")) activeScreen = "vending";
  else if (pathname.includes("/events")) activeScreen = "events";
  else if (pathname.includes("/profile")) activeScreen = "profile";
  else if (pathname.includes("/cart")) activeScreen = "cart";

  const handleScreenChange = (screen: Screen) => {
    switch (screen) {
      case "delivery":
        router.push("/restaurant");
        break;
      case "vending":
        router.push("/restaurant/vending");
        break;
      case "events":
        router.push("/restaurant/events");
        break;
      case "profile":
        router.push("/restaurant/profile");
        break;
      case "cart":
        router.push("/restaurant/cart");
        break;
    }
  };

  return (
    <BottomNav
      activeScreen={activeScreen}
      onScreenChange={handleScreenChange}
    />
  );
}

import { getStoresAction } from "./actions";
import RestaurantClient from "./restaurant-client";

export const dynamic = "force-dynamic";

export default async function RestaurantHome() {
  const storesData = await getStoresAction(Date.now());

  const formattedStores = [
    ...storesData.map((s: any) => ({ ...s, isVending: false })),
  ];

  return <RestaurantClient initialStores={formattedStores} />;
}

import { getVendingMachinesAction } from "../actions";
import VendingClient from "./vending-client";

export const dynamic = "force-dynamic";

export default async function VendingPage() {
  const data = await getVendingMachinesAction(Date.now());

  const mapped = data.map((m: any) => ({
    id: m.id,
    name: m.names,
    location: m.location,
    hostel: m.building || m.hostel || "",
    type: m.type,
  }));

  return <VendingClient initialMachines={mapped} />;
}

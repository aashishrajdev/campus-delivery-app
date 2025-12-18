"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { addVendingMachineItemAction } from "./vending-sync-actions";

export function VendingSyncClient() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [machineId, setMachineId] = useState("machine_1");
  const [machineName, setMachineName] = useState("");
  const [hostel, setHostel] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!machineId || !machineName || !hostel || !location) {
      toast.error("Please fill all fields");
      return;
    }

    startTransition(async () => {
      const fd = new FormData();
      fd.append("machineId", machineId);
      fd.append("machineName", machineName);
      fd.append("hostel", hostel);
      fd.append("location", location);

      const res = await addVendingMachineItemAction(fd);
      if (res.ok) {
        toast.success("Vending machine created!");
        setOpen(false);
        setMachineId("machine_" + Date.now());
        setMachineName("");
        setHostel("");
        setLocation("");
      } else {
        toast.error(res.error || "Failed to create machine");
      }
    });
  };

  return (
    <>
      <Button
        variant="default"
        onClick={() => setOpen(true)}
        className="w-full"
      >
        Create Vending Machine
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Vending Machine</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="machineId">Machine ID</Label>
              <Input
                id="machineId"
                value={machineId}
                onChange={(e) => setMachineId(e.target.value)}
                placeholder="e.g. machine_1"
                required
              />
            </div>

            <div>
              <Label htmlFor="machineName">Machine Name</Label>
              <Input
                id="machineName"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                placeholder="e.g. Main Lobby Vender"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="hostel">Building</Label>
                <Input
                  id="hostel"
                  value={hostel}
                  onChange={(e) => setHostel(e.target.value)}
                  placeholder="e.g. Block A"
                  required
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ground Floor"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Creating..." : "Create Machine"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

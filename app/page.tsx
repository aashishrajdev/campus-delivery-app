"use client";

export const dynamic = "force-dynamic";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    const token = localStorage.getItem("token");
    if (token) {
      router.push("/restaurant");
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between py-20 px-4 max-w-[480px] mx-auto relative overflow-hidden">
      {/* Spacer for visual balance similar to image */}
      <div className="flex-1" />

      <div className="flex flex-col items-center text-center space-y-8 z-10">
        <h1
          className="text-[#1591EA] text-5xl sm:text-3xl lg:text-[72px] leading-tight lg:leading-[1.05] font-extrabold m-0 text-inner-shadow "
          style={{
            letterSpacing: "-2px",
          }}
        >
          Snack Hub
        </h1>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <p className="text-[#1591EA] text-xl font-medium opacity-80">
          put your slogn here
        </p>
      </div>

      <div className="w-full z-10 mb-10">
        <button
          onClick={handleGetStarted}
          style={{
            borderRadius: "40px",
            background:
              "linear-gradient(180deg, #7BB6FD -17.19%, #0D6CB0 123.44%)",
            width: "100%",
            padding: "16px",
            color: "white",
            fontSize: "18px",
            fontWeight: "600",
            border: "none",
            cursor: "pointer",
            boxShadow: "0px 10px 20px rgba(13, 108, 176, 0.2)",
          }}
          className="active:scale-[0.98] transition-transform "
        >
          Start Ordering
        </button>
      </div>
    </div>
  );
}

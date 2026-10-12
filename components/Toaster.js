"use client";
import { Toaster as HotToaster } from "react-hot-toast";

export default function Toaster() {
  return (
    <HotToaster
      position="bottom-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: "#2B1D3F",
          color: "#fff",
          borderRadius: "999px",
          padding: "10px 18px",
          fontWeight: 600,
          fontSize: "15px",
        },
        success: { iconTheme: { primary: "#F5B82E", secondary: "#2B1D3F" } },
        error: { iconTheme: { primary: "#D94F70", secondary: "#fff" } },
      }}
    />
  );
}

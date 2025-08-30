import React, { useEffect } from "react";
import Header from "@/components/Header";
import ResizableSplit from "@/components/ResizableSplit";

const Index = () => {
  useEffect(() => {
    // Call server to clear Qdrant collection on page load/reload
    const clearQdrant = async () => {
      try {
        await fetch("http://localhost:8000/clear-qdrant", { method: "POST" });
      } catch (err) {
        // Silently ignore; this is a best-effort cleanup
        console.error("Failed to clear Qdrant on load:", err);
      }
    };

    clearQdrant();
  }, []);
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <ResizableSplit />
    </div>
  );
};

export default Index;

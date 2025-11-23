import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import ResizableSplit from "@/components/ResizableSplit";
import { useIsMobile } from "@/hooks/use-mobile";
import PDFViewer from "@/components/PDFViewer";
import ChatPanel from "@/components/ChatPanel";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { FileText, MessageSquare } from "lucide-react";

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

  const isMobile = useIsMobile();
  const [view, setView] = useState<"pdf" | "chat">("pdf");

  if (isMobile === undefined) {
    return null; // or a loading spinner
  }

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto pb-20">
          {view === "pdf" ? <PDFViewer /> : <ChatPanel />}
        </main>
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20">
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(value) => {
              if (value) setView(value as "pdf" | "chat");
            }}
            className="bg-background border shadow-lg rounded-full p-1 gap-1"
          >
            <ToggleGroupItem
              value="pdf"
              aria-label="PDF View"
              className="rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <FileText className="h-5 w-5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="chat"
              aria-label="Chat View"
              className="rounded-full data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            >
              <MessageSquare className="h-5 w-5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <ResizableSplit />
    </div>
  );
};

export default Index;

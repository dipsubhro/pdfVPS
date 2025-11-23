import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const PDFViewer = () => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF file",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      setPdfName(file.name);

      try {
        try {
          await fetch("http://localhost:8000/clear-qdrant", { method: "POST" });
        } catch (err) {
          console.error("Failed to clear Qdrant before upload:", err);
        }

        const formData = new FormData();
        formData.append("pdf", file);

        const response = await fetch("http://localhost:8000/upload/pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Upload failed");
        }

        const url = URL.createObjectURL(file);
        setPdfUrl(url);

        toast({
          title: "PDF uploaded successfully",
          description: `${file.name} is ready to view`,
        });
      } catch (error) {
        toast({
          title: "Upload error",
          description: "Something went wrong while uploading the PDF.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="minimal-theme flex flex-col h-full">
      <div className="header p-3 flex justify-between items-center">
        <h2 className="title">PDF Viewer</h2>

        <div className="relative">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 w-full cursor-pointer"
          />
          <Button variant="outline" className="btn" disabled={isLoading}>
            <Upload className="h-4 w-4" />
            Upload PDF
          </Button>
        </div>
      </div>

      
        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in">
              <div className="animate-pulse-light flex flex-col items-center gap-4">
                <FileText className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Loading PDF...</p>
              </div>
            </div>
          ) : pdfUrl ? (
            <div className="h-full w-full p-2 animate-fade-in">
              <div className="bg-accent p-2 mb-2 rounded text-sm overflow-hidden">
                <p className="truncate"><strong>File:</strong> {pdfName}</p>
              </div>
              <object
                data={pdfUrl}
                type="application/pdf"
                className="w-full h-[calc(100%-2.5rem)]"
              >
                <p>
                  It appears your browser doesn't support PDF viewing. You can{" "}
                  <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    download the PDF
                  </a>{" "}
                  instead.
                </p>
              </object>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in">
              <div className="bg-background p-8 rounded-lg border-2 border-dashed border-secondary flex flex-col items-center justify-center max-w-md">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No PDF uploaded yet</h3>
                <p className="text-foreground text-center mb-4">
                  Upload a PDF document to view it here and chat with AI about its contents.
                </p>
                <div className="relative w-full">
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 w-full cursor-pointer z-10"
                  />
                  <Button className="w-full gap-2 animate-pulse-light">
                    <Upload className="h-4 w-4" />
                    Select PDF file
                  </Button>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
    </div>
  );
};

export default PDFViewer;

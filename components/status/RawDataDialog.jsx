"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Code, Copy, Check } from "lucide-react";

export function RawDataDialog({ status, isOpen, setIsOpen }) {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(status, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center"
          onClick={() => setIsOpen(true)}
        >
          <Code className="mr-1 h-4 w-4" />
          View Raw Data{" "}
          <kbd className="ml-1 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
            ⌘K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Raw JSON Data</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={copyToClipboard}
            className="absolute top-4 right-2 z-10"
          >
            {isCopied ? (
              <Check className="h-4 w-4 mr-1" />
            ) : (
              <Copy className="h-4 w-4 mr-1" />
            )}
            {isCopied ? "Copied!" : "Copy"}
          </Button>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 mt-2">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}

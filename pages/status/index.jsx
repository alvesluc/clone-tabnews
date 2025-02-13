"use client";

import { RawDataDialog } from "@/components/status/RawDataDialog";
import { StatusCard } from "@/components/status/StatusCard";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Home, Info, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import useSWR from "swr";

/**
 * @typedef {Object} Status
 * @property {string} updated_at
 * @property {Dependencies} dependencies */

/**
 * @typedef {Object} Dependencies
 * @property {Database} database */

/**
 * @typedef {Object} Database
 * @property {string} version
 * @property {number} max_connections
 * @property {number} open_connections */

const REFRESH_INTERVAL = 5000;

/** @return {Promise<Status>} */
async function fetchAPI(key) {
  const response = await fetch(key);

  if (!response.ok) {
    const errorData = await response.json();
    throw errorData;
  }

  return response.json();
}

export default function StatusPage() {
  const router = useRouter();
  const {
    data: status,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/v1/status", fetchAPI, {
    refreshInterval: REFRESH_INTERVAL,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleKeyDown = useCallback(
    /** @param {KeyboardEvent} event */
    (event) => {
      if (isShortcutKey) {
        const shortcutFromKeyCombination = keysShortcut[event.key];
        if (!shortcutFromKeyCombination) return;

        return shortcutFromKeyCombination(event);
      }
    },
    [router],
  );

  /**
   * @param {KeyboardEvent} event
   * @returns {boolean} */
  const isShortcutKey = (event) => event.metaKey || event.ctrlKey;

  /** @param {KeyboardEvent} event */
  const handleNavigateHome = (event) => {
    event.preventDefault();
    router.push("/");
  };

  /** @param {KeyboardEvent} event */
  const toggleRawDataDialog = (event) => {
    event.preventDefault();
    setIsDialogOpen((prev) => !prev);
  };

  /** @type {Record<string, (event: KeyboardEvent) => void>} */
  const keysShortcut = {
    "/": handleNavigateHome,
    k: toggleRawDataDialog,
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="w-full max-w-md space-y-4">
          <h2 className="text-2xl font-bold text-red-500">
            {error.name || "Error"}
          </h2>
          <p>{error.message || "Failed to load status"}</p>
          {error.action && <p className="font-medium">{error.action}</p>}
          {error.status_code && <p>Status Code: {error.status_code}</p>}
          <div className="flex justify-between">
            <Button onClick={() => mutate()} className="flex items-center">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Retry
            </Button>
            <Link href="/">
              <Button variant="outline" className="flex items-center">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-center">System Status</h1>
        <p className="text-center text-muted-foreground mb-4 flex items-center justify-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex flex-row items-center">
                  Auto-refreshing
                  <Info className="h-5 w-5 ml-1" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  This page auto-refreshes every {REFRESH_INTERVAL / 1000}{" "}
                  seconds
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </p>
        <StatusCard status={status} isLoading={isLoading} />
        <div className="mt-6 flex justify-between">
          <RawDataDialog
            status={status}
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
          />
          <Link href="/" tabindex="-1">
            <Button variant="outline" className="flex items-center">
              <Home className="mr-1 h-4 w-4" />
              Back to Home{" "}
              <kbd className="ml-1 inline-flex h-5 max-h-full items-center rounded border border-border bg-background px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                ⌘/
              </kbd>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

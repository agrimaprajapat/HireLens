"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Loader2, Save } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SavedType } from "@/lib/saved/types";

interface SaveToDashboardProps {
  type: SavedType;
  payload: unknown;
  resumeName: string;
  defaultTitle: string;
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Save bar shown beneath a generated result. Signed-out users see a sign-in
 * prompt; signed-in users can rename the item and save it to their dashboard.
 */
function SaveToDashboard({
  type,
  payload,
  resumeName,
  defaultTitle,
}: SaveToDashboardProps) {
  const { isLoaded, isSignedIn } = useAuth();
  const [title, setTitle] = useState(defaultTitle);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (status === "saving") return;
    setStatus("saving");
    setError(null);
    try {
      const response = await fetch(`/api/saved/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim() || defaultTitle, resumeName, payload }),
      });
      if (!response.ok) {
        setStatus("error");
        setError("We couldn't save this. Please try again.");
        return;
      }
      setStatus("saved");
    } catch {
      setStatus("error");
      setError("We couldn't reach the server. Please try again.");
    }
  };

  if (!isLoaded) return null;

  return (
    <Card className="mt-4 flex-row flex-wrap items-center justify-between gap-4 p-4">
      {!isSignedIn ? (
        <>
          <p className="text-sm text-muted-foreground">
            Sign in to save this to your dashboard.
          </p>
          <Button size="sm" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </>
      ) : status === "saved" ? (
        <>
          <p className="flex items-center gap-2 text-sm font-medium">
            <Check className="size-4 text-brand" />
            Saved to your dashboard.
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard">View in dashboard</Link>
          </Button>
        </>
      ) : (
        <>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor={`save-title-${type}`} className="eyebrow">
              Save to dashboard
            </label>
            <Input
              id={`save-title-${type}`}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={status === "saving"}
              placeholder="Name this item"
              className="max-w-sm"
            />
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
          </div>
          <Button onClick={handleSave} disabled={status === "saving"}>
            {status === "saving" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="size-4" />
                Save
              </>
            )}
          </Button>
        </>
      )}
    </Card>
  );
}

export { SaveToDashboard };

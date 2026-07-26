"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Eye, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { SavedItemSummary, SavedType } from "@/lib/saved/types";

interface SavedItemCardProps {
  type: SavedType;
  item: SavedItemSummary;
}

type Action = "idle" | "duplicating" | "deleting";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** A saved dashboard item with View / Duplicate / Delete (inline confirm). */
function SavedItemCard({ type, item }: SavedItemCardProps) {
  const router = useRouter();
  const [action, setAction] = useState<Action>("idle");
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const busy = action !== "idle";

  const handleDuplicate = async () => {
    setAction("duplicating");
    setError(null);
    try {
      const res = await fetch(`/api/saved/${type}/${item.id}/duplicate`, {
        method: "POST",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Couldn't duplicate. Try again.");
      setAction("idle");
    }
  };

  const handleDelete = async () => {
    setAction("deleting");
    setError(null);
    try {
      const res = await fetch(`/api/saved/${type}/${item.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      router.refresh();
    } catch {
      setError("Couldn't delete. Try again.");
      setAction("idle");
      setConfirmingDelete(false);
    }
  };

  return (
    <Card className="gap-4 p-5">
      <div>
        <h3 className="truncate font-medium tracking-tight">{item.title}</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatDate(item.createdAt)}
        </p>
        {item.resumeName && (
          <p className="mt-2 truncate text-sm text-muted-foreground">
            From {item.resumeName}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}

      {confirmingDelete ? (
        <div className="flex items-center gap-2">
          <span className="flex-1 text-sm text-muted-foreground">
            Delete this item?
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingDelete(false)}
            disabled={busy}
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={busy}
            className="border-destructive/30 text-destructive hover:bg-destructive/5"
          >
            {action === "deleting" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
            Delete
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/dashboard/${type}/${item.id}`}>
              <Eye className="size-4" />
              View
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDuplicate}
            disabled={busy}
            aria-label="Duplicate"
          >
            {action === "duplicating" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmingDelete(true)}
            disabled={busy}
            aria-label="Delete"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}

export { SavedItemCard };

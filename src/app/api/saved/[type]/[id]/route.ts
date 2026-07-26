import { NextResponse } from "next/server";

import { getDbUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { deleteSaved, getSaved, renameSaved } from "@/lib/saved/service";
import { isSavedType } from "@/lib/saved/types";

export const runtime = "nodejs";

type Params = { params: Promise<{ type: string; id: string }> };

/** GET /api/saved/[type]/[id] — fetch a single owned item with its payload. */
export async function GET(_request: Request, { params }: Params) {
  const { type, id } = await params;
  if (!isSavedType(type)) return jsonError("not_found", "Unknown item type.", 404);

  const user = await getDbUser();
  if (!user) return jsonError("unauthorized", "Please sign in.", 401);

  const item = await getSaved(user.id, type, id);
  if (!item) return jsonError("not_found", "Item not found.", 404);

  return NextResponse.json({ ok: true, item });
}

/** PATCH /api/saved/[type]/[id] — rename an owned item. */
export async function PATCH(request: Request, { params }: Params) {
  const { type, id } = await params;
  if (!isSavedType(type)) return jsonError("not_found", "Unknown item type.", 404);

  const user = await getDbUser();
  if (!user) return jsonError("unauthorized", "Please sign in.", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid_input", "Invalid request body.", 400);
  }

  const title = (body as { title?: unknown })?.title;
  if (typeof title !== "string" || title.trim().length === 0) {
    return jsonError("invalid_input", "Please provide a title.", 400);
  }

  const count = await renameSaved(user.id, type, id, title.trim().slice(0, 120));
  if (count === 0) return jsonError("not_found", "Item not found.", 404);

  return NextResponse.json({ ok: true });
}

/** DELETE /api/saved/[type]/[id] — delete an owned item. */
export async function DELETE(_request: Request, { params }: Params) {
  const { type, id } = await params;
  if (!isSavedType(type)) return jsonError("not_found", "Unknown item type.", 404);

  const user = await getDbUser();
  if (!user) return jsonError("unauthorized", "Please sign in.", 401);

  const count = await deleteSaved(user.id, type, id);
  if (count === 0) return jsonError("not_found", "Item not found.", 404);

  return NextResponse.json({ ok: true });
}

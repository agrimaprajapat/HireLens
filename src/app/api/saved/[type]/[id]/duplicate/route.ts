import { NextResponse } from "next/server";

import { getDbUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { duplicateSaved } from "@/lib/saved/service";
import { isSavedType } from "@/lib/saved/types";

export const runtime = "nodejs";

/** POST /api/saved/[type]/[id]/duplicate — copy an owned item. */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { type, id } = await params;
  if (!isSavedType(type)) return jsonError("not_found", "Unknown item type.", 404);

  const user = await getDbUser();
  if (!user) return jsonError("unauthorized", "Please sign in.", 401);

  const created = await duplicateSaved(user.id, type, id);
  if (!created) return jsonError("not_found", "Item not found.", 404);

  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}

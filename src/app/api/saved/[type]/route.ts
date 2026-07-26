import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { getDbUser } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { payloadSchemas } from "@/lib/saved/payloads";
import { createSaved, listSaved } from "@/lib/saved/service";
import {
  isSavedType,
  SAVED_TYPE_LABELS,
  type SavedType,
} from "@/lib/saved/types";

export const runtime = "nodejs";

/** GET /api/saved/[type] — list the signed-in user's saved items of a type. */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  if (!isSavedType(type)) return jsonError("not_found", "Unknown item type.", 404);

  const user = await getDbUser();
  if (!user) return jsonError("unauthorized", "Please sign in.", 401);

  const items = await listSaved(user.id, type);
  return NextResponse.json({ ok: true, items });
}

/** POST /api/saved/[type] — save a generated result to the dashboard. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  if (!isSavedType(type)) return jsonError("not_found", "Unknown item type.", 404);

  const user = await getDbUser();
  if (!user) return jsonError("unauthorized", "Please sign in.", 401);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("invalid_input", "Invalid request body.", 400);
  }

  const { title, resumeName, payload } = (body ?? {}) as {
    title?: unknown;
    resumeName?: unknown;
    payload?: unknown;
  };

  const parsedPayload = payloadSchemas[type as SavedType].safeParse(payload);
  if (!parsedPayload.success) {
    return jsonError("invalid_input", "The item could not be saved.", 400);
  }

  const cleanTitle =
    typeof title === "string" && title.trim().length > 0
      ? title.trim().slice(0, 120)
      : SAVED_TYPE_LABELS[type];
  const cleanResumeName =
    typeof resumeName === "string" ? resumeName.slice(0, 200) : "";

  const created = await createSaved(user.id, type, {
    title: cleanTitle,
    resumeName: cleanResumeName,
    payload: parsedPayload.data as Prisma.InputJsonValue,
  });

  return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
}

import "server-only";

import { auth, currentUser } from "@clerk/nextjs/server";

import { FREE_PLAN_CREDITS } from "@/lib/constants";
import { prisma } from "@/lib/db";

/**
 * Resolve the current signed-in user as a database record.
 *
 * Users are authenticated by Clerk; we mirror a minimal row keyed by the Clerk
 * user id and create it lazily the first time a signed-in user saves something
 * (no webhook needed). Returns null when there is no authenticated user.
 */
export async function getDbUser() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId } });
  if (existing) return existing;

  // First save from this user — create the mirror row from Clerk profile data.
  const clerkUser = await currentUser();
  return prisma.user.create({
    data: {
      clerkId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress ?? "",
      name:
        [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ") ||
        null,
      credits: FREE_PLAN_CREDITS,
    },
  });
}

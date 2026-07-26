import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type {
  SavedItemDetail,
  SavedItemSummary,
  SavedType,
} from "@/lib/saved/types";

/**
 * Data access for saved items. The three kinds map to three Prisma models with
 * an identical shape; a `switch` on `SavedType` dispatches to the right model in
 * a fully type-safe way (no `any`). Every query is scoped to `userId`, so users
 * can only ever read or mutate their own records.
 */

interface SavedInput {
  title: string;
  resumeName: string;
  payload: Prisma.InputJsonValue;
}

const summarySelect = {
  id: true,
  title: true,
  resumeName: true,
  createdAt: true,
} as const;

type SummaryRow = {
  id: string;
  title: string;
  resumeName: string;
  createdAt: Date;
};

function toSummary(row: SummaryRow): SavedItemSummary {
  return {
    id: row.id,
    title: row.title,
    resumeName: row.resumeName,
    createdAt: row.createdAt.toISOString(),
  };
}

function assertNever(value: never): never {
  throw new Error(`Unhandled saved type: ${String(value)}`);
}

export async function listSaved(
  userId: string,
  type: SavedType
): Promise<SavedItemSummary[]> {
  const args = {
    where: { userId },
    orderBy: { createdAt: "desc" as const },
    select: summarySelect,
  };
  switch (type) {
    case "resume-analysis":
      return (await prisma.resumeAnalysis.findMany(args)).map(toSummary);
    case "job-match":
      return (await prisma.jobMatch.findMany(args)).map(toSummary);
    case "cover-letter":
      return (await prisma.coverLetter.findMany(args)).map(toSummary);
    default:
      return assertNever(type);
  }
}

export async function createSaved(
  userId: string,
  type: SavedType,
  input: SavedInput
): Promise<{ id: string }> {
  const data = { ...input, userId };
  switch (type) {
    case "resume-analysis":
      return prisma.resumeAnalysis.create({ data, select: { id: true } });
    case "job-match":
      return prisma.jobMatch.create({ data, select: { id: true } });
    case "cover-letter":
      return prisma.coverLetter.create({ data, select: { id: true } });
    default:
      return assertNever(type);
  }
}

export async function getSaved(
  userId: string,
  type: SavedType,
  id: string
): Promise<SavedItemDetail<unknown> | null> {
  const where = { id, userId };
  const record = await (async () => {
    switch (type) {
      case "resume-analysis":
        return prisma.resumeAnalysis.findFirst({ where });
      case "job-match":
        return prisma.jobMatch.findFirst({ where });
      case "cover-letter":
        return prisma.coverLetter.findFirst({ where });
      default:
        return assertNever(type);
    }
  })();

  if (!record) return null;
  return {
    id: record.id,
    title: record.title,
    resumeName: record.resumeName,
    createdAt: record.createdAt.toISOString(),
    payload: record.payload,
  };
}

export async function renameSaved(
  userId: string,
  type: SavedType,
  id: string,
  title: string
): Promise<number> {
  const args = { where: { id, userId }, data: { title } };
  switch (type) {
    case "resume-analysis":
      return (await prisma.resumeAnalysis.updateMany(args)).count;
    case "job-match":
      return (await prisma.jobMatch.updateMany(args)).count;
    case "cover-letter":
      return (await prisma.coverLetter.updateMany(args)).count;
    default:
      return assertNever(type);
  }
}

export async function deleteSaved(
  userId: string,
  type: SavedType,
  id: string
): Promise<number> {
  const args = { where: { id, userId } };
  switch (type) {
    case "resume-analysis":
      return (await prisma.resumeAnalysis.deleteMany(args)).count;
    case "job-match":
      return (await prisma.jobMatch.deleteMany(args)).count;
    case "cover-letter":
      return (await prisma.coverLetter.deleteMany(args)).count;
    default:
      return assertNever(type);
  }
}

export async function duplicateSaved(
  userId: string,
  type: SavedType,
  id: string
): Promise<{ id: string } | null> {
  const existing = await getSaved(userId, type, id);
  if (!existing) return null;
  return createSaved(userId, type, {
    title: `${existing.title} (copy)`,
    resumeName: existing.resumeName,
    payload: existing.payload as Prisma.InputJsonValue,
  });
}

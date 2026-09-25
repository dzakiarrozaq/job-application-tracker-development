import { requireUserId } from "@/lib/auth-helpers";
import { getDocumentsForUser } from "@/lib/queries";
import { db } from "@/db";
import { applicationDocuments } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { DocumentsClient } from "./documents-client";

export const dynamic = "force-dynamic";

export default async function DocumentsPage() {
  const userId = await requireUserId();
  const documents = await getDocumentsForUser(userId);

  const docIds = documents.map((d) => d.id);
  const links = docIds.length
    ? await db.select().from(applicationDocuments).where(inArray(applicationDocuments.documentId, docIds))
    : [];

  const usageCount: Record<string, number> = {};
  for (const link of links) {
    usageCount[link.documentId] = (usageCount[link.documentId] ?? 0) + 1;
  }

  return <DocumentsClient documents={documents} usageCount={usageCount} />;
}

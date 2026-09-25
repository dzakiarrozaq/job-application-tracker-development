import { requireUserId } from "@/lib/auth-helpers";
import { getApplicationsForUser, getDocumentsForUser, getPipelinesWithStages } from "@/lib/queries";
import { db } from "@/db";
import { applicationDocuments, applicationStageHistory } from "@/db/schema";
import { asc, inArray } from "drizzle-orm";
import { BoardClient } from "./board-client";

type LinkRow = typeof applicationDocuments.$inferSelect;
type HistoryRow = typeof applicationStageHistory.$inferSelect;

export const dynamic = "force-dynamic";

export default async function BoardPage() {
  const userId = await requireUserId();
  const [applications, pipelines, documents] = await Promise.all([
    getApplicationsForUser(userId),
    getPipelinesWithStages(userId),
    getDocumentsForUser(userId),
  ]);

  const appIds = applications.map((a) => a.id);
  const [links, historyRows] = await Promise.all([
    appIds.length
      ? db.select().from(applicationDocuments).where(inArray(applicationDocuments.applicationId, appIds))
      : Promise.resolve([] as LinkRow[]),
    appIds.length
      ? db
          .select()
          .from(applicationStageHistory)
          .where(inArray(applicationStageHistory.applicationId, appIds))
          .orderBy(asc(applicationStageHistory.enteredAt))
      : Promise.resolve([] as HistoryRow[]),
  ]);

  const documentsByApplication: Record<string, string[]> = {};
  for (const link of links) {
    documentsByApplication[link.applicationId] ??= [];
    documentsByApplication[link.applicationId].push(link.documentId);
  }

  const historyByApplication: Record<string, HistoryRow[]> = {};
  for (const row of historyRows) {
    historyByApplication[row.applicationId] ??= [];
    historyByApplication[row.applicationId].push(row);
  }

  return (
    <BoardClient
      initialApplications={applications}
      pipelines={pipelines}
      documents={documents}
      documentsByApplication={documentsByApplication}
      historyByApplication={historyByApplication}
    />
  );
}

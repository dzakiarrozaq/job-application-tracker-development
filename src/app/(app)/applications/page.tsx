import { requireUserId } from "@/lib/auth-helpers";
import { getApplicationsForUser, getDocumentsForUser, getPipelinesWithStages } from "@/lib/queries";
import { ApplicationsClient } from "./applications-client";
import { db } from "@/db";
import { applicationDocuments, applicationStageHistory } from "@/db/schema";
import { asc, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const userId = await requireUserId();
  const [applications, pipelines, documents] = await Promise.all([
    getApplicationsForUser(userId),
    getPipelinesWithStages(userId),
    getDocumentsForUser(userId),
  ]);

  const appIds = applications.map((a) => a.id);
  const links = appIds.length
    ? await db
        .select()
        .from(applicationDocuments)
        .where(inArray(applicationDocuments.applicationId, appIds))
    : [];

  const documentsByApplication: Record<string, string[]> = {};
  for (const link of links) {
    documentsByApplication[link.applicationId] ??= [];
    documentsByApplication[link.applicationId].push(link.documentId);
  }

  const historyRows = appIds.length
    ? await db
        .select()
        .from(applicationStageHistory)
        .where(inArray(applicationStageHistory.applicationId, appIds))
        .orderBy(asc(applicationStageHistory.enteredAt))
    : [];

  const historyByApplication: Record<string, typeof historyRows[number][]> = {};
  for (const row of historyRows) {
    historyByApplication[row.applicationId] ??= [];
    historyByApplication[row.applicationId].push(row);
  }

  return (
    <ApplicationsClient
      applications={applications}
      pipelines={pipelines}
      documents={documents}
      documentsByApplication={documentsByApplication}
      historyByApplication={historyByApplication}
    />
  );
}

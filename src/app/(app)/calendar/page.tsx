import { requireUserId } from "@/lib/auth-helpers";
import { getApplicationsForUser, getDocumentsForUser, getPipelinesWithStages } from "@/lib/queries";
import { db } from "@/db";
import { applicationDocuments } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { CalendarClient } from "./calendar-client";

export const metadata = {
  title: "Kalender | Job Tracker",
};

export default async function CalendarPage() {
  const userId = await requireUserId();
  
  const [applications, pipelines, documents] = await Promise.all([
    getApplicationsForUser(userId),
    getPipelinesWithStages(userId),
    getDocumentsForUser(userId),
  ]);

  const appsWithSchedule = applications.filter((a) => a.interviewDate != null);
  const appIds = appsWithSchedule.map((a) => a.id);

  const links = appIds.length
    ? await db.select().from(applicationDocuments).where(inArray(applicationDocuments.applicationId, appIds))
    : [];

  const documentsByApplication: Record<string, string[]> = {};
  for (const link of links) {
    documentsByApplication[link.applicationId] ??= [];
    documentsByApplication[link.applicationId].push(link.documentId);
  }

  return (
    <div className="mx-auto max-w-5xl">
      <CalendarClient 
        applications={appsWithSchedule} 
        pipelines={pipelines} 
        documents={documents} 
        documentsByApplication={documentsByApplication} 
      />
    </div>
  );
}

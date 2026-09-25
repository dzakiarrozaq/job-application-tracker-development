import { db } from "@/db";
import {
  applicationDocuments,
  applications,
  applicationStageHistory,
  documents,
  pipelineStages,
  pipelines,
} from "@/db/schema";
import { and, asc, eq, inArray } from "drizzle-orm";

export async function getPipelinesWithStages(userId: string) {
  const rows = await db
    .select()
    .from(pipelines)
    .where(eq(pipelines.userId, userId))
    .orderBy(asc(pipelines.createdAt));

  const pipelineIds = rows.map((p) => p.id);
  const stages = pipelineIds.length
    ? await db
        .select()
        .from(pipelineStages)
        .where(inArray(pipelineStages.pipelineId, pipelineIds))
        .orderBy(asc(pipelineStages.order))
    : [];

  return rows.map((pipeline) => ({
    ...pipeline,
    stages: stages.filter((s) => s.pipelineId === pipeline.id),
  }));
}

export async function getPipelineWithStages(userId: string, pipelineId: string) {
  const [pipeline] = await db
    .select()
    .from(pipelines)
    .where(and(eq(pipelines.id, pipelineId), eq(pipelines.userId, userId)))
    .limit(1);

  if (!pipeline) return null;

  const stages = await db
    .select()
    .from(pipelineStages)
    .where(eq(pipelineStages.pipelineId, pipelineId))
    .orderBy(asc(pipelineStages.order));

  return { ...pipeline, stages };
}

export async function getApplicationsForUser(userId: string) {
  return db
    .select()
    .from(applications)
    .where(and(eq(applications.userId, userId), eq(applications.archived, false)))
    .orderBy(asc(applications.createdAt));
}

export async function getApplicationsByPipeline(userId: string, pipelineId: string) {
  return db
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.userId, userId),
        eq(applications.pipelineId, pipelineId),
        eq(applications.archived, false),
      ),
    )
    .orderBy(asc(applications.createdAt));
}

export async function getDocumentsForUser(userId: string) {
  return db.select().from(documents).where(eq(documents.userId, userId)).orderBy(asc(documents.createdAt));
}

export async function getDocumentIdsForApplication(applicationId: string) {
  const rows = await db
    .select({ documentId: applicationDocuments.documentId })
    .from(applicationDocuments)
    .where(eq(applicationDocuments.applicationId, applicationId));
  return rows.map((r) => r.documentId);
}

export async function getApplicationDetail(userId: string, applicationId: string) {
  const [application] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
    .limit(1);

  if (!application) return null;

  const [attachedDocs, history, stages] = await Promise.all([
    db
      .select({ document: documents })
      .from(applicationDocuments)
      .innerJoin(documents, eq(documents.id, applicationDocuments.documentId))
      .where(eq(applicationDocuments.applicationId, applicationId)),
    db
      .select()
      .from(applicationStageHistory)
      .where(eq(applicationStageHistory.applicationId, applicationId))
      .orderBy(asc(applicationStageHistory.enteredAt)),
    db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.pipelineId, application.pipelineId))
      .orderBy(asc(pipelineStages.order)),
  ]);

  return {
    application,
    documents: attachedDocs.map((d) => d.document),
    history,
    stages,
  };
}

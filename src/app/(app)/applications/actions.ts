"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import {
  applicationDocuments,
  applications,
  applicationStageHistory,
  pipelineStages,
} from "@/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";

const applicationSchema = z.object({
  company: z.string().min(1, "Nama perusahaan wajib diisi"),
  position: z.string().min(1, "Posisi wajib diisi"),
  jobUrl: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  salaryExpectation: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  pipelineId: z.string().min(1, "Pipeline wajib dipilih"),
  stageId: z.string().min(1, "Tahapan wajib dipilih"),
  appliedDate: z.string().optional(),
  interviewDate: z.string().optional().nullable(),
});

function extractDocumentIds(formData: FormData) {
  return formData.getAll("documentIds").map(String).filter(Boolean);
}

async function stageTypeToOutcome(stageId: string) {
  const [stage] = await db.select().from(pipelineStages).where(eq(pipelineStages.id, stageId)).limit(1);
  if (!stage) return "active" as const;
  if (stage.type === "normal") return "active" as const;
  return stage.type;
}

export async function createApplication(_prev: { error?: string } | undefined, formData: FormData) {
  const userId = await requireUserId();
  const parsed = applicationSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const data = parsed.data;
  let finalStageId = data.stageId;
  
  if (data.interviewDate) {
    const [interviewStage] = await db
      .select()
      .from(pipelineStages)
      .where(and(eq(pipelineStages.pipelineId, data.pipelineId), eq(pipelineStages.isInterviewStage, true)))
      .limit(1);
    if (interviewStage) finalStageId = interviewStage.id;
  }

  const outcome = await stageTypeToOutcome(finalStageId);

  const [created] = await db
    .insert(applications)
    .values({
      userId,
      company: data.company,
      position: data.position,
      jobUrl: data.jobUrl || null,
      location: data.location || null,
      salaryExpectation: data.salaryExpectation || null,
      notes: data.notes || null,
      pipelineId: data.pipelineId,
      currentStageId: finalStageId,
      outcome,
      interviewDate: data.interviewDate ? new Date(data.interviewDate) : null,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : new Date(),
    })
    .returning({ id: applications.id });

  await db.insert(applicationStageHistory).values({ applicationId: created.id, stageId: finalStageId });

  const documentIds = extractDocumentIds(formData);
  if (documentIds.length) {
    await db
      .insert(applicationDocuments)
      .values(documentIds.map((documentId) => ({ applicationId: created.id, documentId })));
  }

  revalidatePath("/applications");
  revalidatePath("/board");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateApplication(_prev: { error?: string } | undefined, formData: FormData) {
  const userId = await requireUserId();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "ID lamaran tidak ditemukan" };

  const parsed = applicationSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const data = parsed.data;

  const [existing] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.id, id), eq(applications.userId, userId)))
    .limit(1);
  if (!existing) return { error: "Lamaran tidak ditemukan" };

  let finalStageId = data.stageId;

  // Auto-move to interview stage if there is an interview date, 
  // they didn't manually change the stage in the form, 
  // and they are not already in the interview stage.
  if (data.interviewDate && data.stageId === existing.currentStageId) {
    const [currentStage] = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.id, existing.currentStageId))
      .limit(1);

    if (currentStage && !currentStage.isInterviewStage) {
      const [interviewStage] = await db
        .select()
        .from(pipelineStages)
        .where(and(eq(pipelineStages.pipelineId, data.pipelineId), eq(pipelineStages.isInterviewStage, true)))
        .limit(1);
        
      if (interviewStage) {
        finalStageId = interviewStage.id;
      }
    }
  }

  const stageChanged = existing.currentStageId !== finalStageId;
  const outcome = await stageTypeToOutcome(finalStageId);

  await db
    .update(applications)
    .set({
      company: data.company,
      position: data.position,
      jobUrl: data.jobUrl || null,
      location: data.location || null,
      salaryExpectation: data.salaryExpectation || null,
      notes: data.notes || null,
      pipelineId: data.pipelineId,
      currentStageId: finalStageId,
      outcome,
      interviewDate: data.interviewDate ? new Date(data.interviewDate) : null,
      appliedDate: data.appliedDate ? new Date(data.appliedDate) : existing.appliedDate,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, id));

  if (stageChanged) {
    await db.insert(applicationStageHistory).values({ applicationId: id, stageId: finalStageId });
  }

  await db.delete(applicationDocuments).where(eq(applicationDocuments.applicationId, id));
  const documentIds = extractDocumentIds(formData);
  if (documentIds.length) {
    await db
      .insert(applicationDocuments)
      .values(documentIds.map((documentId) => ({ applicationId: id, documentId })));
  }

  revalidatePath("/applications");
  revalidatePath("/board");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteApplication(id: string) {
  const userId = await requireUserId();
  await db.delete(applications).where(and(eq(applications.id, id), eq(applications.userId, userId)));
  revalidatePath("/applications");
  revalidatePath("/board");
  revalidatePath("/dashboard");
}

export async function moveApplicationStage(applicationId: string, stageId: string) {
  const userId = await requireUserId();

  const [existing] = await db
    .select()
    .from(applications)
    .where(and(eq(applications.id, applicationId), eq(applications.userId, userId)))
    .limit(1);
  if (!existing) throw new Error("Lamaran tidak ditemukan");

  const outcome = await stageTypeToOutcome(stageId);

  await db
    .update(applications)
    .set({ currentStageId: stageId, outcome, updatedAt: new Date() })
    .where(eq(applications.id, applicationId));

  if (existing.currentStageId !== stageId) {
    await db.insert(applicationStageHistory).values({ applicationId, stageId });
  }

  revalidatePath("/board");
  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function getFirstStageId(pipelineId: string) {
  const [stage] = await db
    .select()
    .from(pipelineStages)
    .where(eq(pipelineStages.pipelineId, pipelineId))
    .orderBy(asc(pipelineStages.order))
    .limit(1);
  return stage?.id ?? null;
}

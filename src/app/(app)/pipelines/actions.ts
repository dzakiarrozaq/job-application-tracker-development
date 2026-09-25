"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { pipelines, pipelineStages, applications } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";

const stageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  type: z.enum(["normal", "offer", "hired", "rejected"]),
  isInterviewStage: z.boolean().optional().default(false),
  color: z.string().min(1),
});

const pipelineSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama pipeline wajib diisi"),
  description: z.string().optional().nullable(),
  stages: z.array(stageSchema).min(1, "Minimal harus ada 1 tahapan"),
});

export type PipelineFormState = { error?: string; success?: boolean };

export async function savePipeline(
  _prev: PipelineFormState | undefined,
  formData: FormData,
): Promise<PipelineFormState> {
  const userId = await requireUserId();

  let stagesRaw: unknown;
  try {
    stagesRaw = JSON.parse(String(formData.get("stagesJson") ?? "[]"));
  } catch {
    return { error: "Format tahapan tidak valid" };
  }

  const parsed = pipelineSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    description: formData.get("description"),
    stages: stagesRaw,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const data = parsed.data;

  if (data.id) {
    const [existing] = await db
      .select()
      .from(pipelines)
      .where(and(eq(pipelines.id, data.id), eq(pipelines.userId, userId)))
      .limit(1);
    if (!existing) return { error: "Pipeline tidak ditemukan" };

    await db
      .update(pipelines)
      .set({ name: data.name, description: data.description || null })
      .where(eq(pipelines.id, data.id));

    const existingStages = await db
      .select()
      .from(pipelineStages)
      .where(eq(pipelineStages.pipelineId, data.id));
    const existingIds = new Set(existingStages.map((s) => s.id));
    const keptIds = new Set(data.stages.filter((s) => s.id).map((s) => s.id as string));

    for (const stageId of existingIds) {
      if (!keptIds.has(stageId)) {
        await db.delete(pipelineStages).where(eq(pipelineStages.id, stageId));
      }
    }

    for (let i = 0; i < data.stages.length; i++) {
      const stage = data.stages[i];
      if (stage.id && existingIds.has(stage.id)) {
        await db
          .update(pipelineStages)
          .set({
            name: stage.name,
            type: stage.type,
            isInterviewStage: stage.isInterviewStage ?? false,
            color: stage.color,
            order: i,
          })
          .where(eq(pipelineStages.id, stage.id));
      } else {
        await db.insert(pipelineStages).values({
          pipelineId: data.id,
          name: stage.name,
          type: stage.type,
          isInterviewStage: stage.isInterviewStage ?? false,
          color: stage.color,
          order: i,
        });
      }
    }
  } else {
    const [created] = await db
      .insert(pipelines)
      .values({ userId, name: data.name, description: data.description || null, track: "custom" })
      .returning({ id: pipelines.id });

    await db.insert(pipelineStages).values(
      data.stages.map((stage, i) => ({
        pipelineId: created.id,
        name: stage.name,
        type: stage.type,
        isInterviewStage: stage.isInterviewStage ?? false,
        color: stage.color,
        order: i,
      })),
    );
  }

  revalidatePath("/pipelines");
  revalidatePath("/board");
  revalidatePath("/applications");
  return { success: true };
}

export async function deletePipeline(id: string): Promise<{ error?: string }> {
  const userId = await requireUserId();

  const [inUse] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(eq(applications.pipelineId, id))
    .limit(1);

  if (inUse) {
    return { error: "Pipeline tidak bisa dihapus karena masih digunakan oleh lamaran aktif." };
  }

  await db.delete(pipelines).where(and(eq(pipelines.id, id), eq(pipelines.userId, userId)));
  revalidatePath("/pipelines");
  revalidatePath("/board");
  return {};
}

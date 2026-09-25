import { db } from "@/db";
import { pipelines, pipelineStages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { DEFAULT_PIPELINE_TEMPLATES } from "@/lib/pipeline-templates";

/**
 * Seeds the three default pipeline templates (Corporate, Government, Academy)
 * for a freshly registered user, so they have a usable board immediately.
 */
export async function ensureDefaultPipelines(userId: string) {
  const existing = await db
    .select({ id: pipelines.id })
    .from(pipelines)
    .where(eq(pipelines.userId, userId))
    .limit(1);

  if (existing.length > 0) return;

  for (const template of DEFAULT_PIPELINE_TEMPLATES) {
    const [pipeline] = await db
      .insert(pipelines)
      .values({
        userId,
        name: template.name,
        description: template.description,
        track: template.track,
        isSystem: true,
      })
      .returning({ id: pipelines.id });

    await db.insert(pipelineStages).values(
      template.stages.map((stage, index) => ({
        pipelineId: pipeline.id,
        name: stage.name,
        order: index,
        type: stage.type,
        isInterviewStage: stage.isInterviewStage ?? false,
        color: stage.color,
      })),
    );
  }
}

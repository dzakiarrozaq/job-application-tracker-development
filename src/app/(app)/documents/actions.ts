"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/db";
import { documents } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { requireUserId } from "@/lib/auth-helpers";

const documentSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Nama dokumen wajib diisi"),
  type: z.enum(["cv", "portfolio", "cover_letter", "certificate", "other"]),
  url: z.string().url("URL tidak valid"),
  notes: z.string().optional().nullable(),
});

export type DocumentFormState = { error?: string; success?: boolean };

export async function saveDocument(
  _prev: DocumentFormState | undefined,
  formData: FormData,
): Promise<DocumentFormState> {
  const userId = await requireUserId();
  const parsed = documentSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    type: formData.get("type"),
    url: formData.get("url"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }
  const data = parsed.data;

  if (data.id) {
    await db
      .update(documents)
      .set({ name: data.name, type: data.type, url: data.url, notes: data.notes || null })
      .where(and(eq(documents.id, data.id), eq(documents.userId, userId)));
  } else {
    await db.insert(documents).values({
      userId,
      name: data.name,
      type: data.type,
      url: data.url,
      notes: data.notes || null,
    });
  }

  revalidatePath("/documents");
  revalidatePath("/applications");
  return { success: true };
}

export async function deleteDocument(id: string) {
  const userId = await requireUserId();
  await db.delete(documents).where(and(eq(documents.id, id), eq(documents.userId, userId)));
  revalidatePath("/documents");
  revalidatePath("/applications");
}

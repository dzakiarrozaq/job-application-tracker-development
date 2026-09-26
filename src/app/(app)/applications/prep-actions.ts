"use server";

import { db } from "@/db";
import { interviewPrepItems } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const DEFAULT_CHECKLIST = [
  "Riset mendalam tentang perusahaan (visi, misi, produk)",
  "Pelajari deskripsi posisi & skill yang diminta",
  "Siapkan cerita STAR (Situation, Task, Action, Result)",
  "Latihan pertanyaan behavioral interview",
  "Siapkan 3-5 pertanyaan untuk pewawancara",
  "Tes koneksi internet & kamera (jika online)",
  "Siapkan pakaian profesional",
  "Review portfolio / proyek yang relevan",
];

export async function ensurePrepChecklist(applicationId: string) {
  const existing = await db
    .select()
    .from(interviewPrepItems)
    .where(eq(interviewPrepItems.applicationId, applicationId));

  if (existing.length > 0) return existing;

  const items = DEFAULT_CHECKLIST.map((text, i) => ({
    applicationId,
    text,
    sortOrder: i,
  }));

  const created = await db.insert(interviewPrepItems).values(items).returning();
  return created;
}

export async function togglePrepItem(itemId: string, completed: boolean) {
  await db
    .update(interviewPrepItems)
    .set({ completed })
    .where(eq(interviewPrepItems.id, itemId));
  revalidatePath("/dashboard");
  revalidatePath("/board");
}

export async function getPrepItemsForApp(applicationId: string) {
  return db
    .select()
    .from(interviewPrepItems)
    .where(eq(interviewPrepItems.applicationId, applicationId))
    .orderBy(interviewPrepItems.sortOrder);
}

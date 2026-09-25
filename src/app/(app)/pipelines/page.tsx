import { requireUserId } from "@/lib/auth-helpers";
import { getPipelinesWithStages } from "@/lib/queries";
import { PipelinesClient } from "./pipelines-client";

export const dynamic = "force-dynamic";

export default async function PipelinesPage() {
  const userId = await requireUserId();
  const pipelines = await getPipelinesWithStages(userId);
  return <PipelinesClient pipelines={pipelines} />;
}

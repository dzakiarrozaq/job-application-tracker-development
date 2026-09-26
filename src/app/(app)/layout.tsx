import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppShell } from "@/components/app-shell";
import { getFollowUpCount } from "@/lib/analytics";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const followUpCount = await getFollowUpCount(session.user.id!);

  return (
    <AppShell
      user={{ name: session.user.name ?? "Pengguna", email: session.user.email ?? "" }}
      followUpCount={followUpCount}
    >
      {children}
    </AppShell>
  );
}


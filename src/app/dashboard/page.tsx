import { DashboardPageClient } from "@/components/dashboard-page-client";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardPage() {
  return (
    <DashboardShell
      title="Dashboard"
      description="Track your interview history, scores, and next session from one place."
    >
      <DashboardPageClient />
    </DashboardShell>
  );
}

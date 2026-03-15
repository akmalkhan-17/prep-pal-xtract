import { DashboardShell } from "@/components/dashboard-shell";
import { SetupPageClient } from "@/components/setup-page-client";

export default async function SetupPage() {
  return (
    <DashboardShell
      title="Interview Setup"
      description="Choose a role or upload a resume to create a new interview session."
    >
      <SetupPageClient />
    </DashboardShell>
  );
}

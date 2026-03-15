import { DashboardShell } from "@/components/dashboard-shell";
import { ResultsPageClient } from "@/components/results-page-client";

export default async function ResultsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  return (
    <DashboardShell
      title="Interview Results"
      description="Review your scores, feedback, and video-based communication metrics."
    >
      <ResultsPageClient interviewId={id} />
    </DashboardShell>
  );
}

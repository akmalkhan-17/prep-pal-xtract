import { DashboardShell } from "@/components/dashboard-shell";
import { InterviewPageClient } from "@/components/interview-page-client";

export default async function InterviewPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  return (
    <DashboardShell
      title="Interview Session"
      description="Answer the generated questions, record each response, and finish with a final video submission."
    >
      <InterviewPageClient interviewId={id} />
    </DashboardShell>
  );
}

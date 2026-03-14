import { auth } from "@/auth";
import { parseResume, PythonServiceError } from "@/lib/pythonService";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { success: false, message: "Resume file is required" },
        { status: 400 }
      );
    }

    const parsedResume = await parseResume(file);

    return Response.json(
      {
        success: true,
        filename: parsedResume.filename,
        resumeText: parsedResume.resumeText,
        wordCount: parsedResume.wordCount,
        characterCount: parsedResume.characterCount,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof PythonServiceError) {
      return Response.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    console.error("Error in /api/interview/resume/parse:", error);

    return Response.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

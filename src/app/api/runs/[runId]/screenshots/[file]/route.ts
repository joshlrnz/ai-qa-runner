import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  getRunScreenshotsDirectory,
  isStepScreenshotFileName,
} from "@/runner/step-evidence";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    runId: string;
    file: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { runId, file } = await context.params;

  // Step screenshots are the only artifacts this route serves, so the file name
  // is validated against that exact shape before it ever reaches the filesystem.
  if (!isStepScreenshotFileName(file)) {
    return new Response("Invalid screenshot name", { status: 400 });
  }

  try {
    const screenshotsDirectory = getRunScreenshotsDirectory(runId);
    const filePath = path.resolve(screenshotsDirectory, file);

    if (
      !filePath.startsWith(`${path.resolve(screenshotsDirectory)}${path.sep}`)
    ) {
      return new Response("Invalid screenshot path", { status: 400 });
    }

    const contents = await readFile(filePath);

    return new Response(new Uint8Array(contents), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": "image/png",
      },
    });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return new Response("Screenshot not found", { status: 404 });
    }

    const message =
      error instanceof Error ? error.message : "Unable to read screenshot";
    return new Response(message, { status: 400 });
  }
}

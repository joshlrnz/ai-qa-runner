import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { stepResultSchema, type StepResult } from "@/contracts/test-run";
import { getRunDirectory } from "./run-paths";

const screenshotFilePattern = /^step-\d+\.png$/;

export function getRunScreenshotsDirectory(runId: string) {
  return path.join(getRunDirectory(runId), "screenshots");
}

export function getStepScreenshotFileName(stepIndex: number) {
  return `step-${stepIndex}.png`;
}

export function getStepScreenshotUrl(runId: string, fileName: string) {
  return `/api/runs/${runId}/screenshots/${fileName}`;
}

export function isStepScreenshotFileName(fileName: string) {
  return screenshotFilePattern.test(fileName);
}

function getStepsPath(runId: string) {
  return path.join(getRunDirectory(runId), "steps.json");
}

/**
 * Written incrementally by the Playwright spec so a run that crashes or is
 * killed still leaves behind evidence for the steps that did execute. The spec
 * records a bare file name; `readRunSteps` turns it into a servable URL once
 * the run ID is known.
 */
export async function writeRunSteps(
  runOutputDirectory: string,
  steps: StepResult[],
) {
  const stepsPath = path.join(runOutputDirectory, "steps.json");
  const temporaryPath = `${stepsPath}.tmp`;

  await mkdir(runOutputDirectory, { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify(steps, null, 2)}\n`, "utf8");
  await rename(temporaryPath, stepsPath);
}

export async function readRunSteps(
  runId: string,
): Promise<StepResult[] | null> {
  try {
    const contents = await readFile(getStepsPath(runId), "utf8");
    const parsed = stepResultSchema.array().safeParse(JSON.parse(contents));

    if (!parsed.success || parsed.data.length === 0) {
      return null;
    }

    return parsed.data.map((step) => ({
      ...step,
      screenshotUrl:
        step.screenshotUrl && isStepScreenshotFileName(step.screenshotUrl)
          ? getStepScreenshotUrl(runId, step.screenshotUrl)
          : step.screenshotUrl,
    }));
  } catch {
    // Missing or malformed step evidence simply means the UI falls back to the
    // plan-derived step list.
    return null;
  }
}

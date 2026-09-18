import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";
import { testPlanSchema } from "@/contracts/test-plan";
import type { StepResult } from "@/contracts/test-run";
import { describeTestStep, executeTestStep } from "@/runner/execute-test-plan";
import { readParamsFromEnv } from "@/runner/plan-params";
import {
  getStepScreenshotFileName,
  writeRunSteps,
} from "@/runner/step-evidence";

const planPath = path.resolve(
  process.env.TEST_PLAN_PATH ?? path.join("plans", "smoke.json"),
);
const plan = testPlanSchema.parse(JSON.parse(readFileSync(planPath, "utf8")));
const params = readParamsFromEnv(process.env);

const runOutputDirectory = path.resolve(
  process.env.RUN_OUTPUT_DIR ?? path.join("runs", "local"),
);
const screenshotsDirectory = path.join(runOutputDirectory, "screenshots");

const ansiEscapePattern = new RegExp(
  `${String.fromCharCode(27)}\\[[0-9;]*m`,
  "g",
);
const maxStoredErrorLength = 600;

/**
 * Playwright colourises assertion failures for the terminal. The app renders
 * this text as plain HTML, so the escape codes are stripped and the message is
 * capped; the full detail stays in the run log and the HTML report.
 */
function toErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  const plainMessage = message.replace(ansiEscapePattern, "").trim();

  return plainMessage.length > maxStoredErrorLength
    ? `${plainMessage.slice(0, maxStoredErrorLength)}...`
    : plainMessage;
}

test(plan.name, async ({ page }) => {
  const results: StepResult[] = plan.steps.map((step, index) => ({
    index,
    title: describeTestStep(step),
    status: "pending",
    durationMs: null,
    error: null,
    screenshotUrl: null,
  }));

  mkdirSync(screenshotsDirectory, { recursive: true });
  await writeRunSteps(runOutputDirectory, results);

  let failure: unknown = null;

  for (const [index, step] of plan.steps.entries()) {
    if (failure) {
      results[index] = { ...results[index], status: "skipped" };
      continue;
    }

    const startedAt = Date.now();

    try {
      await test.step(describeTestStep(step), async () => {
        await executeTestStep(page, step, params);
      });
      results[index] = { ...results[index], status: "passed" };
    } catch (error) {
      failure = error;
      results[index] = {
        ...results[index],
        status: "failed",
        error: toErrorMessage(error),
      };
    }

    results[index] = { ...results[index], durationMs: Date.now() - startedAt };

    // A capture failure (page closed, navigation in flight) must never mask the
    // step outcome, so the screenshot is strictly best effort.
    try {
      const fileName = getStepScreenshotFileName(index);
      await page.screenshot({
        path: path.join(screenshotsDirectory, fileName),
      });
      results[index] = { ...results[index], screenshotUrl: fileName };
    } catch {
      results[index] = { ...results[index], screenshotUrl: null };
    }

    await writeRunSteps(runOutputDirectory, results);
  }

  await writeRunSteps(runOutputDirectory, results);

  if (failure) {
    throw failure;
  }
});

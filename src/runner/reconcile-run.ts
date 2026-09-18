import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import type { TestRun } from "@/contracts/test-run";
import { getRunDirectory, getRunReportDirectory } from "./run-paths";
import { saveRun } from "./run-store";
import { readRunSteps } from "./step-evidence";

/**
 * A run is abandoned when the server that spawned it died before the child
 * process closed. Playwright's own per-test timeout is 60 seconds, so this
 * ceiling only has to sit comfortably above a realistic whole-plan run.
 */
const abandonedRunTimeoutMs = 10 * 60 * 1000;

/**
 * Playwright writes .last-run.json into the output directory when a run
 * finishes, independently of our child-process listener. It is the only
 * durable record of the outcome once the spawning server is gone.
 */
async function readPlaywrightOutcome(runId: string) {
  const lastRunPath = path.join(
    getRunDirectory(runId),
    "test-results",
    ".last-run.json",
  );

  try {
    const contents = await readFile(lastRunPath, "utf8");
    const parsed = JSON.parse(contents) as { status?: string };

    if (!parsed.status) {
      return null;
    }

    return parsed.status === "passed" ? "passed" : "failed";
  } catch {
    // A missing or malformed file means Playwright never recorded an outcome.
    return null;
  }
}

async function hasReport(runId: string) {
  try {
    await stat(path.join(getRunReportDirectory(runId), "index.html"));
    return true;
  } catch {
    return false;
  }
}

async function getReportUrl(runId: string) {
  return (await hasReport(runId))
    ? `/api/runs/${runId}/report/index.html`
    : null;
}

/**
 * Step evidence outlives the spawning server, so a reconciled failure can name
 * the step that broke instead of sending the reader off to the HTML report.
 */
async function describeReconciledFailure(runId: string) {
  const steps = await readRunSteps(runId);
  const failedStep = steps?.find((step) => step.status === "failed");

  if (!failedStep) {
    return "The run finished while the server was not watching it. Open the report for the failed step.";
  }

  return failedStep.error
    ? `Step ${failedStep.index + 1} failed: ${failedStep.title}. ${failedStep.error}`
    : `Step ${failedStep.index + 1} failed: ${failedStep.title}.`;
}

/**
 * Resolves runs still marked queued or running whose child process can no
 * longer report back, typically because the server restarted mid-run. A run
 * that is genuinely still executing, and every terminal run, is left alone.
 */
export async function reconcileRun(run: TestRun): Promise<TestRun> {
  if (run.status !== "queued" && run.status !== "running") {
    return run;
  }

  const outcome = await readPlaywrightOutcome(run.runId);

  if (outcome) {
    const reconciled: TestRun = {
      ...run,
      status: outcome,
      updatedAt: new Date().toISOString(),
      error:
        outcome === "passed"
          ? null
          : await describeReconciledFailure(run.runId),
      reportUrl: await getReportUrl(run.runId),
    };

    await saveRun(reconciled);
    return reconciled;
  }

  const startedAt = Date.parse(run.createdAt);
  const isAbandoned =
    Number.isFinite(startedAt) &&
    Date.now() - startedAt > abandonedRunTimeoutMs;

  if (!isAbandoned) {
    return run;
  }

  const abandoned: TestRun = {
    ...run,
    status: "failed",
    updatedAt: new Date().toISOString(),
    error:
      "The run never reported a result and has been abandoned. See run.log for details.",
    reportUrl: await getReportUrl(run.runId),
  };

  await saveRun(abandoned);
  return abandoned;
}

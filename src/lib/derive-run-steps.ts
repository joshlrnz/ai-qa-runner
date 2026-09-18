import type { TestPlan } from "@/contracts/test-plan";
import type { StepResult, StepStatus, TestRun } from "@/contracts/test-run";
import { describeTestStep } from "./describe-test-step";

function statusForRun(runStatus: TestRun["status"]): StepStatus {
  if (runStatus === "passed") {
    return "passed";
  }

  if (runStatus === "failed") {
    return "skipped";
  }

  return "pending";
}

export function deriveRunSteps(
  plan: TestPlan | null,
  run: TestRun | null,
): StepResult[] {
  if (run?.steps && run.steps.length > 0) {
    return run.steps;
  }

  if (!plan) {
    return [];
  }

  const status = run ? statusForRun(run.status) : "pending";
  const results: StepResult[] = [];

  for (const [index, step] of plan.steps.entries()) {
    results.push({
      index,
      title: describeTestStep(step),
      status,
      durationMs: null,
      error: null,
      screenshotUrl: null,
    });
  }

  return results;
}

export function countByStatus(steps: StepResult[]) {
  let passed = 0;
  let failed = 0;
  let skipped = 0;

  for (const { status } of steps) {
    if (status === "passed") {
      passed += 1;
    } else if (status === "failed") {
      failed += 1;
    } else if (status === "skipped") {
      skipped += 1;
    }
  }

  return { passed, failed, skipped };
}

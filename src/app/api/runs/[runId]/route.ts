import { NextResponse } from "next/server";
import { reconcileRun } from "@/runner/reconcile-run";
import { getRun } from "@/runner/run-store";
import { readRunSteps } from "@/runner/step-evidence";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    runId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { runId } = await context.params;

  try {
    const run = await getRun(runId);

    if (!run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const reconciledRun = await reconcileRun(run);
    const steps = await readRunSteps(runId);

    return NextResponse.json(
      steps ? { ...reconciledRun, steps } : reconciledRun,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to read run";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

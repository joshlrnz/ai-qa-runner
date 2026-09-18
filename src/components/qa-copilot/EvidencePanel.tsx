"use client";

import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { StepResult } from "@/contracts/test-run";

type EvidencePanelProps = {
  step: StepResult | null;
  environmentLabel: string;
  reportUrl: string | null;
  runError: string | null;
};

export function EvidencePanel({
  step,
  environmentLabel,
  reportUrl,
  runError,
}: EvidencePanelProps) {
  const logLines = step
    ? [
        `step: ${step.title}`,
        `result: ${step.status}`,
        step.error ? `error: ${step.error}` : "error: none",
      ]
    : [];

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        padding: 16,
        borderRadius: "var(--radius-card)",
        background: "var(--neutral-white)",
        boxShadow: "var(--shadow-card)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div>
        <div
          style={{
            font: "700 16px/1.2 var(--font-display)",
            color: "var(--brand-oboda-blue)",
          }}
        >
          {step ? `Step ${step.index + 1} evidence` : "Pick a step"}
        </div>
        <div
          style={{ marginTop: 3, fontSize: 12, color: "var(--text-secondary)" }}
        >
          {step ? step.title : "Select a step to see what the browser did."}
        </div>
      </div>

      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          boxShadow: "inset 0 0 0 1px #EAECF0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "7px 10px",
            background: "var(--neutral-50)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              background: "#CFD8DC",
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              background: "#CFD8DC",
            }}
          />
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: 99,
              background: "#CFD8DC",
            }}
          />
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              fontFamily: "var(--font-mono)",
              color: "var(--text-tertiary)",
            }}
          >
            {environmentLabel}
          </span>
        </div>
        {step?.screenshotUrl ? (
          <a
            href={step.screenshotUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "block" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- run artifacts are served from a dynamic API route, not the image optimiser */}
            <img
              src={step.screenshotUrl}
              alt={`Screenshot after step ${step.index + 1}: ${step.title}`}
              style={{
                display: "block",
                width: "100%",
                height: "auto",
                background: "var(--surface-sunken)",
              }}
            />
          </a>
        ) : (
          <div
            style={{
              height: 150,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "var(--surface-sunken)",
              color: "var(--text-tertiary)",
            }}
          >
            <ImageIcon size={22} />
            <span style={{ fontSize: 11.5, fontFamily: "var(--font-mono)" }}>
              {step
                ? "No screenshot for this step"
                : "Select a step to see its screenshot"}
            </span>
          </div>
        )}
      </div>

      {runError ? (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 10,
            background: "var(--error-50)",
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: ".04em",
              textTransform: "uppercase",
              color: "var(--error-700)",
            }}
          >
            Failure
          </div>
          <div
            style={{
              marginTop: 4,
              fontSize: 13,
              color: "var(--error-700)",
              lineHeight: 1.45,
            }}
          >
            {runError}
          </div>
        </div>
      ) : null}

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {logLines.map((line) => (
          <div
            key={line}
            style={{
              fontSize: 11.5,
              fontFamily: "var(--font-mono)",
              color: "var(--neutral-600)",
              lineHeight: 1.5,
              wordBreak: "break-word",
            }}
          >
            {line}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          paddingTop: 12,
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <Button
          hierarchy="secondary"
          size="sm"
          disabled={!reportUrl}
          onClick={() => {
            // Report URLs come from our own run API; the prefix check keeps an
            // unexpected value from turning this button into an open redirect.
            if (reportUrl?.startsWith("/api/runs/")) {
              window.open(reportUrl, "_blank", "noopener,noreferrer");
            }
          }}
        >
          Open Playwright trace
        </Button>
      </div>
    </div>
  );
}

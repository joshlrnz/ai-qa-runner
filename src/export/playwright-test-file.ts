import type { SavedTest } from "@/contracts/saved-test";
import type { TestStep } from "@/contracts/test-plan";

type PlaywrightTestFile = {
  fileName: string;
  source: string;
};

function toTypeScriptString(value: string) {
  return JSON.stringify(value);
}

function toFileName(name: string) {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `${slug || "saved-test"}.spec.ts`;
}

function renderValue(value: string, hasParams: boolean) {
  const literal = toTypeScriptString(value);
  return hasParams && /\{\w+\}/.test(value) ? `bind(${literal})` : literal;
}

function renderStep(step: TestStep, hasParams: boolean) {
  switch (step.action) {
    case "navigate":
      return `  await page.goto(${renderValue(step.path, hasParams)});`;
    case "click":
      return `  await page.locator(${renderValue(step.selector, hasParams)}).click();`;
    case "fill":
      return [
        `  await page.locator(${renderValue(step.selector, hasParams)}).fill(`,
        `    ${renderValue(step.value, hasParams)},`,
        "  );",
      ].join("\n");
    case "assertVisible":
      return `  await expect(page.locator(${renderValue(step.selector, hasParams)})).toBeVisible();`;
    case "assertText":
      return [
        `  await expect(page.locator(${renderValue(step.selector, hasParams)})).toContainText(`,
        `    ${renderValue(step.value, hasParams)},`,
        "  );",
      ].join("\n");
  }
}

function renderParamSupport(savedTest: SavedTest) {
  const entries = Object.entries(savedTest.plan.requiredParams);

  if (entries.length === 0) {
    return "";
  }

  const params = entries.map(([name, requirement]) => {
    const defaultValue = requirement.secret
      ? undefined
      : savedTest.defaultParams[name];
    const fallback =
      defaultValue === undefined ? "" : `, ${toTypeScriptString(defaultValue)}`;

    return `  ${toTypeScriptString(name)}: readParam(${toTypeScriptString(name)}${fallback}),`;
  });

  return [
    "function readParam(name: string, fallback?: string) {",
    "  const value = process.env[`QA_PARAM_${name}`] ?? fallback;",
    "",
    "  if (value === undefined) {",
    "    throw new Error(`Missing required environment variable: QA_PARAM_${name}`);",
    "  }",
    "",
    "  return value;",
    "}",
    "",
    "const params: Record<string, string> = {",
    ...params,
    "};",
    "",
    "function bind(value: string) {",
    "  return value.replace(/\\{(\\w+)\\}/g, (_match, name: string) => {",
    "    const parameter = params[name];",
    "",
    "    if (parameter === undefined) {",
    "      throw new Error(`Unbound test parameter: ${name}`);",
    "    }",
    "",
    "    return parameter;",
    "  });",
    "}",
    "",
  ].join("\n");
}

export function createPlaywrightTestFile(
  savedTest: SavedTest,
): PlaywrightTestFile {
  const hasParams = Object.keys(savedTest.plan.requiredParams).length > 0;
  const source = [
    'import { expect, test } from "@playwright/test";',
    "",
    renderParamSupport(savedTest),
    `test(${toTypeScriptString(savedTest.plan.name)}, async ({ page }) => {`,
    savedTest.plan.steps
      .map((step) => renderStep(step, hasParams))
      .join("\n\n"),
    "});",
    "",
  ]
    .filter((line, index, lines) => {
      return line !== "" || index === 0 || lines[index - 1] !== "";
    })
    .join("\n");

  return {
    fileName: toFileName(savedTest.name),
    source,
  };
}

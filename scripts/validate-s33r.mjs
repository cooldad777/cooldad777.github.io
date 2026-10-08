/**
 * Checks the S33R records and pages.
 * Run from the repo root: node scripts/validate-s33r.mjs
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const s33r = join(root, "seersolutions", "s33r");
const errors = [];

function fail(msg) {
  errors.push(msg);
}

function load(rel) {
  const path = join(s33r, rel);
  let text;
  try {
    text = readFileSync(path, "utf8");
  } catch (err) {
    fail(`missing ${rel}: ${err.message}`);
    return null;
  }
  try {
    return JSON.parse(text);
  } catch (err) {
    fail(`${rel} is not JSON: ${err.message}`);
    return null;
  }
}

const BANNED_KEY = /^(winner|overall_winner|overall_score|best_model|rank|ranking|leaderboard|objective_score|gold|rating|score)$/i;
const SECRET = [
  [/sk-[A-Za-z0-9]{8,}/, "key-shaped token"],
  [/AKIA[0-9A-Z]{16}/, "cloud key id"],
  [/api[_-]?key\s*[:=]/i, "api key assignment"],
  [/bearer\s+[A-Za-z0-9\-._~+/]+=*/i, "bearer token"],
  [/(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/, "phone number"],
];
const PRIVATE_NAME = [
  [/xifin/i, "xifin"],
  [/halo\s*cut/i, "halo cut"],
  [/\bpkb\b/i, "pkb"],
  [/rutter/i, "rutter"],
  [/settled/i, "settled"],
  [/adventure\s+within/i, "adventure within"],
  [/cool[\s-]+dad/i, "cool dad"],
];
const NAMED_MODEL = /\b(claude|chatgpt|gpt-?\d|grok|gemini|llama|anthropic|openai|mistral)\b/i;

function walk(node, path, fn) {
  if (Array.isArray(node)) {
    node.forEach((value, i) => walk(value, `${path}[${i}]`, fn));
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      fn(key, value, `${path}.${key}`);
      walk(value, `${path}.${key}`, fn);
    }
  }
}

function filesUnder(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) filesUnder(path, acc);
    else acc.push(path);
  }
  return acc;
}

const benchmarks = load("data/benchmarks.json");
const models = load("data/models.json");
const runs = load("data/runs/hs-001.json");

if (benchmarks && models && runs) {
  for (const [label, doc] of [["benchmarks", benchmarks], ["models", models], ["runs", runs]]) {
    walk(doc, label, (key) => {
      if (BANNED_KEY.test(key)) fail(`${label} has forbidden field "${key}"`);
    });
    const blob = JSON.stringify(doc);
    if (!blob.includes("ILLUSTRATIVE")) fail(`${label} missing ILLUSTRATIVE label`);
    if (!/illustrative/i.test(blob)) fail(`${label} missing illustrative status`);
  }

  const list = Array.isArray(benchmarks.benchmarks) ? benchmarks.benchmarks : [];
  if (list.length !== 1) fail(`expected one benchmark, found ${list.length}`);
  const scenario = list[0] || {};
  if (scenario.id !== "HS-001") fail(`benchmark id ${scenario.id}`);
  if (scenario.version !== "1.0") fail(`benchmark version ${scenario.version}`);
  if (scenario.sample_size !== null) fail("sample_size must be null");
  if (scenario.prompt !== "I have too much email. Help me decide what deserves my attention.") {
    fail("prompt text drifted");
  }
  if (scenario.dimension_shown !== "ambiguity-handling") fail("dimension_shown");

  const dims = Array.isArray(benchmarks.dimensions) ? benchmarks.dimensions : [];
  if (dims.length !== 12) fail(`expected 12 dimensions, found ${dims.length}`);
  const dimIds = new Set();
  for (const dim of dims) {
    if (!dim.id || dimIds.has(dim.id)) fail(`bad dimension id ${dim.id}`);
    dimIds.add(dim.id);
    if (!dim.definition || dim.definition.length < 20) fail(`thin definition ${dim.id}`);
  }
  if (!dimIds.has("ambiguity-handling")) fail("missing ambiguity-handling");

  const rubric = benchmarks.rubric || {};
  if (rubric.scenario_id !== "HS-001" || rubric.scenario_version !== "1.0") {
    fail("rubric is not tied to HS-001 version 1.0");
  }
  const levelMarks = (rubric.levels || []).map((level) => level.mark);
  if (levelMarks.join(",") !== "0,1,2,3,4") fail(`rubric marks ${levelMarks}`);

  const slots = Array.isArray(models.models) ? models.models : [];
  if (slots.length !== 3) fail(`expected 3 model slots, found ${slots.length}`);
  const expected = [
    ["model-a", "Model A"],
    ["model-b", "Model B"],
    ["model-c", "Model C"],
  ];
  const seen = new Set();
  slots.forEach((slot, i) => {
    const [id, name] = expected[i] || [];
    if (slot.id !== id || slot.slot !== name) fail(`slot ${i} is ${slot.id}/${slot.slot}`);
    if (slot.interface !== "not run") fail(`${slot.id} interface`);
    if (slot.tested_at !== null) fail(`${slot.id} tested_at must be null`);
    if (!String(slot.notes || "").includes("illustrative placeholder, not a measured run")) {
      fail(`${slot.id} notes`);
    }
    if (slot.version !== "unknown") fail(`${slot.id} version should be unknown`);
    if (slot.model_name || slot.provider) fail(`${slot.id} should not name a provider or model`);
    seen.add(slot.id);
  });

  if (runs.benchmark_id !== "HS-001" || runs.benchmark_version !== "1.0") fail("runs version");
  if (runs.sample_size !== null) fail("runs sample_size");
  if (runs.label !== "ILLUSTRATIVE" || runs.comparison_label !== "ILLUSTRATIVE") {
    fail("runs comparison must be labeled ILLUSTRATIVE");
  }
  const runList = Array.isArray(runs.runs) ? runs.runs : [];
  if (runList.length !== 3) fail(`expected 3 runs, found ${runList.length}`);
  const runModels = new Set();
  for (const run of runList) {
    if (!seen.has(run.model_id)) fail(`run ${run.id} unknown model`);
    if (runModels.has(run.model_id)) fail(`duplicate run for ${run.model_id}`);
    runModels.add(run.model_id);
    if (run.benchmark_id !== "HS-001" || run.benchmark_version !== "1.0") fail(`${run.id} version`);
    if (run.label !== "ILLUSTRATIVE") fail(`${run.id} label`);
    if (run.human_review !== "not run" || run.automated_classification !== "not run") {
      fail(`${run.id} review fields`);
    }
    const cond = run.conditions || {};
    if (cond.interface !== "not run") fail(`${run.id} conditions.interface`);
    for (const key of ["model_version", "temperature", "system_prompt", "tested_at"]) {
      if (cond[key] !== null) fail(`${run.id} conditions.${key} must be null`);
    }
    if (!run.response || NAMED_MODEL.test(run.response)) fail(`${run.id} response`);
    const signals = Array.isArray(run.signals) ? run.signals : [];
    if (signals.length !== 1) fail(`${run.id} should show one signal`);
    for (const signal of signals) {
      if (!dimIds.has(signal.dimension_id)) fail(`${signal.id} dimension`);
      if (signal.label !== "ILLUSTRATIVE") fail(`${signal.id} label`);
      if (!Number.isInteger(signal.mark) || signal.mark < 0 || signal.mark > 4) fail(`${signal.id} mark`);
      if (!signal.rationale) fail(`${signal.id} rationale`);
      if (!signal.evidence_span || !run.response.includes(signal.evidence_span)) {
        fail(`${signal.id} evidence span is not in the response`);
      }
      if (!String(signal.interpretation || "").toLowerCase().includes("illustrative interpretation")) {
        fail(`${signal.id} interpretation label`);
      }
      if (signal.dimension_id !== "ambiguity-handling") fail(`${signal.id} only ambiguity is marked`);
    }
  }
}

const pageNames = ["index.html", "method.html", "scenario.html"];
const pages = {};
for (const name of pageNames) {
  const text = readFileSync(join(s33r, name), "utf8");
  pages[name] = text;
  if (!text.includes("ILLUSTRATIVE")) fail(`${name} missing ILLUSTRATIVE`);
  if (!/seersolutions\/s33r\/|href="\.\.\/index\.html"|href="method\.html"|href="scenario\.html"/.test(text)) {
    fail(`${name} navigation looks incomplete`);
  }
  // Research pages intentionally have no sales CTA; booking remains on SEER.
}

const scenarioPage = pages["scenario.html"] || "";
if (runs && runs.runs) {
  const prompt = benchmarks.benchmarks[0].prompt;
  if (!scenarioPage.includes(prompt)) fail("scenario page missing prompt");
  for (const run of runs.runs) {
    if (!scenarioPage.includes(run.response)) fail(`scenario page missing ${run.slot} response`);
    if (!scenarioPage.includes(run.signals[0].evidence_span)) fail(`scenario page missing evidence for ${run.slot}`);
    if (!scenarioPage.includes(run.signals[0].interpretation)) fail(`scenario page missing interpretation for ${run.slot}`);
  }
}
if (benchmarks) {
  const method = pages["method.html"] || "";
  for (const dim of benchmarks.dimensions) {
    if (!method.includes(dim.name) || !method.includes(dim.definition)) {
      fail(`method page missing dimension ${dim.id}`);
    }
  }
  for (const level of benchmarks.rubric.levels) {
    if (!method.includes(level.definition) || !scenarioPage.includes(level.definition)) {
      fail(`rubric level ${level.mark} not on both pages`);
    }
  }
}

const home = pages["index.html"] || "";
if (!/What happens to the human/i.test(home)) fail("splash H1");
if (!home.includes('href="scenario.html"') || !home.includes('href="method.html"')) fail("splash CTAs");

const seer = readFileSync(join(root, "seersolutions", "index.html"), "utf8");
if (!/href="s33r\/(?:index.html)?"/.test(seer)) fail("SEER page missing quiet S33R link");
if (!seer.includes("https://calendly.com/ryanrsee")) fail("SEER booking link removed");

for (const path of filesUnder(s33r)) {
  const rel = relative(root, path);
  const text = readFileSync(path, "utf8");
  for (const [re, name] of SECRET) {
    if (re.test(text)) fail(`${rel} contains ${name}`);
  }
  for (const [re, name] of PRIVATE_NAME) {
    if (re.test(text)) fail(`${rel} contains private name ${name}`);
  }
  if (NAMED_MODEL.test(text)) fail(`${rel} names a model product`);
  if (/best model/i.test(text)) fail(`${rel} says best model`);
  if (/Ryan See review/i.test(text)) fail(`${rel} says Ryan See review`);
  if (/objective score/i.test(text)) fail(`${rel} says objective score`);
}

if (errors.length) {
  console.error(`S33R validation failed (${errors.length})`);
  for (const err of errors) console.error(`- ${err}`);
  process.exit(1);
}
console.log("S33R validation passed");

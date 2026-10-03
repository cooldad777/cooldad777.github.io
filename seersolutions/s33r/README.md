# S33R / Human Signal

S33R is an experiment by SEER Solutions. It asks what a model did with a defined prompt. It does not ask whether a model is universally good, and it does not rank models.

This folder is a static page. There is no backend, no model call, and no key.

## What is real

- The method statements on `method.html`: what would be measured, what would not, how a scenario is designed, how repetition would be stored, how a human review differs from an automated label, and how versioning works.
- The twelve dimension definitions in `data/benchmarks.json`. They are definitions, not scores.
- The ambiguity-handling rubric for HS-001 version 1.0 (the five level texts).

## What is illustrative

- Scenario HS-001, Ambiguity, version 1.0, including the prompt as a worked example.
- Model A, Model B, and Model C. These are slots. No product was run. Interface is `not run`. Version, temperature, system prompt, and timestamp are unknown.
- The responses, the 0–4 marks, the rationales, the evidence spans, and the sentences marked illustrative interpretation.
- The splash diagram. It is conceptual, not a trace.

Sample size: unknown / not run. Status: illustrative demo, not public research.

## Before this can be called a published benchmark

A public methodology claim needs measured runs: a named interface, a model version, temperature, the system prompt, repeated runs of the same scenario version, and a human review that quotes a span against that rubric version. None of that is in this folder. Do not describe the live pages as research results until those records exist and replace the illustrative ones.

## Check

From the repository root:

```sh
node scripts/validate-s33r.mjs
```

The script checks ids, versions, illustrative labels, empty conditions, evidence spans, and the absence of a winner or overall score field. It also rejects secret-shaped strings and a short list of names that do not belong on this site.

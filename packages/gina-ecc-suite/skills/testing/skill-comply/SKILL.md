---
name: skill-comply
description: "Visualize whether skills, rules, and agent definitions are actually followed — auto-generates scenarios at 3 prompt strictness levels, runs agents, classifies behavioral sequences, and reports compliance rates with full tool call timelines. Use when checking whether agents actually follow the skills, rules, and definitions they were given, rather than assuming they do."
category: testing
allowed-tools: "Read, Grep, Glob, Bash, Edit, Write"
file_names: ["SKILL.md", "fixtures/compliant_trace.jsonl", "fixtures/noncompliant_trace.jsonl", "fixtures/tdd_spec.yaml", "prompts/classifier.md", "prompts/scenario_generator.md", "prompts/spec_generator.md", "pyproject.toml", "scripts/__init__.py", "scripts/classifier.py", "scripts/grader.py", "scripts/parser.py", "scripts/report.py", "scripts/run.py", "scripts/runner.py", "scripts/scenario_generator.py", "scripts/spec_generator.py", "scripts/utils.py", "tests/test_classifier.py", "tests/test_grader.py", "tests/test_parser.py", "tests/test_runner.py", "tests/test_utf8.py"]
metadata:
  origin: ECC
  architecture: GINA-Sovereign-Multi-Agent
  security_charter: GINA-SEC-7L-2026
  memory_topology: 3-tier-L1-L2-L3
  sandbox_policy: "--cap-drop=ALL"
  dlp_leakage_score: "0.00"
---


# skill-comply: Automated Compliance Measurement

Measures whether coding agents actually follow skills, rules, or agent definitions by:
1. Auto-generating expected behavioral sequences (specs) from any .md file
2. Auto-generating scenarios with decreasing prompt strictness (supportive → neutral → competing)
3. Running `claude -p` and capturing tool call traces via stream-json
4. Classifying tool calls against spec steps using LLM (not regex)
5. Checking temporal ordering deterministically
6. Generating self-contained reports with spec, prompts, and timelines

## Supported Targets

- **Skills** (`skills/*/SKILL.md`): Workflow skills like search-first, TDD guides
- **Rules** (`rules/common/*.md`): Mandatory rules like testing.md, security.md, git-workflow.md
- **Agent definitions** (`agents/*.md`): Whether an agent gets invoked when expected (internal workflow verification not yet supported)

## When to Activate

- User runs `/skill-comply <path>`
- User asks "is this rule actually being followed?"
- After adding new rules/skills, to verify agent compliance
- Periodically as part of quality maintenance

## Usage

```bash
# Full run
uv run python -m scripts.run ${GINA_HOME:-~/.gina}/rules/common/testing.md

# Dry run (no cost, spec + scenarios only)
uv run python -m scripts.run --dry-run ${GINA_HOME:-~/.gina}/skills/search-first/SKILL.md

# Custom models
uv run python -m scripts.run --gen-model haiku --model sonnet <path>
```

## Key Concept: Prompt Independence

Measures whether a skill/rule is followed even when the prompt doesn't explicitly support it.

## Report Contents

Reports are self-contained and include:
1. Expected behavioral sequence (auto-generated spec)
2. Scenario prompts (what was asked at each strictness level)
3. Compliance scores per scenario
4. Tool call timelines with LLM classification labels

### Advanced (optional)

For users familiar with hooks, reports also include hook promotion recommendations for steps with low compliance. This is informational — the main value is the compliance visibility itself.

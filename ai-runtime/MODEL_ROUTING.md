# Model Routing

## Goal

Route each task to the lowest-cost model/provider that satisfies its quality, latency, context, and tool requirements.

## Example task classes

### Tier A — deterministic / no model
- schema validation
- file inventory
- hashing
- diffing
- rule-based module selection
- formatting
- manifest generation
- static policy checks

### Tier B — low-cost model
- classification
- extraction
- lightweight summarization
- tagging
- basic rewriting
- simple structured transformations

### Tier C — balanced reasoning model
- project interview synthesis
- module recommendations
- moderate architecture analysis
- competitor synthesis
- pricing synthesis
- content planning

### Tier D — premium reasoning model
- architecture decisions with material tradeoffs
- security analysis
- ambiguous repository recovery
- multi-source contradiction resolution
- high-value final review
- difficult debugging

## Router inputs

- task type
- required output schema
- complexity
- sensitivity
- context size
- latency target
- historical success rate
- cost ceiling
- provider availability
- tool requirements

## Router output

- provider
- model
- max input budget
- max output budget
- timeout
- retry policy
- fallback chain
- validation method

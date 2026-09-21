# Token Harness

## Purpose

Prevent runaway context size and repeated token spend.

## Required mechanisms

### Context packet construction
Create a scoped packet for each task from:
- task instruction
- minimum authoritative files
- relevant current-state slice
- relevant code/files
- previous decision references
- exact evidence needed

Do not attach the entire repository by default.

### Context hierarchy
1. task-critical authority
2. directly relevant implementation
3. relevant decisions/state
4. optional supporting material

### Token budget
Every AI request has:
- estimated input size
- hard input ceiling
- target output size
- hard output ceiling
- truncation/compaction behavior

### Compaction
When conversation/session state grows:
- extract durable decisions
- update canonical state
- summarize ephemeral discussion
- discard redundant execution chatter
- preserve source pointers

### Deduplication
Hash/version reusable context and avoid resending unchanged large blocks when provider/runtime supports reuse.

### Retrieval
Prefer targeted retrieval over bulk inclusion.

### Large repositories
Use:
- tree/index first
- targeted file reads
- symbol/function retrieval
- change-based context
- dependency neighborhood
- staged summaries

Never "read everything" unless the task actually requires it.

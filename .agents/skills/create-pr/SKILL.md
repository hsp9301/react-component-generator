---
name: create-pr
description: Create a GitHub pull request from the current repository changes using a language-appropriate template and a delegated subagent. Use when the user explicitly requests PR creation.
---

# Create PR

Create a GitHub pull request from the current repository state. The actual GitHub PR creation must be performed by a **subagent**; the main agent prepares context, selects the template, delegates the bounded task, and reports the result.

## Workflow

1. Confirm that the user explicitly requested a PR. Inspect the repository status, current branch, base branch, diff, relevant tests, remote, and GitHub authentication before delegating.
2. Determine the project communication language, not the programming language:
   - Use English for an overseas open-source project, based on its README, existing PR/issues, repository metadata, or contributor conventions.
   - Use Korean for a Korean project, based on the same evidence.
   - If the evidence is ambiguous, ask the user before creating the PR.
3. Read only the selected template: [English template](references/pr-template.en.md) or [Korean template](references/pr-template.ko.md).
4. Delegate to a subagent with the repository path, base/head branches, verified test results, change summary, selected template path, and explicit instruction to create the PR. The subagent may create or push a feature branch when needed, but must not merge the PR, force-push, delete branches, or modify unrelated files.
5. The subagent fills every applicable template section from repository evidence. It must not invent test results, issue links, reviewers, labels, or release impact.
6. Report the created PR URL, title, head/base branches, and any skipped or blocked step. If the subagent cannot create the PR, do not create it from the main agent; return the blocker and the safe next action.

## Delegation boundary

The main agent may perform read-only inspection and test commands needed to prepare the delegation. The subagent owns the external PR mutation. User authorization to create a PR is required before the subagent pushes or calls GitHub.

Do not merge, approve, close, or force-update a PR. Do not include secrets in the PR body, logs, branch names, or commit messages.

## Template routing

- English project: read `references/pr-template.en.md`.
- Korean project: read `references/pr-template.ko.md`.

Keep the PR title concise and describe the user-visible change. Keep the body focused on evidence from the actual diff and tests.

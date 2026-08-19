---
name: create-pr
description: Create a GitHub pull request from the current repository changes using a language-appropriate template. Use when the user explicitly requests PR creation.
---

# Create PR

Create a GitHub pull request from the current repository state. The main agent performs the required repository and GitHub mutations after the user explicitly requests PR creation.

## Workflow

1. Confirm that the user explicitly requested a PR. Inspect the repository status, current branch, base branch, diff, relevant tests, remote, and GitHub authentication before mutating anything.
2. Determine the project communication language, not the programming language:
   - Use English for an overseas open-source project, based on its README, existing PR/issues, repository metadata, or contributor conventions.
   - Use Korean for a Korean project, based on the same evidence.
   - If the evidence is ambiguous, ask the user before creating the PR.
3. Read only the selected template: [English template](references/pr-template.en.md) or [Korean template](references/pr-template.ko.md).
4. Ensure the head branch is available on the remote. Push the current feature branch when needed using the configured GitHub authentication. Never force-push.
5. Create the PR yourself with the verified head and base branches. Fill every applicable template section from repository evidence. Do not invent test results, issue links, reviewers, labels, or release impact.
6. Report the created PR URL, title, head/base branches, and any skipped or blocked step. If creation fails, do not retry with an unverified base branch or silently change scope; return the blocker and the safe next action.

## Mutation boundary

User authorization to create a PR is required before pushing a branch or calling GitHub. If GitHub authentication, the remote, or the requested base branch is unavailable, stop and report the exact blocker instead of substituting a branch or creating a different PR.

Do not merge, approve, close, or force-update a PR. Do not include secrets in the PR body, logs, branch names, or commit messages.

## Template routing

- English project: read `references/pr-template.en.md`.
- Korean project: read `references/pr-template.ko.md`.

Keep the PR title concise and describe the user-visible change. Keep the body focused on evidence from the actual diff and tests.

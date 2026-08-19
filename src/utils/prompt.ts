export const MAX_PROMPT_LENGTH = 500;

export function isPromptWithinLimit(prompt: string): boolean {
  return prompt.length <= MAX_PROMPT_LENGTH;
}

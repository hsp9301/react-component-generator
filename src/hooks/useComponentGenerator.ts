import { useState, useCallback, useEffect } from 'react';
import type { GeneratedComponent, Provider } from '../types';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const COMPONENTS_STORAGE_KEY = 'rcg-components';
const PROMPT_HISTORY_STORAGE_KEY = 'rcg-prompt-history';
const MAX_PROMPT_HISTORY = 20;

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  promptHistory: string[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

function loadComponents(): GeneratedComponent[] {
  const stored = loadFromStorage<GeneratedComponent[]>(COMPONENTS_STORAGE_KEY, []);
  return stored
    .filter((component) => component && typeof component.id === 'string' && typeof component.prompt === 'string' && typeof component.code === 'string' && typeof component.createdAt === 'string')
    .map((component) => ({ ...component, createdAt: new Date(component.createdAt) }));
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useState<GeneratedComponent[]>(loadComponents);
  const [promptHistory, setPromptHistory] = useState<string[]>(() =>
    loadFromStorage<string[]>(PROMPT_HISTORY_STORAGE_KEY, []).filter((prompt) => typeof prompt === 'string'),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => saveToStorage(COMPONENTS_STORAGE_KEY, components), [components]);
  useEffect(() => saveToStorage(PROMPT_HISTORY_STORAGE_KEY, promptHistory), [promptHistory]);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setIsLoading(true);
    setError(null);
    setPromptHistory((prev) => [prompt, ...prev.filter((item) => item !== prompt)].slice(0, MAX_PROMPT_HISTORY));

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate component');
      }

      const newComponent: GeneratedComponent = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        prompt,
        code: data.code,
        createdAt: new Date(),
      };

      setComponents((prev) => [newComponent, ...prev]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setComponents([]);
  }, []);

  return { components, promptHistory, isLoading, error, generate, removeComponent, clearAll };
}

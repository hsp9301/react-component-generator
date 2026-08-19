import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from './PromptInput';

describe('PromptInput prompt length validation', () => {
  it('limits the prompt input to 500 characters', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('maxLength', '500');
  });

  it('shows an error and prevents submission for prompts over 500 characters', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);
    const textbox = screen.getByRole('textbox');

    fireEvent.change(textbox, { target: { value: 'a'.repeat(501) } });

    expect(screen.getByText(/500자/)).toBeVisible();
    const submit = screen.getAllByRole('button')[0];
    expect(submit).toBeDisabled();
    await user.click(submit);
    expect(onGenerate).not.toHaveBeenCalled();
  });
});

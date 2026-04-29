import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExpenseForm } from '@/components/features/expenses/ExpenseForm';
import type { MemberBalance } from '@/types';

const members: MemberBalance[] = [
  { id: 'user-1', name: 'Alice', profilePicture: null, balance: 0 },
  { id: 'user-2', name: 'Bob', profilePicture: null, balance: 0 },
  { id: 'user-3', name: 'Charlie', profilePicture: null, balance: 0 },
];

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

function renderExpenseForm(initialData?: object) {
  render(
    <ExpenseForm
      members={members}
      currentUserId="user-1"
      onSubmit={mockOnSubmit}
      onCancel={mockOnCancel}
      initialData={initialData as any}
    />
  );
}

async function fillBasicFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/description/i), 'Dinner');
  await user.type(screen.getByLabelText(/amount/i), '90');
}

describe('ExpenseForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders description, amount, paid-by, and members', () => {
    renderExpenseForm();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getAllByText(/Alice/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Bob/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows validation for empty description', async () => {
    renderExpenseForm();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/amount/i), '50');
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText(/description is required/i)).toBeInTheDocument();
  });

  it('shows validation for invalid amount', async () => {
    renderExpenseForm();
    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/description/i), 'Test');
    await user.type(screen.getByLabelText(/amount/i), '0');
    await user.click(screen.getByRole('button', { name: /save/i }));
    expect(screen.getByText(/amount must be greater than 0/i)).toBeInTheDocument();
  });

  it('submits correct data for equal split', async () => {
    renderExpenseForm();
    const user = userEvent.setup();
    await fillBasicFields(user);
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        description: 'Dinner',
        amount: 90,
        paidById: 'user-1',
        splitType: 'EQUAL',
        splitWith: ['user-1', 'user-2', 'user-3'],
      })
    );
  });

  it('can deselect members in equal split', async () => {
    renderExpenseForm();
    const user = userEvent.setup();
    await fillBasicFields(user);
    const bobCheckbox = screen.getAllByRole('checkbox').find(
      (cb) => (cb as HTMLInputElement).closest('label')?.textContent?.includes('Bob')
    ) as HTMLInputElement;
    if (bobCheckbox) await user.click(bobCheckbox);
    await user.click(screen.getByRole('button', { name: /save/i }));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        splitWith: expect.not.arrayContaining(['user-2']),
      })
    );
  });

  it('shows exact split fields when toggled', async () => {
    renderExpenseForm();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /exact amounts/i }));

    const amountInputs = screen.getAllByPlaceholderText('0.00');
    expect(amountInputs.length).toBeGreaterThanOrEqual(3);
  });
});

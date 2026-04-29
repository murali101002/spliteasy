export function validateEmail(email: string): string | null {
  if (!email) return 'Email is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email address';
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  return null;
}

export function validateName(name: string): string | null {
  if (!name) return 'Name is required';
  if (name.length > 100) return 'Name is too long';
  return null;
}

export function validateGroupName(name: string): string | null {
  if (!name) return 'Group name is required';
  if (name.length > 50) return 'Group name must be 50 characters or less';
  return null;
}

export function validateExpenseDescription(description: string): string | null {
  if (!description) return 'Description is required';
  if (description.length > 100) return 'Description must be 100 characters or less';
  return null;
}

export function validateAmount(amount: number | string): string | null {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'Invalid amount';
  if (num <= 0) return 'Amount must be greater than 0';
  return null;
}

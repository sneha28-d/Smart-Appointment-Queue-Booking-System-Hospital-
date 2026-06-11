import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  children?: ReactNode;
  variant?: 'primary' | 'secondary' | 'white' | 'danger';
  isLoading?: boolean;
  className?: string;
}

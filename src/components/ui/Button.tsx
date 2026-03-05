import { ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = ({
  variant = 'primary',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyles =
    'px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:
      'bg-primary text-primary-foreground hover:brightness-105 active:brightness-95 shadow-[0_2px_12px_rgba(251,168,226,0.35)] hover:shadow-[0_4px_18px_rgba(251,168,226,0.5)]',
    secondary:
      'bg-white/8 text-slate-300 border border-white/10 hover:bg-white/12 active:bg-white/16',
    danger:
      'bg-red-500/15 text-red-300 border border-red-500/25 hover:bg-red-500/25 active:bg-red-500/35',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner className="w-4 h-4" />}
      {children}
    </button>
  );
};

import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  iconOnly?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  iconOnly = false,
  children,
  className,
  ...props
}: ButtonProps) {
  // `.text-button-*` aqui é redundante com a tipografia já presente em
  // Button.module.css (mantida lá por causa do consumo duplo — ver
  // comentário no .module.css e rules.md) — deixado explícito mesmo assim
  // pra deixar claro que este componente segue o padrão de text styles.
  const textStyleClass = { sm: 'text-button-s', md: 'text-button-m', lg: 'text-button-l' }[size];

  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    textStyleClass,
    iconOnly   ? styles.iconOnly  : '',
    iconLeft   ? styles.hasLeft   : '',
    iconRight  ? styles.hasRight  : '',
    className ?? '',
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} {...props}>
      {iconLeft && <span className={styles.icon}>{iconLeft}</span>}
      {!iconOnly && children}
      {iconRight && <span className={styles.icon}>{iconRight}</span>}
    </button>
  );
}

import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Chip.module.css';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

/** Pílula de seleção única/filtro (ex.: categorias do Canal de Ideias) — não confundir com
 * `.badge` de Table.module.css, que é um rótulo de leitura (não clicável, não tem estado
 * selecionado). `Chip` é sempre um `<button>`, pensado pra uma fileira com rolagem horizontal
 * no mobile (ver `.row` abaixo). */
export function Chip({ selected = false, className, children, ...props }: ChipProps) {
  const classes = [styles.chip, selected ? styles.selected : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <button type="button" className={classes} aria-pressed={selected} {...props}>
      {children}
    </button>
  );
}

export interface ChipRowProps {
  children: ReactNode;
  className?: string;
}

/** Wrapper de fileira — `overflow-x:auto` sem scrollbar visível, mesma técnica já usada em
 * `Tab.module.css`'s `.list`. */
export function ChipRow({ children, className }: ChipRowProps) {
  return <div className={[styles.row, className ?? ''].filter(Boolean).join(' ')}>{children}</div>;
}

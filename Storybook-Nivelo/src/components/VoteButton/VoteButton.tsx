import { ButtonHTMLAttributes } from 'react';
import { ThumbsUp } from 'lucide-react';
import styles from './VoteButton.module.css';

export interface VoteButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  count: number;
  voted?: boolean;
  size?: 'sm' | 'md';
}

/** Ação principal do Canal de Ideias — vota/desvota sem abrir a ideia. Pensado pra ficar
 * "chamativo sem roubar o foco": borda neutra por padrão, preenchimento de marca só quando
 * `voted`. `size="sm"` é o usado dentro do card do feed; `size="md"` é o usado na página de
 * detalhe da ideia (mais espaço, número maior). */
export function VoteButton({ count, voted = false, size = 'md', className, onClick, ...props }: VoteButtonProps) {
  const classes = [styles.voteButton, styles[size], voted ? styles.voted : '', className ?? ''].filter(Boolean).join(' ');
  return (
    <button
      type="button"
      className={classes}
      aria-pressed={voted}
      aria-label={voted ? 'Remover voto desta ideia' : 'Votar nesta ideia'}
      onClick={onClick}
      {...props}
    >
      <ThumbsUp className={styles.icon} size={size === 'sm' ? 16 : 20} />
      <span className={styles.count}>{count}</span>
    </button>
  );
}

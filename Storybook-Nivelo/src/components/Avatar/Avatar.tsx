import { ImgHTMLAttributes } from 'react';
import styles from './Avatar.module.css';

export type AvatarColor = 'brand' | 'green' | 'orange' | 'violet' | 'pink' | 'indigo';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'size'> {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  /** Cor do círculo de iniciais quando não há `src` — ver `pickAvatarColor` para derivar
   * uma cor estável a partir de um identificador (ex.: nome do autor). */
  color?: AvatarColor;
  className?: string;
}

const AVATAR_COLORS: AvatarColor[] = ['brand', 'green', 'orange', 'violet', 'pink', 'indigo'];

/** Deriva uma cor estável (sempre a mesma pra o mesmo texto) a partir de um hash simples —
 * usado pra distribuir os autores entre as 6 cores sem precisar guardar a cor em cada registro. */
export function pickAvatarColor(seed: string): AvatarColor {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, src, size = 'md', color, className, ...props }: AvatarProps) {
  const sizeClass = styles[size] ?? styles.md;
  const resolvedColor = color ?? pickAvatarColor(name);

  if (src) {
    return (
      <img
        className={[styles.avatar, sizeClass, className ?? ''].filter(Boolean).join(' ')}
        src={src}
        alt={name}
        {...props}
      />
    );
  }

  return (
    <span
      className={[styles.avatar, styles.initials, sizeClass, className ?? ''].filter(Boolean).join(' ')}
      data-color={resolvedColor}
      role="img"
      aria-label={name}
    >
      {getInitials(name)}
    </span>
  );
}

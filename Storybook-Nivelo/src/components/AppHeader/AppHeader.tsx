import { Menu, BookOpen } from 'lucide-react';
import { Button } from '../Button/Button';
import styles from './AppHeader.module.css';

export interface AppHeaderProps {
  /** Abre/fecha a Sidebar (drawer) no mobile. Undefined = sem hamburger funcional. */
  onMenuClick?: () => void;
  /** Estado atual do drawer mobile — só afeta o aria-label/aria-expanded do botão de menu. */
  mobileMenuOpen?: boolean;
  /** Clique no botão "Caderno de campo" (sem destino definido ainda neste estágio do produto). */
  onNotebookClick?: () => void;
  logoSrc?: string;
  logoAlt?: string;
  tagline?: string;
}

export function AppHeader({
  onMenuClick,
  mobileMenuOpen = false,
  onNotebookClick,
  logoSrc = `${import.meta.env.BASE_URL}logos/nivelo-azul-header-sistema.svg`,
  logoAlt = 'Nivelo',
  tagline = 'Sistema de gestão rural',
}: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.hamburger}
          onClick={onMenuClick}
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="app-sidebar"
        >
          <Menu size={22} />
        </button>

        <div className={styles.brand}>
          <img className={styles.logo} src={logoSrc} alt={logoAlt} />
          <span className={`${styles.tagline} text-10-regular`}>{tagline}</span>
        </div>
      </div>

      <div className={styles.right}>
        <Button type="button" variant="secondary" iconLeft={<BookOpen size={16} />} onClick={onNotebookClick}>
          <span className={styles.notebookLabel}>Caderno de campo</span>
        </Button>
      </div>
    </header>
  );
}

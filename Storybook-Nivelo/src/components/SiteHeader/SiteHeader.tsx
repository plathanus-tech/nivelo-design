import { useEffect, useRef, useState } from 'react';
import styles from './SiteHeader.module.css';

export interface NavLink {
  label: string;
  href: string;
}

export interface SiteHeaderProps {
  /** Logo exibida sobre o hero (fundo escuro) */
  logoWhiteSrc: string;
  /** Logo exibida após scroll (fundo claro) */
  logoColorSrc: string;
  logoAlt?: string;
  navLinks?: NavLink[];
  ctaLabel?: string;
  ctaHref?: string;
}

export function SiteHeader({
  logoWhiteSrc,
  logoColorSrc,
  logoAlt = 'Nivelo',
  navLinks = [],
  ctaLabel = 'Área do Cliente',
  ctaHref = '/login',
}: SiteHeaderProps) {
  const [scrolled, setScrolled]     = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) setDrawerOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const headerClass = [styles.header, scrolled ? styles.scrolled : ''].filter(Boolean).join(' ');
  const drawerClass = [styles.drawer, drawerOpen ? styles.drawerOpen : ''].filter(Boolean).join(' ');

  return (
    <>
      <nav className={headerClass} aria-label="Navegação principal">
        <div className={styles.inner}>

          <a href="#inicio" className={styles.logo} aria-label={`${logoAlt}, ir para o início`}>
            <img className={styles.logoWhite} src={logoWhiteSrc} alt={logoAlt} />
            <img className={styles.logoColor} src={logoColorSrc} alt={logoAlt} />
          </a>

          <ul className={styles.links} role="list">
            {navLinks.map(link => (
              <li key={link.href}>
                <a href={link.href} className="text-16-regular">{link.label}</a>
              </li>
            ))}
          </ul>

          <a href={ctaHref} className={`btn primary sm ${styles.cta}`}>
            {ctaLabel}
          </a>

          <button
            className={styles.hamburger}
            aria-label="Abrir menu"
            aria-expanded={drawerOpen}
            aria-controls="site-header-drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>

        </div>
      </nav>

      {/* Mobile drawer */}
      <div
        className={drawerClass}
        id="site-header-drawer"
        ref={drawerRef}
        aria-hidden={!drawerOpen}
      >
        <div
          className={styles.drawerOverlay}
          onClick={() => setDrawerOpen(false)}
        />
        <div className={styles.drawerPanel} role="dialog" aria-modal="true" aria-label="Menu">

          <button
            className={styles.drawerClose}
            aria-label="Fechar menu"
            onClick={() => setDrawerOpen(false)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          <ul className={styles.drawerLinks} role="list">
            {navLinks.map(link => (
              <li key={link.href}>
                <a href={link.href} className="text-18-regular" onClick={() => setDrawerOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href={ctaHref}
            className={`btn primary md ${styles.drawerCta}`}
            onClick={() => setDrawerOpen(false)}
          >
            {ctaLabel}
          </a>

        </div>
      </div>
    </>
  );
}

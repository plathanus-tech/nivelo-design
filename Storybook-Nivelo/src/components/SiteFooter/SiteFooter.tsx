import { ReactNode } from 'react';
import styles from './SiteFooter.module.css';

export interface FooterNavLink {
  label: string;
  href: string;
}

export interface FooterSocialLink {
  label: string;
  href: string;
  icon: ReactNode;
}

export interface FooterLegalLink {
  label: string;
  onClick: () => void;
}

export interface FooterPhoneBlock {
  /** Rótulo acima do número (ex: "Vendas", "Suporte") */
  label: string;
  /** Número para href tel: (ex: "+5511999999999") */
  phone: string;
  /** Número formatado para exibição (ex: "(11) 99999-9999") */
  phoneDisplay: string;
}

export interface SiteFooterProps {
  /** Logo exibida no rodapé (versão branca recomendada) */
  logoSrc: string;
  logoAlt?: string;
  /** Links de redes sociais */
  socialLinks?: FooterSocialLink[];
  /** Blocos de telefone (Vendas, Suporte etc.) — 0, 1 ou mais */
  phoneBlocks?: FooterPhoneBlock[];
  /** Links da coluna Navegação */
  navLinks?: FooterNavLink[];
  /** Links legais da coluna Legal (Termos, Privacidade, LGPD) */
  legalLinks?: FooterLegalLink[];
  /** Texto de copyright */
  copyright?: string;
}

export function SiteFooter({
  logoSrc,
  logoAlt = 'Nivelo',
  socialLinks = [],
  phoneBlocks = [],
  navLinks = [],
  legalLinks = [],
  copyright = '© 2026 Nivelo',
}: SiteFooterProps) {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.inner}>

        <div className={styles.columns}>

          {/* Coluna 1: Institucional */}
          <div className={styles.brand}>
            <a href="#" className={styles.logoLink} aria-label={`${logoAlt} — página inicial`}>
              <img src={logoSrc} alt={logoAlt} />
            </a>

            {socialLinks.length > 0 && (
              <div className={styles.social} aria-label={`Redes sociais da ${logoAlt}`}>
                {socialLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    aria-label={link.label}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            )}

            {phoneBlocks.map(block => (
              <div key={block.label} className={styles.phoneBlock}>
                <p className={`${styles.phoneLabel} text-10-regular`}>{block.label}</p>
                <a href={`tel:${block.phone}`} className={`${styles.phoneNumber} text-subtitle-l`}>
                  {block.phoneDisplay}
                </a>
              </div>
            ))}
          </div>

          {/* Coluna 2: Navegação */}
          {navLinks.length > 0 && (
            <div className={styles.col}>
              <p className={`${styles.colTitle} text-10-medium`} aria-hidden="true">Navegação</p>
              <nav aria-label="Links do rodapé">
                <ul className={styles.navList}>
                  {navLinks.map(link => (
                    <li key={link.href}>
                      <a href={link.href} className="text-16-regular">{link.label}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}

          {/* Coluna 3: Legal */}
          {legalLinks.length > 0 && (
            <div className={styles.col}>
              <p className={`${styles.colTitle} text-10-medium`} aria-hidden="true">Legal</p>
              <div className={styles.legalLinks}>
                {legalLinks.map(link => (
                  <button
                    key={link.label}
                    type="button"
                    className={`${styles.legalBtn} text-16-regular`}
                    onClick={link.onClick}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        <div className={styles.bottom}>
          <p className={`${styles.copy} text-body-xs`}>{copyright}</p>
        </div>

      </div>
    </footer>
  );
}

import type { Meta, StoryObj } from '@storybook/react';
import { SiteFooter } from './SiteFooter';

/* Ícones SVG inline — apenas para Storybook (não usar na landing; lá usar <img src=".."> */
const IconInstagram = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const IconFacebook = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const IconLinkedIn = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const meta: Meta<typeof SiteFooter> = {
  title: 'Landing/SiteFooter',
  component: SiteFooter,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof SiteFooter>;

export const Default: Story = {
  args: {
    logoSrc: '/NIVELO branco header.svg',
    logoAlt: 'Nivelo',
    socialLinks: [
      { label: 'Instagram da Nivelo', href: '#', icon: <IconInstagram /> },
      { label: 'Facebook da Nivelo',  href: '#', icon: <IconFacebook /> },
      { label: 'LinkedIn da Nivelo',  href: '#', icon: <IconLinkedIn /> },
    ],
    phone:        '+5511999999999',
    phoneDisplay: '(11) 99999-9999',
    navLinks: [
      { label: 'Funcionalidades',    href: '#funcionalidades' },
      { label: 'Planos',             href: '#planos' },
      { label: 'Quem Somos',         href: '#quem-somos' },
      { label: 'Perguntas Frequentes', href: '#faq' },
      { label: 'Contato',            href: '#contato' },
    ],
    legalLinks: [
      { label: 'Termos de Uso',        onClick: () => alert('Termos') },
      { label: 'Politica de Privacidade', onClick: () => alert('Privacidade') },
      { label: 'LGPD',                 onClick: () => alert('LGPD') },
    ],
    copyright: '© 2025 Nivelo. Todos os direitos reservados.',
  },
};

export const SemRedes: Story = {
  name: 'Sem redes sociais',
  args: {
    ...Default.args,
    socialLinks: [],
  },
};

export const SemTelefone: Story = {
  name: 'Sem telefone',
  args: {
    ...Default.args,
    phone:        undefined,
    phoneDisplay: undefined,
  },
};

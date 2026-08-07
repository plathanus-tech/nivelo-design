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

const IconTikTok = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 12a4 4 0 1 0 4 4V4a6 6 0 0 0 6 6"/>
  </svg>
);

const IconYouTube = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <path d="m10 15 5-3-5-3z"/>
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
      { label: 'TikTok da Nivelo',    href: '#', icon: <IconTikTok /> },
      { label: 'YouTube da Nivelo',   href: '#', icon: <IconYouTube /> },
    ],
    phoneBlocks: [
      { label: 'Vendas',  phone: '+5511999999999', phoneDisplay: '(11) 99999-9999' },
      { label: 'Suporte', phone: '+5511988888888', phoneDisplay: '(11) 98888-8888' },
    ],
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
    copyright: '© 2026 Nivelo',
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
    phoneBlocks: [],
  },
};

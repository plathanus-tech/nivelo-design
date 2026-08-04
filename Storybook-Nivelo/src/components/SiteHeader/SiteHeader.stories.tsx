import type { Meta, StoryObj } from '@storybook/react';
import { SiteHeader } from './SiteHeader';

const meta: Meta<typeof SiteHeader> = {
  title: 'Landing/SiteHeader',
  component: SiteHeader,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'hero',
      values: [
        { name: 'hero', value: '#061A40' },
        { name: 'surface', value: '#FFFFFF' },
      ],
    },
  },
  argTypes: {
    logoWhiteSrc: { control: 'text' },
    logoColorSrc: { control: 'text' },
    logoAlt:      { control: 'text' },
    ctaLabel:     { control: 'text' },
    ctaHref:      { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof SiteHeader>;

const defaultLinks = [
  { label: 'Funcionalidades', href: '#funcionalidades' },
  { label: 'Planos',          href: '#planos' },
  { label: 'Quem Somos',      href: '#quem-somos' },
  { label: 'FAQ',             href: '#faq' },
];

export const Default: Story = {
  args: {
    logoWhiteSrc: '/NIVELO branco header.svg',
    logoColorSrc: '/NIVELO azul header.svg',
    logoAlt:      'Nivelo',
    navLinks:     defaultLinks,
    ctaLabel:     'Área do Cliente',
    ctaHref:      '/login',
  },
};

export const Scrolled: Story = {
  name: 'Scrolled (fundo branco)',
  args: {
    ...Default.args,
  },
  parameters: {
    backgrounds: { default: 'surface' },
  },
  decorators: [
    (Story) => (
      <div style={{ paddingTop: '64px' }}>
        {/* Força o estado scrolled via classe direta para preview estático */}
        <Story />
      </div>
    ),
  ],
};

export const SemLinks: Story = {
  name: 'Sem links de navegação',
  args: {
    ...Default.args,
    navLinks: [],
  },
};

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { AppHeader } from './AppHeader';

const meta: Meta<typeof AppHeader> = {
  title: 'Components/AppHeader',
  component: AppHeader,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Header do shell principal (área logada do produto). Fixo no topo, logo + tagline à esquerda, hamburger (só no mobile, abre a Sidebar como drawer) e botão "Caderno de campo" à direita. Sempre light mode — ver app/CLAUDE.md.',
      },
    },
  },
  argTypes: {
    logoSrc: { control: 'text' },
    logoAlt: { control: 'text' },
    tagline: { control: 'text' },
  },
};
export default meta;
type Story = StoryObj<typeof AppHeader>;

export const Default: Story = {};

export const MobileFrame: Story = {
  render: (args) => (
    <div style={{ maxWidth: 375, margin: '0 auto', border: '1px solid #eee' }}>
      <AppHeader {...args} mobileMenuOpen={false} />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Header em viewport mobile (375px) — hamburger visível, rótulo do botão de caderno some abaixo de 480px.' },
    },
  },
};

export const MobileMenuOpen: Story = {
  render: (args) => (
    <div style={{ maxWidth: 375, margin: '0 auto', border: '1px solid #eee' }}>
      <AppHeader {...args} mobileMenuOpen />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Header no mobile com o drawer da Sidebar aberto (hamburger em estado "fechar menu").' },
    },
  },
};

export const DesktopFrame: Story = {
  render: (args) => (
    <div style={{ width: '100%' }}>
      <AppHeader {...args} />
    </div>
  ),
  parameters: {
    docs: {
      description: { story: 'Header em viewport desktop (≥1024px) — hamburger some, a Sidebar já fica sempre visível ao lado.' },
    },
  },
};

export const Interactive: Story = {
  render: (args) => {
    const [menuOpen, setMenuOpen] = useState(false);
    return (
      <div style={{ maxWidth: 375, margin: '0 auto', border: '1px solid #eee' }}>
        <AppHeader {...args} mobileMenuOpen={menuOpen} onMenuClick={() => setMenuOpen((v) => !v)} />
        <p style={{ padding: 16, fontFamily: 'sans-serif', fontSize: 13, color: '#666' }}>
          Estado do drawer: <strong>{menuOpen ? 'aberto' : 'fechado'}</strong> (clique no hamburger)
        </p>
      </div>
    );
  },
};

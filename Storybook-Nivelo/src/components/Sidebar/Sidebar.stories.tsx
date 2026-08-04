import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { AppHeader } from '../AppHeader/AppHeader';

/* ── Conteúdo placeholder ao lado da Sidebar ────────────────────────────── */
function MainPlaceholder({ label }: { label: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0, padding: 32 }}>
      <div style={{
        maxWidth: 640, margin: '0 auto', padding: 48, textAlign: 'center',
        border: '1px dashed var(--color-border-default)', borderRadius: 24,
        background: 'var(--color-bg-surface)',
      }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 500, color: 'var(--color-text-primary)', margin: '0 0 8px' }}>
          Área de conteúdo principal
        </h1>
        <p style={{ fontSize: 16, color: 'var(--color-text-secondary)', margin: 0 }}>
          Item selecionado: <strong>{label}</strong>
        </p>
      </div>
    </div>
  );
}

/* ── Layout wrapper (Sidebar + conteúdo, como no shell real) ────────────── */
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', background: 'var(--color-bg-default)', overflow: 'hidden' }}>
      {children}
    </div>
  );
}

const meta: Meta<typeof Sidebar> = {
  title: 'Components/Sidebar',
  component: Sidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Navegação principal do shell da área logada. Expandida (ícone+texto) ⇄ retraída (só ícone, botão circular na borda, desktop ≥1024px); no mobile vira drawer acionado pelo hamburger do AppHeader. Grupos com subitens (Financeiro, Vendas, Assistente IA, Configuração) funcionam em accordion — só um fica aberto por vez. Clicar num grupo com a Sidebar retraída abre um Popover flutuando ao lado do ícone, sem expandir a Sidebar. Fiscal (dentro de Configuração) é um subgrupo de mais um nível. Sempre light mode — ver app/CLAUDE.md.',
      },
    },
  },
};
export default meta;
type Story = StoryObj<typeof Sidebar>;

/* ── Expandida (padrão) ──────────────────────────────────────────────────── */
export const Expanded: Story = {
  render: () => (
    <AppLayout>
      <Sidebar activeItemId="dashboard" />
      <MainPlaceholder label="Dashboard" />
    </AppLayout>
  ),
};

/* ── Interactive (estado real: retrair, navegar, abrir grupos/popover) ──── */
export const Interactive: Story = {
  render: () => {
    const [active, setActive] = useState('dashboard');
    return (
      <AppLayout>
        <Sidebar activeItemId={active} onNavigate={setActive} onLogout={() => alert('Sair (sem destino real neste estágio)')} />
        <MainPlaceholder label={active} />
      </AppLayout>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Estado real: use o botão circular na borda da Sidebar pra retrair/expandir, clique em Financeiro/Vendas/Assistente IA/Configuração pra ver o accordion (e o Popover quando retraída), e em Fiscal pra ver o subgrupo de 2º nível.',
      },
    },
  },
};

/* ── Mobile (drawer) ──────────────────────────────────────────────────────── */
export const MobileDrawerOpen: Story = {
  render: () => (
    <div style={{ width: 375, height: 700, position: 'relative', overflow: 'hidden', border: '1px solid #eee' }}>
      <Sidebar activeItemId="dashboard" mobileOpen />
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: { story: 'Sidebar como drawer no mobile (< 1024px), aberta — com fundo escurecido atrás, fecha ao clicar nele ou em Escape.' },
    },
  },
};

export const MobileDrawerClosed: Story = {
  render: () => (
    <div style={{ width: 375, height: 700, position: 'relative', overflow: 'hidden', border: '1px solid #eee' }}>
      <Sidebar activeItemId="dashboard" mobileOpen={false} />
    </div>
  ),
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: { story: 'Sidebar como drawer no mobile, fechada (fora da tela) — estado padrão até o hamburger do AppHeader ser clicado.' },
    },
  },
};

/* ── Shell completo (AppHeader + Sidebar, como usados juntos na área logada) ── */
export const WithHeader: Story = {
  render: () => {
    const [active, setActive] = useState('dashboard');
    const [mobileOpen, setMobileOpen] = useState(false);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--color-bg-default)' }}>
        <AppHeader mobileMenuOpen={mobileOpen} onMenuClick={() => setMobileOpen((v) => !v)} />
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <Sidebar
            activeItemId={active}
            onNavigate={(id) => { setActive(id); setMobileOpen(false); }}
            mobileOpen={mobileOpen}
            onMobileOpenChange={setMobileOpen}
            onLogout={() => alert('Sair (sem destino real neste estágio)')}
          />
          <MainPlaceholder label={active} />
        </div>
      </div>
    );
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'AppHeader + Sidebar compostos exatamente como na área logada real: o hamburger do Header abre/fecha o drawer da Sidebar no mobile (redimensione a viewport pra ver os dois modos).',
      },
    },
  },
};

import { ReactNode, useEffect, useState, MouseEvent as ReactMouseEvent, FocusEvent as ReactFocusEvent } from 'react';
import {
  LayoutDashboard, FolderPlus, Package, Wallet, ChevronDown, ChevronLeft, Coins, ArrowUpCircle, ArrowDownCircle, BarChart3,
  ShoppingCart, Receipt, ShoppingBag, Bot, Smartphone, MessageSquarePlus, History, Settings, User, Tractor,
  Landmark, Tags, FileText, Shuffle, ShieldCheck, Lightbulb, CirclePlay, LogOut,
} from 'lucide-react';
import styles from './Sidebar.module.css';

function cx(...args: Array<string | false | undefined | null>) {
  return args.filter(Boolean).join(' ');
}

/* WhatsApp não existe no Lucide — SVG inline com fill="currentColor" (não
   mask-image: já tentamos e o suporte de mask variou entre navegadores,
   deixando o ícone sem cor visível em alguns casos). Mesma técnica que o
   próprio Lucide usa internamente, só que sem passar pelo pacote. */
function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export interface SidebarProps {
  /** Drawer mobile aberto/fechado — controlado de fora (o AppHeader tem o hamburger). */
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
  /** Id do item de navegação selecionado no momento. */
  activeItemId?: string;
  onNavigate?: (id: string) => void;
  onLogout?: () => void;
  version?: string;
}

type TopLevelGroupId = 'financeiro' | 'vendas' | 'assistente-ia' | 'configuracao';

type TooltipState = { text: string; top: number; left: number } | null;
type PopoverPos = { top: number; left: number } | null;

export function Sidebar({
  mobileOpen = false,
  onMobileOpenChange,
  activeItemId = 'dashboard',
  onNavigate,
  onLogout,
  version = 'Versão 1.0.0',
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<TopLevelGroupId | null>(null);
  const [popoverGroupId, setPopoverGroupId] = useState<TopLevelGroupId | null>(null);
  const [popoverPos, setPopoverPos] = useState<PopoverPos>(null);
  const [fiscalOpen, setFiscalOpen] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>(null);

  // Mudar o estado de retração sempre fecha grupos/popovers abertos — evita
  // estado "aberto" preso (com posição de popover obsoleta) ao trocar de
  // contexto expandido ⇄ retraído.
  function toggleCollapsed() {
    setOpenGroupId(null);
    setPopoverGroupId(null);
    setPopoverPos(null);
    setFiscalOpen(false);
    setTooltip(null);
    setCollapsed((c) => !c);
  }

  function handleGroupClick(groupId: TopLevelGroupId, event: ReactMouseEvent<HTMLButtonElement>) {
    const willOpen = openGroupId !== groupId;
    if (!willOpen) {
      setOpenGroupId(null);
      setPopoverGroupId(null);
      setPopoverPos(null);
      return;
    }
    // Abrir um grupo de topo fecha qualquer outro que estivesse aberto
    // (accordion — automático aqui já que openGroupId guarda só 1 id) —
    // inclusive o Fiscal, que só faz sentido junto de Configuração.
    setOpenGroupId(groupId);
    if (groupId !== 'configuracao') setFiscalOpen(false);

    if (collapsed) {
      // Sidebar retraída: não expande permanentemente — mostra os
      // subitens num Popover flutuando ao lado do ícone clicado.
      setTooltip(null);
      const rect = event.currentTarget.getBoundingClientRect();
      setPopoverPos({ top: rect.top, left: rect.right + 8 });
      setPopoverGroupId(groupId);
    } else {
      setPopoverGroupId(null);
      setPopoverPos(null);
    }
  }

  function handleFiscalClick() {
    setFiscalOpen((v) => !v);
  }

  function handleNavigate(id: string) {
    onNavigate?.(id);
    // Selecionar uma opção fecha o Popover, se houver um aberto (nunca
    // fecha um grupo aberto inline na Sidebar expandida — isso é estado de
    // navegação normal, não uma sobreposição temporária).
    if (popoverGroupId !== null) {
      setOpenGroupId(null);
      setPopoverGroupId(null);
      setPopoverPos(null);
      setFiscalOpen(false);
    }
  }

  function showTooltip(text: string, event: ReactMouseEvent<HTMLButtonElement> | ReactFocusEvent<HTMLButtonElement>) {
    // Na Sidebar expandida o rótulo já está visível — tooltip seria redundante.
    if (!collapsed) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltip({ text, top: rect.top + rect.height / 2, left: rect.right + 12 });
  }
  function hideTooltip() {
    setTooltip(null);
  }

  // Escape: fecha o drawer mobile (se aberto) e qualquer Popover aberto.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (mobileOpen) onMobileOpenChange?.(false);
      if (popoverGroupId !== null) {
        setOpenGroupId(null);
        setPopoverGroupId(null);
        setPopoverPos(null);
        setFiscalOpen(false);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileOpen, popoverGroupId, onMobileOpenChange]);

  // Popover: fecha ao clicar fora dele (nunca no hover, só no clique).
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (popoverGroupId === null) return;
      const target = e.target as HTMLElement;
      if (!target.closest(`[data-group-id="${popoverGroupId}"]`)) {
        setOpenGroupId(null);
        setPopoverGroupId(null);
        setPopoverPos(null);
        setFiscalOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [popoverGroupId]);

  /* ── Subcomponentes internos (nível 0/1/2) ────────────────────────────── */

  function NavItem({ id, icon, label, tooltipText, exit }: { id: string; icon: ReactNode; label: string; tooltipText?: string; exit?: boolean }) {
    const isActive = id === activeItemId;
    return (
      <button
        type="button"
        className={cx(styles.navItem, 'text-subtitle-m', isActive && styles.navItemActive, exit && styles.navItemExit)}
        onClick={() => handleNavigate(id)}
        aria-current={isActive ? 'page' : undefined}
        onMouseEnter={(e) => showTooltip(tooltipText ?? label, e)}
        onMouseLeave={hideTooltip}
        onFocus={(e) => showTooltip(tooltipText ?? label, e)}
        onBlur={hideTooltip}
      >
        <span className={styles.navIcon}>{icon}</span>
        <span className={styles.navLabel}>{label}</span>
      </button>
    );
  }

  function NavGroup({ id, icon, label, children }: { id: TopLevelGroupId; icon: ReactNode; label: string; children: ReactNode }) {
    const isOpen = openGroupId === id;
    const isPopover = popoverGroupId === id;
    return (
      <div className={cx(styles.navGroup, isOpen && styles.navGroupOpen)} data-group-id={id}>
        <button
          type="button"
          className={cx(styles.navItem, 'text-subtitle-m')}
          onClick={(e) => handleGroupClick(id, e)}
          aria-expanded={isOpen}
          onMouseEnter={(e) => showTooltip(`${label} · opções`, e)}
          onMouseLeave={hideTooltip}
          onFocus={(e) => showTooltip(`${label} · opções`, e)}
          onBlur={hideTooltip}
        >
          <span className={styles.navIcon}>{icon}</span>
          <span className={styles.navLabel}>{label}</span>
          <span className={styles.navChevron}><ChevronDown size={16} /></span>
        </button>
        <div
          className={cx(styles.navSubmenu, isPopover && styles.navSubmenuPopover)}
          style={isPopover && popoverPos ? { top: popoverPos.top, left: popoverPos.left } : undefined}
        >
          {children}
        </div>
      </div>
    );
  }

  function NavSubitem({ id, icon, label }: { id: string; icon: ReactNode; label: string }) {
    const isActive = id === activeItemId;
    return (
      <button
        type="button"
        className={cx(styles.navSubitem, 'text-body-s', isActive && styles.navSubitemActive)}
        onClick={() => handleNavigate(id)}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className={styles.navIcon}>{icon}</span>
        <span className={styles.navLabel}>{label}</span>
      </button>
    );
  }

  function NavSubsubitem({ id, icon, label }: { id: string; icon: ReactNode; label: string }) {
    const isActive = id === activeItemId;
    return (
      <button
        type="button"
        className={cx(styles.navSubsubitem, 'text-body-xs', isActive && styles.navSubsubitemActive)}
        onClick={() => handleNavigate(id)}
        aria-current={isActive ? 'page' : undefined}
      >
        <span className={cx(styles.navIcon, styles.navIconXs)}>{icon}</span>
        <span className={styles.navLabel}>{label}</span>
      </button>
    );
  }

  /* ── Render ────────────────────────────────────────────────────────────── */

  return (
    <>
      <div className={cx(styles.backdrop, mobileOpen && styles.backdropVisible)} onClick={() => onMobileOpenChange?.(false)} />

      <aside className={cx(styles.sidebar, collapsed && styles.collapsed, mobileOpen && styles.mobileOpen)} id="app-sidebar" aria-label="Navegação principal">
        <button
          type="button"
          className={styles.collapseToggle}
          onClick={toggleCollapsed}
          aria-label={collapsed ? 'Expandir menu' : 'Retrair menu'}
          aria-expanded={!collapsed}
        >
          <ChevronLeft className={styles.collapseToggleIcon} size={16} />
        </button>

        <nav className={styles.body}>

          <div className={styles.section}>
            <span className={`${styles.sectionTitle} text-10-medium`}>Geral</span>

            <NavItem id="dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem id="cadastro" icon={<FolderPlus size={20} />} label="Cadastro" />
            <NavItem id="estoque" icon={<Package size={20} />} label="Estoque" />

            <NavGroup id="financeiro" icon={<Wallet size={20} />} label="Financeiro">
              <NavSubitem id="financeiro-caixa" icon={<Coins size={16} />} label="Caixa" />
              <NavSubitem id="financeiro-pagar" icon={<ArrowUpCircle size={16} />} label="Contas a pagar" />
              <NavSubitem id="financeiro-receber" icon={<ArrowDownCircle size={16} />} label="Contas a receber" />
              <NavSubitem id="financeiro-relatorios" icon={<BarChart3 size={16} />} label="Relatórios" />
            </NavGroup>

            <NavGroup id="vendas" icon={<ShoppingCart size={20} />} label="Vendas">
              <NavSubitem id="vendas-nota-fiscal" icon={<Receipt size={16} />} label="Nota fiscal" />
              <NavSubitem id="vendas-pedidos" icon={<ShoppingBag size={16} />} label="Pedidos de venda" />
            </NavGroup>

            <NavGroup id="assistente-ia" icon={<Bot size={20} />} label="Assistente IA">
              <NavSubitem id="assistente-numeros" icon={<Smartphone size={16} />} label="Meus números" />
              <NavSubitem id="assistente-nova-conversa" icon={<MessageSquarePlus size={16} />} label="Nova conversa" />
              <NavSubitem id="assistente-historico" icon={<History size={16} />} label="Histórico" />
            </NavGroup>
          </div>

          <div className={styles.section}>
            <span className={`${styles.sectionTitle} text-10-medium`}>Gestão</span>

            <NavGroup id="configuracao" icon={<Settings size={20} />} label="Configuração">
              <NavSubitem id="config-minha-conta" icon={<User size={16} />} label="Minha conta" />
              <NavSubitem id="config-fazenda" icon={<Tractor size={16} />} label="Cadastro de fazenda" />
              <NavSubitem id="config-conta-bancaria" icon={<Landmark size={16} />} label="Conta bancária" />
              <NavSubitem id="config-categorias" icon={<Tags size={16} />} label="Categorias de receitas e despesas" />

              <div className={cx(styles.navSubgroup, fiscalOpen && styles.navSubgroupOpen)}>
                <button
                  type="button"
                  className={cx(styles.navSubitem, 'text-body-s')}
                  onClick={handleFiscalClick}
                  aria-expanded={fiscalOpen}
                >
                  <span className={styles.navIcon}><FileText size={16} /></span>
                  <span className={styles.navLabel}>Fiscal</span>
                  <span className={styles.navChevron}><ChevronDown size={14} /></span>
                </button>
                <div className={styles.navSubsubmenu}>
                  <NavSubsubitem id="fiscal-nota-fiscal" icon={<Receipt size={14} />} label="Nota fiscal" />
                  <NavSubsubitem id="fiscal-natureza" icon={<Shuffle size={14} />} label="Natureza da operação" />
                  <NavSubsubitem id="fiscal-certificado" icon={<ShieldCheck size={14} />} label="Certificado digital" />
                </div>
              </div>
            </NavGroup>

            <NavItem id="canal-ideias" icon={<Lightbulb size={20} />} label="Canal de ideias" />
            <NavItem id="videos" icon={<CirclePlay size={20} />} label="Vídeos" />
          </div>

          <div className={styles.section}>
            <span className={`${styles.sectionTitle} text-10-medium`}>Suporte</span>

            <NavItem id="suporte" icon={<WhatsAppIcon size={20} />} label="Suporte" />

            <button
              type="button"
              className={cx(styles.navItem, 'text-subtitle-m', styles.navItemExit)}
              onClick={onLogout}
              onMouseEnter={(e) => showTooltip('Sair', e)}
              onMouseLeave={hideTooltip}
              onFocus={(e) => showTooltip('Sair', e)}
              onBlur={hideTooltip}
            >
              <span className={styles.navIcon}><LogOut size={20} /></span>
              <span className={styles.navLabel}>Sair</span>
            </button>
          </div>

        </nav>

        <div className={styles.footer}>
          <span className={`${styles.version} text-10-regular`}>{version}</span>
        </div>
      </aside>

      {tooltip && (
        <div className={`${styles.tooltip} text-12-regular`} style={{ top: tooltip.top, left: tooltip.left, transform: 'translateY(-50%)' }}>
          {tooltip.text}
        </div>
      )}
    </>
  );
}

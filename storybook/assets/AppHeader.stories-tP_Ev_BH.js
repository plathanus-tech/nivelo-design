import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as w}from"./index-DRjF_FHU.js";import{A as o}from"./AppHeader-Dkc9WI1Q.js";import"./Button-_bFaThKo.js";import"./menu-BYEPoBv8.js";import"./createLucideIcon-B3K6bXbU.js";const D={title:"Components/AppHeader",component:o,tags:["autodocs"],parameters:{layout:"fullscreen",docs:{description:{component:'Header do shell principal (área logada do produto). Fixo no topo, logo + tagline à esquerda, hamburger (só no mobile, abre a Sidebar como drawer) e botão "Caderno de campo" à direita. Sempre light mode — ver app/CLAUDE.md.'}}},argTypes:{logoSrc:{control:"text"},logoAlt:{control:"text"},tagline:{control:"text"}}},a={},s={render:r=>e.jsx("div",{style:{maxWidth:375,margin:"0 auto",border:"1px solid #eee"},children:e.jsx(o,{...r,mobileMenuOpen:!1})}),parameters:{docs:{description:{story:"Header em viewport mobile (375px) — hamburger visível, rótulo do botão de caderno some abaixo de 480px."}}}},n={render:r=>e.jsx("div",{style:{maxWidth:375,margin:"0 auto",border:"1px solid #eee"},children:e.jsx(o,{...r,mobileMenuOpen:!0})}),parameters:{docs:{description:{story:'Header no mobile com o drawer da Sidebar aberto (hamburger em estado "fechar menu").'}}}},t={render:r=>e.jsx("div",{style:{width:"100%"},children:e.jsx(o,{...r})}),parameters:{docs:{description:{story:"Header em viewport desktop (≥1024px) — hamburger some, a Sidebar já fica sempre visível ao lado."}}}},d={render:r=>{const[i,j]=w.useState(!1);return e.jsxs("div",{style:{maxWidth:375,margin:"0 auto",border:"1px solid #eee"},children:[e.jsx(o,{...r,mobileMenuOpen:i,onMenuClick:()=>j(H=>!H)}),e.jsxs("p",{style:{padding:16,fontFamily:"sans-serif",fontSize:13,color:"#666"},children:["Estado do drawer: ",e.jsx("strong",{children:i?"aberto":"fechado"})," (clique no hamburger)"]})]})}};var p,m,c;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:"{}",...(c=(m=a.parameters)==null?void 0:m.docs)==null?void 0:c.source}}};var l,u,b;s.parameters={...s.parameters,docs:{...(l=s.parameters)==null?void 0:l.docs,source:{originalSource:`{
  render: args => <div style={{
    maxWidth: 375,
    margin: '0 auto',
    border: '1px solid #eee'
  }}>\r
      <AppHeader {...args} mobileMenuOpen={false} />\r
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'Header em viewport mobile (375px) — hamburger visível, rótulo do botão de caderno some abaixo de 480px.'
      }
    }
  }
}`,...(b=(u=s.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};var g,x,h;n.parameters={...n.parameters,docs:{...(g=n.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: args => <div style={{
    maxWidth: 375,
    margin: '0 auto',
    border: '1px solid #eee'
  }}>\r
      <AppHeader {...args} mobileMenuOpen />\r
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'Header no mobile com o drawer da Sidebar aberto (hamburger em estado "fechar menu").'
      }
    }
  }
}`,...(h=(x=n.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var v,f,y;t.parameters={...t.parameters,docs:{...(v=t.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: args => <div style={{
    width: '100%'
  }}>\r
      <AppHeader {...args} />\r
    </div>,
  parameters: {
    docs: {
      description: {
        story: 'Header em viewport desktop (≥1024px) — hamburger some, a Sidebar já fica sempre visível ao lado.'
      }
    }
  }
}`,...(y=(f=t.parameters)==null?void 0:f.docs)==null?void 0:y.source}}};var M,O,S;d.parameters={...d.parameters,docs:{...(M=d.parameters)==null?void 0:M.docs,source:{originalSource:`{
  render: args => {
    const [menuOpen, setMenuOpen] = useState(false);
    return <div style={{
      maxWidth: 375,
      margin: '0 auto',
      border: '1px solid #eee'
    }}>\r
        <AppHeader {...args} mobileMenuOpen={menuOpen} onMenuClick={() => setMenuOpen(v => !v)} />\r
        <p style={{
        padding: 16,
        fontFamily: 'sans-serif',
        fontSize: 13,
        color: '#666'
      }}>\r
          Estado do drawer: <strong>{menuOpen ? 'aberto' : 'fechado'}</strong> (clique no hamburger)\r
        </p>\r
      </div>;
  }
}`,...(S=(O=d.parameters)==null?void 0:O.docs)==null?void 0:S.source}}};const q=["Default","MobileFrame","MobileMenuOpen","DesktopFrame","Interactive"];export{a as Default,t as DesktopFrame,d as Interactive,s as MobileFrame,n as MobileMenuOpen,q as __namedExportsOrder,D as default};

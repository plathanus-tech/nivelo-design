import{j as r}from"./jsx-runtime-DiklIkkE.js";import{B as e}from"./Button-_bFaThKo.js";import{P as d,T as G,A as V,a as T,D as k,S as F}from"./trash-wCxq8hDV.js";import{X as H}from"./x-nO499Wy1.js";import{c as X}from"./createLucideIcon-B3K6bXbU.js";import"./index-DRjF_FHU.js";/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const M=X("Save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]),Q={title:"Components/Button",component:e,tags:["autodocs"],argTypes:{variant:{control:"select",options:["primary","secondary","destructive","ghost"]},size:{control:"select",options:["sm","md","lg"]},disabled:{control:"boolean"},children:{control:"text"}}},a={args:{children:"Botão",variant:"primary",size:"md"}},t={render:()=>r.jsxs("div",{style:{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"},children:[r.jsx(e,{variant:"primary",children:"Primary"}),r.jsx(e,{variant:"secondary",children:"Secondary"}),r.jsx(e,{variant:"destructive",children:"Destructive"}),r.jsx(e,{variant:"ghost",children:"Ghost"})]})},i={render:()=>r.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[r.jsx(e,{size:"sm",children:"Small"}),r.jsx(e,{size:"md",children:"Medium"}),r.jsx(e,{size:"lg",children:"Large"})]})},s={args:{children:"Salvar",variant:"primary",iconLeft:r.jsx(M,{size:16})}},n={args:{children:"Próximo",variant:"primary",iconRight:r.jsx(V,{size:16})}},o={render:()=>r.jsxs("div",{style:{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center"},children:[r.jsx(e,{variant:"primary",iconLeft:r.jsx(M,{size:16}),children:"Salvar"}),r.jsx(e,{variant:"primary",iconRight:r.jsx(V,{size:16}),children:"Próximo"}),r.jsx(e,{variant:"secondary",iconLeft:r.jsx(T,{size:16}),children:"Voltar"}),r.jsx(e,{variant:"secondary",iconLeft:r.jsx(k,{size:16}),children:"Exportar"}),r.jsx(e,{variant:"ghost",iconLeft:r.jsx(F,{size:16}),children:"Buscar"}),r.jsx(e,{variant:"destructive",iconLeft:r.jsx(G,{size:16}),children:"Excluir"})]})},c={render:()=>r.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[r.jsx(e,{iconOnly:!0,iconLeft:r.jsx(d,{size:16}),"aria-label":"Adicionar",variant:"primary",size:"sm"}),r.jsx(e,{iconOnly:!0,iconLeft:r.jsx(d,{size:18}),"aria-label":"Adicionar",variant:"primary",size:"md"}),r.jsx(e,{iconOnly:!0,iconLeft:r.jsx(d,{size:20}),"aria-label":"Adicionar",variant:"primary",size:"lg"}),r.jsx(e,{iconOnly:!0,iconLeft:r.jsx(H,{size:16}),"aria-label":"Fechar",variant:"ghost",size:"sm"}),r.jsx(e,{iconOnly:!0,iconLeft:r.jsx(G,{size:16}),"aria-label":"Excluir",variant:"destructive",size:"sm"})]})},l={render:()=>r.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[r.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[r.jsx(e,{variant:"primary",disabled:!0,children:"Primary"}),r.jsx(e,{variant:"secondary",disabled:!0,children:"Secondary"}),r.jsx(e,{variant:"destructive",disabled:!0,children:"Destructive"}),r.jsx(e,{variant:"ghost",disabled:!0,children:"Ghost"})]}),r.jsxs("div",{style:{display:"flex",gap:12,alignItems:"center"},children:[r.jsx(e,{variant:"primary",children:"Primary (ativo)"}),r.jsx(e,{variant:"secondary",children:"Secondary (ativo)"}),r.jsx(e,{variant:"destructive",children:"Destructive (ativo)"}),r.jsx(e,{variant:"ghost",children:"Ghost (ativo)"})]})]})};var u,m,p;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    children: 'Botão',
    variant: 'primary',
    size: 'md'
  }
}`,...(p=(m=a.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var v,y,x;t.parameters={...t.parameters,docs:{...(v=t.parameters)==null?void 0:v.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center'
  }}>\r
      <Button variant="primary">Primary</Button>\r
      <Button variant="secondary">Secondary</Button>\r
      <Button variant="destructive">Destructive</Button>\r
      <Button variant="ghost">Ghost</Button>\r
    </div>
}`,...(x=(y=t.parameters)==null?void 0:y.docs)==null?void 0:x.source}}};var h,g,f;i.parameters={...i.parameters,docs:{...(h=i.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  }}>\r
      <Button size="sm">Small</Button>\r
      <Button size="md">Medium</Button>\r
      <Button size="lg">Large</Button>\r
    </div>
}`,...(f=(g=i.parameters)==null?void 0:g.docs)==null?void 0:f.source}}};var B,j,z;s.parameters={...s.parameters,docs:{...(B=s.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    children: 'Salvar',
    variant: 'primary',
    iconLeft: <Save size={16} />
  }
}`,...(z=(j=s.parameters)==null?void 0:j.docs)==null?void 0:z.source}}};var S,L,b;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    children: 'Próximo',
    variant: 'primary',
    iconRight: <ArrowRight size={16} />
  }
}`,...(b=(L=n.parameters)==null?void 0:L.docs)==null?void 0:b.source}}};var I,D,P;o.parameters={...o.parameters,docs:{...(I=o.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    alignItems: 'center'
  }}>\r
      <Button variant="primary" iconLeft={<Save size={16} />}>Salvar</Button>\r
      <Button variant="primary" iconRight={<ArrowRight size={16} />}>Próximo</Button>\r
      <Button variant="secondary" iconLeft={<ArrowLeft size={16} />}>Voltar</Button>\r
      <Button variant="secondary" iconLeft={<Download size={16} />}>Exportar</Button>\r
      <Button variant="ghost" iconLeft={<Search size={16} />}>Buscar</Button>\r
      <Button variant="destructive" iconLeft={<Trash size={16} />}>Excluir</Button>\r
    </div>
}`,...(P=(D=o.parameters)==null?void 0:D.docs)==null?void 0:P.source}}};var A,w,O;c.parameters={...c.parameters,docs:{...(A=c.parameters)==null?void 0:A.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  }}>\r
      <Button iconOnly iconLeft={<Plus size={16} />} aria-label="Adicionar" variant="primary" size="sm" />\r
      <Button iconOnly iconLeft={<Plus size={18} />} aria-label="Adicionar" variant="primary" size="md" />\r
      <Button iconOnly iconLeft={<Plus size={20} />} aria-label="Adicionar" variant="primary" size="lg" />\r
      <Button iconOnly iconLeft={<X size={16} />} aria-label="Fechar" variant="ghost" size="sm" />\r
      <Button iconOnly iconLeft={<Trash size={16} />} aria-label="Excluir" variant="destructive" size="sm" />\r
    </div>
}`,...(O=(w=c.parameters)==null?void 0:w.docs)==null?void 0:O.source}}};var R,E,W;l.parameters={...l.parameters,docs:{...(R=l.parameters)==null?void 0:R.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 16
  }}>\r
      <div style={{
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }}>\r
        <Button variant="primary" disabled>Primary</Button>\r
        <Button variant="secondary" disabled>Secondary</Button>\r
        <Button variant="destructive" disabled>Destructive</Button>\r
        <Button variant="ghost" disabled>Ghost</Button>\r
      </div>\r
      <div style={{
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }}>\r
        <Button variant="primary">Primary (ativo)</Button>\r
        <Button variant="secondary">Secondary (ativo)</Button>\r
        <Button variant="destructive">Destructive (ativo)</Button>\r
        <Button variant="ghost">Ghost (ativo)</Button>\r
      </div>\r
    </div>
}`,...(W=(E=l.parameters)==null?void 0:E.docs)==null?void 0:W.source}}};const U=["Default","AllVariants","Sizes","WithIconLeft","WithIconRight","IconsShowcase","IconOnly","Disabled"];export{t as AllVariants,a as Default,l as Disabled,c as IconOnly,o as IconsShowcase,i as Sizes,s as WithIconLeft,n as WithIconRight,U as __namedExportsOrder,Q as default};

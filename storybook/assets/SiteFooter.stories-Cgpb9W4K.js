import{j as e}from"./jsx-runtime-DiklIkkE.js";import"./index-DRjF_FHU.js";const _="_footer_mjl83_8",N="_inner_mjl83_21",y="_columns_mjl83_29",T="_brand_mjl83_38",S="_logoLink_mjl83_44",B="_social_mjl83_57",F="_phoneBlock_mjl83_88",P="_phoneLabel_mjl83_102",I="_phoneNumber_mjl83_111",C="_col_mjl83_29",D="_colTitle_mjl83_134",q="_navList_mjl83_143",w="_legalLinks_mjl83_170",V="_legalBtn_mjl83_177",$="_bottom_mjl83_199",A="_copy_mjl83_204",o={footer:_,inner:N,columns:y,brand:T,logoLink:S,social:B,phoneBlock:F,phoneLabel:P,phoneNumber:I,col:C,colTitle:D,navList:q,legalLinks:w,legalBtn:V,bottom:$,copy:A};function v({logoSrc:j,logoAlt:r="Nivelo",socialLinks:i=[],phoneBlocks:x=[],navLinks:t=[],legalLinks:c=[],copyright:L="© 2026 Nivelo"}){return e.jsx("footer",{className:o.footer,role:"contentinfo",children:e.jsxs("div",{className:o.inner,children:[e.jsxs("div",{className:o.columns,children:[e.jsxs("div",{className:o.brand,children:[e.jsx("a",{href:"#",className:o.logoLink,"aria-label":`${r} — página inicial`,children:e.jsx("img",{src:j,alt:r})}),i.length>0&&e.jsx("div",{className:o.social,"aria-label":`Redes sociais da ${r}`,children:i.map(a=>e.jsx("a",{href:a.href,"aria-label":a.label,rel:"noopener noreferrer",target:"_blank",children:a.icon},a.label))}),x.map(a=>e.jsxs("div",{className:o.phoneBlock,children:[e.jsx("p",{className:`${o.phoneLabel} text-10-regular`,children:a.label}),e.jsx("a",{href:`tel:${a.phone}`,className:`${o.phoneNumber} text-subtitle-l`,children:a.phoneDisplay})]},a.label))]}),t.length>0&&e.jsxs("div",{className:o.col,children:[e.jsx("p",{className:`${o.colTitle} text-10-medium`,"aria-hidden":"true",children:"Navegação"}),e.jsx("nav",{"aria-label":"Links do rodapé",children:e.jsx("ul",{className:o.navList,children:t.map(a=>e.jsx("li",{children:e.jsx("a",{href:a.href,className:"text-16-regular",children:a.label})},a.href))})})]}),c.length>0&&e.jsxs("div",{className:o.col,children:[e.jsx("p",{className:`${o.colTitle} text-10-medium`,"aria-hidden":"true",children:"Legal"}),e.jsx("div",{className:o.legalLinks,children:c.map(a=>e.jsx("button",{type:"button",className:`${o.legalBtn} text-16-regular`,onClick:a.onClick,children:a.label},a.label))})]})]}),e.jsx("div",{className:o.bottom,children:e.jsx("p",{className:`${o.copy} text-body-xs`,children:L})})]})})}v.__docgenInfo={description:"",methods:[],displayName:"SiteFooter",props:{logoSrc:{required:!0,tsType:{name:"string"},description:"Logo exibida no rodapé (versão branca recomendada)"},logoAlt:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Nivelo'",computed:!1}},socialLinks:{required:!1,tsType:{name:"Array",elements:[{name:"FooterSocialLink"}],raw:"FooterSocialLink[]"},description:"Links de redes sociais",defaultValue:{value:"[]",computed:!1}},phoneBlocks:{required:!1,tsType:{name:"Array",elements:[{name:"FooterPhoneBlock"}],raw:"FooterPhoneBlock[]"},description:"Blocos de telefone (Vendas, Suporte etc.) — 0, 1 ou mais",defaultValue:{value:"[]",computed:!1}},navLinks:{required:!1,tsType:{name:"Array",elements:[{name:"FooterNavLink"}],raw:"FooterNavLink[]"},description:"Links da coluna Navegação",defaultValue:{value:"[]",computed:!1}},legalLinks:{required:!1,tsType:{name:"Array",elements:[{name:"FooterLegalLink"}],raw:"FooterLegalLink[]"},description:"Links legais da coluna Legal (Termos, Privacidade, LGPD)",defaultValue:{value:"[]",computed:!1}},copyright:{required:!1,tsType:{name:"string"},description:"Texto de copyright",defaultValue:{value:"'© 2026 Nivelo'",computed:!1}}}};const G=()=>e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("rect",{x:"2",y:"2",width:"20",height:"20",rx:"5",ry:"5"}),e.jsx("path",{d:"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"}),e.jsx("line",{x1:"17.5",y1:"6.5",x2:"17.51",y2:"6.5"})]}),E=()=>e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:e.jsx("path",{d:"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"})}),M=()=>e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:e.jsx("path",{d:"M9 12a4 4 0 1 0 4 4V4a6 6 0 0 0 6 6"})}),R=()=>e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("path",{d:"M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"}),e.jsx("path",{d:"m10 15 5-3-5-3z"})]}),z={title:"Landing/SiteFooter",component:v,parameters:{layout:"fullscreen"}},n={args:{logoSrc:"/NIVELO branco header.svg",logoAlt:"Nivelo",socialLinks:[{label:"Instagram da Nivelo",href:"#",icon:e.jsx(G,{})},{label:"Facebook da Nivelo",href:"#",icon:e.jsx(E,{})},{label:"TikTok da Nivelo",href:"#",icon:e.jsx(M,{})},{label:"YouTube da Nivelo",href:"#",icon:e.jsx(R,{})}],phoneBlocks:[{label:"Vendas",phone:"+5511999999999",phoneDisplay:"(11) 99999-9999"},{label:"Suporte",phone:"+5511988888888",phoneDisplay:"(11) 98888-8888"}],navLinks:[{label:"Funcionalidades",href:"#funcionalidades"},{label:"Planos",href:"#planos"},{label:"Quem Somos",href:"#quem-somos"},{label:"Perguntas Frequentes",href:"#faq"},{label:"Contato",href:"#contato"}],legalLinks:[{label:"Termos de Uso",onClick:()=>alert("Termos")},{label:"Politica de Privacidade",onClick:()=>alert("Privacidade")},{label:"LGPD",onClick:()=>alert("LGPD")}],copyright:"© 2026 Nivelo"}},l={name:"Sem redes sociais",args:{...n.args,socialLinks:[]}},s={name:"Sem telefone",args:{...n.args,phoneBlocks:[]}};var d,m,h;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    logoSrc: '/NIVELO branco header.svg',
    logoAlt: 'Nivelo',
    socialLinks: [{
      label: 'Instagram da Nivelo',
      href: '#',
      icon: <IconInstagram />
    }, {
      label: 'Facebook da Nivelo',
      href: '#',
      icon: <IconFacebook />
    }, {
      label: 'TikTok da Nivelo',
      href: '#',
      icon: <IconTikTok />
    }, {
      label: 'YouTube da Nivelo',
      href: '#',
      icon: <IconYouTube />
    }],
    phoneBlocks: [{
      label: 'Vendas',
      phone: '+5511999999999',
      phoneDisplay: '(11) 99999-9999'
    }, {
      label: 'Suporte',
      phone: '+5511988888888',
      phoneDisplay: '(11) 98888-8888'
    }],
    navLinks: [{
      label: 'Funcionalidades',
      href: '#funcionalidades'
    }, {
      label: 'Planos',
      href: '#planos'
    }, {
      label: 'Quem Somos',
      href: '#quem-somos'
    }, {
      label: 'Perguntas Frequentes',
      href: '#faq'
    }, {
      label: 'Contato',
      href: '#contato'
    }],
    legalLinks: [{
      label: 'Termos de Uso',
      onClick: () => alert('Termos')
    }, {
      label: 'Politica de Privacidade',
      onClick: () => alert('Privacidade')
    }, {
      label: 'LGPD',
      onClick: () => alert('LGPD')
    }],
    copyright: '© 2026 Nivelo'
  }
}`,...(h=(m=n.parameters)==null?void 0:m.docs)==null?void 0:h.source}}};var u,p,g;l.parameters={...l.parameters,docs:{...(u=l.parameters)==null?void 0:u.docs,source:{originalSource:`{
  name: 'Sem redes sociais',
  args: {
    ...Default.args,
    socialLinks: []
  }
}`,...(g=(p=l.parameters)==null?void 0:p.docs)==null?void 0:g.source}}};var f,b,k;s.parameters={...s.parameters,docs:{...(f=s.parameters)==null?void 0:f.docs,source:{originalSource:`{
  name: 'Sem telefone',
  args: {
    ...Default.args,
    phoneBlocks: []
  }
}`,...(k=(b=s.parameters)==null?void 0:b.docs)==null?void 0:k.source}}};const O=["Default","SemRedes","SemTelefone"];export{n as Default,l as SemRedes,s as SemTelefone,O as __namedExportsOrder,z as default};

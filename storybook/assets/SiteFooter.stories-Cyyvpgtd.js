import{j as e}from"./jsx-runtime-DiklIkkE.js";import"./index-DRjF_FHU.js";const j="_footer_1lo1q_8",y="_inner_1lo1q_21",q="_columns_1lo1q_29",T="_brand_1lo1q_38",S="_logoLink_1lo1q_44",F="_social_1lo1q_57",I="_phoneBlock_1lo1q_88",P="_phoneLabel_1lo1q_94",C="_phoneNumber_1lo1q_103",D="_col_1lo1q_29",w="_colTitle_1lo1q_126",B="_navList_1lo1q_135",V="_legalLinks_1lo1q_162",$="_legalBtn_1lo1q_169",A="_bottom_1lo1q_191",G="_copy_1lo1q_196",o={footer:j,inner:y,columns:q,brand:T,logoLink:S,social:F,phoneBlock:I,phoneLabel:P,phoneNumber:C,col:D,colTitle:w,navList:B,legalLinks:V,legalBtn:$,bottom:A,copy:G};function _({logoSrc:k,logoAlt:r="Nivelo",socialLinks:i=[],phone:t,phoneDisplay:c,navLinks:d=[],legalLinks:h=[],copyright:N="© 2025 Nivelo. Todos os direitos reservados."}){return e.jsx("footer",{className:o.footer,role:"contentinfo",children:e.jsxs("div",{className:o.inner,children:[e.jsxs("div",{className:o.columns,children:[e.jsxs("div",{className:o.brand,children:[e.jsx("a",{href:"#",className:o.logoLink,"aria-label":`${r} — página inicial`,children:e.jsx("img",{src:k,alt:r})}),i.length>0&&e.jsx("div",{className:o.social,"aria-label":`Redes sociais da ${r}`,children:i.map(a=>e.jsx("a",{href:a.href,"aria-label":a.label,rel:"noopener noreferrer",target:"_blank",children:a.icon},a.label))}),t&&c&&e.jsxs("div",{className:o.phoneBlock,children:[e.jsx("p",{className:`${o.phoneLabel} text-10-regular`,children:"Vendas"}),e.jsx("a",{href:`tel:${t}`,className:`${o.phoneNumber} text-subtitle-l`,children:c})]})]}),d.length>0&&e.jsxs("div",{className:o.col,children:[e.jsx("p",{className:`${o.colTitle} text-10-medium`,"aria-hidden":"true",children:"Navegação"}),e.jsx("nav",{"aria-label":"Links do rodapé",children:e.jsx("ul",{className:o.navList,children:d.map(a=>e.jsx("li",{children:e.jsx("a",{href:a.href,className:"text-16-regular",children:a.label})},a.href))})})]}),h.length>0&&e.jsxs("div",{className:o.col,children:[e.jsx("p",{className:`${o.colTitle} text-10-medium`,"aria-hidden":"true",children:"Legal"}),e.jsx("div",{className:o.legalLinks,children:h.map(a=>e.jsx("button",{type:"button",className:`${o.legalBtn} text-16-regular`,onClick:a.onClick,children:a.label},a.label))})]})]}),e.jsx("div",{className:o.bottom,children:e.jsx("p",{className:`${o.copy} text-body-xs`,children:N})})]})})}_.__docgenInfo={description:"",methods:[],displayName:"SiteFooter",props:{logoSrc:{required:!0,tsType:{name:"string"},description:"Logo exibida no rodapé (versão branca recomendada)"},logoAlt:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Nivelo'",computed:!1}},socialLinks:{required:!1,tsType:{name:"Array",elements:[{name:"FooterSocialLink"}],raw:"FooterSocialLink[]"},description:"Links de redes sociais",defaultValue:{value:"[]",computed:!1}},phone:{required:!1,tsType:{name:"string"},description:'Número para href tel: (ex: "+5511999999999")'},phoneDisplay:{required:!1,tsType:{name:"string"},description:'Número formatado para exibição (ex: "(11) 99999-9999")'},navLinks:{required:!1,tsType:{name:"Array",elements:[{name:"FooterNavLink"}],raw:"FooterNavLink[]"},description:"Links da coluna Navegação",defaultValue:{value:"[]",computed:!1}},legalLinks:{required:!1,tsType:{name:"Array",elements:[{name:"FooterLegalLink"}],raw:"FooterLegalLink[]"},description:"Links legais da coluna Legal (Termos, Privacidade, LGPD)",defaultValue:{value:"[]",computed:!1}},copyright:{required:!1,tsType:{name:"string"},description:"Texto de copyright",defaultValue:{value:"'© 2025 Nivelo. Todos os direitos reservados.'",computed:!1}}}};const E=()=>e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("rect",{x:"2",y:"2",width:"20",height:"20",rx:"5",ry:"5"}),e.jsx("path",{d:"M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"}),e.jsx("line",{x1:"17.5",y1:"6.5",x2:"17.51",y2:"6.5"})]}),R=()=>e.jsx("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:e.jsx("path",{d:"M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"})}),z=()=>e.jsxs("svg",{width:"20",height:"20",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",children:[e.jsx("path",{d:"M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"}),e.jsx("rect",{x:"2",y:"9",width:"4",height:"12"}),e.jsx("circle",{cx:"4",cy:"4",r:"2"})]}),W={title:"Landing/SiteFooter",component:_,parameters:{layout:"fullscreen"}},n={args:{logoSrc:"/NIVELO branco header.svg",logoAlt:"Nivelo",socialLinks:[{label:"Instagram da Nivelo",href:"#",icon:e.jsx(E,{})},{label:"Facebook da Nivelo",href:"#",icon:e.jsx(R,{})},{label:"LinkedIn da Nivelo",href:"#",icon:e.jsx(z,{})}],phone:"+5511999999999",phoneDisplay:"(11) 99999-9999",navLinks:[{label:"Funcionalidades",href:"#funcionalidades"},{label:"Planos",href:"#planos"},{label:"Quem Somos",href:"#quem-somos"},{label:"Perguntas Frequentes",href:"#faq"},{label:"Contato",href:"#contato"}],legalLinks:[{label:"Termos de Uso",onClick:()=>alert("Termos")},{label:"Politica de Privacidade",onClick:()=>alert("Privacidade")},{label:"LGPD",onClick:()=>alert("LGPD")}],copyright:"© 2025 Nivelo. Todos os direitos reservados."}},s={name:"Sem redes sociais",args:{...n.args,socialLinks:[]}},l={name:"Sem telefone",args:{...n.args,phone:void 0,phoneDisplay:void 0}};var m,p,u;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
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
      label: 'LinkedIn da Nivelo',
      href: '#',
      icon: <IconLinkedIn />
    }],
    phone: '+5511999999999',
    phoneDisplay: '(11) 99999-9999',
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
    copyright: '© 2025 Nivelo. Todos os direitos reservados.'
  }
}`,...(u=(p=n.parameters)==null?void 0:p.docs)==null?void 0:u.source}}};var g,f,v;s.parameters={...s.parameters,docs:{...(g=s.parameters)==null?void 0:g.docs,source:{originalSource:`{
  name: 'Sem redes sociais',
  args: {
    ...Default.args,
    socialLinks: []
  }
}`,...(v=(f=s.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};var x,b,L;l.parameters={...l.parameters,docs:{...(x=l.parameters)==null?void 0:x.docs,source:{originalSource:`{
  name: 'Sem telefone',
  args: {
    ...Default.args,
    phone: undefined,
    phoneDisplay: undefined
  }
}`,...(L=(b=l.parameters)==null?void 0:b.docs)==null?void 0:L.source}}};const Q=["Default","SemRedes","SemTelefone"];export{n as Default,s as SemRedes,l as SemTelefone,Q as __namedExportsOrder,W as default};

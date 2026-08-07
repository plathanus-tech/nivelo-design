import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as n}from"./index-DRjF_FHU.js";const F="_header_1vv6c_7",W="_scrolled_1vv6c_27",T="_inner_1vv6c_34",q="_logo_1vv6c_46",V="_logoWhite_1vv6c_58",A="_logoColor_1vv6c_59",H="_links_1vv6c_66",D="_cta_1vv6c_88",I="_hamburger_1vv6c_92",P="_drawer_1vv6c_116",B="_drawerOpen_1vv6c_124",R="_drawerOverlay_1vv6c_130",$="_drawerPanel_1vv6c_141",z="_drawerClose_1vv6c_161",Q="_drawerLinks_1vv6c_178",K="_drawerCta_1vv6c_206",r={header:F,scrolled:W,inner:T,logo:q,logoWhite:V,logoColor:A,links:H,cta:D,hamburger:I,drawer:P,drawerOpen:B,drawerOverlay:R,drawerPanel:$,drawerClose:z,drawerLinks:Q,drawerCta:K};function k({logoWhiteSrc:i,logoColorSrc:j,logoAlt:d="Nivelo",navLinks:u=[],ctaLabel:m="Área do Cliente",ctaHref:v="/login"}){const[L,C]=n.useState(!1),[o,s]=n.useState(!1),S=n.useRef(null);n.useEffect(()=>{const a=()=>C(window.scrollY>80);return window.addEventListener("scroll",a,{passive:!0}),()=>window.removeEventListener("scroll",a)},[]),n.useEffect(()=>(document.body.style.overflow=o?"hidden":"",()=>{document.body.style.overflow=""}),[o]),n.useEffect(()=>{const a=O=>{O.key==="Escape"&&o&&s(!1)};return document.addEventListener("keydown",a),()=>document.removeEventListener("keydown",a)},[o]);const N=[r.header,L?r.scrolled:""].filter(Boolean).join(" "),E=[r.drawer,o?r.drawerOpen:""].filter(Boolean).join(" ");return e.jsxs(e.Fragment,{children:[e.jsx("nav",{className:N,"aria-label":"Navegação principal",children:e.jsxs("div",{className:r.inner,children:[e.jsxs("a",{href:"#inicio",className:r.logo,"aria-label":`${d}, ir para o início`,children:[e.jsx("img",{className:r.logoWhite,src:i,alt:d}),e.jsx("img",{className:r.logoColor,src:j,alt:d})]}),e.jsx("ul",{className:r.links,role:"list",children:u.map(a=>e.jsx("li",{children:e.jsx("a",{href:a.href,className:"text-16-regular",children:a.label})},a.href))}),e.jsx("a",{href:v,className:`btn primary sm ${r.cta}`,children:m}),e.jsx("button",{className:r.hamburger,"aria-label":"Abrir menu","aria-expanded":o,"aria-controls":"site-header-drawer",onClick:()=>s(!0),children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"3",y1:"6",x2:"21",y2:"6"}),e.jsx("line",{x1:"3",y1:"12",x2:"21",y2:"12"}),e.jsx("line",{x1:"3",y1:"18",x2:"21",y2:"18"})]})})]})}),e.jsxs("div",{className:E,id:"site-header-drawer",ref:S,"aria-hidden":!o,children:[e.jsx("div",{className:r.drawerOverlay,onClick:()=>s(!1)}),e.jsxs("div",{className:r.drawerPanel,role:"dialog","aria-modal":"true","aria-label":"Menu",children:[e.jsx("button",{className:r.drawerClose,"aria-label":"Fechar menu",onClick:()=>s(!1),children:e.jsxs("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:[e.jsx("line",{x1:"18",y1:"6",x2:"6",y2:"18"}),e.jsx("line",{x1:"6",y1:"6",x2:"18",y2:"18"})]})}),e.jsx("ul",{className:r.drawerLinks,role:"list",children:u.map(a=>e.jsx("li",{children:e.jsx("a",{href:a.href,className:"text-18-regular",onClick:()=>s(!1),children:a.label})},a.href))}),e.jsx("a",{href:v,className:`btn primary md ${r.drawerCta}`,onClick:()=>s(!1),children:m})]})]})]})}k.__docgenInfo={description:"",methods:[],displayName:"SiteHeader",props:{logoWhiteSrc:{required:!0,tsType:{name:"string"},description:"Logo exibida sobre o hero (fundo escuro)"},logoColorSrc:{required:!0,tsType:{name:"string"},description:"Logo exibida após scroll (fundo claro)"},logoAlt:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Nivelo'",computed:!1}},navLinks:{required:!1,tsType:{name:"Array",elements:[{name:"NavLink"}],raw:"NavLink[]"},description:"",defaultValue:{value:"[]",computed:!1}},ctaLabel:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Área do Cliente'",computed:!1}},ctaHref:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'/login'",computed:!1}}}};const J={title:"Landing/SiteHeader",component:k,parameters:{layout:"fullscreen",backgrounds:{default:"hero",values:[{name:"hero",value:"#061A40"},{name:"surface",value:"#FFFFFF"}]}},argTypes:{logoWhiteSrc:{control:"text"},logoColorSrc:{control:"text"},logoAlt:{control:"text"},ctaLabel:{control:"text"},ctaHref:{control:"text"}}},M=[{label:"Funcionalidades",href:"#funcionalidades"},{label:"Planos",href:"#planos"},{label:"Quem Somos",href:"#quem-somos"},{label:"FAQ",href:"#faq"}],l={args:{logoWhiteSrc:"/NIVELO branco header.svg",logoColorSrc:"/NIVELO azul header.svg",logoAlt:"Nivelo",navLinks:M,ctaLabel:"Área do Cliente",ctaHref:"/login"}},t={name:"Scrolled (fundo branco)",args:{...l.args},parameters:{backgrounds:{default:"surface"}},decorators:[i=>e.jsx("div",{style:{paddingTop:"64px"},children:e.jsx(i,{})})]},c={name:"Sem links de navegação",args:{...l.args,navLinks:[]}};var f,g,p;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    logoWhiteSrc: '/NIVELO branco header.svg',
    logoColorSrc: '/NIVELO azul header.svg',
    logoAlt: 'Nivelo',
    navLinks: defaultLinks,
    ctaLabel: 'Área do Cliente',
    ctaHref: '/login'
  }
}`,...(p=(g=l.parameters)==null?void 0:g.docs)==null?void 0:p.source}}};var h,x,_;t.parameters={...t.parameters,docs:{...(h=t.parameters)==null?void 0:h.docs,source:{originalSource:`{
  name: 'Scrolled (fundo branco)',
  args: {
    ...Default.args
  },
  parameters: {
    backgrounds: {
      default: 'surface'
    }
  },
  decorators: [Story => <div style={{
    paddingTop: '64px'
  }}>\r
        {/* Força o estado scrolled via classe direta para preview estático */}\r
        <Story />\r
      </div>]
}`,...(_=(x=t.parameters)==null?void 0:x.docs)==null?void 0:_.source}}};var w,y,b;c.parameters={...c.parameters,docs:{...(w=c.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'Sem links de navegação',
  args: {
    ...Default.args,
    navLinks: []
  }
}`,...(b=(y=c.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};const U=["Default","Scrolled","SemLinks"];export{l as Default,t as Scrolled,c as SemLinks,U as __namedExportsOrder,J as default};

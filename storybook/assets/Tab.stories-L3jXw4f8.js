import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as I}from"./index-DRjF_FHU.js";const w="_wrapper_3obe7_1",A="_list_3obe7_14",C="_tab_3obe7_3",E="_active_3obe7_59",N="_panel_3obe7_29",a={wrapper:w,list:A,tab:C,active:E,panel:N};function g({tabs:n,defaultIndex:h=0,onChange:i}){var d;const[s,y]=I.useState(h),T=o=>{y(o),i==null||i(o)};return e.jsxs("div",{className:a.wrapper,children:[e.jsx("div",{className:a.list,role:"tablist",children:n.map((o,t)=>e.jsx("button",{role:"tab","aria-selected":s===t,"aria-controls":`tabpanel-${t}`,className:[a.tab,"text-subtitle-m",s===t?a.active:""].filter(Boolean).join(" "),onClick:()=>T(t),children:o.label},t))}),e.jsx("div",{id:`tabpanel-${s}`,role:"tabpanel",className:`${a.panel} text-body-m`,children:(d=n[s])==null?void 0:d.content})]})}g.__docgenInfo={description:"",methods:[],displayName:"Tab",props:{tabs:{required:!0,tsType:{name:"Array",elements:[{name:"TabItem"}],raw:"TabItem[]"},description:""},defaultIndex:{required:!1,tsType:{name:"number"},description:"",defaultValue:{value:"0",computed:!1}},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(index: number) => void",signature:{arguments:[{type:{name:"number"},name:"index"}],return:{name:"void"}}},description:""}}};const S=[{label:"Visão geral",content:e.jsx("p",{children:"Conteúdo da aba Visão geral. Aqui ficam as informações gerais do produto."})},{label:"Especificações",content:e.jsx("p",{children:"Conteúdo das Especificações técnicas detalhadas do produto."})},{label:"Avaliações",content:e.jsx("p",{children:"Conteúdo das Avaliações de clientes sobre este produto."})}],V={title:"Components/Tab",component:g,tags:["autodocs"],decorators:[n=>e.jsx("div",{style:{width:480},children:e.jsx(n,{})})]},r={args:{tabs:S}},c={args:{tabs:S,defaultIndex:1}},l={args:{tabs:[{label:"Início",content:e.jsx("p",{children:"Início"})},{label:"Produtos",content:e.jsx("p",{children:"Produtos"})},{label:"Serviços",content:e.jsx("p",{children:"Serviços"})},{label:"Sobre",content:e.jsx("p",{children:"Sobre nós"})},{label:"Contato",content:e.jsx("p",{children:"Contato"})}]}};var p,b,m;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    tabs
  }
}`,...(m=(b=r.parameters)==null?void 0:b.docs)==null?void 0:m.source}}};var u,x,v;c.parameters={...c.parameters,docs:{...(u=c.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    tabs,
    defaultIndex: 1
  }
}`,...(v=(x=c.parameters)==null?void 0:x.docs)==null?void 0:v.source}}};var f,_,j;l.parameters={...l.parameters,docs:{...(f=l.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    tabs: [{
      label: 'Início',
      content: <p>Início</p>
    }, {
      label: 'Produtos',
      content: <p>Produtos</p>
    }, {
      label: 'Serviços',
      content: <p>Serviços</p>
    }, {
      label: 'Sobre',
      content: <p>Sobre nós</p>
    }, {
      label: 'Contato',
      content: <p>Contato</p>
    }]
  }
}`,...(j=(_=l.parameters)==null?void 0:_.docs)==null?void 0:j.source}}};const $=["Default","SecondTabActive","ManyTabs"];export{r as Default,l as ManyTabs,c as SecondTabActive,$ as __namedExportsOrder,V as default};

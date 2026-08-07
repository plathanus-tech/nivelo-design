import{j as t}from"./jsx-runtime-DiklIkkE.js";import{r as T}from"./index-DRjF_FHU.js";const A="_chip_1vt25_1",y="_selected_1vt25_23",E="_row_1vt25_40",d={chip:A,selected:y,row:E};function i({selected:r=!1,className:s,children:e,...S}){const j=[d.chip,r?d.selected:"",s??""].filter(Boolean).join(" ");return t.jsx("button",{type:"button",className:j,"aria-pressed":r,...S,children:e})}function l({children:r,className:s}){return t.jsx("div",{className:[d.row,s??""].filter(Boolean).join(" "),children:r})}i.__docgenInfo={description:"Pílula de seleção única/filtro (ex.: categorias do Canal de Ideias) — não confundir com\n`.badge` de Table.module.css, que é um rótulo de leitura (não clicável, não tem estado\nselecionado). `Chip` é sempre um `<button>`, pensado pra uma fileira com rolagem horizontal\nno mobile (ver `.row` abaixo).",methods:[],displayName:"Chip",props:{selected:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}},composes:["ButtonHTMLAttributes"]};l.__docgenInfo={description:"Wrapper de fileira — `overflow-x:auto` sem scrollbar visível, mesma técnica já usada em\n`Tab.module.css`'s `.list`.",methods:[],displayName:"ChipRow",props:{children:{required:!0,tsType:{name:"ReactNode"},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};const k={title:"Components/Chip",component:i,tags:["autodocs"]},o={args:{children:"Financeiro",selected:!1}},a={args:{children:"Financeiro",selected:!0}},b=["Todas","Financeiro","Estoque","Caderno de campo","Relatórios","Assistente de IA","Outros"],n={render:()=>{const[r,s]=T.useState("Todas");return t.jsx(l,{children:b.map(e=>t.jsx(i,{selected:r===e,onClick:()=>s(e),children:e},e))})}},c={render:()=>{const[r,s]=T.useState("Todas");return t.jsx("div",{style:{width:320,border:"1px dashed #ccc",padding:8},children:t.jsx(l,{children:b.map(e=>t.jsx(i,{selected:r===e,onClick:()=>s(e),children:e},e))})})}};var p,u,m;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    children: 'Financeiro',
    selected: false
  }
}`,...(m=(u=o.parameters)==null?void 0:u.docs)==null?void 0:m.source}}};var h,v,C;a.parameters={...a.parameters,docs:{...(h=a.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    children: 'Financeiro',
    selected: true
  }
}`,...(C=(v=a.parameters)==null?void 0:v.docs)==null?void 0:C.source}}};var f,w,g;n.parameters={...n.parameters,docs:{...(f=n.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => {
    const [active, setActive] = useState('Todas');
    return <ChipRow>\r
        {CATEGORIES.map(c => <Chip key={c} selected={active === c} onClick={() => setActive(c)}>\r
            {c}\r
          </Chip>)}\r
      </ChipRow>;
  }
}`,...(g=(w=n.parameters)==null?void 0:w.docs)==null?void 0:g.source}}};var x,_,R;c.parameters={...c.parameters,docs:{...(x=c.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => {
    const [active, setActive] = useState('Todas');
    return <div style={{
      width: 320,
      border: '1px dashed #ccc',
      padding: 8
    }}>\r
        <ChipRow>\r
          {CATEGORIES.map(c => <Chip key={c} selected={active === c} onClick={() => setActive(c)}>\r
              {c}\r
            </Chip>)}\r
        </ChipRow>\r
      </div>;
  }
}`,...(R=(_=c.parameters)==null?void 0:_.docs)==null?void 0:R.source}}};const q=["Default","Selected","RowInteractive","NarrowContainer"];export{o as Default,c as NarrowContainer,n as RowInteractive,a as Selected,q as __namedExportsOrder,k as default};

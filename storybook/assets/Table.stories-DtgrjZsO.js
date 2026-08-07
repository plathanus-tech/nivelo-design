import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as x}from"./index-DRjF_FHU.js";import{C as W,E as F}from"./eye-phDVOU-z.js";import{C as G}from"./chevron-down-nqZkofZo.js";import{c as w}from"./createLucideIcon-B3K6bXbU.js";/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=w("ChevronsUpDown",[["path",{d:"m7 15 5 5 5-5",key:"1hf1tw"}],["path",{d:"m7 9 5-5 5 5",key:"sgt6xg"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Z=w("Ellipsis",[["circle",{cx:"12",cy:"12",r:"1",key:"41hilf"}],["circle",{cx:"19",cy:"12",r:"1",key:"1wjl8i"}],["circle",{cx:"5",cy:"12",r:"1",key:"1pcz8c"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const J=w("Pencil",[["path",{d:"M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",key:"1a8usu"}],["path",{d:"m15 5 4 4",key:"1mk7zo"}]]);/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const Q=w("Trash2",[["path",{d:"M3 6h18",key:"d0wm0j"}],["path",{d:"M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6",key:"4alrt4"}],["path",{d:"M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2",key:"v07s0e"}],["line",{x1:"10",x2:"10",y1:"11",y2:"17",key:"1uufr5"}],["line",{x1:"14",x2:"14",y1:"11",y2:"17",key:"xtxkd"}]]),X="_card_1nqav_4",Y="_cardHeader_1nqav_16",ee="_title_1nqav_23",ae="_subtitle_1nqav_23",te="_tableWrap_1nqav_48",ne="_table_1nqav_48",se="_headerRow_1nqav_62",re="_th_1nqav_23",oe="_sortable_1nqav_82",le="_thInner_1nqav_90",ie="_sortIcon_1nqav_96",ce="_tr_1nqav_106",ue="_td_1nqav_23",de="_tdActions_1nqav_132",me="_cellLink_1nqav_23",pe="_badge_1nqav_154",ge="_badgeDot_1nqav_176",ye="_avatar_1nqav_187",be="_miniToggle_1nqav_199",ke="_miniToggleInput_1nqav_206",ve="_miniTrack_1nqav_214",he="_miniThumb_1nqav_228",xe="_cellActions_1nqav_252",we="_actionBtn_1nqav_259",fe="_actionDanger_1nqav_284",_e="_stateCell_1nqav_23",Te="_loadingDot_1nqav_297",t={card:X,cardHeader:Y,title:ee,subtitle:ae,tableWrap:te,table:ne,headerRow:se,th:re,sortable:oe,thInner:le,sortIcon:ie,tr:ce,td:ue,tdActions:de,cellLink:me,badge:pe,badgeDot:ge,avatar:ye,miniToggle:be,miniToggleInput:ke,miniTrack:ve,miniThumb:he,cellActions:xe,actionBtn:we,actionDanger:fe,stateCell:_e,loadingDot:Te};function c({status:a,label:n}){return e.jsxs("span",{className:`${t.badge} text-12-regular`,"data-status":a,children:[e.jsx("span",{className:t.badgeDot}),n]})}function Se({checked:a,onChange:n}){return e.jsxs("label",{className:t.miniToggle,children:[e.jsx("input",{type:"checkbox",className:t.miniToggleInput,checked:a,onChange:s=>n==null?void 0:n(s.target.checked)}),e.jsx("span",{className:t.miniTrack,children:e.jsx("span",{className:t.miniThumb})})]})}function je(a,n){var o,u;const s=n[a.key];if(a.render)return a.render(s,n);switch(a.type){case"badge":{const r=(o=a.statusMap)==null?void 0:o[String(s)];return r?e.jsx(c,{status:r.status,label:r.label}):String(s??"")}case"link":return e.jsx("a",{href:a.getHref?a.getHref(n):"#",className:`${t.cellLink} text-12-bold`,onClick:r=>{a.onLinkClick&&(r.preventDefault(),a.onLinkClick(n))},children:String(s??"")});case"avatar":return e.jsx("img",{src:String(s??""),alt:"",className:t.avatar});case"toggle":return e.jsx(Se,{checked:!!s,onChange:r=>{var l;return(l=a.onToggle)==null?void 0:l.call(a,n,r)}});case"actions":return e.jsx("div",{className:t.cellActions,children:(u=a.actionItems)==null?void 0:u.map((r,l)=>e.jsx("button",{className:[t.actionBtn,r.danger?t.actionDanger:""].filter(Boolean).join(" "),onClick:()=>r.onClick(n),title:r.label,"aria-label":r.label,type:"button",children:r.icon},l))});default:return String(s??"")}}function p({title:a,subtitle:n,columns:s,rows:o,loading:u,emptyMessage:r="Nenhum resultado encontrado.",onSort:l,sortKey:f,sortDir:d}){return e.jsxs("div",{className:t.card,children:[(a||n)&&e.jsxs("div",{className:t.cardHeader,children:[a&&e.jsx("h2",{className:`${t.title} text-heading-6`,children:a}),n&&e.jsx("p",{className:`${t.subtitle} text-14-regular`,children:n})]}),e.jsx("div",{className:t.tableWrap,children:e.jsxs("table",{className:t.table,children:[e.jsx("thead",{children:e.jsx("tr",{className:t.headerRow,children:s.map(i=>e.jsx("th",{className:[t.th,"text-12-bold",i.sortable?t.sortable:""].filter(Boolean).join(" "),style:{width:i.width??void 0,textAlign:i.align??"left"},onClick:()=>i.sortable&&(l==null?void 0:l(i.key)),children:e.jsxs("span",{className:t.thInner,children:[i.label,i.sortable&&e.jsx("span",{className:t.sortIcon,"aria-hidden":"true",children:f===i.key?d==="asc"?e.jsx(W,{size:12}):e.jsx(G,{size:12}):e.jsx(O,{size:12})})]})},String(i.key)))})}),e.jsx("tbody",{children:u?e.jsx("tr",{children:e.jsxs("td",{colSpan:s.length,className:`${t.stateCell} text-body-m`,children:[e.jsx("span",{className:t.loadingDot}),"Carregando..."]})}):o.length===0?e.jsx("tr",{children:e.jsx("td",{colSpan:s.length,className:`${t.stateCell} text-body-m`,children:r})}):o.map((i,_)=>e.jsx("tr",{className:t.tr,children:s.map(m=>e.jsx("td",{className:[t.td,"text-12-regular",m.type==="actions"?t.tdActions:""].filter(Boolean).join(" "),style:{textAlign:m.align??"left"},children:je(m,i)},String(m.key)))},_))})]})})]})}c.__docgenInfo={description:"",methods:[],displayName:"StatusBadge",props:{status:{required:!0,tsType:{name:"union",raw:`| 'success' | 'error' | 'warning' | 'info'
| 'orange' | 'indigo' | 'violet' | 'pink'`,elements:[{name:"literal",value:"'success'"},{name:"literal",value:"'error'"},{name:"literal",value:"'warning'"},{name:"literal",value:"'info'"},{name:"literal",value:"'orange'"},{name:"literal",value:"'indigo'"},{name:"literal",value:"'violet'"},{name:"literal",value:"'pink'"}]},description:""},label:{required:!0,tsType:{name:"string"},description:""}}};p.__docgenInfo={description:"",methods:[],displayName:"Table",props:{title:{required:!1,tsType:{name:"string"},description:""},subtitle:{required:!1,tsType:{name:"string"},description:""},columns:{required:!0,tsType:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  key: keyof T;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';

  /** Custom render always takes priority over \`type\`. */
  render?: (value: unknown, row: T) => ReactNode;

  // ─── Column types ──────────────────────────────────────────────────────
  /** 'text' (default) | 'link' | 'badge' | 'avatar' | 'toggle' | 'actions' */
  type?: 'text' | 'link' | 'badge' | 'avatar' | 'toggle' | 'actions';

  /** Used with type='badge': maps cell value → { label, status } */
  statusMap?: Record<string, { label: string; status: StatusType }>;

  /** Used with type='toggle': fires when the switch is toggled */
  onToggle?: (row: T, value: boolean) => void;

  /** Used with type='actions': list of icon-buttons shown in the cell */
  actionItems?: ActionItem<T>[];

  /** Used with type='link': builds the href from the row data */
  getHref?: (row: T) => string;

  /** Used with type='link': fires on click (prevents default when provided) */
  onLinkClick?: (row: T) => void;
}`,signature:{properties:[{key:"key",value:{name:"T",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"sortable",value:{name:"boolean",required:!1}},{key:"width",value:{name:"union",raw:"string | number",elements:[{name:"string"},{name:"number"}],required:!1}},{key:"align",value:{name:"union",raw:"'left' | 'center' | 'right'",elements:[{name:"literal",value:"'left'"},{name:"literal",value:"'center'"},{name:"literal",value:"'right'"}],required:!1}},{key:"render",value:{name:"signature",type:"function",raw:"(value: unknown, row: T) => ReactNode",signature:{arguments:[{type:{name:"unknown"},name:"value"},{type:{name:"T"},name:"row"}],return:{name:"ReactNode"}},required:!1},description:"Custom render always takes priority over `type`."},{key:"type",value:{name:"union",raw:"'text' | 'link' | 'badge' | 'avatar' | 'toggle' | 'actions'",elements:[{name:"literal",value:"'text'"},{name:"literal",value:"'link'"},{name:"literal",value:"'badge'"},{name:"literal",value:"'avatar'"},{name:"literal",value:"'toggle'"},{name:"literal",value:"'actions'"}],required:!1},description:"'text' (default) | 'link' | 'badge' | 'avatar' | 'toggle' | 'actions'"},{key:"statusMap",value:{name:"Record",elements:[{name:"string"},{name:"signature",type:"object",raw:"{ label: string; status: StatusType }",signature:{properties:[{key:"label",value:{name:"string",required:!0}},{key:"status",value:{name:"union",raw:`| 'success' | 'error' | 'warning' | 'info'
| 'orange' | 'indigo' | 'violet' | 'pink'`,elements:[{name:"literal",value:"'success'"},{name:"literal",value:"'error'"},{name:"literal",value:"'warning'"},{name:"literal",value:"'info'"},{name:"literal",value:"'orange'"},{name:"literal",value:"'indigo'"},{name:"literal",value:"'violet'"},{name:"literal",value:"'pink'"}],required:!0}}]}}],raw:"Record<string, { label: string; status: StatusType }>",required:!1},description:"Used with type='badge': maps cell value → { label, status }"},{key:"onToggle",value:{name:"signature",type:"function",raw:"(row: T, value: boolean) => void",signature:{arguments:[{type:{name:"T"},name:"row"},{type:{name:"boolean"},name:"value"}],return:{name:"void"}},required:!1},description:"Used with type='toggle': fires when the switch is toggled"},{key:"actionItems",value:{name:"Array",elements:[{name:"signature",type:"object",raw:`{
  icon: ReactNode;
  label: string;
  onClick: (row: T) => void;
  danger?: boolean;
}`,signature:{properties:[{key:"icon",value:{name:"ReactNode",required:!0}},{key:"label",value:{name:"string",required:!0}},{key:"onClick",value:{name:"signature",type:"function",raw:"(row: T) => void",signature:{arguments:[{type:{name:"T"},name:"row"}],return:{name:"void"}},required:!0}},{key:"danger",value:{name:"boolean",required:!1}}]}}],raw:"ActionItem<T>[]",required:!1},description:"Used with type='actions': list of icon-buttons shown in the cell"},{key:"getHref",value:{name:"signature",type:"function",raw:"(row: T) => string",signature:{arguments:[{type:{name:"T"},name:"row"}],return:{name:"string"}},required:!1},description:"Used with type='link': builds the href from the row data"},{key:"onLinkClick",value:{name:"signature",type:"function",raw:"(row: T) => void",signature:{arguments:[{type:{name:"T"},name:"row"}],return:{name:"void"}},required:!1},description:"Used with type='link': fires on click (prevents default when provided)"}]}}],raw:"TableColumn<T>[]"},description:""},rows:{required:!0,tsType:{name:"Array",elements:[{name:"T"}],raw:"T[]"},description:""},loading:{required:!1,tsType:{name:"boolean"},description:""},emptyMessage:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Nenhum resultado encontrado.'",computed:!1}},onSort:{required:!1,tsType:{name:"signature",type:"function",raw:"(key: keyof T) => void",signature:{arguments:[{type:{name:"T"},name:"key"}],return:{name:"void"}}},description:""},sortKey:{required:!1,tsType:{name:"T"},description:""},sortDir:{required:!1,tsType:{name:"union",raw:"'asc' | 'desc'",elements:[{name:"literal",value:"'asc'"},{name:"literal",value:"'desc'"}]},description:""}}};const T=[{avatar:"https://api.dicebear.com/7.x/shapes/svg?seed=1",name:"Produto Alpha",category:"Eletrônicos",price:"R$ 299,00",stock:"42",status:"active",featured:!0,active:!0,link:"Ver detalhes"},{avatar:"https://api.dicebear.com/7.x/shapes/svg?seed=2",name:"Produto Beta",category:"Vestuário",price:"R$ 89,90",stock:"7",status:"warning",featured:!1,active:!1,link:"Ver detalhes"},{avatar:"https://api.dicebear.com/7.x/shapes/svg?seed=3",name:"Produto Gamma",category:"Alimentos",price:"R$ 12,50",stock:"150",status:"active",featured:!0,active:!0,link:"Ver detalhes"},{avatar:"https://api.dicebear.com/7.x/shapes/svg?seed=4",name:"Produto Delta",category:"Livros",price:"R$ 49,00",stock:"0",status:"inactive",featured:!1,active:!1,link:"Ver detalhes"},{avatar:"https://api.dicebear.com/7.x/shapes/svg?seed=5",name:"Produto Epsilon",category:"Eletrônicos",price:"R$ 1.299,00",stock:"5",status:"active",featured:!0,active:!0,link:"Ver detalhes"},{avatar:"https://api.dicebear.com/7.x/shapes/svg?seed=6",name:"Produto Zeta",category:"Saúde",price:"R$ 35,00",stock:"88",status:"warning",featured:!1,active:!0,link:"Ver detalhes"}],S={active:{label:"Ativo",status:"success"},inactive:{label:"Inativo",status:"error"},warning:{label:"Pendente",status:"warning"}},Ae={title:"Components/Table",component:p,tags:["autodocs"],decorators:[a=>e.jsx("div",{style:{padding:32},children:e.jsx(a,{})})]},g={render:()=>{const[a,n]=x.useState(T),s=[{key:"avatar",label:"Foto",type:"avatar",width:60},{key:"name",label:"Produto",type:"text"},{key:"category",label:"Categoria",type:"text"},{key:"price",label:"Preço",type:"text"},{key:"status",label:"Status",type:"badge",statusMap:S},{key:"active",label:"Ativo",type:"toggle",width:80,onToggle:(o,u)=>n(r=>r.map(l=>l.name===o.name?{...l,active:u}:l))},{key:"name",label:"Ação",type:"actions",width:120,actionItems:[{icon:e.jsx(F,{size:16}),label:"Visualizar",onClick:o=>alert(`Ver: ${o.name}`)},{icon:e.jsx(J,{size:16}),label:"Editar",onClick:o=>alert(`Editar: ${o.name}`)},{icon:e.jsx(Q,{size:16}),label:"Excluir",onClick:o=>alert(`Excluir: ${o.name}`),danger:!0}]}];return e.jsx(p,{title:"Produtos",subtitle:`Mostrando ${a.length} de ${a.length} produtos`,columns:s,rows:a})}},y={render:()=>{const[a,n]=x.useState(T),[s,o]=x.useState(),[u,r]=x.useState("asc"),l=d=>{const i=s===d&&u==="asc"?"desc":"asc";o(d),r(i),n(_=>[..._].sort((m,j)=>i==="asc"?String(m[d]).localeCompare(String(j[d])):String(j[d]).localeCompare(String(m[d]))))},f=[{key:"name",label:"Produto",sortable:!0},{key:"category",label:"Categoria",sortable:!0},{key:"price",label:"Preço",sortable:!0},{key:"stock",label:"Estoque",sortable:!0,align:"right"},{key:"status",label:"Status",type:"badge",statusMap:S}];return e.jsx(p,{title:"Produtos",subtitle:"Clique no cabeçalho para ordenar",columns:f,rows:a,onSort:l,sortKey:s,sortDir:u})}},b={render:()=>{const a=[{key:"name",label:"Produto",type:"text"},{key:"category",label:"Categoria",type:"text"},{key:"link",label:"Link",type:"link",onLinkClick:n=>alert(`Navegando para: ${n.name}`)},{key:"status",label:"Status",type:"badge",statusMap:S},{key:"name",label:"Ação",type:"actions",width:80,actionItems:[{icon:e.jsx(Z,{size:16}),label:"Mais opções",onClick:n=>alert(n.name)}]}];return e.jsx(p,{title:"Produtos",columns:a,rows:T})}},k={render:()=>{const a=[{key:"name",label:"Produto"},{key:"category",label:"Categoria"},{key:"price",label:"Preço"},{key:"status",label:"Status"}];return e.jsx(p,{title:"Produtos",columns:a,rows:[],loading:!0})}},v={render:()=>{const a=[{key:"name",label:"Produto"},{key:"category",label:"Categoria"},{key:"price",label:"Preço"},{key:"status",label:"Status"}];return e.jsx(p,{title:"Produtos",subtitle:"Nenhum produto cadastrado ainda",columns:a,rows:[],emptyMessage:"Nenhum produto encontrado. Adicione o primeiro!"})}},h={render:()=>e.jsxs("div",{style:{display:"flex",flexWrap:"wrap",gap:8,padding:16},children:[e.jsx(c,{status:"success",label:"Ativo"}),e.jsx(c,{status:"error",label:"Inativo"}),e.jsx(c,{status:"warning",label:"Pendente"}),e.jsx(c,{status:"info",label:"Info"}),e.jsx(c,{status:"orange",label:"Em análise"}),e.jsx(c,{status:"indigo",label:"Agendado"}),e.jsx(c,{status:"violet",label:"Rascunho"}),e.jsx(c,{status:"pink",label:"Especial"})]})};var q,C,P;g.parameters={...g.parameters,docs:{...(q=g.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => {
    const [data, setData] = useState(rows);
    const columns = [
    // Avatar
    {
      key: 'avatar' as const,
      label: 'Foto',
      type: 'avatar' as const,
      width: 60
    },
    // Text
    {
      key: 'name' as const,
      label: 'Produto',
      type: 'text' as const
    }, {
      key: 'category' as const,
      label: 'Categoria',
      type: 'text' as const
    }, {
      key: 'price' as const,
      label: 'Preço',
      type: 'text' as const
    },
    // Badge
    {
      key: 'status' as const,
      label: 'Status',
      type: 'badge' as const,
      statusMap
    },
    // Toggle — "Ativo"
    {
      key: 'active' as const,
      label: 'Ativo',
      type: 'toggle' as const,
      width: 80,
      onToggle: (row: Product, value: boolean) => setData(d => d.map(r => r.name === row.name ? {
        ...r,
        active: value
      } : r))
    },
    // Actions
    {
      key: 'name' as const,
      label: 'Ação',
      type: 'actions' as const,
      width: 120,
      actionItems: [{
        icon: <Eye size={16} />,
        label: 'Visualizar',
        onClick: (r: Product) => alert(\`Ver: \${r.name}\`)
      }, {
        icon: <Pencil size={16} />,
        label: 'Editar',
        onClick: (r: Product) => alert(\`Editar: \${r.name}\`)
      }, {
        icon: <Trash2 size={16} />,
        label: 'Excluir',
        onClick: (r: Product) => alert(\`Excluir: \${r.name}\`),
        danger: true
      }]
    }];
    return <Table title="Produtos" subtitle={\`Mostrando \${data.length} de \${data.length} produtos\`} columns={columns} rows={data} />;
  }
}`,...(P=(C=g.parameters)==null?void 0:C.docs)==null?void 0:P.source}}};var N,D,A;y.parameters={...y.parameters,docs:{...(N=y.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => {
    const [data, setData] = useState(rows);
    const [sortKey, setSortKey] = useState<keyof Product | undefined>();
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const handleSort = (key: keyof Product) => {
      const dir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
      setSortKey(key);
      setSortDir(dir);
      setData(d => [...d].sort((a, b) => dir === 'asc' ? String(a[key]).localeCompare(String(b[key])) : String(b[key]).localeCompare(String(a[key]))));
    };
    const columns = [{
      key: 'name' as const,
      label: 'Produto',
      sortable: true
    }, {
      key: 'category' as const,
      label: 'Categoria',
      sortable: true
    }, {
      key: 'price' as const,
      label: 'Preço',
      sortable: true
    }, {
      key: 'stock' as const,
      label: 'Estoque',
      sortable: true,
      align: 'right' as const
    }, {
      key: 'status' as const,
      label: 'Status',
      type: 'badge' as const,
      statusMap
    }];
    return <Table title="Produtos" subtitle="Clique no cabeçalho para ordenar" columns={columns} rows={data} onSort={handleSort} sortKey={sortKey} sortDir={sortDir} />;
  }
}`,...(A=(D=y.parameters)==null?void 0:D.docs)==null?void 0:A.source}}};var I,E,$;b.parameters={...b.parameters,docs:{...(I=b.parameters)==null?void 0:I.docs,source:{originalSource:`{
  render: () => {
    const columns = [{
      key: 'name' as const,
      label: 'Produto',
      type: 'text' as const
    }, {
      key: 'category' as const,
      label: 'Categoria',
      type: 'text' as const
    }, {
      key: 'link' as const,
      label: 'Link',
      type: 'link' as const,
      onLinkClick: (r: Product) => alert(\`Navegando para: \${r.name}\`)
    }, {
      key: 'status' as const,
      label: 'Status',
      type: 'badge' as const,
      statusMap
    }, {
      key: 'name' as const,
      label: 'Ação',
      type: 'actions' as const,
      width: 80,
      actionItems: [{
        icon: <MoreHorizontal size={16} />,
        label: 'Mais opções',
        onClick: (r: Product) => alert(r.name)
      }]
    }];
    return <Table title="Produtos" columns={columns} rows={rows} />;
  }
}`,...($=(E=b.parameters)==null?void 0:E.docs)==null?void 0:$.source}}};var B,R,M;k.parameters={...k.parameters,docs:{...(B=k.parameters)==null?void 0:B.docs,source:{originalSource:`{
  render: () => {
    const columns = [{
      key: 'name' as const,
      label: 'Produto'
    }, {
      key: 'category' as const,
      label: 'Categoria'
    }, {
      key: 'price' as const,
      label: 'Preço'
    }, {
      key: 'status' as const,
      label: 'Status'
    }];
    return <Table title="Produtos" columns={columns} rows={[]} loading />;
  }
}`,...(M=(R=k.parameters)==null?void 0:R.docs)==null?void 0:M.source}}};var L,z,V;v.parameters={...v.parameters,docs:{...(L=v.parameters)==null?void 0:L.docs,source:{originalSource:`{
  render: () => {
    const columns = [{
      key: 'name' as const,
      label: 'Produto'
    }, {
      key: 'category' as const,
      label: 'Categoria'
    }, {
      key: 'price' as const,
      label: 'Preço'
    }, {
      key: 'status' as const,
      label: 'Status'
    }];
    return <Table title="Produtos" subtitle="Nenhum produto cadastrado ainda" columns={columns} rows={[]} emptyMessage="Nenhum produto encontrado. Adicione o primeiro!" />;
  }
}`,...(V=(z=v.parameters)==null?void 0:z.docs)==null?void 0:V.source}}};var U,H,K;h.parameters={...h.parameters,docs:{...(U=h.parameters)==null?void 0:U.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    padding: 16
  }}>\r
      <StatusBadge status="success" label="Ativo" />\r
      <StatusBadge status="error" label="Inativo" />\r
      <StatusBadge status="warning" label="Pendente" />\r
      <StatusBadge status="info" label="Info" />\r
      <StatusBadge status="orange" label="Em análise" />\r
      <StatusBadge status="indigo" label="Agendado" />\r
      <StatusBadge status="violet" label="Rascunho" />\r
      <StatusBadge status="pink" label="Especial" />\r
    </div>
}`,...(K=(H=h.parameters)==null?void 0:H.docs)==null?void 0:K.source}}};const Ie=["Default","Sortable","WithLinks","Loading","Empty","Badges"];export{h as Badges,g as Default,v as Empty,k as Loading,y as Sortable,b as WithLinks,Ie as __namedExportsOrder,Ae as default};

import{j as e}from"./jsx-runtime-DiklIkkE.js";import{r as a}from"./index-DRjF_FHU.js";import{c as k}from"./createLucideIcon-B3K6bXbU.js";import{D as h}from"./Dropdown-C1liUEal.js";import"./chevron-down-nqZkofZo.js";import"./circle-x-BPPbbaoK.js";/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A=k("SlidersHorizontal",[["line",{x1:"21",x2:"14",y1:"4",y2:"4",key:"obuewd"}],["line",{x1:"10",x2:"3",y1:"4",y2:"4",key:"1q6298"}],["line",{x1:"21",x2:"12",y1:"12",y2:"12",key:"1iu8h1"}],["line",{x1:"8",x2:"3",y1:"12",y2:"12",key:"ntss68"}],["line",{x1:"21",x2:"16",y1:"20",y2:"20",key:"14d8ph"}],["line",{x1:"12",x2:"3",y1:"20",y2:"20",key:"m0wm8r"}],["line",{x1:"14",x2:"14",y1:"2",y2:"6",key:"14e1ph"}],["line",{x1:"8",x2:"8",y1:"10",y2:"14",key:"1i6ji0"}],["line",{x1:"16",x2:"16",y1:"18",y2:"22",key:"1lctlv"}]]),D="_wrapper_1455y_15",E="_trigger_1455y_20",F="_triggerIcon_1455y_45",N="_popover_1455y_51",T="_actions_1455y_79",d={wrapper:D,trigger:E,triggerIcon:F,popover:N,actions:T};function v({label:i="Filtros",fields:c,onApply:u,onClear:p}){const[r,l]=a.useState(!1),[g,_]=a.useState({left:0,top:0,width:320}),m=a.useRef(null),f=a.useRef(null);a.useEffect(()=>{if(!r)return;function s(n){var x,b;const o=n.target;(x=f.current)!=null&&x.contains(o)||(b=m.current)!=null&&b.contains(o)||l(!1)}function t(n){n.key==="Escape"&&l(!1)}return document.addEventListener("click",s),document.addEventListener("keydown",t),()=>{document.removeEventListener("click",s),document.removeEventListener("keydown",t)}},[r]);function j(){if(!r&&m.current){const s=m.current.getBoundingClientRect(),t=16,n=Math.min(320,window.innerWidth-t*2);let o=s.left;o+n>window.innerWidth-t&&(o=window.innerWidth-t-n),o<t&&(o=t),_({left:o,top:s.bottom+8,width:n})}l(s=>!s)}return e.jsxs("div",{className:d.wrapper,children:[e.jsxs("button",{type:"button",className:`${d.trigger} text-body-s`,ref:m,onClick:j,"aria-expanded":r,children:[e.jsx("span",{className:d.triggerIcon,children:e.jsx(A,{size:16})}),e.jsx("span",{children:i})]}),r&&e.jsxs("div",{className:d.popover,ref:f,style:{left:g.left,top:g.top,width:g.width},children:[c,e.jsxs("div",{className:d.actions,children:[e.jsx("button",{type:"button",className:"btn secondary sm",onClick:p,children:"Limpar"}),e.jsx("button",{type:"button",className:"btn primary sm",onClick:u,children:"Aplicar"})]})]})]})}v.__docgenInfo={description:"",methods:[],displayName:"FilterPopover",props:{label:{required:!1,tsType:{name:"string"},description:"",defaultValue:{value:"'Filtros'",computed:!1}},fields:{required:!0,tsType:{name:"ReactNode"},description:""},onApply:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""},onClear:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};const O={title:"Components/FilterPopover",component:v,tags:["autodocs"],decorators:[i=>e.jsx("div",{style:{paddingBottom:240},children:e.jsx(i,{})})]},y={render:()=>{const[i,c]=a.useState("todas"),[u,p]=a.useState("todos"),[r,l]=a.useState({situacao:"todas",destinatario:"todos"});return e.jsx(v,{label:"Filtros",fields:e.jsxs(e.Fragment,{children:[e.jsx(h,{label:"Situação",value:i,onChange:c,options:[{label:"Todas",value:"todas"},{label:"Pendente",value:"pendente"},{label:"Quitado",value:"quitado"}]}),e.jsx(h,{label:"Destinatário",value:u,onChange:p,options:[{label:"Todos",value:"todos"},{label:"Cooperativa Central",value:"Cooperativa Central"},{label:"Agroindústria Sul",value:"Agroindústria Sul"}]})]}),onApply:()=>l({situacao:i,destinatario:u}),onClear:()=>{c("todas"),p("todos"),l({situacao:"todas",destinatario:"todos"})}})}};var w,C,S;y.parameters={...y.parameters,docs:{...(w=y.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => {
    const [situacao, setSituacao] = useState('todas');
    const [destinatario, setDestinatario] = useState('todos');
    const [applied, setApplied] = useState({
      situacao: 'todas',
      destinatario: 'todos'
    });
    return <FilterPopover label="Filtros" fields={<>\r
            <Dropdown label="Situação" value={situacao} onChange={setSituacao} options={[{
        label: 'Todas',
        value: 'todas'
      }, {
        label: 'Pendente',
        value: 'pendente'
      }, {
        label: 'Quitado',
        value: 'quitado'
      }]} />\r
            <Dropdown label="Destinatário" value={destinatario} onChange={setDestinatario} options={[{
        label: 'Todos',
        value: 'todos'
      }, {
        label: 'Cooperativa Central',
        value: 'Cooperativa Central'
      }, {
        label: 'Agroindústria Sul',
        value: 'Agroindústria Sul'
      }]} />\r
          </>} onApply={() => setApplied({
      situacao,
      destinatario
    })} onClear={() => {
      setSituacao('todas');
      setDestinatario('todos');
      setApplied({
        situacao: 'todas',
        destinatario: 'todos'
      });
    }} />;
  }
}`,...(S=(C=y.parameters)==null?void 0:C.docs)==null?void 0:S.source}}};const W=["Default"];export{y as Default,W as __namedExportsOrder,O as default};

import{j as e}from"./jsx-runtime-DiklIkkE.js";import{C as V}from"./circle-x-BPPbbaoK.js";import{c as F}from"./createLucideIcon-B3K6bXbU.js";import"./index-DRjF_FHU.js";/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const U=F("CircleCheck",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m9 12 2 2 4-4",key:"dzmm74"}]]),X="_wrapper_1bbpj_1",A="_label_1bbpj_4",G="_inputWrap_1bbpj_20",J="_input_1bbpj_20",K="_hasLeft_1bbpj_58",Q="_hasRight_1bbpj_59",Y="_iconLeft_1bbpj_61",Z="_iconRight_1bbpj_61",ee="_error_1bbpj_71",se="_helperText_1bbpj_78",re="_errorText_1bbpj_84",ae="_successText_1bbpj_85",oe="_msgIcon_1bbpj_97",s={wrapper:X,label:A,inputWrap:G,input:J,hasLeft:K,hasRight:Q,iconLeft:Y,iconRight:Z,error:ee,helperText:se,errorText:re,successText:ae,msgIcon:oe};function $({label:r,helperText:h,error:a,success:d,iconLeft:m,iconRight:u,hideErrorIcon:B=!1,className:P,id:z,...H}){const b=z??(r==null?void 0:r.toLowerCase().replace(/\s+/g,"-")),M=[s.inputWrap,m?s.hasLeft:"",u?s.hasRight:""].filter(Boolean).join(" ");return e.jsxs("div",{className:[s.wrapper,a?s.error:"",P??""].filter(Boolean).join(" "),children:[r&&e.jsx("label",{className:`${s.label} text-16-bold`,htmlFor:b,children:r}),e.jsxs("div",{className:M,children:[m&&e.jsx("span",{className:s.iconLeft,children:m}),e.jsx("input",{id:b,className:`${s.input} text-body-m`,...H}),u&&e.jsx("span",{className:s.iconRight,children:u})]}),a&&e.jsxs("span",{className:`${s.errorText} text-body-xs`,children:[!B&&e.jsx(V,{size:14,className:s.msgIcon}),a]}),!a&&d&&e.jsxs("span",{className:`${s.successText} text-body-xs`,children:[e.jsx(U,{size:14,className:s.msgIcon}),d]}),!a&&!d&&h&&e.jsx("span",{className:`${s.helperText} text-body-xs`,children:h})]})}$.__docgenInfo={description:"",methods:[],displayName:"Input",props:{label:{required:!1,tsType:{name:"string"},description:""},helperText:{required:!1,tsType:{name:"string"},description:""},error:{required:!1,tsType:{name:"string"},description:""},success:{required:!1,tsType:{name:"string"},description:""},iconLeft:{required:!1,tsType:{name:"ReactNode"},description:""},iconRight:{required:!1,tsType:{name:"ReactNode"},description:""},hideErrorIcon:{required:!1,tsType:{name:"boolean"},description:`Oculta o ícone CircleX dentro da mensagem de erro. Útil quando o indicador\r
 visual de erro é fornecido por outro elemento (ex: Feedback block).`,defaultValue:{value:"false",computed:!1}}},composes:["InputHTMLAttributes"]};const le={title:"Components/Input",component:$,tags:["autodocs"],decorators:[r=>e.jsx("div",{style:{width:320},children:e.jsx(r,{})})]},o={args:{placeholder:"Digite aqui..."}},t={args:{label:"Nome completo",placeholder:"Ex: Maria Silva"}},n={args:{label:"E-mail",placeholder:"seu@email.com",helperText:"Usado para login."}},c={args:{label:"Senha",type:"password",value:"123",error:"Senha deve ter ao menos 8 caracteres.",readOnly:!0}},i={args:{label:"Buscar",iconLeft:e.jsx("span",{children:"🔍"}),iconRight:e.jsx("span",{children:"✕"}),placeholder:"Pesquisar..."}},l={args:{label:"Campo desabilitado",value:"Valor fixo",disabled:!0,readOnly:!0}},p={args:{type:"search",iconLeft:e.jsx("span",{children:"🔍"}),placeholder:"Pesquisar produtos..."}};var g,x,_;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    placeholder: 'Digite aqui...'
  }
}`,...(_=(x=o.parameters)==null?void 0:x.docs)==null?void 0:_.source}}};var f,j,y;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    label: 'Nome completo',
    placeholder: 'Ex: Maria Silva'
  }
}`,...(y=(j=t.parameters)==null?void 0:j.docs)==null?void 0:y.source}}};var T,L,N;n.parameters={...n.parameters,docs:{...(T=n.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    label: 'E-mail',
    placeholder: 'seu@email.com',
    helperText: 'Usado para login.'
  }
}`,...(N=(L=n.parameters)==null?void 0:L.docs)==null?void 0:N.source}}};var I,S,q;c.parameters={...c.parameters,docs:{...(I=c.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    label: 'Senha',
    type: 'password',
    value: '123',
    error: 'Senha deve ter ao menos 8 caracteres.',
    readOnly: true
  }
}`,...(q=(S=c.parameters)==null?void 0:S.docs)==null?void 0:q.source}}};var v,C,R;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    label: 'Buscar',
    iconLeft: <span>🔍</span>,
    iconRight: <span>✕</span>,
    placeholder: 'Pesquisar...'
  }
}`,...(R=(C=i.parameters)==null?void 0:C.docs)==null?void 0:R.source}}};var W,w,E;l.parameters={...l.parameters,docs:{...(W=l.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    label: 'Campo desabilitado',
    value: 'Valor fixo',
    disabled: true,
    readOnly: true
  }
}`,...(E=(w=l.parameters)==null?void 0:w.docs)==null?void 0:E.source}}};var k,D,O;p.parameters={...p.parameters,docs:{...(k=p.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    type: 'search',
    iconLeft: <span>🔍</span>,
    placeholder: 'Pesquisar produtos...'
  }
}`,...(O=(D=p.parameters)==null?void 0:D.docs)==null?void 0:O.source}}};const pe=["Default","WithLabel","WithHelper","WithError","WithIcons","Disabled","Search"];export{o as Default,l as Disabled,p as Search,c as WithError,n as WithHelper,i as WithIcons,t as WithLabel,pe as __namedExportsOrder,le as default};

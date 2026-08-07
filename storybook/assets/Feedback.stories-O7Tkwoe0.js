import{j as e}from"./jsx-runtime-DiklIkkE.js";import{X as O}from"./x-nO499Wy1.js";import{I as W,T as X,C as $}from"./triangle-alert-CmzeIpB7.js";import{C as P}from"./circle-x-BPPbbaoK.js";import"./index-DRjF_FHU.js";import"./createLucideIcon-B3K6bXbU.js";const U="_alert_663h3_1",B="_icon_663h3_9",R="_body_663h3_10",G="_title_663h3_11",H="_message_663h3_11",J="_dismiss_663h3_21",K="_success_663h3_29",L="_error_663h3_34",M="_warning_663h3_39",Q="_info_663h3_44",s={alert:U,icon:B,body:R,title:G,message:H,dismiss:J,success:K,error:L,warning:M,info:Q},V={success:e.jsx($,{size:18}),error:e.jsx(P,{size:18}),warning:e.jsx(X,{size:18}),info:e.jsx(W,{size:18})};function r({type:a,message:F,title:d,dismissible:I,onDismiss:D}){return e.jsxs("div",{className:[s.alert,s[a]].join(" "),role:"alert",children:[e.jsx("span",{className:s.icon,children:V[a]}),e.jsxs("div",{className:s.body,children:[d&&e.jsx("div",{className:`${s.title} text-subtitle-m`,children:d}),e.jsx("div",{className:`${s.message} text-body-xs`,children:F})]}),I&&e.jsx("button",{className:s.dismiss,onClick:D,"aria-label":"Fechar",children:e.jsx(O,{size:16})})]})}r.__docgenInfo={description:"",methods:[],displayName:"Feedback",props:{type:{required:!0,tsType:{name:"union",raw:"'success' | 'error' | 'warning' | 'info'",elements:[{name:"literal",value:"'success'"},{name:"literal",value:"'error'"},{name:"literal",value:"'warning'"},{name:"literal",value:"'info'"}]},description:""},message:{required:!0,tsType:{name:"string"},description:""},title:{required:!1,tsType:{name:"string"},description:""},dismissible:{required:!1,tsType:{name:"boolean"},description:""},onDismiss:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:""}}};const oe={title:"Components/Feedback",component:r,tags:["autodocs"],decorators:[a=>e.jsx("div",{style:{width:480},children:e.jsx(a,{})})]},o={args:{type:"success",message:"Operação realizada com sucesso!"}},t={args:{type:"error",message:"Algo deu errado. Tente novamente."}},i={args:{type:"warning",message:"Atenção: esta ação não pode ser desfeita."}},n={args:{type:"info",message:"Uma atualização está disponível."}},c={args:{type:"error",title:"Erro de autenticação",message:"Suas credenciais são inválidas. Por favor, verifique e tente novamente."}},m={args:{type:"info",message:"Clique no X para fechar este aviso.",dismissible:!0}},l={render:()=>e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[e.jsx(r,{type:"success",title:"Sucesso",message:"Dados salvos com sucesso."}),e.jsx(r,{type:"error",title:"Erro",message:"Não foi possível processar sua solicitação."}),e.jsx(r,{type:"warning",title:"Atenção",message:"O limite de armazenamento está próximo."}),e.jsx(r,{type:"info",title:"Informação",message:"Sistema em manutenção das 02h às 04h."})]})};var p,u,g;o.parameters={...o.parameters,docs:{...(p=o.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    type: 'success',
    message: 'Operação realizada com sucesso!'
  }
}`,...(g=(u=o.parameters)==null?void 0:u.docs)==null?void 0:g.source}}};var f,y,_;t.parameters={...t.parameters,docs:{...(f=t.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    type: 'error',
    message: 'Algo deu errado. Tente novamente.'
  }
}`,...(_=(y=t.parameters)==null?void 0:y.docs)==null?void 0:_.source}}};var v,x,h;i.parameters={...i.parameters,docs:{...(v=i.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    type: 'warning',
    message: 'Atenção: esta ação não pode ser desfeita.'
  }
}`,...(h=(x=i.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var b,j,S;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    type: 'info',
    message: 'Uma atualização está disponível.'
  }
}`,...(S=(j=n.parameters)==null?void 0:j.docs)==null?void 0:S.source}}};var w,T,z;c.parameters={...c.parameters,docs:{...(w=c.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    type: 'error',
    title: 'Erro de autenticação',
    message: 'Suas credenciais são inválidas. Por favor, verifique e tente novamente.'
  }
}`,...(z=(T=c.parameters)==null?void 0:T.docs)==null?void 0:z.source}}};var C,N,k;m.parameters={...m.parameters,docs:{...(C=m.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    type: 'info',
    message: 'Clique no X para fechar este aviso.',
    dismissible: true
  }
}`,...(k=(N=m.parameters)==null?void 0:N.docs)==null?void 0:k.source}}};var q,A,E;l.parameters={...l.parameters,docs:{...(q=l.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  }}>\r
      <Feedback type="success" title="Sucesso" message="Dados salvos com sucesso." />\r
      <Feedback type="error" title="Erro" message="Não foi possível processar sua solicitação." />\r
      <Feedback type="warning" title="Atenção" message="O limite de armazenamento está próximo." />\r
      <Feedback type="info" title="Informação" message="Sistema em manutenção das 02h às 04h." />\r
    </div>
}`,...(E=(A=l.parameters)==null?void 0:A.docs)==null?void 0:E.source}}};const te=["Success","Error","Warning","Info","WithTitle","Dismissible","AllTypes"];export{l as AllTypes,m as Dismissible,t as Error,n as Info,o as Success,i as Warning,c as WithTitle,te as __namedExportsOrder,oe as default};

import{j as e}from"./jsx-runtime-DiklIkkE.js";import{B as t}from"./Button-_bFaThKo.js";import"./index-DRjF_FHU.js";const w="_wrapper_34g1s_1",z="_tip_34g1s_3",q="_top_34g1s_20",R="_bottom_34g1s_21",N="_left_34g1s_22",S="_right_34g1s_23",C="_arrow_34g1s_25",s={wrapper:w,tip:z,top:q,bottom:R,left:N,right:S,arrow:C};function o({content:l,placement:D="top",children:P}){return e.jsxs("span",{className:s.wrapper,children:[P,e.jsxs("span",{className:[s.tip,"text-body-xs",s[D]].join(" "),children:[e.jsx("span",{className:s.arrow}),l]})]})}o.__docgenInfo={description:"",methods:[],displayName:"Tooltip",props:{content:{required:!0,tsType:{name:"string"},description:""},placement:{required:!1,tsType:{name:"union",raw:"'top' | 'bottom' | 'left' | 'right'",elements:[{name:"literal",value:"'top'"},{name:"literal",value:"'bottom'"},{name:"literal",value:"'left'"},{name:"literal",value:"'right'"}]},description:"",defaultValue:{value:"'top'",computed:!1}},children:{required:!0,tsType:{name:"ReactNode"},description:""}}};const I={title:"Components/Tooltip",component:o,tags:["autodocs"],decorators:[l=>e.jsx("div",{style:{padding:60,display:"flex",justifyContent:"center"},children:e.jsx(l,{})})]},r={args:{content:"Dica acima",placement:"top",children:e.jsx(t,{variant:"secondary",children:"Passe o mouse"})}},a={args:{content:"Dica abaixo",placement:"bottom",children:e.jsx(t,{variant:"secondary",children:"Passe o mouse"})}},n={args:{content:"Dica à esquerda",placement:"left",children:e.jsx(t,{variant:"secondary",children:"Passe o mouse"})}},i={args:{content:"Dica à direita",placement:"right",children:e.jsx(t,{variant:"secondary",children:"Passe o mouse"})}},c={render:()=>e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:40,padding:60},children:[e.jsx(o,{content:"Topo",placement:"top",children:e.jsx(t,{size:"sm",children:"Top"})}),e.jsx(o,{content:"Direita",placement:"right",children:e.jsx(t,{size:"sm",children:"Right"})}),e.jsx(o,{content:"Esquerda",placement:"left",children:e.jsx(t,{size:"sm",children:"Left"})}),e.jsx(o,{content:"Baixo",placement:"bottom",children:e.jsx(t,{size:"sm",children:"Bottom"})})]})};var p,m,d;r.parameters={...r.parameters,docs:{...(p=r.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    content: 'Dica acima',
    placement: 'top',
    children: <Button variant="secondary">Passe o mouse</Button>
  }
}`,...(d=(m=r.parameters)==null?void 0:m.docs)==null?void 0:d.source}}};var u,g,h;a.parameters={...a.parameters,docs:{...(u=a.parameters)==null?void 0:u.docs,source:{originalSource:`{
  args: {
    content: 'Dica abaixo',
    placement: 'bottom',
    children: <Button variant="secondary">Passe o mouse</Button>
  }
}`,...(h=(g=a.parameters)==null?void 0:g.docs)==null?void 0:h.source}}};var x,f,_;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  args: {
    content: 'Dica à esquerda',
    placement: 'left',
    children: <Button variant="secondary">Passe o mouse</Button>
  }
}`,...(_=(f=n.parameters)==null?void 0:f.docs)==null?void 0:_.source}}};var B,j,T;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    content: 'Dica à direita',
    placement: 'right',
    children: <Button variant="secondary">Passe o mouse</Button>
  }
}`,...(T=(j=i.parameters)==null?void 0:j.docs)==null?void 0:T.source}}};var y,v,b;c.parameters={...c.parameters,docs:{...(y=c.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 40,
    padding: 60
  }}>\r
      <Tooltip content="Topo" placement="top"><Button size="sm">Top</Button></Tooltip>\r
      <Tooltip content="Direita" placement="right"><Button size="sm">Right</Button></Tooltip>\r
      <Tooltip content="Esquerda" placement="left"><Button size="sm">Left</Button></Tooltip>\r
      <Tooltip content="Baixo" placement="bottom"><Button size="sm">Bottom</Button></Tooltip>\r
    </div>
}`,...(b=(v=c.parameters)==null?void 0:v.docs)==null?void 0:b.source}}};const O=["Top","Bottom","Left","Right","AllPlacements"];export{c as AllPlacements,a as Bottom,n as Left,i as Right,r as Top,O as __namedExportsOrder,I as default};

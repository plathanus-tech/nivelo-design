import{j as t}from"./jsx-runtime-DiklIkkE.js";import{r as v}from"./index-DRjF_FHU.js";import{c as M}from"./createLucideIcon-B3K6bXbU.js";/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O=M("ThumbsUp",[["path",{d:"M7 10v12",key:"1qc93n"}],["path",{d:"M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",key:"emmmcr"}]]),U="_voteButton_1tmjm_1",W="_sm_1tmjm_23",w="_md_1tmjm_30",P="_icon_1tmjm_25",Z="_count_1tmjm_25",F="_voted_1tmjm_41",n={voteButton:U,sm:W,md:w,icon:P,count:Z,voted:F};function f({count:o,voted:s=!1,size:a="md",className:r,onClick:e,...D}){const L=[n.voteButton,n[a],s?n.voted:"",r??""].filter(Boolean).join(" ");return t.jsxs("button",{type:"button",className:L,"aria-pressed":s,"aria-label":s?"Remover voto desta ideia":"Votar nesta ideia",onClick:e,...D,children:[t.jsx(O,{className:n.icon,size:a==="sm"?16:20}),t.jsx("span",{className:n.count,children:o})]})}f.__docgenInfo={description:'Ação principal do Canal de Ideias — vota/desvota sem abrir a ideia. Pensado pra ficar\n"chamativo sem roubar o foco": borda neutra por padrão, preenchimento de marca só quando\n`voted`. `size="sm"` é o usado dentro do card do feed; `size="md"` é o usado na página de\ndetalhe da ideia (mais espaço, número maior).',methods:[],displayName:"VoteButton",props:{count:{required:!0,tsType:{name:"number"},description:""},voted:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"}]},description:"",defaultValue:{value:"'md'",computed:!1}}},composes:["Omit"]};const Q={title:"Components/VoteButton",component:f,tags:["autodocs"]},d={args:{count:128,voted:!1}},c={args:{count:129,voted:!0}},i={args:{count:42,voted:!1,size:"sm"}},m={args:{count:43,voted:!0,size:"sm"}},u={args:{count:2483,voted:!1}},l={render:()=>{const[o,s]=v.useState(!1),[a,r]=v.useState(128);return t.jsx(f,{count:a,voted:o,onClick:()=>{s(e=>!e),r(e=>o?e-1:e+1)}})}},p={render:()=>{const[o,s]=v.useState(!1),[a,r]=v.useState(87);return t.jsxs("div",{style:{display:"flex",gap:16,alignItems:"flex-start",maxWidth:420,padding:16,border:"1px solid #E5E5E5",borderRadius:8},children:[t.jsx(f,{size:"sm",count:a,voted:o,onClick:()=>{s(e=>!e),r(e=>o?e-1:e+1)}}),t.jsxs("div",{children:[t.jsx("strong",{children:"Adicionar filtro de safra no Caderno de Campo"}),t.jsx("p",{style:{margin:"4px 0 0",color:"#525252",fontSize:14},children:"Seria útil filtrar as anotações por safra ao revisar o histórico de um talhão."})]})]})}};var g,x,h;d.parameters={...d.parameters,docs:{...(g=d.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    count: 128,
    voted: false
  }
}`,...(h=(x=d.parameters)==null?void 0:x.docs)==null?void 0:h.source}}};var S,C,_;c.parameters={...c.parameters,docs:{...(S=c.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    count: 129,
    voted: true
  }
}`,...(_=(C=c.parameters)==null?void 0:C.docs)==null?void 0:_.source}}};var j,V,b;i.parameters={...i.parameters,docs:{...(j=i.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    count: 42,
    voted: false,
    size: 'sm'
  }
}`,...(b=(V=i.parameters)==null?void 0:V.docs)==null?void 0:b.source}}};var y,z,B;m.parameters={...m.parameters,docs:{...(y=m.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    count: 43,
    voted: true,
    size: 'sm'
  }
}`,...(B=(z=m.parameters)==null?void 0:z.docs)==null?void 0:B.source}}};var E,I,k;u.parameters={...u.parameters,docs:{...(E=u.parameters)==null?void 0:E.docs,source:{originalSource:`{
  args: {
    count: 2483,
    voted: false
  }
}`,...(k=(I=u.parameters)==null?void 0:I.docs)==null?void 0:k.source}}};var q,T,A;l.parameters={...l.parameters,docs:{...(q=l.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => {
    const [voted, setVoted] = useState(false);
    const [count, setCount] = useState(128);
    return <VoteButton count={count} voted={voted} onClick={() => {
      setVoted(v => !v);
      setCount(c => voted ? c - 1 : c + 1);
    }} />;
  }
}`,...(A=(T=l.parameters)==null?void 0:T.docs)==null?void 0:A.source}}};var N,R,H;p.parameters={...p.parameters,docs:{...(N=p.parameters)==null?void 0:N.docs,source:{originalSource:`{
  render: () => {
    const [voted, setVoted] = useState(false);
    const [count, setCount] = useState(87);
    return <div style={{
      display: 'flex',
      gap: 16,
      alignItems: 'flex-start',
      maxWidth: 420,
      padding: 16,
      border: '1px solid #E5E5E5',
      borderRadius: 8
    }}>\r
        <VoteButton size="sm" count={count} voted={voted} onClick={() => {
        setVoted(v => !v);
        setCount(c => voted ? c - 1 : c + 1);
      }} />\r
        <div>\r
          <strong>Adicionar filtro de safra no Caderno de Campo</strong>\r
          <p style={{
          margin: '4px 0 0',
          color: '#525252',
          fontSize: 14
        }}>\r
            Seria útil filtrar as anotações por safra ao revisar o histórico de um talhão.\r
          </p>\r
        </div>\r
      </div>;
  }
}`,...(H=(R=p.parameters)==null?void 0:R.docs)==null?void 0:H.source}}};const X=["Default","Voted","Small","SmallVoted","HighCount","Interactive","InCardContext"];export{d as Default,u as HighCount,p as InCardContext,l as Interactive,i as Small,m as SmallVoted,c as Voted,X as __namedExportsOrder,Q as default};

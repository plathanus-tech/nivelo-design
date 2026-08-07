import{j as a}from"./jsx-runtime-DiklIkkE.js";import"./index-DRjF_FHU.js";const I="_avatar_d0wbv_1",T="_sm_d0wbv_15",B="_md_d0wbv_19",N="_lg_d0wbv_17",R="_initials_d0wbv_27",n={avatar:I,sm:T,md:B,lg:N,initials:R},v=["brand","green","orange","violet","pink","indigo"];function D(i){let e=0;for(let s=0;s<i.length;s++)e=e*31+i.charCodeAt(s)>>>0;return v[e%v.length]}function E(i){const e=i.trim().split(/\s+/).filter(Boolean);return e.length===0?"":e.length===1?e[0].slice(0,2).toUpperCase():(e[0][0]+e[e.length-1][0]).toUpperCase()}function r({name:i,src:e,size:s="md",color:k,className:d,...w}){const p=n[s]??n.md,q=k??D(i);return e?a.jsx("img",{className:[n.avatar,p,d??""].filter(Boolean).join(" "),src:e,alt:i,...w}):a.jsx("span",{className:[n.avatar,n.initials,p,d??""].filter(Boolean).join(" "),"data-color":q,role:"img","aria-label":i,children:E(i)})}r.__docgenInfo={description:"",methods:[],displayName:"Avatar",props:{name:{required:!0,tsType:{name:"string"},description:""},src:{required:!1,tsType:{name:"string"},description:""},size:{required:!1,tsType:{name:"union",raw:"'sm' | 'md' | 'lg'",elements:[{name:"literal",value:"'sm'"},{name:"literal",value:"'md'"},{name:"literal",value:"'lg'"}]},description:"",defaultValue:{value:"'md'",computed:!1}},color:{required:!1,tsType:{name:"union",raw:"'brand' | 'green' | 'orange' | 'violet' | 'pink' | 'indigo'",elements:[{name:"literal",value:"'brand'"},{name:"literal",value:"'green'"},{name:"literal",value:"'orange'"},{name:"literal",value:"'violet'"},{name:"literal",value:"'pink'"},{name:"literal",value:"'indigo'"}]},description:"Cor do círculo de iniciais quando não há `src` — ver `pickAvatarColor` para derivar\numa cor estável a partir de um identificador (ex.: nome do autor)."},className:{required:!1,tsType:{name:"string"},description:""}},composes:["Omit"]};const V={title:"Components/Avatar",component:r,tags:["autodocs"]},o={args:{name:"Maria Oliveira"}},t={render:()=>a.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[a.jsx(r,{name:"Maria Oliveira",size:"sm"}),a.jsx(r,{name:"Maria Oliveira",size:"md"}),a.jsx(r,{name:"Maria Oliveira",size:"lg"})]})},l={render:()=>a.jsxs("div",{style:{display:"flex",gap:12},children:[a.jsx(r,{name:"Ana",color:"brand"}),a.jsx(r,{name:"Bruno",color:"green"}),a.jsx(r,{name:"Carla",color:"orange"}),a.jsx(r,{name:"Diego",color:"violet"}),a.jsx(r,{name:"Elis",color:"pink"}),a.jsx(r,{name:"Fábio",color:"indigo"})]})},m={args:{name:"Roberto"}},c={args:{name:"Maria Oliveira",src:"https://i.pravatar.cc/80?img=5"}};var g,u,f;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    name: 'Maria Oliveira'
  }
}`,...(f=(u=o.parameters)==null?void 0:u.docs)==null?void 0:f.source}}};var x,A,_;t.parameters={...t.parameters,docs:{...(x=t.parameters)==null?void 0:x.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: 12
  }}>\r
      <Avatar name="Maria Oliveira" size="sm" />\r
      <Avatar name="Maria Oliveira" size="md" />\r
      <Avatar name="Maria Oliveira" size="lg" />\r
    </div>
}`,...(_=(A=t.parameters)==null?void 0:A.docs)==null?void 0:_.source}}};var h,j,b;l.parameters={...l.parameters,docs:{...(h=l.parameters)==null?void 0:h.docs,source:{originalSource:`{
  render: () => <div style={{
    display: 'flex',
    gap: 12
  }}>\r
      <Avatar name="Ana" color="brand" />\r
      <Avatar name="Bruno" color="green" />\r
      <Avatar name="Carla" color="orange" />\r
      <Avatar name="Diego" color="violet" />\r
      <Avatar name="Elis" color="pink" />\r
      <Avatar name="Fábio" color="indigo" />\r
    </div>
}`,...(b=(j=l.parameters)==null?void 0:j.docs)==null?void 0:b.source}}};var y,C,O;m.parameters={...m.parameters,docs:{...(y=m.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    name: 'Roberto'
  }
}`,...(O=(C=m.parameters)==null?void 0:C.docs)==null?void 0:O.source}}};var z,M,S;c.parameters={...c.parameters,docs:{...(z=c.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    name: 'Maria Oliveira',
    src: 'https://i.pravatar.cc/80?img=5'
  }
}`,...(S=(M=c.parameters)==null?void 0:M.docs)==null?void 0:S.source}}};const W=["Default","Sizes","Colors","SingleName","WithImage"];export{l as Colors,o as Default,m as SingleName,t as Sizes,c as WithImage,W as __namedExportsOrder,V as default};

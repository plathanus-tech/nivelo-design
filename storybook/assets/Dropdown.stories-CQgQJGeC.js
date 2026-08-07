import{j as r}from"./jsx-runtime-DiklIkkE.js";import{r as p}from"./index-DRjF_FHU.js";import{D as o}from"./Dropdown-C1liUEal.js";import"./chevron-down-nqZkofZo.js";import"./createLucideIcon-B3K6bXbU.js";import"./circle-x-BPPbbaoK.js";const c=[{label:"React",value:"react"},{label:"Vue",value:"vue"},{label:"Angular",value:"angular"},{label:"Svelte",value:"svelte"}],F={title:"Components/Dropdown",component:o,tags:["autodocs"],decorators:[e=>r.jsx("div",{style:{width:280,paddingBottom:200},children:r.jsx(e,{})})]},s={render:()=>{const[e,a]=p.useState("");return r.jsx(o,{options:c,value:e,onChange:a,label:"Framework",placeholder:"Escolha um framework"})}},t={render:()=>{const[e,a]=p.useState("react");return r.jsx(o,{options:c,value:e,onChange:a,placeholder:"Escolha um framework"})}},l={render:()=>r.jsx(o,{options:c,disabled:!0,placeholder:"Indisponível",label:"Framework"})},n={render:()=>{const[e,a]=p.useState("");return r.jsx(o,{options:c,value:e,onChange:a,label:"Framework",placeholder:"Escolha um framework",error:"Selecione uma opção para continuar"})}};var u,d,m;s.parameters={...s.parameters,docs:{...(u=s.parameters)==null?void 0:u.docs,source:{originalSource:`{
  render: () => {
    const [val, setVal] = useState('');
    return <Dropdown options={options} value={val} onChange={setVal} label="Framework" placeholder="Escolha um framework" />;
  }
}`,...(m=(d=s.parameters)==null?void 0:d.docs)==null?void 0:m.source}}};var i,h,v;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  render: () => {
    const [val, setVal] = useState('react');
    return <Dropdown options={options} value={val} onChange={setVal} placeholder="Escolha um framework" />;
  }
}`,...(v=(h=t.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};var w,b,g;l.parameters={...l.parameters,docs:{...(w=l.parameters)==null?void 0:w.docs,source:{originalSource:`{
  render: () => <Dropdown options={options} disabled placeholder="Indisponível" label="Framework" />
}`,...(g=(b=l.parameters)==null?void 0:b.docs)==null?void 0:g.source}}};var S,f,k;n.parameters={...n.parameters,docs:{...(S=n.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: () => {
    const [val, setVal] = useState('');
    return <Dropdown options={options} value={val} onChange={setVal} label="Framework" placeholder="Escolha um framework" error="Selecione uma opção para continuar" />;
  }
}`,...(k=(f=n.parameters)==null?void 0:f.docs)==null?void 0:k.source}}};const W=["Default","WithValue","Disabled","WithError"];export{s as Default,l as Disabled,n as WithError,t as WithValue,W as __namedExportsOrder,F as default};

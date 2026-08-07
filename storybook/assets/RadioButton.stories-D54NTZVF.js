import{j as a}from"./jsx-runtime-DiklIkkE.js";import{r as z}from"./index-DRjF_FHU.js";const B="_group_us3wl_1",N="_horizontal_us3wl_3",O="_label_us3wl_7",R="_option_us3wl_33",V="_disabled_us3wl_41",q="_circle_us3wl_43",S="_dot_us3wl_51",T="_optionLabel_us3wl_53",D="_input_us3wl_57",k="_checked_us3wl_81",e={group:B,horizontal:N,label:O,option:R,disabled:V,circle:q,dot:S,optionLabel:T,input:D,checked:k};function i({options:s,value:o,onChange:u,name:j,label:c,disabled:p=!1,orientation:w="vertical"}){return a.jsxs("fieldset",{style:{border:"none",padding:0,margin:0},children:[c&&a.jsx("legend",{className:`${e.label} text-16-bold`,children:c}),a.jsx("div",{className:[e.group,w==="horizontal"?e.horizontal:""].filter(Boolean).join(" "),children:s.map(t=>a.jsxs("label",{className:[e.option,o===t.value?e.checked:"",p?e.disabled:""].filter(Boolean).join(" "),children:[a.jsx("input",{type:"radio",className:e.input,name:j,value:t.value,checked:o===t.value,disabled:p,onChange:()=>u==null?void 0:u(t.value)}),a.jsx("span",{className:e.circle,children:a.jsx("span",{className:e.dot})}),a.jsx("span",{className:`${e.optionLabel} text-body-m`,children:t.label})]},t.value))})]})}i.__docgenInfo={description:"",methods:[],displayName:"RadioButton",props:{options:{required:!0,tsType:{name:"Array",elements:[{name:"RadioOption"}],raw:"RadioOption[]"},description:""},value:{required:!1,tsType:{name:"string"},description:""},onChange:{required:!1,tsType:{name:"signature",type:"function",raw:"(value: string) => void",signature:{arguments:[{type:{name:"string"},name:"value"}],return:{name:"void"}}},description:""},name:{required:!0,tsType:{name:"string"},description:""},label:{required:!1,tsType:{name:"string"},description:""},disabled:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},orientation:{required:!1,tsType:{name:"union",raw:"'vertical' | 'horizontal'",elements:[{name:"literal",value:"'vertical'"},{name:"literal",value:"'horizontal'"}]},description:"",defaultValue:{value:"'vertical'",computed:!1}}}};const d=[{label:"Opção A",value:"a"},{label:"Opção B",value:"b"},{label:"Opção C",value:"c"}],L={title:"Components/Radio Button",component:i,tags:["autodocs"]},n={render:()=>{const[s,o]=z.useState("a");return a.jsx(i,{options:d,name:"default",value:s,onChange:o,label:"Escolha uma opção"})}},l={render:()=>{const[s,o]=z.useState("a");return a.jsx(i,{options:d,name:"horizontal",value:s,onChange:o,orientation:"horizontal",label:"Orientação horizontal"})}},r={args:{options:d,name:"disabled",value:"a",disabled:!0,label:"Desabilitado"}};var m,b,v;n.parameters={...n.parameters,docs:{...(m=n.parameters)==null?void 0:m.docs,source:{originalSource:`{
  render: () => {
    const [val, setVal] = useState('a');
    return <RadioButton options={options} name="default" value={val} onChange={setVal} label="Escolha uma opção" />;
  }
}`,...(v=(b=n.parameters)==null?void 0:b.docs)==null?void 0:v.source}}};var _,h,f;l.parameters={...l.parameters,docs:{...(_=l.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => {
    const [val, setVal] = useState('a');
    return <RadioButton options={options} name="horizontal" value={val} onChange={setVal} orientation="horizontal" label="Orientação horizontal" />;
  }
}`,...(f=(h=l.parameters)==null?void 0:h.docs)==null?void 0:f.source}}};var g,x,y;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    options,
    name: 'disabled',
    value: 'a',
    disabled: true,
    label: 'Desabilitado'
  }
}`,...(y=(x=r.parameters)==null?void 0:x.docs)==null?void 0:y.source}}};const A=["Default","Horizontal","Disabled"];export{n as Default,r as Disabled,l as Horizontal,A as __namedExportsOrder,L as default};

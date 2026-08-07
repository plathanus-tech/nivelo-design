import{j as a}from"./jsx-runtime-DiklIkkE.js";import{r as u}from"./index-DRjF_FHU.js";import{M as O,C as P}from"./minus-CHEDjjUS.js";import"./createLucideIcon-B3K6bXbU.js";const W="_wrapper_mird3_1",$="_disabled_mird3_5",B="_box_mird3_6",F="_checked_mird3_10",R="_indeterminate_mird3_11",G="_mark_mird3_15",H="_label_mird3_16",J="_input_mird3_18",r={wrapper:W,disabled:$,box:B,checked:F,indeterminate:R,mark:G,label:H,input:J};function c({label:s,checked:t=!1,indeterminate:e=!1,disabled:h=!1,onChange:E,id:T,...V}){const b=T??`cb-${Math.random().toString(36).slice(2)}`,z=[r.wrapper,t?r.checked:"",e?r.indeterminate:"",h?r.disabled:""].filter(Boolean).join(" ");return a.jsxs("label",{className:z,htmlFor:b,children:[a.jsx("input",{type:"checkbox",id:b,className:r.input,checked:t,disabled:h,onChange:E,...V}),a.jsx("span",{className:r.box,children:e?a.jsx("span",{className:r.mark,children:a.jsx(O,{size:12,strokeWidth:3})}):t?a.jsx("span",{className:r.mark,children:a.jsx(P,{size:12,strokeWidth:3})}):null}),s&&a.jsx("span",{className:`${r.label} text-16-regular`,children:s})]})}c.__docgenInfo={description:"",methods:[],displayName:"Checkbox",props:{label:{required:!1,tsType:{name:"string"},description:""},checked:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},indeterminate:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},disabled:{defaultValue:{value:"false",computed:!1},required:!1}},composes:["Omit"]};const X={title:"Components/Checkbox",component:c,tags:["autodocs"]},n={render:()=>{const[s,t]=u.useState(!1);return a.jsx(c,{label:"Aceitar termos de uso",checked:s,onChange:()=>t(e=>!e)})}},o={render:()=>{const[s,t]=u.useState(!0);return a.jsx(c,{label:"Selecionado",checked:s,onChange:()=>t(e=>!e)})}},d={render:()=>{const[s,t]=u.useState(!1);return a.jsx(c,{label:"Parcialmente selecionado",checked:s,indeterminate:!s,onChange:()=>t(e=>!e)})}},l={args:{label:"Desabilitado",disabled:!0,checked:!1}},i={args:{label:"Desabilitado selecionado",disabled:!0,checked:!0}},m={render:()=>{const[s,t]=u.useState({a:!1,b:!0,c:!1});return a.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:12},children:[a.jsx(c,{label:"Desmarcado",checked:s.a,onChange:()=>t(e=>({...e,a:!e.a}))}),a.jsx(c,{label:"Marcado",checked:s.b,onChange:()=>t(e=>({...e,b:!e.b}))}),a.jsx(c,{label:"Indeterminado",checked:s.c,indeterminate:!s.c,onChange:()=>t(e=>({...e,c:!e.c}))}),a.jsx(c,{label:"Desabilitado",disabled:!0})]})}};var p,k,x;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Checkbox label="Aceitar termos de uso" checked={checked} onChange={() => setChecked(v => !v)} />;
  }
}`,...(x=(k=n.parameters)==null?void 0:k.docs)==null?void 0:x.source}}};var f,C,g;o.parameters={...o.parameters,docs:{...(f=o.parameters)==null?void 0:f.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Checkbox label="Selecionado" checked={checked} onChange={() => setChecked(v => !v)} />;
  }
}`,...(g=(C=o.parameters)==null?void 0:C.docs)==null?void 0:g.source}}};var _,S,j;d.parameters={...d.parameters,docs:{...(_=d.parameters)==null?void 0:_.docs,source:{originalSource:`{
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Checkbox label="Parcialmente selecionado" checked={checked} indeterminate={!checked} onChange={() => setChecked(v => !v)} />;
  }
}`,...(j=(S=d.parameters)==null?void 0:S.docs)==null?void 0:j.source}}};var D,v,y;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  args: {
    label: 'Desabilitado',
    disabled: true,
    checked: false
  }
}`,...(y=(v=l.parameters)==null?void 0:v.docs)==null?void 0:y.source}}};var N,I,M;i.parameters={...i.parameters,docs:{...(N=i.parameters)==null?void 0:N.docs,source:{originalSource:`{
  args: {
    label: 'Desabilitado selecionado',
    disabled: true,
    checked: true
  }
}`,...(M=(I=i.parameters)==null?void 0:I.docs)==null?void 0:M.source}}};var q,w,A;m.parameters={...m.parameters,docs:{...(q=m.parameters)==null?void 0:q.docs,source:{originalSource:`{
  render: () => {
    const [states, setStates] = useState({
      a: false,
      b: true,
      c: false
    });
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }}>\r
        <Checkbox label="Desmarcado" checked={states.a} onChange={() => setStates(s => ({
        ...s,
        a: !s.a
      }))} />\r
        <Checkbox label="Marcado" checked={states.b} onChange={() => setStates(s => ({
        ...s,
        b: !s.b
      }))} />\r
        <Checkbox label="Indeterminado" checked={states.c} indeterminate={!states.c} onChange={() => setStates(s => ({
        ...s,
        c: !s.c
      }))} />\r
        <Checkbox label="Desabilitado" disabled />\r
      </div>;
  }
}`,...(A=(w=m.parameters)==null?void 0:w.docs)==null?void 0:A.source}}};const Y=["Default","Checked","Indeterminate","Disabled","DisabledChecked","AllStates"];export{m as AllStates,o as Checked,n as Default,l as Disabled,i as DisabledChecked,d as Indeterminate,Y as __namedExportsOrder,X as default};

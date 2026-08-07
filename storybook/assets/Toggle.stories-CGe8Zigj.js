import{j as s}from"./jsx-runtime-DiklIkkE.js";import{r as u}from"./index-DRjF_FHU.js";const w="_wrapper_d36hb_1",q="_disabled_d36hb_8",E="_track_d36hb_9",R="_checked_d36hb_12",A="_thumb_d36hb_15",I="_label_d36hb_18",L="_input_d36hb_20",r={wrapper:w,disabled:q,track:E,checked:R,thumb:A,label:I,input:L};function o({label:e,checked:t=!1,disabled:a=!1,onChange:y,id:M,...O}){const p=M??`toggle-${Math.random().toString(36).slice(2)}`;return s.jsxs("label",{className:[r.wrapper,t?r.checked:"",a?r.disabled:""].filter(Boolean).join(" "),htmlFor:p,children:[s.jsx("input",{type:"checkbox",id:p,className:r.input,checked:t,disabled:a,onChange:y,role:"switch","aria-checked":t,...O}),s.jsx("span",{className:r.track,children:s.jsx("span",{className:r.thumb})}),e&&s.jsx("span",{className:`${r.label} text-16-regular`,children:e})]})}o.__docgenInfo={description:"",methods:[],displayName:"Toggle",props:{label:{required:!1,tsType:{name:"string"},description:""},checked:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}},disabled:{defaultValue:{value:"false",computed:!1},required:!1}},composes:["Omit"]};const B={title:"Components/Toggle",component:o,tags:["autodocs"]},n={render:()=>{const[e,t]=u.useState(!1);return s.jsx(o,{label:e?"Ligado":"Desligado",checked:e,onChange:()=>t(a=>!a)})}},l={render:()=>{const[e,t]=u.useState(!0);return s.jsx(o,{label:e?"Modo escuro ativo":"Modo escuro inativo",checked:e,onChange:()=>t(a=>!a)})}},c={args:{label:"Recurso indisponível",disabled:!0,checked:!1}},d={args:{label:"Sempre ativo",checked:!0,disabled:!0}},i={render:()=>{const[e,t]=u.useState({notif:!1,dark:!0});return s.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:16},children:[s.jsx(o,{label:e.notif?"Notificações ativas":"Notificações inativas",checked:e.notif,onChange:()=>t(a=>({...a,notif:!a.notif}))}),s.jsx(o,{label:e.dark?"Modo escuro":"Modo claro",checked:e.dark,onChange:()=>t(a=>({...a,dark:!a.dark}))}),s.jsx(o,{label:"Desabilitado",disabled:!0,checked:!1}),s.jsx(o,{label:"Desabilitado ativo",disabled:!0,checked:!0})]})}};var b,h,m;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  render: () => {
    const [on, setOn] = useState(false);
    return <Toggle label={on ? 'Ligado' : 'Desligado'} checked={on} onChange={() => setOn(v => !v)} />;
  }
}`,...(m=(h=n.parameters)==null?void 0:h.docs)==null?void 0:m.source}}};var g,f,k;l.parameters={...l.parameters,docs:{...(g=l.parameters)==null?void 0:g.docs,source:{originalSource:`{
  render: () => {
    const [on, setOn] = useState(true);
    return <Toggle label={on ? 'Modo escuro ativo' : 'Modo escuro inativo'} checked={on} onChange={() => setOn(v => !v)} />;
  }
}`,...(k=(f=l.parameters)==null?void 0:f.docs)==null?void 0:k.source}}};var _,v,x;c.parameters={...c.parameters,docs:{...(_=c.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    label: 'Recurso indisponível',
    disabled: true,
    checked: false
  }
}`,...(x=(v=c.parameters)==null?void 0:v.docs)==null?void 0:x.source}}};var S,j,D;d.parameters={...d.parameters,docs:{...(S=d.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    label: 'Sempre ativo',
    checked: true,
    disabled: true
  }
}`,...(D=(j=d.parameters)==null?void 0:j.docs)==null?void 0:D.source}}};var C,T,N;i.parameters={...i.parameters,docs:{...(C=i.parameters)==null?void 0:C.docs,source:{originalSource:`{
  render: () => {
    const [states, setStates] = useState({
      notif: false,
      dark: true
    });
    return <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16
    }}>\r
        <Toggle label={states.notif ? 'Notificações ativas' : 'Notificações inativas'} checked={states.notif} onChange={() => setStates(s => ({
        ...s,
        notif: !s.notif
      }))} />\r
        <Toggle label={states.dark ? 'Modo escuro' : 'Modo claro'} checked={states.dark} onChange={() => setStates(s => ({
        ...s,
        dark: !s.dark
      }))} />\r
        <Toggle label="Desabilitado" disabled checked={false} />\r
        <Toggle label="Desabilitado ativo" disabled checked />\r
      </div>;
  }
}`,...(N=(T=i.parameters)==null?void 0:T.docs)==null?void 0:N.source}}};const F=["Default","Checked","Disabled","DisabledChecked","AllStates"];export{i as AllStates,l as Checked,n as Default,c as Disabled,d as DisabledChecked,F as __namedExportsOrder,B as default};

import{j as e}from"./jsx-runtime-DiklIkkE.js";import{C as N}from"./chevron-right-DgUBg2g2.js";import{c as v}from"./createLucideIcon-B3K6bXbU.js";import{H as k}from"./house-3Ue02SsL.js";import"./index-DRjF_FHU.js";/**
 * @license lucide-react v0.400.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const C=v("Shirt",[["path",{d:"M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z",key:"1wgbhj"}]]),y="_nav_19gh7_1",w="_list_19gh7_5",P="_item_19gh7_14",R="_link_19gh7_21",O="_sep_19gh7_36",T="_current_19gh7_46",D="_icon_19gh7_53",a={nav:y,list:w,item:P,link:R,sep:O,current:T,icon:D};function L({items:c}){return e.jsx("nav",{"aria-label":"Breadcrumb",className:a.nav,children:e.jsx("ol",{className:a.list,children:c.map((r,i)=>{const z=i===c.length-1;return e.jsx("li",{className:a.item,children:z?e.jsxs("span",{className:`${a.current} text-14-bold`,"aria-current":"page",children:[r.label,r.icon&&e.jsx("span",{className:a.icon,"aria-hidden":"true",children:r.icon})]}):e.jsxs("a",{href:r.href??"#",className:`${a.link} text-14-regular`,children:[r.label,e.jsx("span",{className:a.sep,"aria-hidden":"true",children:e.jsx(N,{size:12})})]})},i)})})})}L.__docgenInfo={description:"",methods:[],displayName:"Breadcrumb",props:{items:{required:!0,tsType:{name:"Array",elements:[{name:"BreadcrumbItem"}],raw:"BreadcrumbItem[]"},description:""}}};const A={title:"Components/Breadcrumb",component:L,tags:["autodocs"]},s={args:{items:[{label:"Home",href:"#"},{label:"Produtos",href:"#"},{label:"Camiseta"}]}},n={args:{items:[{label:"Home",href:"#"},{label:"Loja",href:"#"},{label:"Camiseta Branca",icon:e.jsx(C,{size:16})}]}},o={args:{items:[{label:"Home",href:"#"},{label:"Loja",href:"#"},{label:"Roupas",href:"#"},{label:"Feminino",href:"#"},{label:"Camiseta Branca",icon:e.jsx(C,{size:16})}]}},t={args:{items:[{label:"Home",href:"#"},{label:"Sobre"}]}},l={args:{items:[{label:"Home",icon:e.jsx(k,{size:16})}]}};var m,h,p;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Home',
      href: '#'
    }, {
      label: 'Produtos',
      href: '#'
    }, {
      label: 'Camiseta'
    }]
  }
}`,...(p=(h=s.parameters)==null?void 0:h.docs)==null?void 0:p.source}}};var d,u,b;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Home',
      href: '#'
    }, {
      label: 'Loja',
      href: '#'
    }, {
      label: 'Camiseta Branca',
      icon: <Shirt size={16} />
    }]
  }
}`,...(b=(u=n.parameters)==null?void 0:u.docs)==null?void 0:b.source}}};var g,f,_;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Home',
      href: '#'
    }, {
      label: 'Loja',
      href: '#'
    }, {
      label: 'Roupas',
      href: '#'
    }, {
      label: 'Feminino',
      href: '#'
    }, {
      label: 'Camiseta Branca',
      icon: <Shirt size={16} />
    }]
  }
}`,...(_=(f=o.parameters)==null?void 0:f.docs)==null?void 0:_.source}}};var j,x,H;t.parameters={...t.parameters,docs:{...(j=t.parameters)==null?void 0:j.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Home',
      href: '#'
    }, {
      label: 'Sobre'
    }]
  }
}`,...(H=(x=t.parameters)==null?void 0:x.docs)==null?void 0:H.source}}};var S,B,I;l.parameters={...l.parameters,docs:{...(S=l.parameters)==null?void 0:S.docs,source:{originalSource:`{
  args: {
    items: [{
      label: 'Home',
      icon: <Home size={16} />
    }]
  }
}`,...(I=(B=l.parameters)==null?void 0:B.docs)==null?void 0:I.source}}};const M=["Default","WithIcon","LongPath","TwoItems","OneItem"];export{s as Default,o as LongPath,l as OneItem,t as TwoItems,n as WithIcon,M as __namedExportsOrder,A as default};

"use strict";
(() => {
 const KEY='utp-estadistica-parcial2-v1';
 const state=()=>window.probabilidadConjuntos?.probSets;
 const gcd=(a,b)=>b?gcd(b,a%b):a;
 function showProbability(detail){
  const node=document.getElementById('prob-expression-probability-work'); if(!node)return;
  if(!detail.probabilityQuery){node.textContent='—';return;}
  const n=detail.result.length, total=state()?.S.length||0;
  if(!total){node.textContent='No es posible calcular P(E) con S vacío.';return;}
  const d=gcd(n,total), frac=`${n/d}/${total/d}`;
  node.textContent=`P(${detail.eventExpression || "E"}) = n(E) / n(S) = ${n} / ${total} = ${frac} = ${(n/total).toFixed(4)} = ${(100*n/total).toFixed(2)} %`;
 }
 function persist(){
  try {const sets=state(); if(!sets)return;const input=document.getElementById('prob-expression-input');
   localStorage.setItem(KEY,JSON.stringify({sets:{S:[...sets.S],A:[...sets.A],B:[...sets.B],C:[...sets.C]},expression:input?.value||''}));
  }catch(e){console.warn('No fue posible guardar datos localmente.',e);}
 }
 function restore(){
  try {const raw=localStorage.getItem(KEY);if(!raw)return;const data=JSON.parse(raw), sets=state();if(!sets||!data.sets)return;
   if(!Array.isArray(data.sets.S)||!['A','B','C'].every(k=>Array.isArray(data.sets[k])))return;
   const S=[...new Set(data.sets.S.map(String))];
   const restored={S};
   for(const k of ['A','B','C']) restored[k]=[...new Set(data.sets[k].map(String))].filter(v=>S.includes(v));
   const input=document.getElementById('prob-expression-input');if(input&&typeof data.expression==='string')input.value=data.expression;
   window.probabilidadConjuntos.replaceSets(restored);
   for(const k of ['s','a','b','c']){const node=document.getElementById(`exp-${k}-input`);if(node)node.value=restored[k.toUpperCase()].join(', ');}

  }catch(e){console.warn('No se pudieron restaurar los datos guardados.',e);}
 }
 const display=a=>`{${a.join(', ')}}`;
 let question=null,attempts=0,correct=0;
 function createQuestion(){
  const s=state();if(!s)return;
  const A=s.A,B=s.B,C=s.C,S=s.S;
  const tasks=[
   {label:'¿Cuántos elementos tiene A ∪ B?',type:'number',answer:new Set([...A,...B]).size,explain:'Cuenta cada elemento una sola vez en la unión.'},
   {label:'Escribe los elementos de A ∩ B.',type:'set',answer:A.filter(x=>B.includes(x)),explain:'La intersección contiene únicamente elementos comunes.'},
   {label:'¿Cuál es la cardinalidad de A − B?',type:'number',answer:A.filter(x=>!B.includes(x)).length,explain:'Resta de A los elementos que también aparecen en B.'},
   {label:'¿Cuál es P(A)?',type:'prob',answer:S.length?A.length/S.length:null,explain:`P(A) = n(A)/n(S) = ${A.length}/${S.length}.`},
   {label:'Escribe los elementos de (A ∪ B) ∩ C.',type:'set',answer:[...new Set([...A,...B])].filter(x=>C.includes(x)),explain:'Primero une A y B; luego conserva los elementos presentes en C.'},
   {label:'¿Cuál es P(Aᶜ)?',type:'prob',answer:S.length?(S.length-A.length)/S.length:null,explain:`P(Aᶜ) = (n(S) − n(A))/n(S) = (${S.length} − ${A.length})/${S.length}.`},
   {label:'¿Cuántos elementos tiene A △ B?',type:'number',answer:A.filter(x=>!B.includes(x)).length+B.filter(x=>!A.includes(x)).length,explain:'Cuenta los elementos exclusivos de A y los exclusivos de B.'}
  ];
  question=tasks[Math.floor(Math.random()*tasks.length)];
  document.getElementById('practice-question').textContent=question.label;
  document.getElementById('practice-hint').textContent=question.type==='set'?'Respuesta como {1, 2, 3}.':question.type==='prob'?'Puedes responder con 0.5, 1/2 o 50%.':'Responde con un número entero.';
  document.getElementById('practice-answer').value='';
  const notice=document.getElementById('practice-feedback');notice.className='prob-notice';notice.textContent='';
 }
 function parseProb(v){let x=v.trim().replace(',','.');const pct=x.endsWith('%');if(pct)x=x.slice(0,-1);let result;
  if(x.includes('/')){const parts=x.split('/').map(Number);result=parts.length===2&&parts[1]!==0?parts[0]/parts[1]:NaN;}else result=Number(x);
  return pct?result/100:result;
 }
 function check(){if(!question)return;const raw=document.getElementById('practice-answer').value.trim();if(!raw)return;
  let valid=false;
  if(question.type==='set'){
   const cleaned=raw.replace(/^\s*\{/,'').replace(/\}\s*$/,'');
   const arr=cleaned.trim()?cleaned.split(',').map(x=>x.trim()):[];
   valid=arr.length===new Set(arr).size&&arr.length===question.answer.length&&arr.every(x=>question.answer.map(String).includes(x));
  }else if(question.type==='number')valid=/^\d+$/.test(raw)&&Number(raw)===question.answer;
  else valid=question.answer!==null&&Math.abs(parseProb(raw)-question.answer)<0.0001;
  attempts++;if(valid)correct++;
  const notice=document.getElementById('practice-feedback');notice.className=`prob-notice visible ${valid?'success':'error'}`;
  const answer=question.type==='set'?display(question.answer):question.type==='prob'?(question.answer===null?'Indefinida (S vacío)':`${question.answer.toFixed(4)} (${(question.answer*100).toFixed(2)}%)`):String(question.answer);
  notice.textContent=`${valid?'¡Correcto!':'Revisa tu respuesta.'} ${question.explain} Respuesta: ${answer}`;
  document.getElementById('practice-score').textContent=`${correct} aciertos de ${attempts} intentos`;
 }
 document.addEventListener('DOMContentLoaded',()=>{
  document.addEventListener('prob:expression-evaluated',e=>{showProbability(e.detail);persist();});
  document.addEventListener('prob:expression-invalid',()=>{const n=document.getElementById('prob-expression-probability-work');if(n)n.textContent='—';});
  document.getElementById('prob-expression-input')?.addEventListener('input',persist);
  for(const id of ['prob-s-apply','prob-a-apply','prob-b-apply','prob-c-apply','exp-recalculate'])document.getElementById(id)?.addEventListener('click',()=>setTimeout(persist,0));
  document.querySelectorAll('[data-experiment]').forEach(button=>button.addEventListener('click',()=>setTimeout(persist,0)));
  document.getElementById('prob-reset-saved')?.addEventListener('click',()=>{
   if(!confirm('¿Restablecer los datos iniciales y borrar los conjuntos guardados?'))return;
   localStorage.removeItem(KEY);location.reload();
  });
  document.getElementById('practice-next')?.addEventListener('click',createQuestion);
  document.getElementById('practice-check')?.addEventListener('click',check);
  document.getElementById('practice-answer')?.addEventListener('keydown',e=>{if(e.key==='Enter')check();});
  restore();
  window.expresionesConjuntos?.runExpression();
  document.addEventListener('prob:sets-changed',()=>{persist();createQuestion();});
  createQuestion();
 });
})();

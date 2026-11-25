"use strict";

(function () {
  function getSets() {
    const state = window.probabilidadConjuntos;
    return state ? state.probSets : { S: [], A: [], B: [], C: [] };
  }

  function svgText(x, y, text, className = "venn-region-count") {
    return `<text x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" class="${className}">${text}</text>`;
  }

  function expressionNames() {
    const e = window.expresionesConjuntos?.lastEvaluation;
    return [...new Set((e?.tokens || []).filter(t=>t.type==='NAME' && ['A','B','C'].includes(t.value)).map(t=>t.value))].sort();
  }
  function pair() {
    const names=expressionNames();
    return names.length===2 ? names : names.length===1 && names[0]==='C' ? ['A','C'] : ['A','B'];
  }
  function twoRegionSets() {
    const original = getSets(), [a,b]=pair();
    const sets = {...original,A:original[a],B:original[b]};
    return {
      onlyA: sets.S.filter((value) => sets.A.includes(value) && !sets.B.includes(value)),
      onlyB: sets.S.filter((value) => sets.B.includes(value) && !sets.A.includes(value)),
      both: sets.S.filter((value) => sets.A.includes(value) && sets.B.includes(value)),
      outside: sets.S.filter((value) => !sets.A.includes(value) && !sets.B.includes(value))
    };
  }

  let selectedResult = null;
  const escapeText = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const regionText = values => `${values.length} · {${values.map(escapeText).join(', ')}}`;
  // Keep actual elements inside each region, with a full accessible list.
  function svgValues(x, y, values, width = 140, height = 90) {
    const ordered = [...values];
    if (ordered.every(v => /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(v))) ordered.sort((a,b) => Number(a)-Number(b));
    const full = ordered.length ? ordered.join(', ') : '∅';
    let size=19, lines=[];
    function wrap(size) {
      const limit=Math.max(3,Math.floor(width/(size*.64))); const rows=[];
      for(const value of ordered){const v=String(value); if(rows.length && rows.at(-1).length+v.length+2<=limit) rows[rows.length-1]+=', '+v; else rows.push(v);}
      return {rows:rows.length?rows:['∅'],limit};
    }
    let layout=wrap(size);
    while(size>12 && (layout.rows.length*(size+4)+20>height || layout.rows.some(v=>v.length>layout.limit))) layout=wrap(--size);
    const max=Math.max(1,Math.floor((height-20)/(size+4)));
    lines=layout.rows.slice(0,max).map(v=>v.length>layout.limit?v.slice(0,layout.limit-1)+'…':v);
    if(layout.rows.length>max) lines[max-1]=lines[max-1].slice(0,layout.limit-1)+'…';
    const start=y-(lines.length*(size+4)+16)/2+size/2;
    return `<g><title>${escapeText(full)} · n = ${values.length}</title>${lines.map((line,i)=>`<text x="${x}" y="${start+i*(size+4)}" text-anchor="middle" dominant-baseline="middle" class="venn-region-values" style="font-size:${size}px">${escapeText(line)}</text>`).join('')}${svgText(x,start+lines.length*(size+4)+2,`n = ${values.length}`,'venn-region-size')}</g>`;
  }
  const memberships = {onlyA:[1,0,0],onlyB:[0,1,0],onlyC:[0,0,1],ab:[1,1,0],ac:[1,0,1],bc:[0,1,1],abc:[1,1,1],outside:[0,0,0]};
  const twoMemberships = {onlyA:[1,0],onlyB:[0,1],both:[1,1],outside:[0,0]};
  function chosenExpression(n) {
    const mode = document.getElementById(n===2?'venn-two-mode':'venn-three-mode')?.value || 'last';
    if(mode==='last') return window.expresionesConjuntos?.lastEvaluation?.eventExpression ?? null;
    const [a,b]=pair();
    if(n===2) return ({union:`${a}∪${b}`,intersection:`${a}∩${b}`,difference:`${a}−${b}`,symmetric:`${a}△${b}`,complement:`${a}ᶜ`})[mode] ?? null;
    return ({union:n===2?'A∪B':'A∪B∪C',intersection:n===2?'A∩B':'A∩B∩C',difference:'A−B',symmetric:'A△B',complement:'Aᶜ',ab:'A∩B',ac:'A∩C',bc:'B∩C'})[mode] ?? null;
  }
  function regionStatus(n,key) {
    const expression=chosenExpression(n);
    if(!expression) return 'none';
    const bits=n===2?twoMemberships[key]:memberships[key];
    const patterns=n===2?[0,1].map(other=>{const [a,b]=pair(); const map={[a]:bits[0],[b]:bits[1]}; return ['A','B','C'].map(k=>map[k]??other); }):[bits];
    const matches=patterns.map(([a,b,c])=>window.expresionesConjuntos.evaluateExpression(expression,{S:['x'],A:a?['x']:[],B:b?['x']:[],C:c?['x']:[]}).result.length>0);
    return matches.every(Boolean)?'full':matches.some(Boolean)?'partial':'none';
  }
  function partialNote(n, regions) {
    return Object.keys(regions).some(key=>regionStatus(n,key)==='partial') ? '<p>Algunas regiones están seleccionadas parcialmente; consulta el diagrama de tres conjuntos para el resaltado exacto.</p>' : '';
  }

  function chosenElements(n) {
    const expression=chosenExpression(n);
    return expression ? window.expresionesConjuntos.evaluateExpression(expression,getSets()).result : null;
  }
  function highlightOverlay(n, regions) {
    const result=chosenElements(n); if(!Array.isArray(result)) return '';
    const keys=n===2?['onlyA','onlyB','both','outside']:['onlyA','onlyB','onlyC','ab','ac','bc','abc','outside'];
    // SVG masks use the exact circle geometry to highlight membership regions.
    const circles=n===2?[[330,260,190],[570,260,190]]:[[320,255,205],[580,255,205],[450,480,205]];
    const masks=keys.map((key,i)=>{
      const status=regionStatus(n,key);
      if(status==='none') return '';
      const memberships=n===2?{onlyA:[1,0],onlyB:[0,1],both:[1,1],outside:[0,0]}:{onlyA:[1,0,0],onlyB:[0,1,0],onlyC:[0,0,1],ab:[1,1,0],ac:[1,0,1],bc:[0,1,1],abc:[1,1,1],outside:[0,0,0]};
      const bits=memberships[key], id='venn-mask-'+n+'-'+i;
      const shapes=circles.map(([cx,cy,r],j)=>`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${bits[j]?'white':'black'}"/>`).join('');
      // subtract nonmember circles after positive intersections
      const positives=circles.map(([cx,cy,r],j)=>bits[j]?`<circle cx="${cx}" cy="${cy}" r="${r}" fill="white"/>`:'').join('');
      const negatives=circles.map(([cx,cy,r],j)=>!bits[j]?`<circle cx="${cx}" cy="${cy}" r="${r}" fill="black"/>`:'').join('');
      const base=bits.some(Boolean)?`<rect width="900" height="760" fill="black"/>${positives}${negatives}`:`<rect width="900" height="760" fill="white"/>${negatives}`;
      // Intersection of positive circles is achieved with nested clip paths.
      let area=`<rect x="20" y="20" width="${860}" height="${n===2?496:720}"/>`;
      const positive=circles.map((c,j)=>bits[j]?j:-1).filter(j=>j>=0);
      positive.forEach((j,k)=>{const c=circles[j]; area=`<g clip-path="url(#clip-${n}-${i}-${k})">${area}</g>`;});
      const defs=positive.map((j,k)=>{const [cx,cy,r]=circles[j];return `<clipPath id="clip-${n}-${i}-${k}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath>`;}).join('');
      return `<defs>${defs}<mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="900" height="760">${base}</mask></defs><g mask="url(#${id})" fill="${status==='full'?'#75d6ae':'#f5d17a'}" opacity="1">${area}</g>`;
    }).join('');
    return masks;
  }

  function renderTwoSetVenn() {
    const container = document.getElementById("prob-venn-two");
    if (!container) return;
    const [a,b]=pair();
    const regions = twoRegionSets();
    container.innerHTML = `
      ${Array.isArray(chosenElements(2)) ? '<div class="venn-key">Verde: resultado · Gris: fuera del resultado · Ámbar: selección parcial</div>' : ''}
      <svg class="${Array.isArray(chosenElements(2)) ? 'venn-active' : ''}" viewBox="0 0 900 536" role="img" aria-label="Diagrama de Venn de dos conjuntos">
        <rect x="20" y="20" width="860" height="496" rx="12" class="venn-universal"/>
        <circle cx="330" cy="260" r="190" class="venn-circle venn-a"/>
        <circle cx="570" cy="260" r="190" class="venn-circle venn-b"/>
        ${highlightOverlay(2, regions)}<circle cx="330" cy="260" r="190" fill="none" stroke="#526b80" stroke-width="2.5"/><circle cx="570" cy="260" r="190" fill="none" stroke="#526b80" stroke-width="2.5"/>
        ${svgValues(260, 260, regions.onlyA, 180, 145)}
        ${svgValues(450, 260, regions.both, 120, 150)}
        ${svgValues(640, 260, regions.onlyB, 180, 145)}
        ${svgValues(765, 65, regions.outside, 185, 75)}
        ${svgText(330, 95, a, "venn-set-name")}
        ${svgText(570, 95, b, "venn-set-name")}
        ${svgText(850, 490, "S", "venn-set-name")}
      </svg>
      <div class="venn-legend">
        <span>Solo ${a}: <strong>${regionText(regions.onlyA)}</strong></span>
        <span>${a} ∩ ${b}: <strong>${regionText(regions.both)}</strong></span>
        <span>Solo ${b}: <strong>${regionText(regions.onlyB)}</strong></span>
        <span>Exterior: <strong>${regionText(regions.outside)}</strong></span>
      </div>${partialNote(2, regions)}`;
  }

  function threeRegionSets() {
    const sets = getSets();
    return {
      onlyA: sets.S.filter((value) => sets.A.includes(value) && !sets.B.includes(value) && !sets.C.includes(value)),
      onlyB: sets.S.filter((value) => !sets.A.includes(value) && sets.B.includes(value) && !sets.C.includes(value)),
      onlyC: sets.S.filter((value) => !sets.A.includes(value) && !sets.B.includes(value) && sets.C.includes(value)),
      ab: sets.S.filter((value) => sets.A.includes(value) && sets.B.includes(value) && !sets.C.includes(value)),
      ac: sets.S.filter((value) => sets.A.includes(value) && !sets.B.includes(value) && sets.C.includes(value)),
      bc: sets.S.filter((value) => !sets.A.includes(value) && sets.B.includes(value) && sets.C.includes(value)),
      abc: sets.S.filter((value) => sets.A.includes(value) && sets.B.includes(value) && sets.C.includes(value)),
      outside: sets.S.filter((value) => !sets.A.includes(value) && !sets.B.includes(value) && !sets.C.includes(value))
    };
  }

  function renderThreeSetVenn() {
    const container = document.getElementById("prob-venn-three");
    if (!container) return;
    const regions = threeRegionSets();
    container.innerHTML = `
      <svg class="${Array.isArray(chosenElements(3)) ? 'venn-active' : ''}" viewBox="0 0 900 760" role="img" aria-label="Diagrama de Venn de tres conjuntos">
        <rect x="20" y="20" width="860" height="720" rx="12" class="venn-universal"/>
        <circle cx="320" cy="255" r="205" class="venn-circle venn-a"/>
        <circle cx="580" cy="255" r="205" class="venn-circle venn-b"/>
        <circle cx="450" cy="480" r="205" class="venn-circle venn-c"/>
        ${highlightOverlay(3, regions)}<circle cx="320" cy="255" r="205" fill="none" stroke="#526b80" stroke-width="2.5"/><circle cx="580" cy="255" r="205" fill="none" stroke="#526b80" stroke-width="2.5"/><circle cx="450" cy="480" r="205" fill="none" stroke="#526b80" stroke-width="2.5"/>
        ${svgValues(245, 220, regions.onlyA, 160, 130)}
        ${svgValues(655, 220, regions.onlyB, 160, 130)}
        ${svgValues(450, 590, regions.onlyC, 220, 115)}
        ${svgValues(450, 195, regions.ab, 120, 100)}
        ${svgValues(330, 410, regions.ac, 110, 85)}
        ${svgValues(570, 410, regions.bc, 110, 85)}
        ${svgValues(450, 350, regions.abc, 110, 80)}
        ${svgValues(775, 65, regions.outside, 165, 75)}
        ${svgText(320, 78, "A", "venn-set-name")}
        ${svgText(580, 78, "B", "venn-set-name")}
        ${svgText(450, 665, "C", "venn-set-name")}
        ${svgText(850, 710, "S", "venn-set-name")}
      </svg>
      <div class="venn-legend venn-legend-three">
        <span>A solo <strong>${regionText(regions.onlyA)}</strong></span>
        <span>B solo <strong>${regionText(regions.onlyB)}</strong></span>
        <span>C solo <strong>${regionText(regions.onlyC)}</strong></span>
        <span>A∩B <strong>${regionText(regions.ab)}</strong></span>
        <span>A∩C <strong>${regionText(regions.ac)}</strong></span>
        <span>B∩C <strong>${regionText(regions.bc)}</strong></span>
        <span>A∩B∩C <strong>${regionText(regions.abc)}</strong></span>
        <span>Exterior <strong>${regionText(regions.outside)}</strong></span>
      </div>`;
  }

  function renderHighlightedExpression(evaluation) {
    const expressionSets = evaluation?.result;
    for (const id of ["venn-two-mode", "venn-three-mode"]) { const select = document.getElementById(id); if (select) select.value = "last"; }
    const note = document.getElementById("prob-venn-expression-note");
    
    if (expressionSets && Array.isArray(expressionSets)) {
      selectedResult = expressionSets;
      renderVenn();
      if (note) note.textContent = `Última expresión: ${evaluation.interpreted} · Resultado: {${expressionSets.join(", ")}} · Cardinalidad: ${expressionSets.length}${evaluation.probabilityQuery ? (getSets().S.length ? ` · Probabilidad: ${(100*expressionSets.length/getSets().S.length).toFixed(2)}%` : " · Probabilidad indefinida") : ""}`;
    } else {
      selectedResult = null;
      renderVenn();
      if (note) note.textContent = "Evalúa una expresión para identificar el conjunto resaltado en la visualización.";
    }
  }

  function renderVenn() {
    const names=expressionNames(), [a,b]=pair();
    const view=document.getElementById('venn-view')?.value || 'auto';
    const two=document.getElementById('venn-two-panel'), three=document.getElementById('venn-three-panel');
    const mode=document.getElementById('venn-two-mode');
    if(mode) {
      const labels={union:`${a} ∪ ${b}`,intersection:`${a} ∩ ${b}`,difference:`${a} − ${b}`,symmetric:`${a} △ ${b}`,complement:`${a}ᶜ`};
      for(const option of mode.options) if(labels[option.value]) option.textContent=labels[option.value];
      mode.options[0].disabled=names.length===3;
      if(names.length===3 && mode.value==='last' && view==='both') mode.value='union';
    }
    if(two) two.style.display=view==='auto' && names.length===3?'none':'';
    if(three) three.style.display=view==='auto' && names.length>0 && names.length<3?'none':'';
    const heading=document.getElementById('venn-two-heading'); if(heading) heading.textContent=`Dos conjuntos: ${a} y ${b}`;
    const hint=document.getElementById('venn-view-note'); if(hint) hint.textContent=names.length===3?'La expresión utiliza tres conjuntos. El diagrama de tres conjuntos representa el resultado exacto. En la vista de ambos, el diagrama de dos conjuntos permite explorar operaciones independientes.':names.length?'Se selecciona automáticamente el diagrama según los conjuntos de la expresión.':'Evalúa una expresión o explora ambos diagramas.';
    if(!(view==='auto' && names.length===3)) renderTwoSetVenn();
    renderThreeSetVenn();
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderVenn();
    document.getElementById("venn-view")?.addEventListener("change",renderVenn);
    ["venn-two-mode","venn-three-mode"].forEach(id=>document.getElementById(id)?.addEventListener("change",renderVenn));
    document.addEventListener("prob:expression-evaluated",event=>renderHighlightedExpression(event.detail));
    document.addEventListener("prob:expression-invalid",()=>renderHighlightedExpression(null));
    renderHighlightedExpression(window.expresionesConjuntos?.lastEvaluation);
    const observer = new MutationObserver(() => renderVenn());
    const foundationPage = document.getElementById("page-10");
    if (foundationPage) observer.observe(foundationPage, { childList: true, subtree: true, attributes: true });
  });

  window.vennConjuntos = { renderVenn, twoRegionSets, threeRegionSets };
})();
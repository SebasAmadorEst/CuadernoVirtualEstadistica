"use strict";

(function () {
  const probSetNames = ["S", "A", "B", "C"];
  const probSets = {
    S: [1, 2, 3, 4, 5, 6],
    A: [2, 4, 6],
    B: [4, 5, 6],
    C: [2, 3, 5]
  };

  function formatElement(value) {
    return String(value);
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function uniqueElements(values) {
    return [...new Set(values.map(formatElement))];
  }

  function parseSetInput(raw) {
    return uniqueElements(String(raw).split(/[,;\n\t ]+/).map((value) => value.trim()).filter(Boolean));
  }

  function union(a, b) {
    const result = uniqueElements([...a, ...b]);
    if (result.every((value) => /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(value))) {
      return result.sort((left, right) => Number(left) - Number(right));
    }
    return result;
  }
  function intersection(a, b) { return a.filter((value) => b.includes(value)); }
  function complement(a, universal) { return universal.filter((value) => !a.includes(value)); }
  function difference(a, b) { return a.filter((value) => !b.includes(value)); }
  function symmetricDifference(a, b) { return union(difference(a, b), difference(b, a)); }
  function intersection3(a, b, c) {
    return intersection(intersection(a, b), c);
  }

  function greatestCommonDivisor(a, b) {
    let left = Math.abs(a);
    let right = Math.abs(b);
    while (right) [left, right] = [right, left % right];
    return left || 1;
  }

  function simplifiedFraction(numerator, denominator) {
    if (!denominator) return "0/1";
    const divisor = greatestCommonDivisor(numerator, denominator);
    return `${numerator / divisor}/${denominator / divisor}`;
  }

  function probabilitySummary(result) {
    if (!probSets.S.length) return { decimal: 0, percent: 0, fraction: "0/1" };
    const numerator = result.length;
    const denominator = probSets.S.length;
    const decimal = numerator / denominator;
    return { decimal, percent: decimal * 100, fraction: simplifiedFraction(numerator, denominator) };
  }

  function normalizeSets() {
    probSets.S = uniqueElements(probSets.S);
    probSets.A = uniqueElements(probSets.A).filter((value) => probSets.S.includes(value));
    probSets.B = uniqueElements(probSets.B).filter((value) => probSets.S.includes(value));
    probSets.C = uniqueElements(probSets.C).filter((value) => probSets.S.includes(value));
  }

  function renderSets() {
    normalizeSets();
    probSetNames.forEach((name) => {
      const input = document.getElementById(`prob-${name.toLowerCase()}-input`);
      if (input) input.value = probSets[name].join(", ");
    });
    setText("prob-s-cardinality", String(probSets.S.length));
    setText("prob-a-cardinality", String(probSets.A.length));
    setText("prob-b-cardinality", String(probSets.B.length));
    setText("prob-c-cardinality", String(probSets.C.length));
    setText("prob-s-result", `{${probSets.S.join(", ")}}`);
    renderCardinality();
  }

  function renderOperation(operation) {
    let result;
    let title;
    let notation;
    const a = probSets.A;
    const b = probSets.B;
    switch (operation) {
      case "union": result = union(a, b); title = "Unión"; notation = "A ∪ B"; break;
      case "intersection": result = intersection(a, b); title = "Intersección"; notation = "A ∩ B"; break;
      case "complement": result = complement(a, probSets.S); title = "Complemento"; notation = "Aᶜ = S − A"; break;
      case "difference": result = difference(a, b); title = "Diferencia"; notation = "A − B"; break;
      default: result = symmetricDifference(a, b); title = "Diferencia simétrica"; notation = "A △ B";
    }
    setText("prob-operation-title", `${title}: ${notation}`);
    setText("prob-operation-result", `{${result.join(", ")}}`);
    setText("prob-operation-cardinality", String(result.length));
    const probability = probSets.S.length ? result.length / probSets.S.length : 0;
    setText("prob-operation-probability", `${probability.toFixed(4)} · ${(probability * 100).toFixed(2)}%`);
  }

  function updateSet(name) {
    const input = document.getElementById(`prob-${name.toLowerCase()}-input`);
    if (!input) return;
    const values = parseSetInput(input.value);
    if (name !== "S") {
      const outside = values.filter((value) => !probSets.S.includes(value));
      if (outside.length) {
        const notice = document.getElementById("prob-set-notice");
        notice.textContent = `Los elementos ${outside.join(", ")} no pertenecen a S y se descartaron.`;
        notice.className = "prob-notice visible error";
        probSets[name] = values.filter((value) => probSets.S.includes(value));
      } else {
        probSets[name] = values;
        const notice = document.getElementById("prob-set-notice");
        notice.textContent = `${name} actualizado correctamente.`;
        notice.className = "prob-notice visible success";
      }
    } else {
      probSets.S = values;
      normalizeSets();
      const notice = document.getElementById("prob-set-notice");
      notice.textContent = `S actualizado. Los eventos fueron restringidos a los elementos válidos de S.`;
      notice.className = "prob-notice visible success";
    }
    refreshSets();
  }

  function refreshSets() {
    renderSets();
    renderOperation(document.querySelector("[data-operation].active")?.dataset.operation || "union");
    document.dispatchEvent(new CustomEvent("prob:sets-changed"));
  }

  function replaceSets(sets) {
    for (const name of probSetNames) probSets[name] = uniqueElements(sets[name]);
    refreshSets();
  }

  function renderCardinality() {
    const ab = intersection(probSets.A, probSets.B);
    const ac = intersection(probSets.A, probSets.C);
    const bc = intersection(probSets.B, probSets.C);
    const abc = intersection3(probSets.A, probSets.B, probSets.C);
    const unionAB = union(probSets.A, probSets.B);
    const differenceAB = difference(probSets.A, probSets.B);
    const symmetricAB = symmetricDifference(probSets.A, probSets.B);
    const unionABC = union(union(probSets.A, probSets.B), probSets.C);

    const twoFormula = probSets.A.length + probSets.B.length - ab.length;
    const threeFormula = probSets.A.length + probSets.B.length + probSets.C.length
      - ab.length - ac.length - bc.length + abc.length;

    setText("prob-card-s", String(probSets.S.length));
    setText("prob-card-a", String(probSets.A.length));
    setText("prob-card-b", String(probSets.B.length));
    setText("prob-card-c", String(probSets.C.length));

    const resultContainer = document.getElementById("prob-card-results");
    if (resultContainer) {
      resultContainer.innerHTML = `
        <div class="prob-result"><strong>Aᶜ = S − A</strong><code>n(Aᶜ) = ${probSets.S.length} − ${probSets.A.length} = ${complement(probSets.A, probSets.S).length}</code></div>
        <div class="prob-result"><strong>A − B</strong><code>n(A−B) = ${probSets.A.length} − ${ab.length} = ${differenceAB.length} · conjunto {${differenceAB.join(", ")}}</code></div>
        <div class="prob-result"><strong>A △ B</strong><code>n = ${probSets.A.length} + ${probSets.B.length} − 2(${ab.length}) = ${symmetricAB.length} · conjunto {${symmetricAB.join(", ")}}</code></div>
        <div class="prob-result"><strong>A ∪ B</strong><code>n = ${probSets.A.length} + ${probSets.B.length} − ${ab.length} = ${twoFormula} · directo = ${unionAB.length}</code></div>
        <div class="prob-result"><strong>A ∪ B ∪ C</strong><code>fórmula = ${threeFormula} · directo = ${unionABC.length}</code></div>`;
    }

    const verification = document.getElementById("prob-card-verification");
    if (verification) {
      const valid = unionAB.length === twoFormula && unionABC.length === threeFormula;
      verification.textContent = valid
        ? `Verificación correcta: ${unionAB.length} = n(A∪B) y ${unionABC.length} = n(A∪B∪C).`
        : "La cardinalidad requiere revisión.";
      verification.className = `prob-notice visible ${valid ? "success" : "error"}`;
    }

    const probabilityContainer = document.getElementById("probability-results");
    if (probabilityContainer) {
      const operations = [
        ["A", probSets.A], ["B", probSets.B], ["Aᶜ", complement(probSets.A, probSets.S)],
        ["A ∪ B", unionAB], ["A − B", differenceAB], ["A △ B", symmetricAB], ["A ∪ B ∪ C", unionABC]
      ];
      probabilityContainer.innerHTML = operations.map(([label, elements]) => {
        const summary = probabilitySummary(elements);
        return `<div class="prob-result"><strong>P(${label})</strong><code>${summary.decimal.toFixed(4)} · ${(summary.percent).toFixed(2)}% · ${summary.fraction}</code></div>`;
      }).join("");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderSets();
    renderOperation("union");

    probSetNames.forEach((name) => {
      const button = document.getElementById(`prob-${name.toLowerCase()}-apply`);
      if (button) button.addEventListener("click", () => updateSet(name));
    });

    document.querySelectorAll(".prob-actions button[data-operation]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelectorAll(".prob-actions button[data-operation]").forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        renderOperation(button.dataset.operation);
      });
    });
  });

  window.probabilidadConjuntos = { probSets, replaceSets, refreshSets, union, intersection, complement, difference, symmetricDifference };
})();
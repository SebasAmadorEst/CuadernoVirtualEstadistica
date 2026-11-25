"use strict";

(function () {
  const experiments = {
    dice: {
      S: ["1", "2", "3", "4", "5", "6"],
      A: ["2", "4", "6"],
      B: ["4", "5", "6"],
      C: ["2", "3", "5"]
    },
    coins: {
      S: ["CC", "CS", "SC", "SS"],
      A: ["CC", "CS"],
      B: ["CS", "SS"],
      C: ["CC", "SC"]
    },
    population: {
      S: ["Ana", "Beto", "Caro", "Dani"],
      A: ["Ana", "Caro"],
      B: ["Caro", "Dani"],
      C: ["Ana", "Beto"]
    }
  };

  let active = "dice";

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function unique(values) { return [...new Set(values.map(String))]; }
  function parse(input) { return unique(String(input).split(/[,;\n\t ]+/).map((value) => value.trim()).filter(Boolean)); }
  function intersection(a, b) { return a.filter((value) => b.includes(value)); }
  function union(a, b) { return unique([...a, ...b]); }
  function difference(a, b) { return a.filter((value) => !b.includes(value)); }
  function symmetric(a, b) { return union(difference(a, b), difference(b, a)); }

  function loadExperiment(name) {
    active = name;
    const experiment = experiments[name];
    ["S", "A", "B", "C"].forEach((label) => {
      document.getElementById(`exp-${label.toLowerCase()}-input`).value = experiment[label].join(", ");
    });
    document.querySelectorAll("[data-experiment]").forEach((button) => {
      button.classList.toggle("active", button.dataset.experiment === name);
    });
    calculateExperiment();
  }

  function calculateExperiment() {
    const s = parse(document.getElementById("exp-s-input").value);
    const a = parse(document.getElementById("exp-a-input").value).filter((value) => s.includes(value));
    const b = parse(document.getElementById("exp-b-input").value).filter((value) => s.includes(value));
    const c = parse(document.getElementById("exp-c-input").value).filter((value) => s.includes(value));

    const ab = intersection(a, b);
    const ac = intersection(a, c);
    const bc = intersection(b, c);
    const abc = intersection(intersection(a, b), c);
    const unionAB = union(a, b);
    const unionABC = union(union(a, b), c);

    const formulaTwo = a.length + b.length - ab.length;
    const formulaThree = a.length + b.length + c.length - ab.length - ac.length - bc.length + abc.length;
    const differenceAB = difference(a, b);
    const symmetricAB = symmetric(a, b);

    setText("exp-s-count", String(s.length));
    setText("exp-a-count", String(a.length));
    setText("exp-b-count", String(b.length));
    setText("exp-c-count", String(c.length));

    const container = document.getElementById("exp-results");
    container.innerHTML = `
      <div class="prob-result"><strong>A ∪ B</strong><code>{${unionAB.join(", ")}} · n = ${unionAB.length} · fórmula = ${formulaTwo}</code></div>
      <div class="prob-result"><strong>A ∩ C</strong><code>{${ac.join(", ")}} · n = ${ac.length}</code></div>
      <div class="prob-result"><strong>A − B</strong><code>{${differenceAB.join(", ")}} · n = ${differenceAB.length}</code></div>
      <div class="prob-result"><strong>A △ B</strong><code>{${symmetricAB.join(", ")}} · n = ${symmetricAB.length}</code></div>
      <div class="prob-result" style="border-left-color:#4f8f78"><strong>A ∪ B ∪ C</strong><code>{${unionABC.join(", ")}} · directo = ${unionABC.length} · fórmula = ${formulaThree}</code></div>`;

    const testContainer = document.getElementById("exp-probability-tests");
    const checks = [
      ["P(A)", a.length / (s.length || 1)],
      ["P(A ∪ B)", unionAB.length / (s.length || 1)],
      ["P(A △ B)", symmetricAB.length / (s.length || 1)],
      ["P(A ∪ B ∪ C)", unionABC.length / (s.length || 1)]
    ];
    testContainer.innerHTML = checks.map(([label, probability]) => {
      const valid = Number.isFinite(probability) && probability >= 0 && probability <= 1;
      return `<div class="prob-result"><strong>${label}</strong><code>${probability.toFixed(4)} · ${(probability * 100).toFixed(2)}% · ${valid ? "válida" : "inválida"}</code></div>`;
    }).join("");

    experiments[active] = { S: s, A: a, B: b, C: c };
    window.probabilidadConjuntos?.replaceSets({ S: s, A: a, B: b, C: c });
  }

  function runExpressionTests() {
    const testCases = [
      ["(A ∪ B) ∩ C", true],
      ["(A ∩ B)ᶜ", true],
      ["(A − B) ∪ C", true],
      ["(A △ B) ∩ C", true],
      ["A ∪ ∩ B", false],
      ["(A ∪ B", false],
      ["D ∪ A", false]
    ];
    const container = document.getElementById("exp-expression-tests");
    if (!container) return;
    const evaluator = window.expresionesConjuntos?.evaluateExpression;

    if (!evaluator) {
      container.innerHTML = '<div class="prob-notice visible error">El evaluador no está disponible.</div>';
      return;
    }

    container.innerHTML = testCases.map(([expression, shouldBeValid]) => {
      let valid = false;
      let detail = "";
      try {
        const result = evaluator(expression);
        valid = true;
        detail = `{${result.result.join(", ")}}`;
      } catch (error) {
        detail = error.message;
      }
      const passed = valid === shouldBeValid;
      return `<div class="prob-notice visible ${passed ? "success" : "error"}">${passed ? "✓" : "✗"} ${expression} · ${passed ? "esperado" : "inesperado"} · ${detail}</div>`;
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-experiment]").forEach((button) => {
      button.addEventListener("click", () => loadExperiment(button.dataset.experiment));
    });
    ["s", "a", "b", "c"].forEach((name) => {
      document.getElementById(`exp-${name}-input`)?.addEventListener("change", calculateExperiment);
    });
    document.getElementById("exp-recalculate")?.addEventListener("click", calculateExperiment);
    document.getElementById("exp-run-tests")?.addEventListener("click", runExpressionTests);
    loadExperiment("dice");
  });

  window.experimentosConjuntos = { experiments, loadExperiment, calculateExperiment, runExpressionTests };
})();
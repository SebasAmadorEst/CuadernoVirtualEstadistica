"use strict";

(function () {
  const allowedSymbols = new Set(["∪", "∩", "−", "△", "ᶜ", "(", ")", "^", "c", "C", " ", "\t", "\n"]);

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function ordered(values) {
    const copy = [...values];
    return copy.every(v => /^-?(?:\d+(?:\.\d*)?|\.\d+)$/.test(String(v))) ? copy.sort((a,b) => Number(a)-Number(b)) : copy;
  }

  function displaySet(values) {
    return `{${ordered(values).join(", ")}}`;
  }

  function getSets() {
    const state = window.probabilidadConjuntos;
    return state ? state.probSets : { S: [], A: [], B: [], C: [] };
  }

  function union(a, b) {
    return ordered(new Set([...a, ...b]));
  }

  function intersection(a, b) {
    return a.filter((value) => b.includes(value));
  }

  function difference(a, b) {
    return a.filter((value) => !b.includes(value));
  }

  function symmetric(a, b) {
    return union(difference(a, b), difference(b, a));
  }

  function complement(a) {
    return difference(getSets().S, a);
  }

  function normalizeExpression(expression) {
    return expression
      .replace(/COMPLEMENTO/gi, "complemento")
      .replace(/\b(?:UNION|UNIÓN)\b/gi, "∪")
      .replace(/\s+[uU]\s+/g, " ∪ ")
      .replace(/([SABC)])\s*[uU]\s*(?=[SABC(])/gi, "$1∪")
      .replace(/INTERSECCION|INTERSECCIÓN/gi, "∩")
      .replace(/DIFERENCIA_SIMETRICA|SIMETRICA|SIMÉTRICA/gi, "△")
      .replace(/-/g, "−")
      .replace(/\^c/gi, "ᶜ")
      .replace(/\b[sabc]\b/gi, name => name.toUpperCase())
      .trim();
  }

  function tokenize(expression) {
    const tokens = [];
    let index = 0;
    while (index < expression.length) {
      const character = expression[index];
      if (/\s/.test(character)) { index += 1; continue; }
      if (character === "∪" || character === "∩" || character === "−" || character === "△" || character === "ᶜ" || character === "(" || character === ")") {
        tokens.push({ type: character === "(" ? "LPAREN" : character === ")" ? "RPAREN" : character === "∪" || character === "∩" || character === "−" || character === "△" ? "OP" : "COMPLEMENT", value: character });
        index += 1;
        continue;
      }
      if (/^[A-Za-z_áéíóúÁÉÍÓÚñÑ]/.test(character)) {
        let name = "";
        while (index < expression.length && /^[A-Za-z_0-9áéíóúÁÉÍÓÚñÑ]/.test(expression[index])) {
          name += expression[index];
          index += 1;
        }
        if (/^complemento$/i.test(name)) {
          while (expression[index] === " " || expression[index] === "\t") index += 1;
          if (expression[index] !== "(") throw new Error("La palabra complemento debe ir seguida de paréntesis: complemento(A).");
          tokens.push({ type: "COMPLEMENT_FUNCTION", value: "complemento" });
        } else {
          tokens.push({ type: "NAME", value: name });
        }
        continue;
      }
      throw new Error(`Símbolo no permitido: «${character}». Usa únicamente nombres de conjuntos y los operadores ∪, ∩, −, △, ᶜ.`);
    }
    return tokens;
  }

  class ExpressionParser {
    constructor(tokens, sets = getSets()) {
      this.sets = sets;
      this.tokens = tokens;
      this.position = 0;
      this.steps = [];
    }

    current() { return this.tokens[this.position]; }

    consume(type, value) {
      const token = this.current();
      if (!token || token.type !== type || (value && token.value !== value)) return false;
      this.position += 1;
      return true;
    }

    parse() {
      if (!this.tokens.length) throw new Error("La expresión está vacía.");
      const result = this.parseUnion();
      if (this.current()) {
        if (this.current().type === "RPAREN") throw new Error("Hay un paréntesis de cierre sin uno de apertura correspondiente.");
        throw new Error(`Operador o conjunto mal ubicado cerca de «${this.current().value}».`);
      }
      return result;
    }

    record(operator, left, right, result) {
      const operation = right === null ? `${displaySet(left)}ᶜ` : `${displaySet(left)} ${operator} ${displaySet(right)}`;
      this.steps.push({ operator, operation, result: [...result], cardinality: result.length });
      return result;
    }

    parseUnion() {
      let left = this.parseAdditive();
      while (this.current()?.type === "OP" && this.current().value === "∪") {
        this.position += 1;
        if (!this.current()) throw new Error("La expresión termina después de ∪; falta el conjunto de la derecha.");
        const right = this.parseAdditive();
        left = this.record("∪", left, right, union(left, right));
      }
      return left;
    }

    parseAdditive() {
      let left = this.parseIntersection();
      while (this.current()?.type === "OP" && ["−", "△"].includes(this.current().value)) {
        const operator = this.current().value;
        this.position += 1;
        if (!this.current()) throw new Error(`La expresión termina después de ${operator}; falta el conjunto de la derecha.`);
        const right = this.parseIntersection();
        left = this.record(operator, left, right, operator === "−" ? difference(left, right) : symmetric(left, right));
      }
      return left;
    }

    parseIntersection() {
      let left = this.parseComplement();
      while (this.current()?.type === "OP" && this.current().value === "∩") {
        this.position += 1;
        if (!this.current()) throw new Error("La expresión termina después de ∩; falta el conjunto de la derecha.");
        const right = this.parseComplement();
        left = this.record("∩", left, right, intersection(left, right));
      }
      return left;
    }

    parseComplement() {
      let value;
      if (this.consume("COMPLEMENT_FUNCTION")) {
        if (!this.consume("LPAREN")) throw new Error("La función complemento requiere paréntesis.");
        value = this.parseUnion();
        if (!this.consume("RPAREN")) throw new Error("Falta cerrar el paréntesis de complemento(...). ");
        value = this.record("ᶜ", value, null, difference(this.sets.S, value));
      } else if (this.consume("LPAREN")) {
        value = this.parseUnion();
        if (!this.consume("RPAREN")) throw new Error("Hay un paréntesis de apertura sin cerrar.");
      } else {
        const token = this.current();
        if (!token || token.type !== "NAME") {
          if (token?.type === "OP") throw new Error(`Operador «${token.value}» mal ubicado. Hace falta un conjunto antes o después del operador.`);
          throw new Error("Se esperaba un nombre de conjunto o un paréntesis.");
        }
        this.position += 1;
        const sets = this.sets;
        if (!Object.prototype.hasOwnProperty.call(sets, token.value)) throw new Error(`El conjunto «${token.value}» no existe. Conjuntos disponibles: ${Object.keys(sets).join(", ")}.`);
        value = [...sets[token.value]];
      }

      while (this.consume("COMPLEMENT")) value = this.record("ᶜ", value, null, difference(this.sets.S, value));
      return value;
    }
  }

  function validateBalanced(expression) {
    let depth = 0;
    for (const character of expression) {
      if (character === "(") depth += 1;
      if (character === ")") {
        depth -= 1;
        if (depth < 0) throw new Error("Hay un paréntesis de cierre sin uno de apertura correspondiente.");
      }
    }
    if (depth !== 0) throw new Error("Hay un paréntesis de apertura sin cerrar.");
  }

  function evaluateExpression(original, sets = getSets()) {
    const normalized = normalizeExpression(original);
    validateBalanced(normalized);
    const probabilityQuery = /^p\s*\(/i.test(normalized);
    let eventExpression = normalized;
    if (probabilityQuery) {
      const wrapped = normalized.replace(/^p\s*/i, "");
      let depth = 0;
      for (let i = 0; i < wrapped.length; i++) {
        if (wrapped[i] === "(") depth++;
        if (wrapped[i] === ")" && --depth === 0 && i !== wrapped.length - 1) throw new Error("Escribe toda la consulta dentro de P(...).");
      }
      eventExpression = wrapped.slice(1, -1);
    }
    const tokens = tokenize(eventExpression);
    const parser = new ExpressionParser(tokens, sets);
    const result = parser.parse();
    const uniqueResult = ordered([...new Set(result)].filter((value) => sets.S.includes(value)));
    return { original, interpreted: probabilityQuery ? `P(${eventExpression})` : normalized, probabilityQuery, eventExpression: eventExpression, result: uniqueResult, tokens, steps: parser.steps };
  }

  function renderSteps(steps, result) {
    const container = document.getElementById("prob-expression-steps");
    if (!container) return;
    container.replaceChildren();
    const list = document.createElement("ol");
    list.className = "prob-trace-list";
    if (!steps.length) {
      const item = document.createElement("li");
      item.textContent = `El conjunto ya está definido: ${displaySet(result)}. No requiere operaciones adicionales.`;
      list.appendChild(item);
    }
    steps.forEach((step) => {
      const item = document.createElement("li");
      const operation = document.createElement("span");
      operation.className = "prob-trace-operation";
      operation.textContent = `${step.operation} = ${displaySet(step.result)}`;
      const count = document.createElement("small");
      count.textContent = `Cardinalidad del resultado intermedio: ${step.cardinality}`;
      item.append(operation, count);
      list.appendChild(item);
    });
    container.appendChild(list);
  }

  function showProbabilityRows(visible) {
    for (const id of ["prob-expression-probability", "prob-expression-probability-work"]) {
      const node = document.getElementById(id);
      if (node) {
        node.parentElement.style.display = visible ? "" : "none";
        if (!visible) node.textContent = "—";
      }
    }
  }

  function runExpression() {
    const input = document.getElementById("prob-expression-input");
    const notice = document.getElementById("prob-expression-notice");
    if (!input || !notice) return;
    try {
      const evaluation = evaluateExpression(input.value);
      renderSteps(evaluation.steps, evaluation.result);
      const probability = getSets().S.length ? evaluation.result.length / getSets().S.length : null;
      setText("prob-expression-original", evaluation.original);
      setText("prob-expression-interpreted", evaluation.interpreted);
      setText("prob-expression-result", displaySet(evaluation.result));
      setText("prob-expression-cardinality", String(evaluation.result.length));
      showProbabilityRows(evaluation.probabilityQuery);
      if (evaluation.probabilityQuery) setText("prob-expression-probability", probability === null ? "Indefinida (S vacío)" : `${evaluation.result.length}/${getSets().S.length} · ${probability.toFixed(4)} · ${(probability * 100).toFixed(2)}%`);
      window.expresionesConjuntos.lastEvaluation = evaluation;
      document.dispatchEvent(new CustomEvent("prob:expression-evaluated", { detail: evaluation }));
      notice.textContent = "Expresión válida. El conjunto resultado fue calculado solo con elementos de S.";
      notice.className = "prob-notice visible success";
    } catch (error) {
      const stepsContainer = document.getElementById("prob-expression-steps");
      if (stepsContainer) stepsContainer.replaceChildren();
      setText("prob-expression-original", input.value);
      setText("prob-expression-interpreted", "No interpretada");
      setText("prob-expression-result", "—");
      setText("prob-expression-cardinality", "—");
      showProbabilityRows(false);
      window.expresionesConjuntos.lastEvaluation = null;
      document.dispatchEvent(new CustomEvent("prob:expression-invalid"));
      notice.textContent = error.message;
      notice.className = "prob-notice visible error";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const evaluateButton = document.getElementById("prob-expression-evaluate");
    if (evaluateButton) evaluateButton.addEventListener("click", runExpression);
    document.querySelectorAll("[data-expression]").forEach((button) => {
      button.addEventListener("click", () => {
        const input = document.getElementById("prob-expression-input");
        if (input) {
          input.value = button.dataset.expression;
          runExpression();
        }
      });
    });
    document.addEventListener("prob:sets-changed", runExpression);
    runExpression();
  });

  window.expresionesConjuntos = { evaluateExpression, runExpression, validateBalanced, normalizeExpression, tokenize };
})();
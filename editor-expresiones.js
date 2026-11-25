"use strict";
/* Etapa 1: editor visual sin alterar el analizador ni la evaluación existentes. */
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("prob-expression-input");
    const setContainer = document.getElementById("expression-set-buttons");
    const help = document.getElementById("expression-builder-help");
    if (!input || !setContainer || !help) return;

    let selectionStart = input.value.length;
    let selectionEnd = selectionStart;
    const descriptions = {
      "∪": "Unión: reúne los elementos que están en uno o ambos conjuntos.",
      "∩": "Intersección: conserva únicamente los elementos comunes.",
      "ᶜ": "Complemento: devuelve los elementos de S que no pertenecen al conjunto o expresión anterior.",
      "−": "Diferencia: conserva los elementos del primer conjunto que no están en el segundo.",
      "△": "Diferencia simétrica: conserva los elementos que están en uno solo de los dos conjuntos.",
      "(": "Paréntesis de apertura: inicia una operación agrupada.",
      ")": "Paréntesis de cierre: termina una operación agrupada."
    };
    function rememberSelection() {
      selectionStart = input.selectionStart;
      selectionEnd = input.selectionEnd;
    }
    ["click", "keyup", "select", "input", "focus"].forEach((name) => input.addEventListener(name, rememberSelection));

    function updateInput(value, start, end, caret) {
      input.value = value.slice(0, start) + (caret.insert || "") + value.slice(end);
      const position = start + (caret.insert || "").length;
      input.focus();
      input.setSelectionRange(position, position);
      rememberSelection();
      input.dispatchEvent(new Event("input", { bubbles: true }));
    }
    function insertSymbol(symbol) {
      rememberSelection();
      const start = Math.min(selectionStart, input.value.length);
      const end = Math.min(selectionEnd, input.value.length);
      updateInput(input.value, start, end, { insert: symbol });
      help.textContent = descriptions[symbol] || `Conjunto ${symbol}: inserta su nombre en la expresión.`;
    }
    // Evita que los botones quiten el foco antes de insertar en la selección.
    const builder = document.querySelector(".expression-builder");
    builder.addEventListener("mousedown", (event) => {
      if (event.target.closest("button")) event.preventDefault();
    });
    document.querySelectorAll("[data-insert-symbol]").forEach((button) => {
      button.addEventListener("click", () => insertSymbol(button.dataset.insertSymbol));
    });
    document.getElementById("expression-probability")?.addEventListener("click", () => {
      const value = input.value.trim();
      if (!/^p\s*\(/i.test(value)) input.value = `P(${value})`;
      input.focus();
      const position = input.value.length - 1;
      input.setSelectionRange(position, position);
      rememberSelection();
      input.dispatchEvent(new Event("input", { bubbles: true }));
      help.textContent = "Escribe el evento dentro de P(...), luego pulsa Evaluar expresión.";
    });
    function renderSets() {
      // Los nombres proceden del estado real de los conjuntos cuando está disponible.
      const api = window.probabilidadConjuntos;
      const names = api && typeof api.getSets === "function"
        ? Object.keys(api.getSets()) : ["S", "A", "B", "C"];
      setContainer.replaceChildren();
      names.forEach((name) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = name;
        button.title = `Insertar conjunto ${name}`;
        button.addEventListener("click", () => insertSymbol(name));
        setContainer.appendChild(button);
      });
    }
    renderSets();
    document.getElementById("expression-clear")?.addEventListener("click", () => {
      input.value = "";
      input.focus();
      input.setSelectionRange(0, 0);
      rememberSelection();
      input.dispatchEvent(new Event("input", { bubbles: true }));
      help.textContent = "Expresión vacía. Construye una nueva con los botones.";
    });
    document.getElementById("expression-delete-selection")?.addEventListener("click", () => {
      rememberSelection();
      const start = Math.min(selectionStart, input.value.length);
      const end = Math.min(selectionEnd, input.value.length);
      if (start !== end) updateInput(input.value, start, end, { insert: "" });
      else if (start > 0) updateInput(input.value, start - 1, start, { insert: "" });
      help.textContent = "Se eliminó la selección o el carácter anterior al cursor.";
    });
  });
})();

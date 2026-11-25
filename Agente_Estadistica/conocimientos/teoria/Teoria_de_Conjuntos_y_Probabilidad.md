# Teoría de Conjuntos y Probabilidad Clásica

## Convenios

- `S` es el espacio muestral finito.
- Todo evento debe ser subconjunto de `S`.
- Los elementos son únicos dentro de cada conjunto.
- Las probabilidades usan casos reales y equiprobables:
  `P(A) = n(A)/n(S)`.
- La suma de las regiones de un diagrama de Venn debe igualar `n(S)`.

## Operaciones

- Unión: `A ∪ B = {x: x∈A o x∈B}`.
- Intersección: `A ∩ B = {x: x∈A y x∈B}`.
- Complemento: `Aᶜ = S − A`.
- Diferencia: `A − B = {x: x∈A y x∉B}`.
- Diferencia simétrica: `A △ B = (A−B) ∪ (B−A)`.

## Cardinalidad

- `n(A−B) = n(A)−n(A∩B)`.
- `n(A△B) = n(A)+n(B)−2n(A∩B)`.
- Inclusión-exclusión:
  `n(A∪B∪C) = n(A)+n(B)+n(C)−n(A∩B)−n(A∩C)−n(B∩C)+n(A∩B∩C)`.

## Precedencia

1. Paréntesis.
2. Complemento pospuesto `ᶜ`, `^c` o `complemento(...)`.
3. Intersección `∩`.
4. Diferencia `−` y diferencia simétrica `△`, de izquierda a derecha.
5. Unión `∪`, de izquierda a derecha.

## Identidades

- `A ∪ ∅ = A`
- `A ∩ S = A`
- `A ∪ Aᶜ = S`
- `A ∩ Aᶜ = ∅`
- `A−B = A∩Bᶜ`
- `A△B = (A−B)∪(B−A)`

## Verificación pedagógica

El estudiante debe comparar siempre el conteo directo con la fórmula, comprobar que la probabilidad pertenece a `[0,1]` y explicar el significado de cada región del diagrama.
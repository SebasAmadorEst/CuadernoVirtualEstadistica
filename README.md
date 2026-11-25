# 📊 Cuaderno Virtual de Estadística

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) ![UTP](https://img.shields.io/badge/UTP-2026--2-174A7E)

Cuaderno virtual interactivo de **Estadística Descriptiva, Teoría de Conjuntos y Probabilidad**, desarrollado como proyecto académico del programa de Ingeniería de Sistemas y Computación de la Universidad Tecnológica de Pereira (UTP), período 2026-2.

Su propósito es facilitar el aprendizaje mediante explicaciones teóricas, fórmulas, ejemplos resueltos, herramientas de cálculo, representaciones gráficas y actividades interactivas. El estudiante puede modificar los datos y observar cómo cambian los resultados, relacionando los conceptos matemáticos con su aplicación práctica.

## 📚 Contenido del cuaderno

El cuaderno está organizado en dos unidades y 16 páginas de contenido académico.

### Unidad I — Estadística descriptiva

| Página | Tema | Contenido |
| --- | --- | --- |
| 1 | Gestión e identificación de datos | Ingreso de observaciones e identificación de población o muestra. |
| 2 | Organización de datos | Ordenamiento y distribución de frecuencias. |
| 3 | Tendencia central | Media, mediana y moda. |
| 4 | Medidas de posición | Cuartiles e interpolación lineal. |
| 5 | Medidas de dispersión | Variabilidad absoluta y relativa. |
| 6 | Detección de valores atípicos | Rango intercuartílico y regla de Tukey. |
| 7 | Momentos estadísticos | Momentos centrales, asimetría y curtosis. |
| 8 | Representación gráfica | Gráficos de frecuencias, proporciones y caja y bigotes. |

### Unidad II — Teoría de conjuntos y probabilidad

| Página | Tema | Contenido |
| --- | --- | --- |
| 9 | Introducción a la unidad | Experimentos, espacio muestral, eventos y probabilidad clásica. |
| 10 | Fundamentos de teoría de conjuntos | Administración de S, A, B y C; pertenencia y subconjuntos. |
| 11 | Operaciones entre conjuntos | Unión, intersección, complemento, diferencia y diferencia simétrica. |
| 12 | Cardinalidad y probabilidad clásica | Conteo de elementos y principio de inclusión-exclusión. |
| 13 | Validador y evaluador de expresiones | Construcción de expresiones, validación, resolución paso a paso y consultas de probabilidad. |
| 14 | Diagramas de Venn interactivos | Visualización dinámica de regiones, elementos y cardinalidades. |
| 15 | Experimentos interactivos | Dados, dos monedas y población finita editable. |
| 16 | Autoevaluación | Preguntas interactivas con retroalimentación. |

## ✨ Funcionalidades destacadas

- Cálculos estadísticos a partir de datos ingresados por el usuario.
- Tablas de frecuencias y representaciones gráficas.
- Fórmulas y explicaciones que acompañan los resultados.
- Conjuntos editables y eliminación de elementos duplicados.
- Evaluador de expresiones con validación sintáctica, sin utilizar `eval()`.
- Resultados numéricos de conjuntos ordenados de menor a mayor.
- Consultas explícitas de probabilidad en formato fraccionario, decimal y porcentual.
- Diagramas de Venn sincronizados con las expresiones evaluadas.
- Selección automática del diagrama de dos o tres conjuntos según la expresión, con opción de exploración manual.
- Resaltado de regiones incluso cuando están vacías, mostrando sus elementos y cardinalidades.
- Experimentos y actividades de autoevaluación.
- Persistencia local de datos en el navegador.

## 🧮 Evaluador de expresiones

En la página 13 se pueden construir expresiones utilizando los conjuntos definidos previamente. El sistema valida la sintaxis, muestra el resultado y desarrolla las operaciones paso a paso.

| Expresión | Significado |
| --- | --- |
| `A ∪ B` o `AuB` | Unión |
| `A ∩ B` | Intersección |
| `A − B` | Diferencia |
| `A △ B` | Diferencia simétrica |
| `Aᶜ` o `A^c` | Complemento respecto a S |
| `(A ∪ B) ∩ C` | Expresión compuesta |
| `P(A)` | Probabilidad de A |
| `P(A ∪ B)` | Probabilidad de la unión |
| `P(A ∩ B ∩ C)` | Probabilidad de la intersección triple |

La precedencia de operadores es: paréntesis, complemento, intersección, diferencia y diferencia simétrica, y finalmente unión.

**Ejemplo:** si S = {1, 2, 3, 4, 5, 6}, A = {2, 4, 6} y B = {4, 5, 6}, entonces `A ∪ B` devuelve {2, 4, 5, 6}. La consulta `P(A ∪ B)` devuelve 4/6 = 2/3 ≈ 66,67 % bajo el supuesto de resultados equiprobables.

## 🎨 Diagramas de Venn

La página 14 representa gráficamente las expresiones de la página 13. Los colores distinguen las regiones seleccionadas (verde), las no seleccionadas (gris) y las selecciones parciales (ámbar, cuando corresponda en la exploración manual).

El modo automático utiliza los conjuntos involucrados en la expresión para elegir la representación adecuada. Las regiones vacías también pueden resaltarse: su selección depende de la expresión matemática y no de su cardinalidad.

## 🚀 Cómo ejecutar el proyecto

No se requiere instalar dependencias de JavaScript ni compilar el código.

1. Descarga el repositorio mediante **Code → Download ZIP** en GitHub.
2. Descomprime el archivo.
3. Localiza la carpeta que contiene `index.html` y ábrelo en un navegador moderno.

### Alternativa: servidor local

Desde una terminal ubicada en la carpeta que contiene `index.html`, ejecuta:

```bash
python3 -m http.server 4173
```

Abre [http://localhost:4173](http://localhost:4173) en el navegador. Para detener el servidor, presiona `Ctrl+C`.

> Se recomienda conexión a Internet para cargar Chart.js y las tipografías externas. Los cálculos y módulos de probabilidad se ejecutan en el navegador.

## 📁 Estructura del proyecto

Estructura principal, relativa a la carpeta que contiene `index.html`:

```text
Estadistica/
├── index.html
├── probabilidad.css
├── probabilidad.js
├── expresiones.js
├── editor-expresiones.js
├── venn.js
├── experimentos.js
├── mejoras-integradas.js
├── imagenes/
├── Agente_Estadistica/
│   ├── config/
│   ├── conocimientos/
│   ├── prompts_ejemplo/
│   └── README.md
└── README.md
```

| Archivo | Responsabilidad |
| --- | --- |
| `index.html` | Interfaz, navegación y contenido académico. |
| `probabilidad.css` | Estilos de la Unidad II. |
| `probabilidad.js` | Gestión de conjuntos, operaciones y cardinalidades. |
| `expresiones.js` | Análisis y evaluación de expresiones. |
| `editor-expresiones.js` | Constructor interactivo de expresiones. |
| `venn.js` | Representación dinámica mediante SVG. |
| `experimentos.js` | Experimentos y comprobaciones. |
| `mejoras-integradas.js` | Funcionalidades complementarias y persistencia. |

## 🤖 Agente educativo

La carpeta `Agente_Estadistica/` contiene documentación teórica, instrucciones, una plantilla de configuración y ejemplos de uso para integrar un agente educativo de inteligencia artificial. Es un recurso complementario; no requiere que se configure una API para utilizar el cuaderno web.

## 🛠️ Tecnologías utilizadas

- **HTML5:** estructura y contenido.
- **CSS3:** presentación y diseño de la interfaz.
- **JavaScript:** cálculos, validaciones e interactividad.
- **Chart.js:** representación de datos estadísticos.
- **SVG:** diagramas de Venn dinámicos.
- **LocalStorage:** almacenamiento local de información.

## 🎓 Contexto académico

**Universidad:** Universidad Tecnológica de Pereira (UTP)  
**Programa:** Ingeniería de Sistemas y Computación  
**Área:** Estadística  
**Período:** 2026-2

Este proyecto tiene fines educativos y busca complementar el estudio de la estadística y la probabilidad mediante la experimentación y la visualización matemática. Los resultados deben interpretarse de acuerdo con los supuestos y convenciones de cada tema.

---

*Aprender estadística no es solamente aplicar fórmulas, sino comprender qué representan los datos y cómo interpretar sus resultados.*

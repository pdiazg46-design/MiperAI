# MIPERAI: Biblia de Arquitectura y Paso a Producción (Cloud)

Este documento es la regla inquebrantable de diseño y estructura del ecosistema **MiperAI**. Todo paso futuro hacia la sincronización con base de datos en la nube (Prisma/Neon) debe someterse a esta disposición sin alterar su comportamiento visual ni funcional interactivo.

## 1. Bifurcación Estructural B2B (Móvil vs Escritorio)
MiperAI no es un sitio web responsivo tradicional, es **un ecosistema dual de prevención de riesgos**.
*   **Modo Administrador (Escritorio/PC):** Acceso total al Wizard de IA para estructuración de matrices y control de historial de proyectos.
*   **Modo Prevencionista/Trabajador (Móvil/Simulador):** Entorno altamente restringido. Solo ve herramientas operativas directas (Inspecciones y Charlas AST). Todo rastro de redacción documental desaparece de su vista.

### 1.1 El Proveedor Global (DeviceSimulatorProvider)
*   **Ubicación:** Inyectado directamente en el `layout.tsx`.
*   **Propósito:** Es la única fuente de la verdad para el estado `isSimulatorEnabled`. Fuerza matemáticamente la contención de toda la aplicación dentro del envoltorio "Android S24 FE (412px)".
*   **Regla de Oro:** **Jamás** escribir lógica de "simulación de celular" dentro de las páginas hijas (`/ast` o `/inspeccion`). El hijo es agnóstico; el padre dicta el tamaño.

## 2. Dashboard Dinámico (`/src/app/page.tsx`)
El menú principal es un ser vivo que muta de interfaz corporativa a aplicación instalada según el dispositivo.

*   **Cabecera Limpia (Mobile-First):** En dispositivos móviles o bajo simulación, el subtítulo largo del logo ("Matriz inteligente...") debe ocultarse para comprimir el alto del header. 
*   **Saludo Personalizado:** El avatar del usuario no vive apretado en la barra superior móvil. Posee un bloque masivo y centrado bajo el H2 de "Bienvenido a Terreno" con translación negativa en Y (`-translate-y-3`) para un balance armónico.
*   **El Orden Sagrado de Módulos (Grid):**
    1.  **AST (Charla Diaria) - Tarjeta Verde:** Obligatoriamente de número uno en DOM. Ocupa arriba en el celular y la izquierda en el PC.
    2.  **Reporte de Hallazgos - Tarjeta Naranja:** Ocupa el segundo nodo y es el escolta del flujo.
*   **Encubrimiento Modular:** El bloque gigantesco azul del `Wizard` (Nueva Matriz) y el Historial de Proyectos quedan purgados de la memoria visual (`hidden`) cada vez que alguien entra por teléfono.

## 3. Jerarquía Funcional del Wizard (Generador de IA) y Cuantificación
La IA no dispara información al vuelo. Debe estar anclada a la configuración física del mundo de la construcción y a la estricta normativa chilena.

*   **Jerarquía de Tres Niveles:** Toda evaluación nace regida bajo el árbol: `[Proyecto]` -> `[Procedimiento Específico]` -> N x `[Maniobras / Peligros]`.
*   **Motor Cuantitativo (PxS = MR):** Todo riesgo extraído por el asistente cruza obligatoriamente las métricas de Probabilidad (1 a 4) y Severidad (1 a 4). La Magnitud resultante dictamina inquebrantablemente el renderizado visual y el nivel crítico del riesgo en la UI.
*   **Sorting Descendente:** El Wizard y el Visualizador Móvil priorizan la vida humana, interceptando la API e inyectando de arriba a abajo los riesgos más letales o higiénicamente limitantes primero, basándose puramente en su índice de Magnitud.
*   **Exportación Legal Dinámica (PDF/DOCX):** Al descargar la matriz a Word o PDF, el título heredará las máscaras espaciales de ambos inputs (`Matriz_{Proyecto}_{Procedimiento}`), garantizando validación experta con métricas numéricas formales expuestas en la tabla.

## 4. Estética General y Clean-Look
*   **Scrollbars Ocultas:** Todo el ecosistema goza de desplazamiento nativo, pero carece de la típica "barra gris" visual (implementado mediante la utility CSS customizada `@utility scrollbar-hide` en `globals.css`). 
*   **Sombras y Rounded Corners:** Se exige mantener el estilo `rounded-3xl` para contenedores pesados y `rounded-full` para botones flotantes. El look de los modales imita hardware físico premium. Ningún botón en modo terreno debe ser cuadrado clásico.

<br/>

## 5. Arquitectura de Persistencia y Base de Datos (Cloud Ready)
El sistema ha abandonado el estadio de frontend pasivo y mock data. MiperAI posee persistencia relacional estricta usando `PrismaClient` para integración directa a PostgreSQL (NeonDB).

*   **Esquema Central (\`schema.prisma\`):**
    *   La tabla `Project` consolida las Tareas y Riesgos como un objeto JSON masivo amarrado a un Procedimiento en su raíz.
    *   El modelo relacional `ASTLog` permite almacenar iteraciones de firma en terreno, adjuntando la captura nativa transaccional multimedial (fotos y audios) de Bitácoras de Terreno.
*   **Pipelines de Endpoints Inteligentes:** Endpoints asíncronos en `/api/projects` reciben el empuje de matrices generadas. Estos nutren exclusivamente en tiempo real los visores operativos Móviles (`/ast` y `/inspeccion`), vinculando dinámicamente los menús selectores a los datos reales del usuario mediante NextAuth (`userId`).
*   **Captura de Dispositivos (Device Access APIs):** Todo componente de inspección o AST móvil recurre a APIs del sistema para abrir periféricos nativos (Cámaras, Micrófonos), inyectando el material fotográfico/audio mediante cadenas Base64 hacia el pipeline Prisma (`ASTLog`) para posterior auditoría.

## 6. Motor SaaS, Monetización y Paywall B2B
MiperAI maneja múltiples suscripciones cruzadas en la base de datos para bloquear funciones de exportación oficiales sin perjudicar la experiencia core y formativa de retención (Modo FREE).

*   **Pared de Pago (Paywall):** Los usuarios de nivel `FREE` y `BASICO` pueden generar, leer, auditar y **guardar** en la nube ilimitadamente (estrategia de Data Lock-In). Sin embargo, las descargas finales de producción de nivel industrial (docx/pdf) disparan *interceptores de capa media* que dirigen coercitivamente al `/checkout`.
*   **Estructura de la Interfaz (La Huincha Naranja):** Los banners de alertas promocionales (e.g. "Días de Prueba Restantes") nunca usan `absolute` superpuesto que rompa y corte botones adyacentes. Se integran al DOM dictando un layout flex de columna superior, empujando todo el dashboard asimétricamente hacia abajo para mantener la visibilidad 100%.

<br/>

> [!WARNING]
> **ESTADO CRÍTICO PENDIENTE (REANUDAR MAÑANA)**
> 
> **Bug de Redireccionamiento / Infinite Loop en Login**
> - **Explicación:** Al intentar entrar a la URL viva de Vercel e iniciar sesión válidamente, NextAuth aparentemente falla al crear/desencriptar las cookies de sesión (probablemente un mismatch en `authOptions.secret`, ausencia de `pages: { signIn: '/login' }`, o colisión de tokens Vercel en la configuración) lo cual frena a `router.push('/wizard')` manteniéndose estático o redirigiendo ocultamente atrás a `/login`, causando que el `Loader` gire infinitamente sin imprimir red-box errors en pantalla.
> - **Solución Inminente:** 
>   1. Debemos re-construir `try/catch` avanzado interceptando un 504/401 directo.
>   2. Declarar estrictamente el `secret` exportando todo en `NEXTAUTH_SECRET` con compatibilidad Edge.
>   3. Definir `{ pages: { signIn: '/login'} }` en el route.ts de NextAuth para evitar caídas silenciosas a la build abstracta de api.

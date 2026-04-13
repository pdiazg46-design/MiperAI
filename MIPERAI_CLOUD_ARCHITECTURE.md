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

## 7. Leyes de Estabilidad en Vercel Edge (NextAuth y Enrutamiento SPA)

> [!CAUTION]
> **HISTORIAL DE PRODUCCIÓN PROTEGIDO: EVASIÓN DEL COLAPSO EN VERCEL EDGE**
>
> Durante el pase a producción, el ecosistema sufrió una caída enmascarada como `Failed to fetch` ("Unexpected token '<'") seguida de un Infinite Loop en la UI. Todo Agente de IA que toque el Auth en el futuro debe atenerse a este diagnóstico clínico para no volver a quebrar la plataforma:
> 
> 1.  **La Incompatibilidad Serial de `jose` (JWT):** NextAuth enruta su firma JWT internamente a través de la librería criptográfica `jose`. Si el callback de `jwt()` expone campos físicos con atributos no-serializables puros (Ej: Los objetos `Date` nativos como `user.createdAt` generados por Prisma), Vercel Serverless Edge interceptará un error de serialización indescifrable (`500 Error` HTML) causando que el Fetch del Frontend colapse al hacer `.json()`.
>     *   **Regla Institucional:** Está **rotundamente prohibido** almacenar objetos nativos de JavaScript (Dates, Funciones, Set) dentro del destilado `token` o `session` en `src/app/api/auth/[...nextauth]/route.ts`. Sólo se admiten Strings, Booleans o Números fijos (Ej: `user.id`, `user.role`, `user.subscriptionTier`).
> 
> 2.  **El Loop Silencioso del Soft Router (SPA):** Si el Frontend utiliza `router.push('/ruta_protegida')` tras el registro/login, Next.js emite un Soft Navigation Transition (obteniendo el RSC Payload). Si hubo alguna ligera inestabilidad de cookie o demora en la sincronización, el archivo `middleware.ts` rechazará el fetch de React abortando el RSC. Esto ocasiona que el usuario sea redirigido de vuelta al origen *sin cambiar físicamente la URL del Browser*, dejando un estado React local perpetuo (`loading === true`) que hace que los Spinners jamás se detengan.
>     *   **Regla Institucional:** Tras un suceso de Login o Registro donde NextAuth emite una nueva jerarquía estructural (cookies firmadas con `NEXTAUTH_SECRET`), el frontend **debe** aplicar invariablemente `window.location.href = '/'` para ejecutar un Hard Reload en el browser. Esto limpia los contextos de React, asegura el flush del microtask queue y materializa sin fallos la persistencia universal de la aplicación al llegar al Dashboard Principal.

### 7.1 Estado de Despliegue: Producción Activa (Vercel y Neon)

Este ecosistema **ya se encuentra vivamente desplegado y operativo en Vercel**, conectado en tiempo real a nuestra base de datos Cloud (NeonDB).

* **La Nube es la Única Verdad:** Cualquier prueba o testeo sobre la concurrencia de sesiones y renderizado móvil debe entenderse bajo las normativas del entorno en la nube. Las menciones a "simuladores" solo hacen referencia a restricciones visuales de CSS/Layout en el DOM de la aplicación, pero la data, el enrutamiento (Edge Routes) y la funcionalidad residen e interactúan al 100% con un entorno Vercel de producción real.
* Está prohibido asumir flujos pensando en entornos locales (`npm run dev`); se debe programar contemplando las restricciones de tiempo y latencia del ecosistema Vercel.

<br/>

## 8. Ecosistema Multi-Tenant y Seguridad B2B (Fase Enterprise)

MiperAI ha evolucionado de una herramienta transaccional individual a una **plataforma B2B (Multi-Tenant)**. Esto significa que las empresas compran "nodos" del ecosistema corporativo para gobernar a su propia flota.

### 8.1 Jerarquía Operativa (Escalamiento de Permisos)
*   **ROOT (Súper Administrador)**: El creador del software. Controla los planes de negocio (Ascensos a Enterprise) a través de `/admin` y goza de uso ilimitado de la API IA.
*   **ADMIN (Admin Corporativo / Empresa)**: Un cliente que compró el plan `ENTERPRISE`. Obtiene acceso a `/company`, donde puede inyectar el Logo, RUT de su empresa, y enrolar masivamente a sus trabajadores. Él es el "Dios" de su propia burbuja cerrada.
*   **PREVENCIONISTA / SUPERVISOR**: Roles de faena media. Poseen facultades dinámicas (controladas por el Admin) para acceder al motor de inteligencia artificial (Crear Matrices) y auditar en campo (Inspecciones operativas con registro de base de datos).
*   **OPERADOR**: El eslabón final y masivo. Carece de poder de generación inteligente, pero es el vector principal de trazabilidad legal. Utiliza su celular principalmente para:
    1. Visualizar de forma transparente las jerarquías de riesgo.
    2. Aplicar "**Firmas Multi-Concurrencia**" (Toma de Conocimiento) que comprueban inmutablemente ante fiscalizadores (Ej: Sernageomin) que recibió su instrucción.
    3. Iniciar reportes rápidos de hallazgos mediante acceso único de cámara, sin poder editar documentación adyacente.

### 8.2 Seguridad y Forja de Cuentas (El Túnel B2B)
El sistema ha erradicado el frotamiento burocrático de que un minero "se cree una cuenta". Los usuarios son *Forjados en Clave* por sus gerentes.
*   **Auto-Forjado y Sombra**: Cuando el *Administrador Corporativo* sube un flujo de Excel masivo (o añade manuales), las bases de datos de Prisma generan cuentas instantáneas vinculadas estrictamente a su `companyId`, estableciendo por defecto la contraseña global `Miper2026*`.
*   **Bloqueo de Primer Acceso (Túnel PxC)**: Por regulaciones severas de seguridad de la información informátia frente al cruce de accesos civiles y corporativos, todo usuario forjado nace con el flag `mustChangePassword = true`. Al efectuar su log-in inaugural, no pueden renderizar ni interactuar con los módulos de MiperAI sin antes declarar legalmente su propia contraseña bajo un flujo bloqueante de pantalla completa, desarticulando el conocimiento global de los gerentes sobre las claves personales y liberando de retención legal a la plataforma.

<br/>

## 9. Células de Eficiencia y Desacople de IA (Módulo Terreno)

Las fases operacionales de campo exigen priorizar latencia cero y solidez probatoria por encima del lujo del procesamiento en modelos largos (Gen-AI). Las inspecciones no se validan por un LLM; se validan mediante la captura pura de la responsabilidad humana.

### 9.1 Dictado Forense (Native STT)
*   Se prohíbe el uso de transferencias masivas de datos Blob/Audio hacia el storage de Vercel/Neon para los audios de campo.
*   En su lugar, el proyecto incorpora el **Native Web Speech API** para Speech-To-Text en tiempo real. Se exige usar el modo temporal pasivo (`continuous: false`, `interimResults: false`) para evadir el bug sistémico de "Eco de Bucle Infinito" característico de los navegadores móviles basados en Chromium (Android), logrando dictados de una sola ráfaga, 100% precisos y gratuitos, que se convierten a texto manual editable de forma inmediata.

### 9.2 Reportabilidad DOCX Dinámica (Client-to-Buffer)
*   **Agnosticismo del Frontend:** El panel de `Historial de Proyectos` desecha botones redundantes a favor de la consolidación de informes gerenciales. 
*   Para descargar consolidaciones formales, se ha implantado el motor `docx`, que amalgama las matrices AST, Hallazgos y transcripciones nativas STT, forzando la compilación en un `Uint8Array` dentro de la Serverless Function (`RouteHandler`) para compaginar estrictamente con las políticas de compatibilidad de `NextResponse` en Next.js 15.

### 9.3 Móvil Single-Screen Concept
*   En vista B2B de faena (`/page.tsx` modo móvil), queda vetado el formato de listado vertical pesado. Todas las sub-aplicaciones primarias (Visor AST e Inspección de Hallazgos) implementan un diseño de condensación horizontal (`Single-Screen Flex-Row`). 
*   **Regla Visual:** El usuario de campo nunca debe someterse a operaciones de *Scroll* vertical para descubrir las botoneras en su base de trabajo central. Los módulos se encogen asimétricamente y truncan textos largos garantizando el acceso táctil en solo una vista (Single-Screen).

<br/>

## 10. Pendientes Programados (Próximos Sprints)
*   **Gestión Multi-Tenant (B2B):** Vincular operativamente el registro del "Nombre de la Empresa" a todas las suscripciones de nivel `PRO`, para que el administrador central pueda firmar y adjudicar el sistema a cargo de una organización o rut corporativo específico.

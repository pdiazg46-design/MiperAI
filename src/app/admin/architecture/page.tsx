'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Users, Shield, ChevronRight, Lock, Crown, Briefcase, Zap, UserPlus, Target, Navigation } from 'lucide-react';

const plans = [
  { id: 'free', label: '1. Evaluación (FREE)' },
  { id: 'pro', label: '2. Asesor Independiente (PRO)' },
  { id: 'enterprise', label: '3. Mandante Corporativo (ENTERPRISE)' },
  { id: 'operador', label: '4. Flota de Terreno (OPERADOR)' }
];

export default function BusinessFlowMap() {
  const [activePlan, setActivePlan] = useState('free');

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-6 md:p-12 font-sans relative overflow-x-hidden flex flex-col">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto z-10 relative flex-1 w-full flex flex-col">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Arquitectura Interactiva de Negocios</h1>
            <p className="text-sm text-zinc-400 font-medium mt-2">Simulación de flujos operacionales y monetización de MiperAI.</p>
          </div>
          <Link href="/admin">
            <button className="mt-4 md:mt-0 flex items-center gap-2 bg-zinc-900 border border-zinc-800 text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-zinc-800 transition-all shadow-xl">
              <Home className="w-4 h-4 text-zinc-400" /> Volver al Centro de Mando
            </button>
          </Link>
        </header>

        {/* SELECTOR INTERACTIVO */}
        <div className="flex flex-wrap gap-3 mb-10">
           {plans.map((plan) => (
             <button
               key={plan.id}
               onClick={() => setActivePlan(plan.id)}
               className={`px-6 py-4 rounded-xl font-bold flex items-center gap-2 text-sm transition-all outline-none 
                 ${activePlan === plan.id 
                    ? plan.id === 'free' ? 'bg-zinc-100 text-black shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105' :
                      plan.id === 'pro' ? 'bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] scale-105' :
                      plan.id === 'enterprise' ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)] scale-105' :
                      'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-105'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                 }`}
             >
                {activePlan === plan.id && <Navigation className="w-4 h-4" />}
                {plan.label}
             </button>
           ))}
        </div>

        {/* VISOR CONDICIONAL */}
        <div className="flex-1 bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden transition-all duration-500">
           
           {activePlan === 'free' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-8">
                   <div className="bg-zinc-800 p-4 rounded-2xl"><Shield className="w-10 h-10 text-zinc-200" /></div>
                   <div>
                     <h2 className="text-3xl font-black text-white uppercase">Suscripción FREE</h2>
                     <p className="text-zinc-400 font-medium">El Gancho Comercial (Prueba de Pago)</p>
                   </div>
                </div>

                <div className="space-y-8">
                   <FeatureBlock
                      icon={<Users className="w-5 h-5 text-zinc-400" />}
                      title="1. El Aterrizaje (Ingreso)"
                      desc="El usuario entra desde la Landing Web o Google. Crea una cuenta sin restricciones ni tarjetas de crédito. Ideal para que el minero averigüe si la IA funciona o es mentira."
                   />
                   <FeatureBlock
                      icon={<Zap className="w-5 h-5 text-yellow-500" />}
                      title="2. La Sensación de Poder (Funciones)"
                      desc="Se le abren las compuertas al Motor de IA GPT-4o. Crea una faena, visualiza la evaluación de riesgos, interactúa con la matriz en tiempo real simulando ser un Prevencionista de primer nivel."
                   />
                   <FeatureBlock
                      icon={<Lock className="w-5 h-5 text-red-500" />}
                      title="3. El Muro (Paywall Transaccional)"
                      desc="Cuando la IA terminó de analizar los riesgos y él necesita presentar este documento de 20 páginas al mandante mañoso de la minera, presiona 'Exportar a Word/PDF'. MiperAI enciende la sirena: 'Tu licencia expiró'. Su única salida para recuperar ese trabajo terminado es sacar la Tarjeta de Crédito."
                   />
                </div>
             </div>
           )}

           {activePlan === 'pro' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <Zap className="w-[300px] h-[300px] text-blue-500" />
                </div>
                <div className="flex items-center gap-4 mb-8 relative z-10">
                   <div className="bg-blue-600 p-4 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)]"><Zap className="w-10 h-10 text-white" /></div>
                   <div>
                     <h2 className="text-3xl font-black text-blue-400 uppercase">Suscripción PRO</h2>
                     <p className="text-blue-200/60 font-medium">El Asesor Independiente de Riesgos</p>
                   </div>
                </div>

                <div className="space-y-8 relative z-10">
                   <FeatureBlock
                      icon={<Crown className="w-5 h-5 text-blue-400" />}
                      title="1. El Upgrade Financiero"
                      desc="Depositó el pago en la Pasarela (Stripe/MercadoPago). Su cuenta es elevada a tier PRO. Adquiere consultas masivas de tokens IA (GPT)."
                   />
                   <FeatureBlock
                      icon={<Briefcase className="w-5 h-5 text-blue-400" />}
                      title="2. Operatoria Profesional (Descargas y APIs)"
                      desc="Descarga un PDF o Docx oficial por cada matriz generada, perfecto, encriptado y aceptado en Chile. Le inyecta el logo global de MiperAI (o sin marca de agua). No requiere personal a cargo para sacarle valor a la plataforma."
                   />
                   <FeatureBlock
                      icon={<Lock className="w-5 h-5 text-zinc-500" />}
                      title="3. Ausencia del Panel Corporativo"
                      desc="Pese a tener todo ilimitado, funciona como un llanero solitario. Si tiene 10 maestros de obra bajo su mando, no posee manera de 'auto-enrolarlos' con un clic. Debe prestar su celular para la Charla de 5 Minutos."
                   />
                </div>
             </div>
           )}

           {activePlan === 'enterprise' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <Briefcase className="w-[300px] h-[300px] text-amber-500" />
                </div>
                <div className="flex items-center gap-4 mb-8 relative z-10">
                   <div className="bg-amber-500 p-4 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]"><Briefcase className="w-10 h-10 text-amber-950" /></div>
                   <div>
                     <h2 className="text-3xl font-black text-amber-500 uppercase">Administrador ENTERPRISE</h2>
                     <p className="text-amber-200/70 font-medium">La Constructora, Contratista o Mandante B2B</p>
                   </div>
                </div>

                <div className="space-y-8 relative z-10">
                   <FeatureBlock
                      icon={<Users className="w-5 h-5 text-amber-400" />}
                      title="1. Entorno Multi-Tenant (Su propio software)"
                      desc="Al obtener este plan, desbloquea la 'Bóveda Empresarial'. Todo el software ahora opera bajo su RUT Comercial, con su propio LOGO en los PDFs y sus Políticas Internas inyectadas globalmente."
                   />
                   <FeatureBlock
                      icon={<UserPlus className="w-5 h-5 text-amber-400" />}
                      title="2. El Sistema de Inyección de Cuentas (Forja Masiva)"
                      desc="Sube una planilla Excel con 1.000 operarios (Nombre, RUT, Correo, Rol). MiperAI crea instantáneamente 1.000 cuentas de acceso. Asigna roles: 'Supervisores' (podrán operar matrices) o 'Operadores' (Sujetos de control de terreno)."
                   />
                   <FeatureBlock
                      icon={<Target className="w-5 h-5 text-amber-400" />}
                      title="3. Panel de Mando Privado (Dashboard B2B)"
                      desc="En tiempo real, este administrador observa un semáforo rojo y verde viendo cuántos de sus contratistas han firmado digitalmente la 'Toma de Conocimiento del Riesgo' antes de que Sernageomin llegue a golpear su puerta."
                   />
                </div>
             </div>
           )}

           {activePlan === 'operador' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <Target className="w-[300px] h-[300px] text-emerald-500" />
                </div>
                <div className="flex items-center gap-4 mb-8 relative z-10">
                   <div className="bg-emerald-500 p-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)]"><Target className="w-10 h-10 text-emerald-950" /></div>
                   <div>
                     <h2 className="text-3xl font-black text-emerald-500 uppercase">El Operador (Móvil)</h2>
                     <p className="text-emerald-200/70 font-medium">Eléctrico, Rigger, Albañil o Chofer en Terreno</p>
                   </div>
                </div>

                <div className="space-y-8 relative z-10">
                   <FeatureBlock
                      icon={<Lock className="w-5 h-5 text-emerald-400" />}
                      title="1. La Celda Obligatoria (Túnel de Seguridad)"
                      desc="Nunca se registró por sí mismo. Su empresa (Enterprise) lo hizo por él otorgándole la clave comodín oficial (Miper2026*). Al iniciar sesión en la App Web por primera vez, un Muro Infranqueable le advierte legalmente que DEBE crear una contraseña estrictamente personal para seguir iterando."
                   />
                   <FeatureBlock
                      icon={<Shield className="w-5 h-5 text-emerald-400" />}
                      title="2. El Repositorio Restringido (Bolsillo Seguro)"
                      desc="Este usuario no redacta. Ingresa desde su celular en modo App y su UI colapsa módulos gigantes: solo ve los 'Informes', 'Matrices' o 'PTS' redactados superiormente por su Prevencionista."
                   />
                   <FeatureBlock
                      icon={<Zap className="w-5 h-5 text-emerald-400" />}
                      title="3. Rol Pasivo y Defensivo (La Toma de Conocimiento)"
                      desc="Físicamente asiste a la charla de seguridad (5 minutos). Tras el habla, saca el celular de su bolsillo derecho y asiente con 1 clic: 'Comprendí los peligros de la excavación hoy'. Esta firma digital se inyecta en la nube. Aparte, tiene acceso rápido a levantar Alertas de Cámara instantáneas (Auditoría Básica)."
                   />
                </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}

function FeatureBlock({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors border border-transparent hover:border-white/5">
      <div className="mt-1 bg-zinc-800 border border-zinc-700 p-2 rounded-xl text-white">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-bold text-white tracking-wide mb-1">{title}</h4>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">{desc}</p>
      </div>
    </div>
  )
}

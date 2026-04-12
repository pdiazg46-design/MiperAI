'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Home, Lightbulb, Download, UserCheck, ShieldCheck, Phone, CheckCircle2, Navigation, AlertTriangle, Briefcase, Users, FileText, Target, Lock } from 'lucide-react';

const plans = [
  { id: 'free', label: '1. Plan de Prueba (Gratis)' },
  { id: 'pro', label: '2. Profesional (PRO)' },
  { id: 'enterprise', label: '3. Nivel Empresa' },
  { id: 'operador', label: '4. El Trabajador (Terreno)' }
];

export default function UserJourneySimple() {
  const [activePlan, setActivePlan] = useState('free');

  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 p-6 md:p-12 font-sans relative overflow-x-hidden flex flex-col">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto z-10 relative flex-1 w-full flex flex-col">
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">¿Cómo funciona MiperAI?</h1>
            <p className="text-sm text-zinc-400 font-medium mt-2">Paso a paso de lo que vive el usuario dentro del software.</p>
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
                <div className="flex items-center gap-4 mb-10">
                   <div className="bg-zinc-800 p-4 rounded-2xl"><Lightbulb className="w-10 h-10 text-zinc-200" /></div>
                   <div>
                     <h2 className="text-3xl font-black text-white uppercase">El Plan Gratuito (15 Días)</h2>
                     <p className="text-zinc-400 font-medium">Así descubre una persona cómo MiperAI le facilita la vida.</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <FeatureBlock
                      icon={<UserCheck />}
                      title="Paso 1: Entrar a la plataforma"
                      desc="Te registras con tu correo en un par de clics por la web."
                   />
                   <FeatureBlock
                      icon={<Lightbulb />}
                      title="Paso 2: Hablar con la IA"
                      desc="Le dices a la plataforma qué trabajo vas a realizar (Ej: 'Soldar en un techo'). La Inteligencia Artificial analiza el trabajo y en segundos te arma una lista completa de peligros y cómo cuidarte."
                   />
                   <FeatureBlock
                      icon={<AlertTriangle className="text-red-400" />}
                      title="Paso 3: El Límite"
                      desc="Puedes ver toda esa información en pantalla, pero si quieres descargarla en un documento PDF formal para entregarlo a tu jefe, el sistema te avisará que tu prueba gratuita de 15 días terminó y debes comprar el plan PRO."
                   />
                </div>
             </div>
           )}

           {activePlan === 'pro' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-10 relative z-10">
                   <div className="bg-blue-600 p-4 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.3)]"><Download className="w-10 h-10 text-white" /></div>
                   <div>
                     <h2 className="text-3xl font-black text-blue-400 uppercase">La Suscripción PRO</h2>
                     <p className="text-blue-200/60 font-medium">Para el Asesor de Riesgos o Profesional Independiente.</p>
                   </div>
                </div>

                <div className="space-y-6 relative z-10">
                   <FeatureBlock
                      icon={<CheckCircle2 />}
                      title="Paso 1: ¡Todo el poder desbloqueado!"
                      desc="Funciona igual que el plan gratuito, pero ahora eres un profesional sin límites para generar prevenciones con Inteligencia Artificial."
                   />
                   <FeatureBlock
                      icon={<FileText />}
                      title="Paso 2: Documentos Oficiales Inmediatos"
                      desc="Ahora sí puedes presionar el botón 'Exportar' en cualquier momento. Bajas todas tus matrices en carpetas PDF o Word listas para firmar e imprimir."
                   />
                   <FeatureBlock
                      icon={<Briefcase />}
                      title="Paso 3: Tu propia marca"
                      desc="Los documentos que descargas ya no son genéricos. Pueden salir con tu logotipo en la esquina superior, luciendo como reportes corporativos de primer nivel."
                   />
                </div>
             </div>
           )}

           {activePlan === 'enterprise' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-10 relative z-10">
                   <div className="bg-amber-500 p-4 rounded-2xl shadow-[0_0_20px_rgba(245,158,11,0.3)]"><Briefcase className="w-10 h-10 text-amber-950" /></div>
                   <div>
                     <h2 className="text-3xl font-black text-amber-500 uppercase">Suscripción EMPRESA</h2>
                     <p className="text-amber-200/70 font-medium">Para la Constructora, la Minera o el Contratista.</p>
                   </div>
                </div>

                <div className="space-y-6 relative z-10">
                   <FeatureBlock
                      icon={<ShieldCheck />}
                      title="Paso 1: Tu Propio Panel de Empresa"
                      desc="Se te abre un menú especial donde subes el Logo y RUT de tu constructora. Absolutamente todos los reportes de tus trabajadores llevarán tu insignia, unificando todo el formato."
                   />
                   <FeatureBlock
                      icon={<Users />}
                      title="Paso 2: El Jefe de la Flota (Auto-registro)"
                      desc="Ya no necesitas que tus 100 obreros 'visiten una página web' para inscribirse. Tú como empresa subes un archivo Excel y la plataforma le crea una cuenta mágica a cada uno de tus trabajadores."
                   />
                   <FeatureBlock
                      icon={<Target />}
                      title="Paso 3: Tú decides quién manda"
                      desc="El Administrador puede decirle al sistema: 'A Juan dale permisos de Prevencionista para usar la IA', y 'A Pedro ponlo de Operador simple' para que solo lea a través de su celular sin tocar botones importantes."
                   />
                </div>
             </div>
           )}

           {activePlan === 'operador' && (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-4 mb-10 relative z-10">
                   <div className="bg-emerald-500 p-4 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)]"><Phone className="w-10 h-10 text-emerald-950" /></div>
                   <div>
                     <h2 className="text-3xl font-black text-emerald-500 uppercase">El Trabajador de Terreno</h2>
                     <p className="text-emerald-200/70 font-medium">Aquel que lleva la aplicación en su celular durante la obra.</p>
                   </div>
                </div>

                <div className="space-y-6 relative z-10">
                   <FeatureBlock
                      icon={<Lock />}
                      title="Paso 1: Una cuenta segura"
                      desc="Como su cuenta fue creada por su jefe en Excel, él entra inicialmente con la contraseña que el capataz le dictó. Pero por su propia privacidad, el sistema congela la pantalla al entrar y le exige crear su propia contraseña secreta."
                   />
                   <FeatureBlock
                      icon={<SmartphoneIcon />}
                      title="Paso 2: Una App ultra sencilla (Modo Lector)"
                      desc="A diferencia de los gerentes, al abrir MiperAI él ve pocos botones. No ve herramientas complicadas ni a la Inteligencia Artificial. Solo usa su celular como una 'enciclopedia de bolsillo' para revisar qué riesgos tiene su día de trabajo."
                   />
                   <FeatureBlock
                      icon={<CheckCircle2 />}
                      title="Paso 3: El check de los 5 Minutos"
                      desc="Después de escuchar al Prevencionista en la mañana, saca su celular y aprieta un enorme botón verde: 'Comprendí los peligros de hoy'. En ese segundo, su nombre viaja a la tabla del Gerente diciendo que la Ley se cumplió."
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
    <div className="flex items-start gap-5 p-5 rounded-2xl bg-zinc-950/40 border border-zinc-800/80 hover:bg-zinc-800/50 transition-colors">
      <div className="shrink-0 mt-1 bg-zinc-800 border border-zinc-700 p-3 rounded-xl text-white">
        {icon}
      </div>
      <div>
        <h4 className="text-lg font-black text-white tracking-wide mb-2">{title}</h4>
        <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-4xl">{desc}</p>
      </div>
    </div>
  )
}

function SmartphoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/>
    </svg>
  );
}

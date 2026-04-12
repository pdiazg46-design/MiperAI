'use client';
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Smartphone, AlertTriangle, CheckSquare, Square, ChevronDown, ChevronUp, AlertOctagon, ClipboardCheck, Users, ShieldCheck, Camera, Mic, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ASTViewerPage() {
  const [expandedManeuver, setExpandedManeuver] = useState<number | null>(0);
  const [checkedControls, setCheckedControls] = useState<Record<string, boolean>>({});

  const [dbProjects, setDbProjects] = useState<any[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Multimedia Capture
  const [photoData, setPhotoData] = useState<string|null>(null);
  const [audioData, setAudioData] = useState<string|null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fileInputPhotoRef = useRef<HTMLInputElement>(null);
  const fileInputAudioRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if(Array.isArray(data)) {
          setDbProjects(data);
          if(data.length > 0) setActiveProjectId(data[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const activeProject = dbProjects.find(p => p.id === activeProjectId);
  const activeProcedure = activeProject?.procedures?.[0] || null;
  
  // Extraer las maniobras (JSON almacenado)
  // Recordemos que el JSON guarda el array de 'accumulatedTasks'
  let parsedManeuvers: any[] = [];
  if (activeProcedure?.jsonPayload) {
    try {
      parsedManeuvers = JSON.parse(activeProcedure.jsonPayload);
    } catch(e) {}
  }

  const toggleControl = (controlId: string) => {
     setCheckedControls(prev => ({
        ...prev,
        [controlId]: !prev[controlId]
     }));
  };

  const handleCapture = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'audio') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64str = event.target?.result as string;
      if(type === 'photo') setPhotoData(base64str);
      else setAudioData(base64str);
    };
    reader.readAsDataURL(file);
  };

  const submitASTLog = async () => {
    if (!activeProject) return;
    setIsSubmitting(true);
    
    // Armar el objeto de controles aprobados extrayendo el texto real de la matriz
    const checkedTexts: string[] = [];
    Object.keys(checkedControls).forEach(cId => {
      if (checkedControls[cId]) {
         const parts = cId.split('_'); // Ej: c_0_0_0
         if (parts.length === 4) {
           const m = parseInt(parts[1]);
           const r = parseInt(parts[2]);
           const c = parseInt(parts[3]);
           const text = parsedManeuvers[m]?.result?.risks?.[r]?.controls?.[c];
           if (text) checkedTexts.push(text);
         }
      }
    });

    try {
      const res = await fetch('/api/ast-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProject.id,
          procedureName: activeProcedure?.name || 'General',
          photoData,
          audioData,
          checkedControls: checkedTexts
        })
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
    } catch(err) {
      alert("Error enviando reporte a BD.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800">AST Registrado Correctamente</h2>
        <p className="text-slate-500">La evidencia multimedia y la matriz firmada se han acoplado exitosamente al proyecto.</p>
        <Link href="/" className="bg-slate-900 text-white font-bold px-8 py-4 rounded-xl hover:-translate-y-1 transition-transform">
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 relative flex flex-col">
      
        {/* App Bar Móvil AST */}
        <header className="sticky top-0 z-50 bg-emerald-600/95 backdrop-blur-md border-b border-emerald-500 shadow-sm px-4 h-16 flex items-center justify-between shrink-0 text-white">
           <Link href="/" className="p-2 -ml-2 text-emerald-100 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
           </Link>
           <h1 className="font-bold tracking-tight">Visor AST (Charla)</h1>
           <div className="w-10"></div>
        </header>

        <main className="w-full max-w-md mx-auto p-4 pb-24 flex-1 overflow-y-auto scrollbar-hide">
           
           {loading ? (
             <div className="flex flex-col items-center py-20 text-slate-400">
               <Loader2 className="w-10 h-10 animate-spin mb-4" />
               <p className="font-medium text-sm">Cargando matrices en la nube...</p>
             </div>
           ) : dbProjects.length === 0 ? (
             <div className="flex flex-col items-center py-20 text-slate-400 text-center">
               <ShieldCheck className="w-12 h-12 mb-4 opacity-50" />
               <p className="font-bold">Sin proyectos activos</p>
               <p className="text-xs">Crea una matriz asistida primero en PC.</p>
             </div>
           ) : (
             <>
               {/* Selectores de Contexto */}
               <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-top-4">
                  <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
                     <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Proyecto Activo</h2>
                     <select 
                       value={activeProjectId}
                       onChange={(e) => setActiveProjectId(e.target.value)}
                       className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                     >
                        {dbProjects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                     </select>
                  </div>
               </div>

               {/* Meta Cabecera Operativo */}
               <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-200 mb-6 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <ClipboardCheck className="w-16 h-16" />
                  </div>
                  <div className="relative z-10 flex items-center gap-3">
                     <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5" />
                     </div>
                     <div>
                        <h2 className="font-bold text-slate-800 text-sm leading-tight">{activeProject?.company || 'Terreno'}</h2>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-semibold text-emerald-700">Procedimiento: {activeProcedure?.name || 'General'}</p>
                     </div>
                  </div>
               </div>

               {/* Lista de Maniobras (Acordeones) */}
               {parsedManeuvers.length === 0 ? (
                  <div className="text-center p-6 bg-yellow-50 text-yellow-700 rounded-xl font-bold border border-yellow-200 text-sm">
                    Este proyecto parece no tener maniobras registradas en la base de datos.
                  </div>
               ) : (
                 <div className="space-y-4">
                    {parsedManeuvers.map((maneuver, mIdx) => (
                       <div key={mIdx} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${mIdx * 100}ms` }}>
                          
                          {/* Header Acordeon */}
                          <button 
                             onClick={() => setExpandedManeuver(expandedManeuver === mIdx ? null : mIdx)}
                             className={`w-full flex items-center justify-between p-4 text-left transition-colors ${expandedManeuver === mIdx ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                          >
                             <div className="flex items-center gap-3 pr-4">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${expandedManeuver === mIdx ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                                   {mIdx + 1}
                                </div>
                                <h3 className="font-bold text-slate-800 text-sm leading-tight">{maneuver.taskOriginalName || maneuver.result?.task}</h3>
                             </div>
                             {expandedManeuver === mIdx ? <ChevronUp className="w-5 h-5 text-slate-400 shrink-0"/> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0"/>}
                          </button>

                          {/* Contenido Acordeon */}
                          {expandedManeuver === mIdx && (
                             <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-4">
                                {maneuver.result?.risks?.map((risk: any, rIdx: number) => (
                                   <div key={rIdx} className="bg-white border rounded-xl overflow-hidden shadow-sm">
                                      {/* Componente Peligro (Color Base según riesgo) */}
                                      <div className={`p-3 flex gap-3 ${risk.initialRiskLevel?.toLowerCase().includes('crític') || risk.initialRiskLevel?.toLowerCase().includes('alto') ? 'bg-red-50 border-b border-red-100' : 'bg-yellow-50 border-b border-yellow-100'}`}>
                                         <AlertOctagon className={`w-5 h-5 shrink-0 mt-0.5 ${risk.initialRiskLevel?.toLowerCase().includes('crític') || risk.initialRiskLevel?.toLowerCase().includes('alto') ? 'text-red-500' : 'text-yellow-600'}`} />
                                         <div>
                                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                               <span className={`text-[10px] font-bold uppercase tracking-wider ${(!risk.magnitudeRisk ? (risk.initialRiskLevel?.toLowerCase().includes('crític') || risk.initialRiskLevel?.toLowerCase().includes('alto') ? 'text-red-600' : 'text-yellow-700') : (risk.magnitudeRisk >= 9 ? 'text-red-600' : (risk.magnitudeRisk >= 5 ? 'text-yellow-700' : 'text-green-700')))}`}>
                                                 Riesgo {risk.initialRiskLevel}
                                               </span>
                                               {(risk.probability && risk.severity) && (
                                                 <span className="text-[9px] font-bold bg-white/50 px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">
                                                   P:{risk.probability} × S:{risk.severity} = MR:{risk.magnitudeRisk}
                                                 </span>
                                               )}
                                            </div>
                                            <p className="font-bold text-slate-800 text-sm leading-tight">{risk.hazard}</p>
                                            <p className="text-xs text-red-600 mt-1 font-medium italic">"{risk.incident}"</p>
                                         </div>
                                      </div>
                                      
                                      {/* Componente Control (Checklist) */}
                                      <div className="p-3 bg-white">
                                         <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                                            <ShieldCheck className="w-3 h-3" /> Controles a Verificar en Faena
                                         </p>
                                         <div className="space-y-2">
                                            {risk.controls?.map((controlStr: string, cIdx: number) => {
                                               const cId = `c_${mIdx}_${rIdx}_${cIdx}`;
                                               const isChecked = checkedControls[cId];
                                               return (
                                                  <button 
                                                     key={cIdx}
                                                     onClick={() => toggleControl(cId)}
                                                     className={`w-full flex text-left gap-3 p-3 rounded-lg border transition-all ${isChecked ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-emerald-300'}`}
                                                  >
                                                     <div className={`mt-0.5 shrink-0 ${isChecked ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                        {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                                     </div>
                                                     <p className={`text-sm tracking-tight ${isChecked ? 'text-emerald-800 font-medium' : 'text-slate-600'}`}>
                                                        {controlStr}
                                                     </p>
                                                  </button>
                                               )
                                            })}
                                         </div>
                                      </div>
                                   </div>
                                ))}
                             </div>
                          )}
                       </div>
                    ))}
                 </div>
               )}
               
               {/* --------------------
                   NUEVA ZONA: CAPTURAS MULTIMEDIA (BITÁCORA REAL)
                   -------------------- */}
               {parsedManeuvers.length > 0 && (
                 <div className="mt-8 mb-6 p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-emerald-600"/> Adjuntos Especiales de Bitácora</h3>
                    
                    <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputPhotoRef} onChange={(e) => handleCapture(e, 'photo')} />
                    <input type="file" accept="audio/*" capture="environment" className="hidden" ref={fileInputAudioRef} onChange={(e) => handleCapture(e, 'audio')} />

                    <div className="grid grid-cols-2 gap-3">
                       <button onClick={() => fileInputPhotoRef.current?.click()} className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${photoData ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-600'}`}>
                          <Camera className={`w-6 h-6 mb-2 ${photoData ? 'text-emerald-500' : ''}`}/>
                          <span className="text-[10px] font-bold uppercase tracking-wider">{photoData ? 'Foto Adjunta' : 'Foto Asistencia'}</span>
                       </button>
                       <button onClick={() => fileInputAudioRef.current?.click()} className={`flex flex-col items-center justify-center p-4 border rounded-xl transition-all ${audioData ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-600'}`}>
                          <Mic className={`w-6 h-6 mb-2 ${audioData ? 'text-emerald-500' : ''}`}/>
                          <span className="text-[10px] font-bold uppercase tracking-wider">{audioData ? 'Audio Listo' : 'Nota de Voz'}</span>
                       </button>
                    </div>
                 </div>
               )}

               {/* FIRMA Y ENVÍO */}
               {parsedManeuvers.length > 0 && (
                 <div className="mt-8 mb-4 px-2">
                    <button onClick={submitASTLog} disabled={isSubmitting} className="w-full bg-emerald-600 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 active:scale-[0.98] transition-all disabled:opacity-50">
                       {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckSquare className="w-5 h-5" />}
                       {isSubmitting ? 'Guardando en BD...' : 'Aprobar y Firmar AST'}
                    </button>
                    <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">Las verificaciones y anexos multimedia se integrarán al proyecto matriz en NeonDB.</p>
                 </div>
               )}
             </>
           )}
        </main>
    </div>
  );
}

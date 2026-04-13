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

  // Multimedia Capture (Arrays)
  const [photosData, setPhotosData] = useState<string[]>([]);
  const [audiosData, setAudiosData] = useState<string[]>([]);
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
      if (type === 'photo') {
         // Comprimir preventivamente en el cliente para evitar limites de Vercel/Neondb (413 Payload Too Large)
         const img = new window.Image(); /* prevent React errors */
         img.onload = () => {
           const canvas = document.createElement('canvas');
           let width = img.width;
           let height = img.height;
           const MAX_WIDTH = 800;
           
           if (width > MAX_WIDTH) {
             height = Math.round(height * (MAX_WIDTH / width));
             width = MAX_WIDTH;
           }
           
           canvas.width = width;
           canvas.height = height;
           const ctx = canvas.getContext('2d');
           ctx?.drawImage(img, 0, 0, width, height);
           
           // Bajar fuertemente la calidad para web (0.6)
           const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
           setPhotosData(prev => [...prev, compressedBase64]);
         };
         img.src = base64str;
      } else {
         setAudiosData(prev => [...prev, base64str]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = ''; // Permite volver a sacar la misma o sucesivas
  };

  const removeAttachment = (index: number, type: 'photo' | 'audio') => {
    if (type === 'photo') {
      setPhotosData(prev => prev.filter((_, i) => i !== index));
    } else {
      setAudiosData(prev => prev.filter((_, i) => i !== index));
    }
  };

  const submitASTLog = async (targetManeuverIdx: number) => {
    if (!activeProject) return;
    setIsSubmitting(true);
    
    // Armar el objeto de controles aprobados SOLO para la tarea seleccionada
    const checkedTexts: string[] = [];
    Object.keys(checkedControls).forEach(cId => {
      if (checkedControls[cId]) {
         const parts = cId.split('_'); // Ej: c_0_0_0
         if (parts.length === 4) {
           const m = parseInt(parts[1]);
           if (m === targetManeuverIdx) {
             const r = parseInt(parts[2]);
             const c = parseInt(parts[3]);
             const text = parsedManeuvers[m]?.result?.risks?.[r]?.controls?.[c];
             if (text) checkedTexts.push(text);
           }
         }
      }
    });

    const maneuverName = parsedManeuvers[targetManeuverIdx]?.taskOriginalName || parsedManeuvers[targetManeuverIdx]?.result?.task;

    try {
      const res = await fetch('/api/ast-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: activeProject.id,
          procedureName: maneuverName || activeProcedure?.name || 'General',
          photoData: photosData.length > 0 ? JSON.stringify(photosData) : null,
          audioData: audiosData.length > 0 ? JSON.stringify(audiosData) : null,
          checkedControls: checkedTexts
        })
      });
      if (!res.ok) throw new Error();
      setSuccess(true);
    } catch(err: any) {
      alert("Error enviando reporte a BD: " + (err.message || "Error desconocido. Intente acortar el audio o revisar su conexión 3G/4G."));
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

                                 {/* BLOQUE DE MULTIMEDIA Y FIRMA INTEGRADO AL ACORDEÓN */}
                                 <div className="mt-6 pt-6 border-t border-slate-200">
                                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4"><ClipboardCheck className="w-4 h-4 text-emerald-600"/> Adjuntos Especiales y Firma</h3>
                                    
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                       <button onClick={() => fileInputPhotoRef.current?.click()} className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${photosData.length > 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-600'}`}>
                                          <Camera className={`w-5 h-5 mb-1 ${photosData.length > 0 ? 'text-emerald-500' : ''}`}/>
                                          <span className="text-[10px] font-bold uppercase tracking-wider">Añadir Foto</span>
                                       </button>
                                       <button onClick={() => fileInputAudioRef.current?.click()} className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${audiosData.length > 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-600'}`}>
                                          <Mic className={`w-5 h-5 mb-1 ${audiosData.length > 0 ? 'text-emerald-500' : ''}`}/>
                                          <span className="text-[10px] font-bold uppercase tracking-wider">Grabar Audio</span>
                                       </button>
                                    </div>

                                    {/* Previsualización */}
                                    {(photosData.length > 0 || audiosData.length > 0) && (
                                       <div className="mb-4 space-y-2">
                                          {photosData.map((photoStr, idx) => (
                                            <div key={`photo-${idx}`} className="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4">
                                              <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                                                <img src={photoStr} alt="Previsualización" className="object-cover w-full h-full" />
                                              </div>
                                              <span className="text-[11px] font-bold text-slate-500">Fotografía #{idx + 1}</span>
                                              <button onClick={() => removeAttachment(idx, 'photo')} className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors">
                                                <span className="font-bold text-xs">×</span>
                                              </button>
                                            </div>
                                          ))}

                                          {audiosData.map((audioStr, idx) => (
                                            <div key={`audio-${idx}`} className="flex items-center justify-between bg-emerald-50 p-2 rounded-xl border border-emerald-100 shadow-sm animate-in fade-in slide-in-from-right-4 gap-2">
                                              <div className="flex-1 w-full max-w-[200px]">
                                                <audio controls src={audioStr} className="w-full h-8" />
                                              </div>
                                              <button onClick={() => removeAttachment(idx, 'audio')} className="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 hover:bg-red-100 transition-colors">
                                                <span className="font-bold text-xs">×</span>
                                              </button>
                                            </div>
                                          ))}
                                       </div>
                                    )}

                                    <button onClick={() => submitASTLog(mIdx)} disabled={isSubmitting} className="w-full bg-emerald-600 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 shadow-md active:scale-[0.98] transition-all disabled:opacity-50 mt-2">
                                       {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <CheckSquare className="w-5 h-5" />}
                                       {isSubmitting ? 'Guardando en BD...' : 'Aprobar y Firmar'}
                                    </button>
                                 </div>
                             </div>
                          )}
                       </div>
                    ))}
                 </div>
               )}
               
               {/* Inputs ocultos globales de multimedia */}
               <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputPhotoRef} onChange={(e) => handleCapture(e, 'photo')} />
               <input type="file" accept="audio/*" capture="environment" className="hidden" ref={fileInputAudioRef} onChange={(e) => handleCapture(e, 'audio')} />
             </>
           )}
        </main>
    </div>
  );
}

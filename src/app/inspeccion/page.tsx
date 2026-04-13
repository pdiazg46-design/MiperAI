'use client';
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Camera, Mic, Upload, X, ShieldAlert, Loader2, Sparkles, CheckCircle2, FileDown, Zap, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function InspeccionPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioNote, setAudioNote] = useState('');
  const [reportType, setReportType] = useState<'falta' | 'cumplimiento'>('falta');
  const [extractedData, setExtractedData] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedProcedureId, setSelectedProcedureId] = useState('');
  const [selectedTask, setSelectedTask] = useState('');

  // Extract maneuvers from active procedure to populate the supervised task dropdown
  const activeProject = projects.find(p => p.id === selectedProjectId);
  const activeProcedure = activeProject?.procedures?.find((p: any) => p.id === selectedProcedureId);
  const parsedManeuvers = React.useMemo(() => {
    if (!activeProcedure?.jsonPayload) return [];
    try {
      const data = JSON.parse(activeProcedure.jsonPayload);
      return Array.isArray(data) ? data : (data.maneuvers || []);
    } catch {
      return [];
    }
  }, [activeProcedure]);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch(console.error);
  }, []);

  const [compressedPhotoBody, setCompressedPhotoBody] = useState<string | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Preview inmediato
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);

      const MAX_WIDTH = 800;

      // Compresión eficiente en memoria (Evita "Memoria Insuficiente" en Safari/Android)
      if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
        try {
           const bitmap = await window.createImageBitmap(file, { resizeWidth: MAX_WIDTH });
           const canvas = document.createElement('canvas');
           canvas.width = bitmap.width;
           canvas.height = bitmap.height;
           const ctx = canvas.getContext('2d');
           if (ctx) {
              ctx.drawImage(bitmap, 0, 0);
              setCompressedPhotoBody(canvas.toDataURL('image/jpeg', 0.6));
              return;
           }
        } catch(err) {
           console.warn("Fallo de motor VRAM, usando fallback de compresión", err);
        }
      }

      // Fallback tradicional si createImageBitmap no está soportado o falla
      const img = new window.Image();
      img.onload = () => {
         const canvas = document.createElement('canvas');
         let width = img.width;
         let height = img.height;
         if (width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
         }
         
         canvas.width = width;
         canvas.height = height;
         
         const ctx = canvas.getContext('2d');
         if(ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const base64str = canvas.toDataURL('image/jpeg', 0.6);
            setCompressedPhotoBody(base64str);
         }
         URL.revokeObjectURL(url); // Limpieza de RAM forzada
      };
      img.src = url;
    }
  };

  const simulateProcessing = async () => {
    if(!compressedPhotoBody || !selectedProjectId || !selectedProcedureId || !selectedTask) {
      alert('Por favor complete: Proyecto, Procedimiento, Tarea y asegúrese de que la fotografía haya terminado de procesarse.');
      return;
    }
    setStep(2);
    try {
      const res = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: selectedProjectId,
          procedureId: selectedProcedureId,
          taskName: selectedTask,
          photoData: compressedPhotoBody, 
          audioData: audioNote,
          transcription: audioNote,
          reportType: reportType
        })
      });
      const data = await res.json();
      if(data.success && data.extractedData) {
         setExtractedData(data.extractedData);
         setStep(3);
      } else {
         console.error('API Error Response:', data);
         alert(`Error del servidor: ${data.error || 'Fallo desconocido al procesar con IA'}`);
         setStep(1);
      }
    } catch(e) {
      console.error(e);
      alert('Error de conexión a la API Serverless.');
      setStep(1);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-orange-500 relative flex flex-col">
      
        {/* App Bar Móvil */}
        <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-4 h-16 flex items-center justify-between shrink-0">
           <Link href="/" className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-6 h-6" />
           </Link>
           <h1 className="font-bold text-white tracking-tight">Reporte de Hallazgo</h1>
           <div className="w-10"></div> {/* Spacer balance */}
        </header>

        <main className="max-w-md mx-auto p-4 pb-24 w-full flex-1 overflow-y-auto scrollbar-hide">
        
        {step === 1 && (
           <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              
              {/* Selector de Proyecto y Procedimiento */}
              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/50 shadow-lg space-y-4">
                 <div>
                    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Proyecto Activo</h2>
                    <div className="relative">
                      <select 
                        value={selectedProjectId}
                        onChange={(e) => {
                          setSelectedProjectId(e.target.value);
                          setSelectedProcedureId(''); // reset proc
                        }}
                        className="appearance-none w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none cursor-pointer text-sm"
                      >
                        <option value="">Selecciona el Proyecto actual...</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                 </div>

                 <div>
                    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Procedimiento (Matriz)</h2>
                    <div className="relative">
                      <select 
                        value={selectedProcedureId}
                        onChange={(e) => {
                          setSelectedProcedureId(e.target.value);
                          setSelectedTask(''); // reset task
                        }}
                        disabled={!selectedProjectId}
                        className="appearance-none w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none cursor-pointer text-sm disabled:opacity-50"
                      >
                        <option value="">Selecciona el Procedimiento de Riesgo...</option>
                        {activeProject?.procedures?.map((proc: any) => (
                           <option key={proc.id} value={proc.id}>{proc.name}</option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                 </div>

                 <div>
                    <h2 className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Tarea Supervisada</h2>
                    <div className="relative">
                      <select 
                        value={selectedTask}
                        onChange={(e) => setSelectedTask(e.target.value)}
                        disabled={!selectedProcedureId || parsedManeuvers.length === 0}
                        className="appearance-none w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none cursor-pointer text-sm disabled:opacity-50"
                      >
                        <option value="">Selecciona la Tarea Específica...</option>
                        {parsedManeuvers.map((maneuver: any, i: number) => {
                           const mName = maneuver.taskOriginalName || maneuver.result?.task || `Maniobra ${i+1}`;
                           return <option key={i} value={mName}>{mName}</option>
                        })}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700/50 shadow-lg">
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Paso 1: Evidencia Visual</h2>
                 
                 {photoUrl ? (
                    <div className="relative rounded-xl overflow-hidden aspect-video bg-black border border-slate-700">
                       <img src={photoUrl} className="w-full h-full object-cover opacity-90" alt="Hallazgo" />
                       <button onClick={() => setPhotoUrl(null)} className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white p-2 rounded-full hover:bg-black/80 transition-colors">
                         <X className="w-4 h-4" />
                       </button>
                    </div>
                 ) : (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-600 rounded-xl aspect-video flex flex-col items-center justify-center gap-3 bg-slate-800/50 hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                       <div className="bg-slate-700 p-4 rounded-full text-slate-300">
                          <Camera className="w-8 h-8" />
                       </div>
                       <div className="text-center">
                          <p className="font-bold text-slate-300">Fotografía en Terreno</p>
                          <p className="text-xs text-slate-500 mt-1">Obligatorio captura en vivo</p>
                       </div>
                       <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload}/>
                    </div>
                 )}
              </div>

              <div className={`bg-slate-800 rounded-2xl p-4 border border-slate-700/50 shadow-lg transition-opacity ${!photoUrl ? 'opacity-50 pointer-events-none' : ''}`}>
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Paso 2: Dictado de Voz</h2>
                 
                 <div className="space-y-4">
                    <div className="flex gap-2 mb-2">
                       <button onClick={() => setReportType('falta')} className={`flex-1 text-[10px] uppercase tracking-wider py-2 rounded-md font-bold border transition-colors ${reportType === 'falta' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400'}`}>Simular Falta</button>
                       <button onClick={() => setReportType('cumplimiento')} className={`flex-1 text-[10px] uppercase tracking-wider py-2 rounded-md font-bold border transition-colors ${reportType === 'cumplimiento' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400'}`}>Simular Felicidad</button>
                    </div>
                    <button 
                      onPointerDown={() => setIsRecording(true)}
                      onPointerUp={() => { 
                         setIsRecording(false); 
                         setAudioNote(reportType === 'falta' 
                           ? 'El trabajador en el andamio del segundo piso está trabajando sin línea de vida amarrada y el andamio carece de rodapié.' 
                           : 'Todo el personal en el sector B está utilizando correctamente su equipo para trabajo en altura, andamios certificados y buena actitud.'); 
                      }}
                      onPointerLeave={() => { if(isRecording) { setIsRecording(false); setAudioNote('Grabación terminada.'); } }}
                      className={`w-full flex items-center justify-center gap-3 p-5 rounded-xl font-bold transition-all shadow-lg select-none ${isRecording ? 'bg-blue-500 text-white scale-[0.98]' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                    >
                       <Mic className={`w-6 h-6 ${isRecording ? 'animate-pulse' : ''}`} />
                       {isRecording ? 'Escuchando... (suelta al terminar)' : 'Mantener para Hablar'}
                    </button>
                    
                    {audioNote && (
                        <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                           <p className="text-xs text-slate-400 uppercase font-bold mb-1">Transcripción Whisper AI:</p>
                           <p className="text-sm text-slate-300 italic">"{audioNote}"</p>
                        </div>
                    )}
                 </div>
              </div>

              <button 
                onClick={simulateProcessing}
                disabled={!compressedPhotoBody || !selectedProjectId || !selectedProcedureId || !selectedTask}
                className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold text-lg shadow-xl transition-all ${(!compressedPhotoBody || !selectedProjectId || !selectedProcedureId || !selectedTask) ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-orange-600 text-white hover:bg-orange-500 hover:scale-[1.02]'}`}
              >
                 <Zap className="w-5 h-5" /> Analizar Hallazgo con IA
              </button>
           </div>
        )}

        {step === 2 && (
           <div className="flex flex-col items-center justify-center py-20 animate-in fade-in zoom-in-95 duration-500">
              <div className="relative">
                 <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse"></div>
                 <div className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-2xl relative">
                    <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
                 </div>
              </div>
              <h2 className="text-2xl font-extrabold mt-8 text-white text-center">Clasificando Hallazgo...</h2>
              <div className="mt-4 flex flex-col items-center gap-2 text-sm font-medium text-slate-400">
                 <p className="flex items-center gap-2 text-orange-400 animate-pulse"><Sparkles className="w-4 h-4"/> Interpretando fotografía en alta resolución</p>
                 <p className="flex items-center gap-2 mt-2"><CheckCircle2 className="w-4 h-4 text-green-500 opacity-50"/> Transcripción completada</p>
                 <p className="flex items-center gap-2 mt-1"><Loader2 className="w-4 h-4 opacity-50 animate-spin"/> Cruzando matrices de Ley 16.744</p>
              </div>
           </div>
        )}

        {step === 3 && (
           <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
              <div className="text-center space-y-2">
                 <div className="inline-flex bg-green-500/20 text-green-400 p-3 rounded-full mb-2 border border-green-500/30">
                    <ShieldAlert className="w-8 h-8" />
                 </div>
                 <h2 className="text-2xl font-extrabold text-white">Informe Generado</h2>
                 <p className="text-slate-400 text-sm">El sistema ha estructurado tu inspección normativamente.</p>
              </div>

              <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                 <div className={`${reportType === 'falta' ? 'bg-red-600' : 'bg-green-600'} px-4 py-3 flex items-center justify-between text-white`}>
                    <span className="font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                      {reportType === 'falta' ? <ShieldAlert className="w-4 h-4"/> : <Sparkles className="w-4 h-4"/>}
                      {reportType === 'falta' ? 'Hallazgo Crítico (Falta)' : 'Hallazgo Positivo (100% Cumplimiento)'}
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">14 Oct 2026</span>
                 </div>
                 
                 <div className="p-5 space-y-5">
                    {photoUrl && (
                       <img src={photoUrl} className="w-full aspect-video object-cover rounded-lg shadow-sm border border-slate-200" alt="Evidencia" />
                    )}
                    
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Descripción del Hallazgo</h3>
                        <p className="font-semibold text-slate-800">
                          {extractedData?.description || "Procesando..."}
                        </p>
                    </div>

                    <div className={`bg-slate-50 border-l-4 ${reportType === 'falta' ? 'border-red-500' : 'border-green-500'} p-3 rounded-r-lg`}>
                        <h3 className={`text-xs font-bold uppercase tracking-wider mb-1 ${reportType === 'falta' ? 'text-red-700' : 'text-green-700'}`}>
                          {reportType === 'falta' ? 'Infracción Legal Incurrida' : 'Normativa Cumplida a Cabalidad'}
                        </h3>
                        <ul className="text-xs text-slate-700 space-y-2">
                           {extractedData?.rules?.map((rule: any, i: number) => (
                              <li key={i}><strong className="text-slate-900">{rule.norm}:</strong> "{rule.text}"</li>
                           ))}
                        </ul>
                    </div>

                    {reportType === 'falta' && extractedData?.correctiveActions?.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Medida Correctiva Inmediata</h3>
                            <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-900 text-sm font-medium space-y-1">
                               {extractedData.correctiveActions.map((action: string, idx: number) => (
                                 <p key={idx}>{idx + 1}. {action}</p>
                               ))}
                            </div>
                        </div>
                    )}
                 </div>
              </div>

              <div className="flex gap-3 pt-4">
                 <Link href="/" className="flex-1 bg-blue-600 text-white font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg transition-colors">
                    Volver al Escritorio
                 </Link>
                 <button onClick={() => { setStep(1); setPhotoUrl(null); setAudioNote(''); }} className="bg-slate-800 text-slate-300 font-bold p-4 px-6 rounded-xl hover:bg-slate-700 transition-colors">
                    Nueva
                 </button>
              </div>
           </div>
        )}

        </main>
    </div>
  );
}

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

  const fileInputAudioRef = useRef<HTMLInputElement>(null);
  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
       setAudioNote(event.target?.result as string);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const MAX_WIDTH = 800;

      // Compresión eficiente en memoria (Evita "Memoria Insuficiente" en Safari/Android)
      // Nota: NO seteamos photoUrl al url nativo porque renderizar una foto 8K en el DOM inmediatamente explota la VRAM.
      if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
        try {
           const bitmap = await window.createImageBitmap(file, { resizeWidth: MAX_WIDTH });
           const canvas = document.createElement('canvas');
           canvas.width = bitmap.width;
           canvas.height = bitmap.height;
           const ctx = canvas.getContext('2d');
           if (ctx) {
              ctx.drawImage(bitmap, 0, 0);
              const compressedStr = canvas.toDataURL('image/jpeg', 0.6);
              setCompressedPhotoBody(compressedStr);
              setPhotoUrl(compressedStr); // Usamos la miniatura para la pantalla
              URL.revokeObjectURL(url);
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
            setPhotoUrl(base64str); // Usamos la miniatura para la pantalla
         }
         URL.revokeObjectURL(url); // Limpieza de RAM forzada
      };
      img.src = url;
    }
  };

  const simulateProcessing = async () => {
    if(!selectedProjectId || !selectedProcedureId || !selectedTask) {
      alert('Por favor complete: Proyecto, Procedimiento y Tarea.');
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
          audioData: null,
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
                    {selectedProjectId && (() => {
                      const proj = projects.find(p => p.id === selectedProjectId);
                      if (!proj) return null;
                      const ok = proj.inspections?.filter((i: any) => i.reportType === 'cumplimiento').length || 0;
                      const faltas = proj.inspections?.filter((i: any) => i.reportType === 'falta').length || 0;
                      return (
                        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-700/50">
                           <div className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded border border-slate-700">📋 {proj.astLogs?.length || 0} AST</div>
                           {(ok > 0 || faltas > 0) && (
                             <>
                               <div className="text-xs bg-green-500/10 text-green-400 px-2 py-1 rounded border border-green-500/20">✨ {ok} Positivas</div>
                               <div className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded border border-red-500/20">⚠️ {faltas} Faltas</div>
                             </>
                           )}
                        </div>
                      );
                    })()}
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
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Paso 1: Evidencia Visual (Opcional)</h2>
                 
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
                          <p className="text-xs text-slate-500 mt-1">Opcional para mejorar reporte IA</p>
                       </div>
                       <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload}/>
                    </div>
                 )}
              </div>

              <div className={`bg-slate-800 rounded-2xl p-4 border border-slate-700/50 shadow-lg transition-opacity`}>
                 <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Paso 2: Tipo de Reporte y Contexto</h2>
                 
                 <div className="space-y-4">
                    <div className="flex gap-2 mb-2">
                       <button onClick={() => setReportType('falta')} className={`flex-1 text-[10px] uppercase tracking-wider py-2 rounded-md font-bold border transition-colors ${reportType === 'falta' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400'}`}>Reportar Falta</button>
                       <button onClick={() => setReportType('cumplimiento')} className={`flex-1 text-[10px] uppercase tracking-wider py-2 rounded-md font-bold border transition-colors ${reportType === 'cumplimiento' ? 'bg-green-500/20 text-green-400 border-green-500/50' : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-400'}`}>Felicitación</button>
                    </div>
                     <div className="flex gap-2 mb-3">
                        <button 
                          onClick={(e) => {
                             e.preventDefault();
                             if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                                alert("Tu navegador no soporta dictado por voz. Por favor escribe el reporte manualmente.");
                                return;
                             }

                             // Si ya está grabando, lo detenemos
                             if (isRecording && (window as any).currentRecognition) {
                                (window as any).currentRecognition.stop();
                                setIsRecording(false);
                                return;
                             }

                             const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
                             const recognition = new SpeechRecognition();
                             (window as any).currentRecognition = recognition;
                             recognition.lang = 'es-CL';
                             recognition.continuous = true;
                             recognition.interimResults = true;
                             
                             recognition.onstart = () => setIsRecording(true);
                             
                             recognition.onresult = (event: any) => {
                                let finalTranscript = '';
                                for (let i = event.resultIndex; i < event.results.length; ++i) {
                                  if (event.results[i].isFinal) {
                                    finalTranscript += event.results[i][0].transcript;
                                  }
                                }
                                if (finalTranscript) {
                                   setAudioNote(prev => prev ? prev + " " + finalTranscript : finalTranscript);
                                }
                             };
                             
                             recognition.onerror = (event: any) => {
                                console.warn("Dictado advertencia:", event.error);
                                if(event.error === 'not-allowed') {
                                   alert('Debes dar permisos de micrófono en el navegador para dictar.');
                                }
                                setIsRecording(false);
                             };
                             
                             recognition.onend = () => setIsRecording(false);
                             
                             try {
                                recognition.start();
                             } catch(err) {
                                console.log("Recognition already started");
                             }
                          }}
                          className={`w-full flex items-center justify-center gap-3 p-4 rounded-xl font-bold transition-all shadow-sm select-none ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
                        >
                           <Mic className="w-5 h-5" />
                           {isRecording ? 'Detener Grabación' : 'Dictar Reporte por Voz'}
                        </button>
                     </div>

                     <textarea 
                        value={audioNote.startsWith('data:') ? '' : audioNote} // Clean legacy base64 if cached
                        onChange={(e) => setAudioNote(e.target.value)}
                        placeholder="Usa el botón para dictar o escribe el contexto de tu hallazgo aquí..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500 outline-none text-sm min-h-[100px] resize-none"
                     ></textarea>
                     
                     <p className="text-[10px] text-center text-slate-500 mt-2">
                        El dictado por voz es gratuito, no consume IA y se convierte inmediatamente a texto editable.
                     </p>
                  </div>
               </div>

              <button 
                onClick={simulateProcessing}
                disabled={!selectedProjectId || !selectedProcedureId || !selectedTask}
                className={`w-full flex items-center justify-center gap-2 p-4 rounded-xl font-bold text-lg shadow-xl transition-all ${(!selectedProjectId || !selectedProcedureId || !selectedTask) ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-emerald-600 text-white hover:bg-emerald-500 hover:scale-[1.02]'}`}
              >
                 <Zap className="w-5 h-5" /> Guardar Registro en Bitácora
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
                 <h2 className="text-2xl font-extrabold text-white">Registro Guardado</h2>
                 <p className="text-slate-400 text-sm">Tu evidencia ha sido almacenada correctamente y sincronizada en el servidor corporativo.</p>
              </div>

              <div className="bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl">
                 <div className={`${reportType === 'falta' ? 'bg-red-600' : 'bg-green-600'} px-4 py-3 flex items-center justify-between text-white`}>
                    <span className="font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                      {reportType === 'falta' ? <ShieldAlert className="w-4 h-4"/> : <Sparkles className="w-4 h-4"/>}
                      {reportType === 'falta' ? 'Hallazgo Reportado (Falta)' : 'Reporte Positivo (Logro en Terreno)'}
                    </span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold">Registro Manual</span>
                 </div>
                 
                 <div className="p-5 space-y-5">
                    {photoUrl && (
                       <div className="relative">
                          <span className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white px-2 py-1 rounded text-[10px] font-bold z-10 border border-white/10 uppercase tracking-wider">
                             Evidencia Adjunta al Servidor
                          </span>
                          <img src={photoUrl} className="w-full aspect-video object-cover rounded-lg shadow-sm border border-slate-200" alt="Evidencia" />
                       </div>
                    )}
                    
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Detalle de Sincronización</h3>
                        <p className="font-semibold text-slate-800 text-sm">
                          {extractedData?.description || "Registro guardado sin incidencias."}
                        </p>
                    </div>
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

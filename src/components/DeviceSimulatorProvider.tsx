'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Smartphone } from 'lucide-react';

interface SimulatorContextType {
  isSimulatorEnabled: boolean;
  setIsSimulatorEnabled: (val: boolean) => void;
}

const SimulatorContext = createContext<SimulatorContextType>({
  isSimulatorEnabled: false,
  setIsSimulatorEnabled: () => {},
});

export const useDeviceSimulator = () => useContext(SimulatorContext);

export default function DeviceSimulatorProvider({ children }: { children: React.ReactNode }) {
  const [isSimulatorEnabled, setIsSimulatorEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('isMobileSim');
    if (stored === 'true') setIsSimulatorEnabled(true);
  }, []);

  useEffect(() => {
    if (mounted) {
       localStorage.setItem('isMobileSim', String(isSimulatorEnabled));
    }
  }, [isSimulatorEnabled, mounted]);

  if (!mounted) return <>{children}</>;

  if (isSimulatorEnabled) {
     return (
        <SimulatorContext.Provider value={{ isSimulatorEnabled, setIsSimulatorEnabled }}>
           <div className="min-h-screen bg-zinc-950 flex py-10 justify-center w-full selection:bg-orange-500 font-sans relative">
              {/* Toggle de salida - solo visible en PC al lado del celular */}
              {pathname === '/' && (
                 <div className="fixed bottom-6 right-6 z-[100] hidden md:block">
                     <button 
                       onClick={() => setIsSimulatorEnabled(false)} 
                       className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full px-5 py-3 text-sm font-bold shadow-2xl flex items-center gap-2 hover:bg-white/30 transition-all"
                     >
                       <Smartphone className="w-5 h-5" /> Salir Modo S24
                     </button>
                 </div>
              )}
              
              <div className="w-[412px] h-[850px] bg-slate-900 rounded-[3rem] border-[14px] border-zinc-800 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden relative flex flex-col">
                 {/* Hardware notch simulado para S24 */}
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-zinc-950 rounded-full mt-2 z-[999] shadow-inner pointer-events-none"></div>
                 {/* Contenedor desplazable interno */}
                 <div className="flex-1 w-full h-full overflow-y-auto overflow-x-hidden scrollbar-hide relative bg-slate-50">
                    {children}
                 </div>
              </div>
           </div>
        </SimulatorContext.Provider>
     );
  }

  return (
    <SimulatorContext.Provider value={{ isSimulatorEnabled, setIsSimulatorEnabled }}>
      {pathname === '/' && (
         <div className="fixed bottom-6 right-6 z-[100] hidden md:block">
             <button 
               onClick={() => setIsSimulatorEnabled(true)} 
               className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 text-white rounded-full px-5 py-3 text-sm font-bold shadow-2xl flex items-center gap-2 hover:bg-slate-800 transition-all"
             >
               <Smartphone className="w-5 h-5" /> Ver en Android S24 FE
             </button>
         </div>
      )}
      {children}
    </SimulatorContext.Provider>
  );
}

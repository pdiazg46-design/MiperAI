"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Cpu, ShieldCheck, Zap, ArrowDownToLine, CheckCircle2 } from 'lucide-react';

const LOADING_MESSAGES = [
  { text: "Encendiendo Motores de Riesgo...", icon: Cpu },
  { text: "Escaneando Normativa DS 594...", icon: FileText },
  { text: "Mapeando Matriz IPER Base...", icon: Zap },
  { text: "Detectando Probabilidad y Severidad...", icon: ArrowDownToLine },
  { text: "Calculando Ley 16.744 sobre accidentes...", icon: ShieldCheck },
  { text: "Redactando Medidas de Control Críticas...", icon: CheckCircle2 }
];

export default function AILoadingScanner() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    // Rotar mensaje cada 2.5 segundos
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = LOADING_MESSAGES[messageIndex].icon;

  return (
    <div className="w-full max-w-lg mx-auto py-12 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
      
      {/* Zona del Escáner */}
      <div className="relative w-48 h-64 bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex items-center justify-center">
        {/* Documento base */}
        <div className="absolute inset-0 flex flex-col p-6 space-y-4 opacity-30 blur-[1px]">
          <div className="w-1/2 h-3 bg-zinc-600 rounded"></div>
          <div className="w-full h-2 bg-zinc-700 rounded"></div>
          <div className="w-3/4 h-2 bg-zinc-700 rounded"></div>
          <div className="w-full h-2 bg-zinc-700 rounded"></div>
          
          <div className="pt-4 grid grid-cols-2 gap-2">
            <div className="w-full h-8 bg-zinc-600 rounded"></div>
            <div className="w-full h-8 bg-zinc-600 rounded"></div>
            <div className="w-full h-8 bg-zinc-600 rounded"></div>
            <div className="w-full h-8 bg-zinc-600 rounded"></div>
          </div>
        </div>

        {/* Branding central */}
        <div className="relative z-10 p-4 bg-zinc-900/80 backdrop-blur border border-white/10 rounded-2xl shadow-xl flex flex-col items-center">
           <Cpu className="w-10 h-10 text-blue-500 mb-2" />
           <span className="font-black text-white text-xs tracking-widest">MiperAI</span>
        </div>

        {/* Láser de Escaneo (Animado de arriba a abajo) */}
        <motion.div
           className="absolute top-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_20px_5px_rgba(59,130,246,0.6)] z-20"
           animate={{
             y: [0, 256, 0] // 256 corresponde al height aproximado del contenedor (64 * 4)
           }}
           transition={{
             duration: 2.5,
             ease: "linear",
             repeat: Infinity
           }}
        />

        {/* Gradiente de seguimiento del láser */}
        <motion.div
           className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-blue-500/20 z-10"
           animate={{
             y: [-128, 256, -128]
           }}
           transition={{
             duration: 2.5,
             ease: "linear",
             repeat: Infinity
           }}
        />
      </div>

      {/* Mensajes interactivos de IA */}
      <div className="h-16 flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={messageIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col items-center text-center space-y-2"
          >
            <div className="flex items-center gap-2">
              <CurrentIcon className="w-5 h-5 text-blue-500" />
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                {LOADING_MESSAGES[messageIndex].text}
              </h3>
            </div>
            <p className="text-zinc-400 text-sm font-medium">Procesador IA trabajando en máxima capacidad...</p>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}

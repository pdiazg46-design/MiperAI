'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ShieldAlert, Loader2, KeyRound } from 'lucide-react';

export default function ForcePasswordChange() {
  const { data: session, update } = useSession();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const mustChange = (session?.user as any)?.mustChangePassword;

  if (!mustChange) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
    }
    if (newPassword !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
    }

    setLoading(true);
    setError('');

    try {
        const res = await fetch('/api/user/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newPassword })
        });
        
        if (res.ok) {
            await update({ mustChangePassword: false });
            window.location.reload();
        } else {
            const data = await res.json();
            setError(data.error || 'Error cambiando contraseña');
        }
    } catch(err) {
        setError('Error de conexión');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl border border-slate-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 mx-auto">
                <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-center text-slate-800 mb-2">Cambio de Clave Obligatorio</h2>
            <p className="text-slate-500 text-center text-sm mb-8 font-medium">
                Por políticas de seguridad de MiperAI Enterprise, debes definir tu propia contraseña privada antes de acceder a tu cuenta.
            </p>

            {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-bold rounded-xl text-center">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Nueva Contraseña</label>
                    <div className="relative">
                        <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        <input 
                            type="password" 
                            required 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Confirmar Contraseña</label>
                    <div className="relative">
                        <KeyRound className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                        <input 
                            type="password" 
                            required 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800"
                            placeholder="Repite la contraseña"
                        />
                    </div>
                </div>

                <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full mt-6 bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-lg disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Guardar y Continuar'}
                </button>
            </form>
        </div>
    </div>
  );
}

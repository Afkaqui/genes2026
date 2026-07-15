"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import genesLogo from '@/public/logos/genesLogo.png';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function IntranetLogin() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('genes_token');
    if (token) router.push('/intranet/dashboard');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Credenciales incorrectas');
        return;
      }

      localStorage.setItem('genes_token', data.token);
      localStorage.setItem('genes_user', JSON.stringify(data.user));
      router.push('/intranet/dashboard');
    } catch {
      setError('Error de conexion. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-green-50 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <div className="flex flex-col items-center mb-8">
            <Image src={genesLogo} alt="GENES Peru" width={80} height={80} className="mb-4" />
            <h1 className="text-2xl font-bold text-slate-800">Intranet GENES</h1>
            <p className="text-sm text-slate-500 mt-1">Accede a tus certificados y recursos</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">Usuario</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                required autoComplete="username"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-genes-green focus:border-genes-green outline-none transition text-slate-800 placeholder:text-slate-400"
                placeholder="Ingresa tu usuario" />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">Contrasena</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                required autoComplete="current-password"
                className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-genes-green focus:border-genes-green outline-none transition text-slate-800 placeholder:text-slate-400"
                placeholder="Ingresa tu contrasena" />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-2.5 rounded-lg border border-red-100">{error}</div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-genes-green text-white py-2.5 rounded-lg font-semibold hover:bg-genes-green/90 transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-slate-500 hover:text-genes-green transition">Volver al sitio principal</a>
          </div>
        </div>
      </div>
    </div>
  );
}

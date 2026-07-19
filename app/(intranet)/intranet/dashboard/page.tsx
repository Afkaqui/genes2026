"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import genesLogo from '@/public/logos/genesLogo.png';
import { formatFechaCertificado } from '@/lib/fecha';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface Certificate {
  id: number;
  type: 'certificado' | 'constancia';
  verification_code: string;
  issue_date: string;
  hours: number;
  course_name: string;
  full_name: string;
  instructor: string;
  issued_by_name: string | null;
}

interface User {
  id: number;
  username: string;
  full_name: string;
  role: 'user' | 'admin' | 'superadmin';
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('genes_token');

  const logout = useCallback(() => {
    localStorage.removeItem('genes_token');
    localStorage.removeItem('genes_user');
    router.push('/intranet');
  }, [router]);

  useEffect(() => {
    const token = getToken();
    const stored = localStorage.getItem('genes_user');
    if (!token || !stored) { router.push('/intranet'); return; }

    setUser(JSON.parse(stored));

    fetch(`${API_URL}/api/certificates?mine=true`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => { if (r.status === 401) { logout(); return null; } return r.json(); })
      .then((data) => { if (data) setCertificates(data); })
      .catch(() => setCertificates([]))
      .finally(() => setLoading(false));
  }, [router, logout]);

  const downloadPDF = (certId: number) => {
    const token = getToken();
    window.open(`${API_URL}/api/certificates/${certId}/pdf?token=${token}`, '_blank');
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-genes-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Image src={genesLogo} alt="GENES Peru" width={40} height={40} className="shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">Intranet GENES</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Portal de Certificados</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isAdmin && (
              <Link href="/intranet/admin"
                className="text-xs sm:text-sm bg-genes-green text-white px-3 sm:px-4 py-1.5 rounded-lg font-medium hover:bg-genes-green/90 transition whitespace-nowrap">
                Admin
              </Link>
            )}
            <Link href="/intranet/cuenta" className="text-xs sm:text-sm text-slate-600 hover:text-genes-green transition whitespace-nowrap">
              Mi Cuenta
            </Link>
            <span className="text-sm text-slate-600 hidden sm:block">{user?.full_name}</span>
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full hidden sm:inline">{user?.role}</span>
            <button onClick={logout} className="text-xs sm:text-sm text-slate-500 hover:text-red-500 transition font-medium">
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Mis Certificados</h2>
          <p className="text-slate-500 mt-1">Bienvenido, {user?.full_name}. Consulta y descarga tus certificados.</p>
        </div>

        {certificates.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-3">📄</div>
            <p className="text-slate-500">No tienes certificados disponibles.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {certificates.map((cert) => (
              <div key={cert.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition group">
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    cert.type === 'certificado'
                      ? 'text-genes-green bg-green-50'
                      : 'text-blue-600 bg-blue-50'
                  }`}>
                    {cert.type === 'certificado' ? 'Certificado' : 'Constancia'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {formatFechaCertificado(cert.issue_date)}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1">{cert.course_name}</h3>
                <p className="text-sm text-slate-500 mb-1">{cert.hours} horas academicas</p>
                {cert.issued_by_name && (
                  <p className="text-xs text-slate-400 mb-1">Emitido por: {cert.issued_by_name}</p>
                )}
                <p className="text-xs text-slate-400 mb-4 font-mono">{cert.verification_code}</p>
                <button onClick={() => downloadPDF(cert.id)}
                  className="w-full text-center bg-slate-50 text-genes-green py-2 rounded-lg text-sm font-medium hover:bg-genes-green hover:text-white transition">
                  Descargar PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

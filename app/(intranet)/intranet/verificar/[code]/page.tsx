"use client";

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import genesLogo from '@/public/logos/genesLogo.png';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface VerificationResult {
  valid: boolean;
  type?: string;
  full_name?: string;
  dni?: string;
  course_name?: string;
  hours?: number;
  issue_date?: string;
  instructor?: string;
  verification_code?: string;
  message?: string;
}

export default function VerificarPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/certificates/verify/${code}`)
      .then((r) => r.json())
      .then(setResult)
      .catch(() => setResult({ valid: false, message: 'Error de conexion' }))
      .finally(() => setLoading(false));
  }, [code]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-green-50 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
          <div className="flex flex-col items-center mb-6">
            <Image src={genesLogo} alt="GENES Peru" width={60} height={60} className="mb-3" />
            <h1 className="text-xl font-bold text-slate-800">Verificacion de Certificado</h1>
            <p className="text-sm text-slate-500 mt-1 font-mono">{code}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-genes-green border-t-transparent" />
            </div>
          ) : result?.valid ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">✓</div>
                <p className="text-green-700 font-semibold">Documento valido</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Tipo</span>
                  <span className="font-medium text-slate-800 capitalize">{result.type}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Otorgado a</span>
                  <span className="font-medium text-slate-800">{result.full_name}</span>
                </div>
                {result.dni && (
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">DNI</span>
                    <span className="font-medium text-slate-800">{result.dni}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Curso</span>
                  <span className="font-medium text-slate-800">{result.course_name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Duracion</span>
                  <span className="font-medium text-slate-800">{result.hours} horas</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Fecha de emision</span>
                  <span className="font-medium text-slate-800">
                    {new Date(result.issue_date!).toLocaleDateString('es-PE', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </span>
                </div>
                {result.instructor && (
                  <div className="flex justify-between py-2">
                    <span className="text-slate-500">Instructor</span>
                    <span className="font-medium text-slate-800">{result.instructor}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="text-2xl mb-1">✗</div>
              <p className="text-red-700 font-semibold">Documento no encontrado</p>
              <p className="text-red-500 text-sm mt-1">El codigo ingresado no corresponde a ningun certificado emitido por GENES Peru.</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-slate-500 hover:text-genes-green transition">Ir al sitio principal</a>
          </div>
        </div>
      </div>
    </div>
  );
}

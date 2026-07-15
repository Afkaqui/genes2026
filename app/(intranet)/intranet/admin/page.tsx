"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import genesLogo from '@/public/logos/genesLogo.png';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User { id: number; username: string; full_name: string; dni: string; email: string; role: string; active: boolean; }
interface Course { id: number; name: string; description: string; hours: number; instructor: string; active: boolean; creator_name: string; }
interface Certificate { id: number; type: string; verification_code: string; issue_date: string; hours: number; course_name: string; full_name: string; }

type Tab = 'certificates' | 'courses' | 'users';

export default function AdminPanel() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ role: string; full_name: string } | null>(null);
  const [tab, setTab] = useState<Tab>('certificates');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<string | null>(null);

  const getToken = () => localStorage.getItem('genes_token');
  const headers = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

  const logout = useCallback(() => {
    localStorage.removeItem('genes_token');
    localStorage.removeItem('genes_user');
    router.push('/intranet');
  }, [router]);

  const loadData = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push('/intranet'); return; }

    try {
      const [uRes, cRes, certRes] = await Promise.all([
        fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/courses`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/certificates`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (uRes.status === 401) { logout(); return; }
      if (uRes.status === 403) { router.push('/intranet/dashboard'); return; }

      setUsers(await uRes.json());
      setCourses(await cRes.json());
      setCertificates(await certRes.json());
    } catch { /* ignore */ }
    setLoading(false);
  }, [router, logout]);

  useEffect(() => {
    const stored = localStorage.getItem('genes_user');
    if (!stored) { router.push('/intranet'); return; }
    const u = JSON.parse(stored);
    if (u.role !== 'admin' && u.role !== 'superadmin') { router.push('/intranet/dashboard'); return; }
    setCurrentUser(u);
    loadData();
  }, [router, loadData]);

  const isSuperadmin = currentUser?.role === 'superadmin';

  // --- Forms state ---
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', dni: '', email: '', role: 'user' });
  const [newCourse, setNewCourse] = useState({ name: '', description: '', hours: 1, instructor: '' });
  const [newCert, setNewCert] = useState({ user_id: '', course_id: '', type: 'certificado', issue_date: '' });
  const [formError, setFormError] = useState('');

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const res = await fetch(`${API_URL}/api/users`, { method: 'POST', headers: headers(), body: JSON.stringify(newUser) });
    if (!res.ok) { setFormError((await res.json()).message); return; }
    setNewUser({ username: '', password: '', full_name: '', dni: '', email: '', role: 'user' });
    setModal(null);
    loadData();
  };

  const createCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const res = await fetch(`${API_URL}/api/courses`, { method: 'POST', headers: headers(), body: JSON.stringify(newCourse) });
    if (!res.ok) { setFormError((await res.json()).message); return; }
    setNewCourse({ name: '', description: '', hours: 1, instructor: '' });
    setModal(null);
    loadData();
  };

  const issueCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const body = { ...newCert, user_id: parseInt(newCert.user_id), course_id: parseInt(newCert.course_id) };
    const res = await fetch(`${API_URL}/api/certificates`, { method: 'POST', headers: headers(), body: JSON.stringify(body) });
    if (!res.ok) { setFormError((await res.json()).message); return; }
    setNewCert({ user_id: '', course_id: '', type: 'certificado', issue_date: '' });
    setModal(null);
    loadData();
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Eliminar usuario? Sus certificados tambien se eliminaran.')) return;
    await fetch(`${API_URL}/api/users/${id}`, { method: 'DELETE', headers: headers() });
    loadData();
  };

  const toggleUserActive = async (u: User) => {
    await fetch(`${API_URL}/api/users/${u.id}`, {
      method: 'PUT', headers: headers(),
      body: JSON.stringify({ active: !u.active }),
    });
    loadData();
  };

  const deleteCert = async (id: number) => {
    if (!confirm('Eliminar este certificado?')) return;
    await fetch(`${API_URL}/api/certificates/${id}`, { method: 'DELETE', headers: headers() });
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-genes-green border-t-transparent" />
      </div>
    );
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'certificates', label: `Certificados (${certificates.length})` },
    { key: 'courses', label: `Cursos (${courses.length})` },
    { key: 'users', label: `Usuarios (${users.length})` },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src={genesLogo} alt="GENES Peru" width={40} height={40} />
            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">Panel de Administracion</h1>
              <p className="text-xs text-slate-500">Intranet GENES Peru</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/intranet/dashboard" className="text-sm text-slate-600 hover:text-genes-green transition">
              Mi Dashboard
            </Link>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {currentUser?.role}
            </span>
            <button onClick={logout} className="text-sm text-slate-500 hover:text-red-500 transition font-medium">Salir</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white rounded-lg p-1 border border-slate-200 w-fit">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                tab === t.key ? 'bg-genes-green text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Certificates Tab */}
        {tab === 'certificates' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Certificados Emitidos</h2>
              <button onClick={() => { setFormError(''); setModal('cert'); }}
                className="bg-genes-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-genes-green/90 transition">
                Emitir Certificado
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Participante</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Curso</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Codigo</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Fecha</th>
                  {isSuperadmin && <th className="text-left px-4 py-3 font-medium text-slate-600">Acciones</th>}
                </tr></thead>
                <tbody>
                  {certificates.map((c) => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-800">{c.full_name}</td>
                      <td className="px-4 py-3 text-slate-600">{c.course_name}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          c.type === 'certificado' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                        }`}>{c.type}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.verification_code}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(c.issue_date).toLocaleDateString('es-PE')}</td>
                      {isSuperadmin && (
                        <td className="px-4 py-3">
                          <button onClick={() => deleteCert(c.id)} className="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {certificates.length === 0 && <p className="text-center text-slate-400 py-8">No hay certificados emitidos</p>}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {tab === 'courses' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Cursos</h2>
              <button onClick={() => { setFormError(''); setModal('course'); }}
                className="bg-genes-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-genes-green/90 transition">
                Crear Curso
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((c) => (
                <div key={c.id} className="bg-white rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-slate-800 mb-1">{c.name}</h3>
                  {c.description && <p className="text-sm text-slate-500 mb-2 line-clamp-2">{c.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{c.hours} horas</span>
                    {c.instructor && <span>Instructor: {c.instructor}</span>}
                  </div>
                </div>
              ))}
              {courses.length === 0 && <p className="text-slate-400 col-span-full text-center py-8">No hay cursos creados</p>}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Usuarios</h2>
              <button onClick={() => { setFormError(''); setModal('user'); }}
                className="bg-genes-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-genes-green/90 transition">
                Agregar Usuario
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Usuario</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">DNI</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Estado</th>
                  {isSuperadmin && <th className="text-left px-4 py-3 font-medium text-slate-600">Acciones</th>}
                </tr></thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-800">{u.full_name}</td>
                      <td className="px-4 py-3 text-slate-600">{u.username}</td>
                      <td className="px-4 py-3 text-slate-500">{u.dni || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          u.role === 'superadmin' ? 'bg-purple-50 text-purple-700'
                          : u.role === 'admin' ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${u.active ? 'text-green-600' : 'text-red-500'}`}>
                          {u.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      {isSuperadmin && (
                        <td className="px-4 py-3 flex gap-2">
                          <button onClick={() => toggleUserActive(u)}
                            className="text-xs text-blue-600 hover:text-blue-800">
                            {u.active ? 'Desactivar' : 'Activar'}
                          </button>
                          <button onClick={() => deleteUser(u.id)} className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setModal(null)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            {modal === 'user' && (
              <form onSubmit={createUser} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Nuevo Usuario</h3>
                <input placeholder="Nombre completo *" required value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green" />
                <input placeholder="Username *" required value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green" />
                <input placeholder="Contrasena *" type="password" required value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green" />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="DNI" value={newUser.dni}
                    onChange={(e) => setNewUser({ ...newUser, dni: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green" />
                  <input placeholder="Email" type="email" value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green" />
                </div>
                {isSuperadmin && (
                  <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green">
                    <option value="user">Usuario</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                )}
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-genes-green text-white rounded-lg text-sm font-medium">Crear</button>
                </div>
              </form>
            )}

            {modal === 'course' && (
              <form onSubmit={createCourse} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Nuevo Curso</h3>
                <input placeholder="Nombre del curso *" required value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green" />
                <textarea placeholder="Descripcion" value={newCourse.description} rows={2}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green resize-none" />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Horas *" type="number" min={1} required value={newCourse.hours}
                    onChange={(e) => setNewCourse({ ...newCourse, hours: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green" />
                  <input placeholder="Instructor" value={newCourse.instructor}
                    onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green" />
                </div>
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-genes-green text-white rounded-lg text-sm font-medium">Crear</button>
                </div>
              </form>
            )}

            {modal === 'cert' && (
              <form onSubmit={issueCert} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Emitir Certificado</h3>
                <select required value={newCert.user_id}
                  onChange={(e) => setNewCert({ ...newCert, user_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green">
                  <option value="">Seleccionar participante *</option>
                  {users.filter((u) => u.active).map((u) => (
                    <option key={u.id} value={u.id}>{u.full_name} ({u.username})</option>
                  ))}
                </select>
                <select required value={newCert.course_id}
                  onChange={(e) => setNewCert({ ...newCert, course_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green">
                  <option value="">Seleccionar curso *</option>
                  {courses.filter((c) => c.active).map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.hours}h)</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <select value={newCert.type} onChange={(e) => setNewCert({ ...newCert, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green">
                    <option value="certificado">Certificado</option>
                    <option value="constancia">Constancia</option>
                  </select>
                  <input type="date" value={newCert.issue_date}
                    onChange={(e) => setNewCert({ ...newCert, issue_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green" />
                </div>
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-genes-green text-white rounded-lg text-sm font-medium">Emitir</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

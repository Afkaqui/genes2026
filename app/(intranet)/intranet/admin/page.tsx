"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import genesLogo from '@/public/logos/genesLogo.png';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User { id: number; username: string; full_name: string; dni: string; email: string; role: string; active: boolean; }
interface Course { id: number; name: string; description: string; hours: number; instructor: string; active: boolean; creator_name: string; }
interface Certificate { id: number; type: string; verification_code: string; issue_date: string; hours: number; course_name: string; course_id: number; full_name: string; issued_by_name: string | null; }

type Tab = 'certificates' | 'courses' | 'users';

/** Quita tildes/diacriticos y deja solo [a-z0-9]. */
function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Vista previa del username que generara el servidor:
 * inicial del primer nombre + primer apellido. Ej: "Ana Torres Ramirez" -> "atorres".
 * El backend es quien decide el valor final (y resuelve duplicados con sufijo).
 */
function buildUsernameBase(fullName: string): string {
  const parts = (fullName || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return slugify(parts[0]);
  const surnameIdx = parts.length >= 4 ? 2 : 1;
  const initial = slugify(parts[0]).charAt(0);
  return `${initial}${slugify(parts[surnameIdx])}`;
}

export default function AdminPanel() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ id: number; role: string; full_name: string } | null>(null);
  const [tab, setTab] = useState<Tab>('certificates');
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<Record<number, boolean>>({});

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
  // Si el admin edita el usuario a mano, dejamos de autogenerarlo
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', description: '', hours: 1, instructor: '' });
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [bulkCert, setBulkCert] = useState({ selectedUserIds: [] as number[], course_id: '', type: 'certificado', issue_date: '' });
  const [formError, setFormError] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ issued: number; skipped: number } | null>(null);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const res = await fetch(`${API_URL}/api/users`, { method: 'POST', headers: headers(), body: JSON.stringify(newUser) });
    if (!res.ok) { setFormError((await res.json()).message); return; }
    setNewUser({ username: '', password: '', full_name: '', dni: '', email: '', role: 'user' });
    setUsernameTouched(false);
    setModal(null);
    loadData();
  };

  const updateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setFormError('');
    const body: Record<string, unknown> = { full_name: editUser.full_name, dni: editUser.dni, email: editUser.email };
    if (isSuperadmin) { body.role = editUser.role; body.active = editUser.active; }
    const res = await fetch(`${API_URL}/api/users/${editUser.id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
    if (!res.ok) { setFormError((await res.json()).message); return; }
    setEditUser(null);
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

  const updateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourse) return;
    setFormError('');
    const res = await fetch(`${API_URL}/api/courses/${editCourse.id}`, {
      method: 'PUT', headers: headers(),
      body: JSON.stringify({ name: editCourse.name, description: editCourse.description, hours: editCourse.hours, instructor: editCourse.instructor, active: editCourse.active }),
    });
    if (!res.ok) { setFormError((await res.json()).message); return; }
    setEditCourse(null);
    setModal(null);
    loadData();
  };

  const issueBulkCerts = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (bulkCert.selectedUserIds.length === 0) { setFormError('Selecciona al menos un participante'); return; }
    if (!bulkCert.course_id) { setFormError('Selecciona un curso'); return; }

    setBulkLoading(true);
    setBulkResult(null);
    try {
      const res = await fetch(`${API_URL}/api/certificates/bulk`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({
          user_ids: bulkCert.selectedUserIds,
          course_id: parseInt(bulkCert.course_id),
          type: bulkCert.type,
          issue_date: bulkCert.issue_date || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message); setBulkLoading(false); return; }
      const skipped = bulkCert.selectedUserIds.length - data.issued;
      setBulkResult({ issued: data.issued, skipped });
      loadData();
    } catch {
      setFormError('Error de conexion');
    }
    setBulkLoading(false);
  };

  const toggleUserInBulk = (uid: number) => {
    setBulkCert(prev => ({
      ...prev,
      selectedUserIds: prev.selectedUserIds.includes(uid)
        ? prev.selectedUserIds.filter(id => id !== uid)
        : [...prev.selectedUserIds, uid],
    }));
  };

  const selectAllUsers = () => {
    const activeUserIds = users.filter(u => u.active).map(u => u.id);
    const allSelected = activeUserIds.every(id => bulkCert.selectedUserIds.includes(id));
    setBulkCert(prev => ({
      ...prev,
      selectedUserIds: allSelected ? [] : activeUserIds,
    }));
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

  // Agrupar certificados por curso
  const certsByCourse = (() => {
    const map = new Map<number, { course_id: number; course_name: string; certs: Certificate[] }>();
    for (const c of certificates) {
      if (!map.has(c.course_id)) {
        map.set(c.course_id, { course_id: c.course_id, course_name: c.course_name, certs: [] });
      }
      map.get(c.course_id)!.certs.push(c);
    }
    return Array.from(map.values()).sort((a, b) => a.course_name.localeCompare(b.course_name));
  })();

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green";

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Image src={genesLogo} alt="GENES Peru" width={40} height={40} className="shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight truncate">Panel de Administracion</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Intranet GENES Peru</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/intranet/dashboard" className="text-xs sm:text-sm text-slate-600 hover:text-genes-green transition whitespace-nowrap">
              Dashboard
            </Link>
            <Link href="/intranet/cuenta" className="text-xs sm:text-sm text-slate-600 hover:text-genes-green transition whitespace-nowrap">
              Mi Cuenta
            </Link>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
              {currentUser?.role}
            </span>
            <button onClick={logout} className="text-xs sm:text-sm text-slate-500 hover:text-red-500 transition font-medium">Salir</button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Tabs */}
        <div className="flex flex-wrap gap-1 mb-6 bg-white rounded-lg p-1 border border-slate-200 w-full sm:w-fit">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition ${
                tab === t.key ? 'bg-genes-green text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Certificates Tab */}
        {tab === 'certificates' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-slate-800">Certificados Emitidos</h2>
              <button onClick={() => { setFormError(''); setBulkResult(null); setBulkCert({ selectedUserIds: [], course_id: '', type: 'certificado', issue_date: '' }); setModal('cert'); }}
                className="bg-genes-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-genes-green/90 transition w-full sm:w-auto">
                Emitir Certificados
              </button>
            </div>

            {certificates.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
                No hay certificados emitidos
              </div>
            ) : (
              <div className="space-y-4">
                {certsByCourse.map((group) => {
                  const open = expandedCourses[group.course_id] ?? true;
                  return (
                    <div key={group.course_id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                      <button onClick={() => setExpandedCourses(prev => ({ ...prev, [group.course_id]: !open }))}
                        className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 hover:bg-slate-50 transition text-left">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}>▸</span>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-slate-800 truncate">{group.course_name}</h3>
                            <p className="text-xs text-slate-400">{group.certs.length} certificado{group.certs.length !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <span className="text-xs font-medium bg-genes-green/10 text-genes-green px-2.5 py-1 rounded-full shrink-0">
                          {group.certs.length}
                        </span>
                      </button>

                      {open && (
                        <div className="overflow-x-auto border-t border-slate-100">
                          <table className="w-full text-sm">
                            <thead><tr className="border-b border-slate-100 bg-slate-50/70">
                              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Participante</th>
                              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Tipo</th>
                              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Emitido por</th>
                              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Codigo</th>
                              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Fecha</th>
                              {isSuperadmin && <th className="text-left px-4 py-2.5 font-medium text-slate-600">Acciones</th>}
                            </tr></thead>
                            <tbody>
                              {group.certs.map((c) => (
                                <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                  <td className="px-4 py-3 text-slate-800">{c.full_name}</td>
                                  <td className="px-4 py-3">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                      c.type === 'certificado' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                                    }`}>{c.type}</span>
                                  </td>
                                  <td className="px-4 py-3 text-slate-500">{c.issued_by_name || '—'}</td>
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
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {tab === 'courses' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-slate-800">Cursos</h2>
              <button onClick={() => { setFormError(''); setModal('course'); }}
                className="bg-genes-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-genes-green/90 transition w-full sm:w-auto">
                Crear Curso
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((c) => (
                <div key={c.id} className={`bg-white rounded-xl border p-5 ${c.active ? 'border-slate-200' : 'border-red-200 bg-red-50/30'}`}>
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800">{c.name}</h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {!c.active && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Inactivo</span>}
                      <button onClick={() => { setEditCourse({ ...c }); setFormError(''); setModal('editCourse'); }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium">Editar</button>
                    </div>
                  </div>
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-slate-800">Usuarios</h2>
              <button onClick={() => {
                  setFormError('');
                  setNewUser({ username: '', password: '', full_name: '', dni: '', email: '', role: 'user' });
                  setUsernameTouched(false);
                  setModal('user');
                }}
                className="bg-genes-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-genes-green/90 transition w-full sm:w-auto">
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
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Acciones</th>
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
                      <td className="px-4 py-3 flex gap-2">
                        {/* Superadmin edita a todos; admin solo a usuarios regulares o a si mismo */}
                        {(isSuperadmin || u.role === 'user' || u.id === currentUser?.id) && (
                          <button onClick={() => { setEditUser({ ...u }); setFormError(''); setModal('editUser'); }}
                            className="text-xs text-blue-600 hover:text-blue-800">Editar</button>
                        )}
                        {/* Superadmin gestiona a todos; admin solo a usuarios regulares */}
                        {(isSuperadmin || u.role === 'user') && u.id !== currentUser?.id && (
                          <>
                            <button onClick={() => toggleUserActive(u)}
                              className="text-xs text-amber-600 hover:text-amber-800">
                              {u.active ? 'Desactivar' : 'Activar'}
                            </button>
                            <button onClick={() => deleteUser(u.id)} className="text-xs text-red-500 hover:text-red-700">Eliminar</button>
                          </>
                        )}
                      </td>
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {modal === 'user' && (
              <form onSubmit={createUser} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Nuevo Usuario</h3>
                <input placeholder="Nombre completo *" required value={newUser.full_name}
                  onChange={(e) => {
                    const full_name = e.target.value;
                    setNewUser((prev) => ({
                      ...prev,
                      full_name,
                      username: usernameTouched ? prev.username : buildUsernameBase(full_name),
                    }));
                  }}
                  className={inputClass} />
                <div>
                  <input placeholder="Usuario (se genera solo)" value={newUser.username}
                    onChange={(e) => {
                      const value = slugify(e.target.value);
                      if (value === '') {
                        // Vaciar el campo reanuda la autogeneracion desde el nombre
                        setUsernameTouched(false);
                        setNewUser((prev) => ({ ...prev, username: buildUsernameBase(prev.full_name) }));
                      } else {
                        setUsernameTouched(true);
                        setNewUser((prev) => ({ ...prev, username: value }));
                      }
                    }}
                    className={inputClass} />
                  <p className="text-xs text-slate-400 mt-1">
                    {usernameTouched
                      ? 'Editado manualmente. Vacíalo para volver a generarlo automáticamente.'
                      : 'Se genera del nombre: inicial + primer apellido. Puedes editarlo.'}
                  </p>
                </div>
                <input placeholder="Contrasena *" type="password" required value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="DNI" value={newUser.dni}
                    onChange={(e) => setNewUser({ ...newUser, dni: e.target.value })}
                    className={inputClass} />
                  <input placeholder="Email" type="email" value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className={inputClass} />
                </div>
                {isSuperadmin && (
                  <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className={inputClass}>
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
                  className={inputClass} />
                <textarea placeholder="Descripcion" value={newCourse.description} rows={2}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className={inputClass + ' resize-none'} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Horas *" type="number" min={1} required value={newCourse.hours}
                    onChange={(e) => setNewCourse({ ...newCourse, hours: parseInt(e.target.value) || 1 })}
                    className={inputClass} />
                  <input placeholder="Instructor" value={newCourse.instructor}
                    onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                    className={inputClass} />
                </div>
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-genes-green text-white rounded-lg text-sm font-medium">Crear</button>
                </div>
              </form>
            )}

            {modal === 'editCourse' && editCourse && (
              <form onSubmit={updateCourse} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Editar Curso</h3>
                <input placeholder="Nombre del curso *" required value={editCourse.name}
                  onChange={(e) => setEditCourse({ ...editCourse, name: e.target.value })}
                  className={inputClass} />
                <textarea placeholder="Descripcion" value={editCourse.description || ''} rows={2}
                  onChange={(e) => setEditCourse({ ...editCourse, description: e.target.value })}
                  className={inputClass + ' resize-none'} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Horas *" type="number" min={1} required value={editCourse.hours}
                    onChange={(e) => setEditCourse({ ...editCourse, hours: parseInt(e.target.value) || 1 })}
                    className={inputClass} />
                  <input placeholder="Instructor" value={editCourse.instructor || ''}
                    onChange={(e) => setEditCourse({ ...editCourse, instructor: e.target.value })}
                    className={inputClass} />
                </div>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={editCourse.active}
                    onChange={(e) => setEditCourse({ ...editCourse, active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-genes-green focus:ring-genes-green" />
                  Curso activo
                </label>
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-genes-green text-white rounded-lg text-sm font-medium">Guardar</button>
                </div>
              </form>
            )}

            {modal === 'editUser' && editUser && (
              <form onSubmit={updateUser} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Editar Usuario</h3>
                <p className="text-xs text-slate-400 -mt-2">Username: {editUser.username}</p>
                <input placeholder="Nombre completo *" required value={editUser.full_name}
                  onChange={(e) => setEditUser({ ...editUser, full_name: e.target.value })}
                  className={inputClass} />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="DNI" value={editUser.dni || ''}
                    onChange={(e) => setEditUser({ ...editUser, dni: e.target.value })}
                    className={inputClass} />
                  <input placeholder="Email" type="email" value={editUser.email || ''}
                    onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    className={inputClass} />
                </div>
                {isSuperadmin && (
                  <>
                    <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                      className={inputClass}>
                      <option value="user">Usuario</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={editUser.active}
                        onChange={(e) => setEditUser({ ...editUser, active: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-genes-green focus:ring-genes-green" />
                      Usuario activo
                    </label>
                  </>
                )}
                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-genes-green text-white rounded-lg text-sm font-medium">Guardar</button>
                </div>
              </form>
            )}

            {modal === 'cert' && (
              <form onSubmit={issueBulkCerts} className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Emitir Certificados</h3>
                <p className="text-sm text-slate-500 -mt-2">Selecciona uno o varios participantes para emitir certificados en lote.</p>

                <select required value={bulkCert.course_id}
                  onChange={(e) => setBulkCert({ ...bulkCert, course_id: e.target.value })}
                  className={inputClass}>
                  <option value="">Seleccionar curso *</option>
                  {courses.filter((c) => c.active).map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.hours}h)</option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <select value={bulkCert.type} onChange={(e) => setBulkCert({ ...bulkCert, type: e.target.value })}
                    className={inputClass}>
                    <option value="certificado">Certificado</option>
                    <option value="constancia">Constancia</option>
                  </select>
                  <input type="date" value={bulkCert.issue_date}
                    onChange={(e) => setBulkCert({ ...bulkCert, issue_date: e.target.value })}
                    className={inputClass} />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                      Participantes ({bulkCert.selectedUserIds.length} seleccionados)
                    </label>
                    <button type="button" onClick={selectAllUsers}
                      className="text-xs text-genes-green hover:text-genes-green/80 font-medium">
                      {users.filter(u => u.active).every(u => bulkCert.selectedUserIds.includes(u.id)) ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                  </div>
                  <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {users.filter(u => u.active).map(u => (
                      <label key={u.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 cursor-pointer">
                        <input type="checkbox"
                          checked={bulkCert.selectedUserIds.includes(u.id)}
                          onChange={() => toggleUserInBulk(u.id)}
                          className="w-4 h-4 rounded border-slate-300 text-genes-green focus:ring-genes-green shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-slate-800 truncate">{u.full_name}</p>
                          <p className="text-xs text-slate-400">{u.username}{u.dni ? ` - ${u.dni}` : ''}</p>
                        </div>
                      </label>
                    ))}
                    {users.filter(u => u.active).length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">No hay usuarios activos</p>
                    )}
                  </div>
                </div>

                {formError && <p className="text-red-500 text-sm">{formError}</p>}

                {bulkResult && (
                  <div className="text-sm px-4 py-2.5 rounded-lg border bg-green-50 text-green-700 border-green-200">
                    {bulkResult.issued} certificado{bulkResult.issued !== 1 ? 's' : ''} emitido{bulkResult.issued !== 1 ? 's' : ''} correctamente
                    {bulkResult.skipped > 0 && `. ${bulkResult.skipped} omitido${bulkResult.skipped !== 1 ? 's' : ''} (ya existian).`}
                  </div>
                )}

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600">
                    {bulkResult ? 'Cerrar' : 'Cancelar'}
                  </button>
                  {!bulkResult && (
                    <button type="submit" disabled={bulkLoading}
                      className="px-4 py-2 bg-genes-green text-white rounded-lg text-sm font-medium disabled:opacity-50">
                      {bulkLoading ? 'Emitiendo...' : `Emitir (${bulkCert.selectedUserIds.length})`}
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

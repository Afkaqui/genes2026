"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import genesLogo from '@/public/logos/genesLogo.png';
import { formatFechaCertificado } from '@/lib/fecha';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User { id: number; username: string; full_name: string; dni: string; email: string; role: string; active: boolean; has_logged_in?: boolean; invited_at?: string | null; }
interface Course { id: number; name: string; description: string; hours: number; instructor: string; active: boolean; creator_name: string; }
interface Certificate { id: number; type: string; verification_code: string; issue_date: string; hours: number; course_name: string; course_id: number; full_name: string; issued_by_name: string | null; downloaded_at?: string | null; download_count?: number; has_logged_in?: boolean; }

type SortDir = 'asc' | 'desc';
interface SortState { key: string; dir: SortDir }

/** Compara valores de distinto tipo dejando los vacios al final. */
function compareValues(a: unknown, b: unknown): number {
  const vacio = (v: unknown) => v === null || v === undefined || v === '';
  if (vacio(a) && vacio(b)) return 0;
  if (vacio(a)) return 1;
  if (vacio(b)) return -1;
  // Booleanos como numeros para que todas las columnas de estado ordenen igual:
  // ascendente deja primero lo pendiente (No / Inactivo / sin descargar).
  if (typeof a === 'boolean' || typeof b === 'boolean') return Number(a) - Number(b);
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'es', { sensitivity: 'base', numeric: true });
}

/** Ordena una copia de la lista segun el estado de orden. */
function sortRows<T>(rows: T[], sort: SortState | null, getValue: (row: T, key: string) => unknown): T[] {
  if (!sort) return rows;
  const orden = [...rows].sort((a, b) => compareValues(getValue(a, sort.key), getValue(b, sort.key)));
  return sort.dir === 'asc' ? orden : orden.reverse();
}

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

const limpiarNombre = (s: string) => s.replace(/\s+/g, ' ').trim().replace(/[.,;]+$/, '').trim();
const casoTitulo = (s: string) => (s === s.toUpperCase() ? s.toLowerCase().replace(/(^|\s)\p{L}/gu, (m) => m.toUpperCase()) : s);

/**
 * Las actas vienen como "APELLIDOS Y NOMBRES"; el sistema guarda "Nombres Apellidos".
 * Con coma el corte es exacto; sin coma se asume que los 2 primeros terminos son apellidos.
 */
function invertirNombre(nombre: string): string {
  const n = limpiarNombre(nombre);
  if (!n) return '';
  let apellidos: string, nombres: string;
  if (n.includes(',')) {
    const [a, b = ''] = n.split(',');
    apellidos = limpiarNombre(a);
    nombres = limpiarNombre(b);
  } else {
    const p = n.split(' ');
    if (p.length < 3) return casoTitulo(n);
    apellidos = p.slice(0, 2).join(' ');
    nombres = p.slice(2).join(' ');
  }
  if (!nombres) return casoTitulo(n);
  return limpiarNombre(`${casoTitulo(nombres)} ${casoTitulo(apellidos)}`);
}

/** Separa lo pegado desde Excel (TSV) o texto simple. */
function parsearPegado(texto: string): string[][] {
  return texto
    .split(/\r?\n/)
    .map((l) => (l.includes('\t') ? l.split('\t') : [l]))
    .map((c) => c.map((x) => x.trim()))
    .filter((c) => c.some((x) => x));
}

/** Detecta que columna es el nombre y cual el DNI. */
function detectarColumnas(filas: string[][]): { nombre: number; dni: number } {
  const cols = Math.max(...filas.map((f) => f.length), 1);
  let dni = -1, mejorDni = 0, nombre = 0, mejorNombre = -1;
  for (let c = 0; c < cols; c++) {
    let dniHits = 0, nomHits = 0;
    for (const f of filas) {
      const v = (f[c] || '').trim();
      if (/^\d{7,9}$/.test(v)) dniHits++;
      if (/\p{L}{2,}/u.test(v) && v.split(/[\s,]+/).filter(Boolean).length >= 2) nomHits++;
    }
    if (dniHits > mejorDni) { mejorDni = dniHits; dni = c; }
    if (nomHits > mejorNombre) { mejorNombre = nomHits; nombre = c; }
  }
  return { nombre, dni };
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
  const [userSort, setUserSort] = useState<SortState | null>({ key: 'full_name', dir: 'asc' });
  const [certSort, setCertSort] = useState<SortState | null>({ key: 'full_name', dir: 'asc' });

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
  const [editPassword, setEditPassword] = useState('');
  const [bulkCert, setBulkCert] = useState({ selectedUserIds: [] as number[], course_id: '', type: 'certificado', issue_date: '' });
  const [imp, setImp] = useState({ texto: '', invertir: true, course_id: '', type: 'certificado', issue_date: '' });
  const [impLoading, setImpLoading] = useState(false);
  const [impResult, setImpResult] = useState<{ creados: number; reutilizados: number; emitidos: number; ya_tenian: number } | null>(null);
  // Campaña de invitaciones (por curso, a quienes nunca ingresaron)
  interface CampaignStat { course_id: number; course_name: string; total: number; ingresaron: number; descargaron: number; pendientes_con_correo: number; pendientes_sin_correo: number; }
  const [campaign, setCampaign] = useState<CampaignStat[]>([]);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [sendingCourseId, setSendingCourseId] = useState<number | null>(null);
  const [campaignMsg, setCampaignMsg] = useState<{ course_id: number; text: string; ok: boolean } | null>(null);
  // Reenvio individual del acceso desde la fila del usuario
  const [invitingId, setInvitingId] = useState<number | null>(null);
  const [rowMsg, setRowMsg] = useState<{ id: number; text: string; ok: boolean } | null>(null);
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
    if (editPassword) { body.password = editPassword; }
    const res = await fetch(`${API_URL}/api/users/${editUser.id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(body) });
    if (!res.ok) { setFormError((await res.json()).message); return; }
    setEditUser(null);
    setEditPassword('');
    setModal(null);
    loadData();
  };

  /** Superadmin cambia contrasenas de cualquiera; el admin solo las de usuarios regulares. */
  const canResetPassword = (target: User) => isSuperadmin || target.role === 'user';

  // --- Campaña de invitaciones ---
  const openCampaign = async () => {
    setCampaignMsg(null);
    setModal('campaign');
    setCampaignLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/campaign-stats`, { headers: headers() });
      if (res.ok) setCampaign(await res.json());
    } catch { /* ignore */ }
    setCampaignLoading(false);
  };

  /** Reenvia el acceso a un solo usuario (por si perdio el primer correo). */
  const invitarUsuario = async (u: User) => {
    setRowMsg(null);
    setInvitingId(u.id);
    try {
      const res = await fetch(`${API_URL}/api/users/send-invitations`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ user_ids: [u.id] }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRowMsg({ id: u.id, text: data.message || 'Error al enviar', ok: false });
      } else if (data.enviados > 0) {
        setRowMsg({ id: u.id, text: 'Correo enviado', ok: true });
        loadData();
      } else {
        setRowMsg({ id: u.id, text: data.sin_correo ? 'Sin correo' : 'No se pudo enviar', ok: false });
      }
    } catch {
      setRowMsg({ id: u.id, text: 'Error de conexión', ok: false });
    }
    setInvitingId(null);
  };

  const sendCampaign = async (courseId: number) => {
    setCampaignMsg(null);
    setSendingCourseId(courseId);
    try {
      const res = await fetch(`${API_URL}/api/users/send-campaign`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({ course_id: courseId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCampaignMsg({ course_id: courseId, text: data.message || 'Error al enviar', ok: false });
      } else if (data.enviados === 0) {
        setCampaignMsg({ course_id: courseId, text: data.mensaje || 'No había pendientes con correo', ok: true });
      } else {
        setCampaignMsg({
          course_id: courseId, ok: true,
          text: `${data.enviados} invitación${data.enviados !== 1 ? 'es' : ''} enviada${data.enviados !== 1 ? 's' : ''}` +
            (data.fallidos > 0 ? ` · ${data.fallidos} con error` : ''),
        });
        // refresca stats y la tabla de usuarios
        const stats = await fetch(`${API_URL}/api/users/campaign-stats`, { headers: headers() });
        if (stats.ok) setCampaign(await stats.json());
        loadData();
      }
    } catch {
      setCampaignMsg({ course_id: courseId, text: 'Error de conexión', ok: false });
    }
    setSendingCourseId(null);
  };

  // --- Importacion de listas ---
  const impFilas = (() => {
    const filas = parsearPegado(imp.texto);
    if (filas.length === 0) return [];
    const { nombre: cn, dni: cd } = detectarColumnas(filas);
    const porDni = new Map(users.filter((u) => u.dni).map((u) => [u.dni.trim(), u]));
    const vistos = new Set<string>();

    return filas
      .map((f) => {
        const crudo = (f[cn] || '').trim();
        const dni = cd >= 0 ? (f[cd] || '').trim() : '';
        return { crudo, dni };
      })
      // descarta encabezados y filas sin nombre real
      .filter((r) => r.crudo && !/^(apellidos|nombre|n°|nro|dni|item)\b/i.test(r.crudo) && /\p{L}{2,}/u.test(r.crudo))
      .map((r) => {
        const nombre = imp.invertir ? invertirNombre(r.crudo) : limpiarNombre(r.crudo);
        const existente = r.dni ? porDni.get(r.dni) : undefined;
        const repetido = r.dni ? vistos.has(r.dni) : false;
        if (r.dni) vistos.add(r.dni);
        return {
          crudo: r.crudo,
          nombre,
          dni: r.dni,
          usuario: existente ? existente.username : buildUsernameBase(nombre),
          estado: repetido ? 'repetido' : existente ? 'existe' : 'nuevo',
        };
      });
  })();

  const runImport = async () => {
    setFormError('');
    if (impFilas.length === 0) { setFormError('Pega al menos una fila con nombre'); return; }
    setImpLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/users/import`, {
        method: 'POST', headers: headers(),
        body: JSON.stringify({
          participants: impFilas
            .filter((f) => f.estado !== 'repetido')
            .map((f) => ({ full_name: f.nombre, dni: f.dni })),
          course_id: imp.course_id ? parseInt(imp.course_id) : undefined,
          type: imp.type,
          issue_date: imp.issue_date || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.message); setImpLoading(false); return; }
      setImpResult({
        creados: data.usuarios.creados, reutilizados: data.usuarios.reutilizados,
        emitidos: data.certificados.emitidos, ya_tenian: data.certificados.ya_tenian,
      });
      loadData();
    } catch {
      setFormError('Error de conexion');
    }
    setImpLoading(false);
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

  const downloadPDF = (certId: number) => {
    window.open(`${API_URL}/api/certificates/${certId}/pdf?token=${getToken()}`, '_blank');
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

  /** Cabecera de tabla que ordena al hacer clic. */
  const SortableTh = ({ label, sortKey, sort, setSort, className = '' }: {
    label: string; sortKey: string; sort: SortState | null;
    setSort: (s: SortState) => void; className?: string;
  }) => {
    const activo = sort?.key === sortKey;
    return (
      <th className={`text-left font-medium text-slate-600 ${className}`}>
        <button type="button"
          onClick={() => setSort({ key: sortKey, dir: activo && sort!.dir === 'asc' ? 'desc' : 'asc' })}
          className={`flex items-center gap-1 hover:text-genes-green transition ${activo ? 'text-genes-green' : ''}`}
          title={`Ordenar por ${label.toLowerCase()}`}>
          {label}
          <span className={`text-[9px] leading-none ${activo ? '' : 'text-slate-300'}`}>
            {activo ? (sort!.dir === 'asc' ? '▲' : '▼') : '▲'}
          </span>
        </button>
      </th>
    );
  };

  const usersSorted = sortRows(users, userSort, (u, k) => {
    if (k === 'ingreso') return u.has_logged_in ? 2 : u.invited_at ? 1 : 0;
    return (u as unknown as Record<string, unknown>)[k];
  });

  const sortCerts = (list: Certificate[]) => sortRows(list, certSort, (c, k) => {
    if (k === 'descarga') return c.download_count ?? 0;
    if (k === 'issue_date') return c.issue_date?.slice(0, 10) ?? '';
    return (c as unknown as Record<string, unknown>)[k];
  });

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
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button onClick={() => { setFormError(''); setImpResult(null); setImp({ texto: '', invertir: true, course_id: '', type: 'certificado', issue_date: '' }); setModal('import'); }}
                  className="border border-genes-green text-genes-green px-4 py-2 rounded-lg text-sm font-medium hover:bg-genes-green/5 transition w-full sm:w-auto">
                  Importar lista
                </button>
                <button onClick={() => { setFormError(''); setBulkResult(null); setBulkCert({ selectedUserIds: [], course_id: '', type: 'certificado', issue_date: '' }); setModal('cert'); }}
                  className="bg-genes-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-genes-green/90 transition w-full sm:w-auto">
                  Emitir Certificados
                </button>
              </div>
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
                              <SortableTh label="Participante" sortKey="full_name" sort={certSort} setSort={setCertSort} className="px-4 py-2.5" />
                              <SortableTh label="Tipo" sortKey="type" sort={certSort} setSort={setCertSort} className="px-4 py-2.5" />
                              <SortableTh label="Descargado" sortKey="descarga" sort={certSort} setSort={setCertSort} className="px-4 py-2.5" />
                              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Emitido por</th>
                              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Codigo</th>
                              <SortableTh label="Fecha" sortKey="issue_date" sort={certSort} setSort={setCertSort} className="px-4 py-2.5" />
                              <th className="text-left px-4 py-2.5 font-medium text-slate-600">Acciones</th>
                            </tr></thead>
                            <tbody>
                              {sortCerts(group.certs).map((c) => (
                                <tr key={c.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50">
                                  <td className="px-4 py-3 text-slate-800">{c.full_name}</td>
                                  <td className="px-4 py-3">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                      c.type === 'certificado' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'
                                    }`}>{c.type}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {c.download_count ? (
                                      <span className="text-xs font-medium text-green-600"
                                        title={`${c.download_count} descarga${c.download_count !== 1 ? 's' : ''} · primera: ${formatFechaCertificado(c.downloaded_at)}`}>
                                        ✓ Sí{c.download_count > 1 ? ` (${c.download_count})` : ''}
                                      </span>
                                    ) : (
                                      <span className="text-xs text-slate-400">No</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-3 text-slate-500">{c.issued_by_name || '—'}</td>
                                  <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.verification_code}</td>
                                  <td className="px-4 py-3 text-slate-500">{formatFechaCertificado(c.issue_date)}</td>
                                  <td className="px-4 py-3 flex gap-3">
                                    <button onClick={() => downloadPDF(c.id)}
                                      className="text-genes-green hover:text-genes-green/70 text-xs font-medium">
                                      Descargar
                                    </button>
                                    {isSuperadmin && (
                                      <button onClick={() => deleteCert(c.id)} className="text-red-500 hover:text-red-700 text-xs">Eliminar</button>
                                    )}
                                  </td>
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
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button onClick={openCampaign}
                  className="border border-genes-green text-genes-green px-4 py-2 rounded-lg text-sm font-medium hover:bg-genes-green/5 transition w-full sm:w-auto">
                  Campaña de acceso
                </button>
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
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-slate-100 bg-slate-50">
                  <SortableTh label="Nombre" sortKey="full_name" sort={userSort} setSort={setUserSort} className="px-4 py-3" />
                  <SortableTh label="Usuario" sortKey="username" sort={userSort} setSort={setUserSort} className="px-4 py-3" />
                  <SortableTh label="Correo" sortKey="email" sort={userSort} setSort={setUserSort} className="px-4 py-3" />
                  <SortableTh label="Rol" sortKey="role" sort={userSort} setSort={setUserSort} className="px-4 py-3" />
                  <SortableTh label="Estado" sortKey="active" sort={userSort} setSort={setUserSort} className="px-4 py-3" />
                  <SortableTh label="Ingresó" sortKey="ingreso" sort={userSort} setSort={setUserSort} className="px-4 py-3" />
                  <th className="text-left px-4 py-3 font-medium text-slate-600">Acciones</th>
                </tr></thead>
                <tbody>
                  {usersSorted.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-800">{u.full_name}</td>
                      <td className="px-4 py-3 text-slate-600">{u.username}</td>
                      <td className="px-4 py-3 text-slate-500">
                        {u.email
                          ? <span className="text-slate-600">{u.email}</span>
                          : <span className="text-xs text-red-400">sin correo</span>}
                      </td>
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
                      <td className="px-4 py-3">
                        {u.has_logged_in ? (
                          <span className="text-xs font-medium text-green-600">✓ Sí</span>
                        ) : u.invited_at ? (
                          <span className="text-xs text-amber-600" title={`Invitado el ${formatFechaCertificado(u.invited_at)}`}>Invitado</span>
                        ) : (
                          <span className="text-xs text-slate-400">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Superadmin edita a todos; admin solo a usuarios regulares o a si mismo */}
                          {(isSuperadmin || u.role === 'user' || u.id === currentUser?.id) && (
                            <button onClick={() => { setEditUser({ ...u }); setEditPassword(''); setFormError(''); setModal('editUser'); }}
                              className="text-xs text-blue-600 hover:text-blue-800">Editar</button>
                          )}
                          {/* Reenvio individual del acceso (por si perdio el primer correo) */}
                          {(isSuperadmin || u.role === 'user') && u.email && (
                            rowMsg?.id === u.id ? (
                              <span className={`text-xs ${rowMsg.ok ? 'text-green-600' : 'text-red-500'}`}>{rowMsg.text}</span>
                            ) : (
                              <button onClick={() => invitarUsuario(u)} disabled={invitingId === u.id}
                                className="text-xs text-genes-green hover:text-genes-green/70 disabled:opacity-50"
                                title="Enviar el acceso a su correo">
                                {invitingId === u.id ? 'Enviando...' : u.invited_at ? 'Reenviar' : 'Enviar acceso'}
                              </button>
                            )
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
                        </div>
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
                <div>
                  <input placeholder="Contrasena (opcional)" type="password" value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className={inputClass} />
                  <p className="text-xs text-slate-400 mt-1">
                    Si la dejas vacía, la contraseña inicial será el mismo usuario
                    {newUser.username ? <> (<span className="font-mono text-slate-500">{newUser.username}</span>)</> : null}.
                  </p>
                </div>
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

                {canResetPassword(editUser) ? (
                  <div className="pt-1 border-t border-slate-100">
                    <label className="block text-sm font-medium text-slate-700 mt-3 mb-1">Restablecer contraseña</label>
                    <input type="password" value={editPassword} autoComplete="new-password"
                      onChange={(e) => setEditPassword(e.target.value)}
                      placeholder="Dejar vacío para no cambiarla"
                      className={inputClass} />
                    <button type="button"
                      onClick={() => setEditPassword(editUser.username)}
                      className="text-xs text-genes-green hover:text-genes-green/80 font-medium mt-1.5">
                      Usar el nombre de usuario ({editUser.username})
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 pt-1 border-t border-slate-100 mt-3">
                    Solo un superadministrador puede restablecer la contraseña de un administrador.
                  </p>
                )}

                {formError && <p className="text-red-500 text-sm">{formError}</p>}
                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600">Cancelar</button>
                  <button type="submit" className="px-4 py-2 bg-genes-green text-white rounded-lg text-sm font-medium">Guardar</button>
                </div>
              </form>
            )}

            {modal === 'campaign' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Campaña de acceso</h3>
                <p className="text-sm text-slate-500 -mt-2">
                  Reenvía el acceso a los participantes de cada curso que <strong>aún no ingresaron</strong>.
                  Cada uno recibe su usuario y contraseña para entrar y descargar su certificado.
                </p>

                {campaignLoading ? (
                  <div className="py-10 flex justify-center">
                    <div className="animate-spin rounded-full h-7 w-7 border-4 border-genes-green border-t-transparent" />
                  </div>
                ) : campaign.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No hay cursos con participantes todavía.</p>
                ) : (
                  <div className="space-y-3">
                    {campaign.map((c) => {
                      const progreso = c.total > 0 ? Math.round((c.ingresaron / c.total) * 100) : 0;
                      const msg = campaignMsg?.course_id === c.course_id ? campaignMsg : null;
                      const enviando = sendingCourseId === c.course_id;
                      return (
                        <div key={c.course_id} className="border border-slate-200 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h4 className="font-semibold text-slate-800 text-sm truncate">{c.course_name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {c.ingresaron} de {c.total} ingresaron · {c.descargaron} descargaron
                                {c.pendientes_sin_correo > 0 && ` · ${c.pendientes_sin_correo} sin correo`}
                              </p>
                            </div>
                            <button
                              onClick={() => sendCampaign(c.course_id)}
                              disabled={enviando || c.pendientes_con_correo === 0}
                              className="shrink-0 bg-genes-green text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-genes-green/90 transition disabled:opacity-40 disabled:cursor-not-allowed">
                              {enviando ? 'Enviando...'
                                : c.pendientes_con_correo === 0 ? 'Sin pendientes'
                                : `Enviar a ${c.pendientes_con_correo}`}
                            </button>
                          </div>

                          <div className="mt-2.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-genes-green rounded-full transition-all" style={{ width: `${progreso}%` }} />
                          </div>

                          {msg && (
                            <p className={`text-xs mt-2 ${msg.ok ? 'text-green-600' : 'text-red-500'}`}>{msg.text}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <p className="text-xs text-slate-400">
                  Solo se envía a quienes tienen correo registrado. Los que ya ingresaron no reciben nada.
                  La contraseña enviada es igual al usuario.
                </p>

                <div className="flex justify-end">
                  <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600">Cerrar</button>
                </div>
              </div>
            )}

            {modal === 'import' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Importar lista de participantes</h3>
                <p className="text-sm text-slate-500 -mt-2">
                  Copia las filas desde el Excel (nombre y DNI) y pégalas aquí. Se crean los usuarios que falten
                  y, si eliges un curso, se emite su certificado.
                </p>

                {!impResult && (
                  <>
                    <textarea value={imp.texto} rows={5}
                      onChange={(e) => setImp({ ...imp, texto: e.target.value })}
                      placeholder={"Pega aquí desde Excel. Ejemplo:\nTolentino Encarnación Abraham\t74362388\nDuran Trujillo, Deysi Rosa\t61599922"}
                      className={inputClass + ' font-mono text-xs resize-y'} />

                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" checked={imp.invertir}
                        onChange={(e) => setImp({ ...imp, invertir: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-300 text-genes-green focus:ring-genes-green" />
                      El nombre viene como <strong>Apellidos Nombres</strong> (invertir)
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <select value={imp.course_id} onChange={(e) => setImp({ ...imp, course_id: e.target.value })}
                        className={inputClass}>
                        <option value="">Sin curso (solo crear usuarios)</option>
                        {courses.filter((c) => c.active).map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.hours}h)</option>
                        ))}
                      </select>
                      <select value={imp.type} onChange={(e) => setImp({ ...imp, type: e.target.value })}
                        className={inputClass} disabled={!imp.course_id}>
                        <option value="certificado">Certificado</option>
                        <option value="constancia">Constancia</option>
                      </select>
                      <input type="date" value={imp.issue_date} disabled={!imp.course_id}
                        onChange={(e) => setImp({ ...imp, issue_date: e.target.value })}
                        className={inputClass} />
                    </div>

                    {impFilas.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2 text-sm">
                          <span className="font-medium text-slate-700">Previsualización ({impFilas.length})</span>
                          <span className="text-xs text-slate-500">
                            {impFilas.filter((f) => f.estado === 'nuevo').length} nuevos ·{' '}
                            {impFilas.filter((f) => f.estado === 'existe').length} ya existen
                            {impFilas.some((f) => f.estado === 'repetido') &&
                              ` · ${impFilas.filter((f) => f.estado === 'repetido').length} repetidos`}
                          </span>
                        </div>
                        <div className="border border-slate-200 rounded-lg max-h-56 overflow-auto">
                          <table className="w-full text-xs">
                            <thead className="sticky top-0 bg-slate-50">
                              <tr className="border-b border-slate-100">
                                <th className="text-left px-3 py-2 font-medium text-slate-600">Nombre a registrar</th>
                                <th className="text-left px-3 py-2 font-medium text-slate-600">Usuario</th>
                                <th className="text-left px-3 py-2 font-medium text-slate-600">DNI</th>
                                <th className="text-left px-3 py-2 font-medium text-slate-600">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {impFilas.map((f, i) => (
                                <tr key={i} className={`border-b border-slate-50 ${
                                  f.estado === 'repetido' ? 'bg-red-50/60' : f.estado === 'existe' ? 'bg-amber-50/50' : ''
                                }`}>
                                  <td className="px-3 py-1.5 text-slate-800">{f.nombre}</td>
                                  <td className="px-3 py-1.5 font-mono text-slate-500">{f.usuario}</td>
                                  <td className="px-3 py-1.5 text-slate-500">{f.dni || '—'}</td>
                                  <td className="px-3 py-1.5">
                                    <span className={`px-1.5 py-0.5 rounded-full font-medium ${
                                      f.estado === 'nuevo' ? 'bg-green-50 text-green-700'
                                      : f.estado === 'existe' ? 'bg-amber-50 text-amber-700'
                                      : 'bg-red-50 text-red-600'
                                    }`}>
                                      {f.estado === 'nuevo' ? 'Nuevo' : f.estado === 'existe' ? 'Ya existe' : 'Repetido'}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-slate-400 mt-1.5">
                          Los repetidos dentro de la lista se omiten. Los que ya existen reutilizan su cuenta.
                        </p>
                      </div>
                    )}
                  </>
                )}

                {impResult && (
                  <div className="text-sm px-4 py-3 rounded-lg border bg-green-50 text-green-800 border-green-200 space-y-1">
                    <p className="font-medium">Importación completada</p>
                    <p>{impResult.creados} usuarios creados · {impResult.reutilizados} ya existían</p>
                    {imp.course_id && (
                      <p>{impResult.emitidos} certificados emitidos
                        {impResult.ya_tenian > 0 && ` · ${impResult.ya_tenian} ya lo tenían`}</p>
                    )}
                  </div>
                )}

                {formError && <p className="text-red-500 text-sm">{formError}</p>}

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm text-slate-600">
                    {impResult ? 'Cerrar' : 'Cancelar'}
                  </button>
                  {!impResult && (
                    <button type="button" onClick={runImport} disabled={impLoading || impFilas.length === 0}
                      className="px-4 py-2 bg-genes-green text-white rounded-lg text-sm font-medium disabled:opacity-50">
                      {impLoading ? 'Importando...' : `Importar (${impFilas.filter((f) => f.estado !== 'repetido').length})`}
                    </button>
                  )}
                </div>
              </div>
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

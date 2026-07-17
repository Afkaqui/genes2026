"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import genesLogo from '@/public/logos/genesLogo.png';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface User {
  id: number;
  username: string;
  full_name: string;
  dni: string;
  email: string;
  role: string;
  active: boolean;
}

export default function CuentaPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [pwdLoading, setPwdLoading] = useState(false);

  const [editName, setEditName] = useState('');
  const [editDni, setEditDni] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);

  const [roleMsg, setRoleMsg] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const getToken = () => localStorage.getItem('genes_token');
  const authHeaders = () => ({ Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

  const isAdmin = currentUser?.role === 'admin' || currentUser?.role === 'superadmin';
  const isSuperadmin = currentUser?.role === 'superadmin';

  const logout = useCallback(() => {
    localStorage.removeItem('genes_token');
    localStorage.removeItem('genes_user');
    router.push('/intranet');
  }, [router]);

  const loadData = useCallback(async () => {
    const token = getToken();
    if (!token) { router.push('/intranet'); return; }

    try {
      const meRes = await fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (meRes.status === 401) { logout(); return; }
      const me = await meRes.json();
      setCurrentUser(me);
      setEditName(me.full_name);
      setEditDni(me.dni || '');
      setEditEmail(me.email || '');

      if (me.role === 'superadmin') {
        const uRes = await fetch(`${API_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } });
        if (uRes.ok) setUsers(await uRes.json());
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [router, logout]);

  useEffect(() => {
    const stored = localStorage.getItem('genes_user');
    if (!stored) { router.push('/intranet'); return; }
    loadData();
  }, [router, loadData]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword.length < 6) {
      setPwdMsg({ type: 'error', text: 'La nueva contrasena debe tener al menos 6 caracteres' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Las contrasenas no coinciden' });
      return;
    }

    setPwdLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwdMsg({ type: 'error', text: data.message });
      } else {
        setPwdMsg({ type: 'ok', text: 'Contrasena actualizada correctamente' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setPwdMsg({ type: 'error', text: 'Error de conexion' });
    }
    setPwdLoading(false);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setProfileMsg(null);
    setProfileLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ full_name: editName, dni: editDni, email: editEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setProfileMsg({ type: 'error', text: data.message });
      } else {
        setProfileMsg({ type: 'ok', text: 'Datos actualizados correctamente' });
        setEditingProfile(false);
        const stored = localStorage.getItem('genes_user');
        if (stored) {
          const u = JSON.parse(stored);
          u.full_name = editName;
          localStorage.setItem('genes_user', JSON.stringify(u));
        }
        loadData();
      }
    } catch {
      setProfileMsg({ type: 'error', text: 'Error de conexion' });
    }
    setProfileLoading(false);
  };

  const changeRole = async (userId: number, newRole: string) => {
    setRoleMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setRoleMsg({ type: 'error', text: data.message });
      } else {
        setRoleMsg({ type: 'ok', text: 'Rol actualizado correctamente' });
        loadData();
      }
    } catch {
      setRoleMsg({ type: 'error', text: 'Error de conexion' });
    }
  };

  const inputClass = "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-genes-green";

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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Image src={genesLogo} alt="GENES Peru" width={40} height={40} className="shrink-0" />
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">Mi Cuenta</h1>
              <p className="text-xs text-slate-500 hidden sm:block">Configuracion de usuario</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link href="/intranet/dashboard" className="text-xs sm:text-sm text-slate-600 hover:text-genes-green transition whitespace-nowrap">
              Dashboard
            </Link>
            <button onClick={logout} className="text-xs sm:text-sm text-slate-500 hover:text-red-500 transition font-medium">Salir</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* User info */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Informacion Personal</h2>
            {isAdmin && !editingProfile && (
              <button onClick={() => { setEditingProfile(true); setProfileMsg(null); }}
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 font-medium">
                Editar
              </button>
            )}
          </div>

          {editingProfile && isAdmin ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Nombre completo</label>
                  <input required value={editName} onChange={(e) => setEditName(e.target.value)}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Usuario</label>
                  <p className="px-3 py-2 text-sm text-slate-400 bg-slate-50 rounded-lg border border-slate-200">{currentUser?.username}</p>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">DNI</label>
                  <input value={editDni} onChange={(e) => setEditDni(e.target.value)}
                    className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Email</label>
                  <input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)}
                    className={inputClass} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Rol:</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  currentUser?.role === 'superadmin' ? 'bg-purple-50 text-purple-700'
                  : currentUser?.role === 'admin' ? 'bg-amber-50 text-amber-700'
                  : 'bg-slate-100 text-slate-600'
                }`}>{currentUser?.role}</span>
              </div>

              {profileMsg && (
                <div className={`text-sm px-4 py-2.5 rounded-lg border ${
                  profileMsg.type === 'ok' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'
                }`}>{profileMsg.text}</div>
              )}

              <div className="flex gap-3">
                <button type="submit" disabled={profileLoading}
                  className="bg-genes-green text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-genes-green/90 transition disabled:opacity-50">
                  {profileLoading ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => { setEditingProfile(false); setEditName(currentUser?.full_name || ''); setEditDni(currentUser?.dni || ''); setEditEmail(currentUser?.email || ''); }}
                  className="px-5 py-2 text-sm text-slate-600 hover:text-slate-800">Cancelar</button>
              </div>
            </form>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Nombre completo</span>
                  <p className="font-medium text-slate-800">{currentUser?.full_name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Usuario</span>
                  <p className="font-medium text-slate-800">{currentUser?.username}</p>
                </div>
                <div>
                  <span className="text-slate-500">DNI</span>
                  <p className="font-medium text-slate-800">{currentUser?.dni || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Email</span>
                  <p className="font-medium text-slate-800">{currentUser?.email || '—'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Rol</span>
                  <p className="font-medium">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      currentUser?.role === 'superadmin' ? 'bg-purple-50 text-purple-700'
                      : currentUser?.role === 'admin' ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                    }`}>{currentUser?.role}</span>
                  </p>
                </div>
              </div>
              {!isAdmin && <p className="text-xs text-slate-400 mt-3">Para modificar tus datos, contacta a un administrador.</p>}

              {profileMsg && (
                <div className={`text-sm px-4 py-2.5 rounded-lg border mt-4 ${
                  profileMsg.type === 'ok' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-100'
                }`}>{profileMsg.text}</div>
              )}
            </>
          )}
        </div>

        {/* Change password */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Cambiar Contrasena</h2>
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contrasena actual</label>
              <input type="password" required value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={inputClass}
                placeholder="Ingresa tu contrasena actual" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nueva contrasena</label>
              <input type="password" required value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                placeholder="Minimo 6 caracteres" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar nueva contrasena</label>
              <input type="password" required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                placeholder="Repite la nueva contrasena" />
            </div>

            {pwdMsg && (
              <div className={`text-sm px-4 py-2.5 rounded-lg border ${
                pwdMsg.type === 'ok'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-100'
              }`}>{pwdMsg.text}</div>
            )}

            <button type="submit" disabled={pwdLoading}
              className="bg-genes-green text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-genes-green/90 transition disabled:opacity-50">
              {pwdLoading ? 'Guardando...' : 'Cambiar Contrasena'}
            </button>
          </form>
        </div>

        {/* Superadmin: manage roles */}
        {isSuperadmin && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-1">Gestionar Roles de Usuarios</h2>
            <p className="text-sm text-slate-500 mb-4">Solo visible para superadministradores</p>

            {roleMsg && (
              <div className={`text-sm px-4 py-2.5 rounded-lg border mb-4 ${
                roleMsg.type === 'ok'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-100'
              }`}>{roleMsg.text}</div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Nombre</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Usuario</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Rol Actual</th>
                    <th className="text-left px-4 py-3 font-medium text-slate-600">Cambiar Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 text-slate-800">{u.full_name}</td>
                      <td className="px-4 py-3 text-slate-600">{u.username}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          u.role === 'superadmin' ? 'bg-purple-50 text-purple-700'
                          : u.role === 'admin' ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3">
                        {u.id === currentUser?.id ? (
                          <span className="text-xs text-slate-400">Tu cuenta</span>
                        ) : (
                          <select value={u.role}
                            onChange={(e) => changeRole(u.id, e.target.value)}
                            className="text-sm px-2 py-1 rounded border border-slate-300 text-slate-700 outline-none focus:ring-2 focus:ring-genes-green">
                            <option value="user">Usuario</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                          </select>
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
    </div>
  );
}

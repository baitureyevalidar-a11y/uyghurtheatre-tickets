'use client'

import { useState, useEffect } from 'react'
import { Plus, Shield, Ban } from 'lucide-react'

interface User {
  id: string
  fullName: string
  phone: string
  email: string | null
  role: string
  isBlocked: boolean
  createdAt: string
}

const roleColors: Record<string, string> = {
  USER: 'bg-gray-100 text-gray-600',
  ADMIN: 'bg-blue-100 text-blue-600',
  SUPER_ADMIN: 'bg-purple-100 text-purple-600',
  CASHIER: 'bg-green-100 text-green-600',
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newUser, setNewUser] = useState({ fullName: '', phone: '', email: '', password: '', role: 'CASHIER' })

  useEffect(() => {
    fetch('/api/admin/users').then((r) => r.json()).then((d) => setUsers(d.users || d || [])).catch(console.error)
  }, [])

  const handleCreate = async () => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    })
    if (res.ok) {
      const user = await res.json()
      setUsers((prev) => [...prev, user])
      setShowCreate(false)
      setNewUser({ fullName: '', phone: '', email: '', password: '', role: 'CASHIER' })
    }
  }

  const toggleBlock = async (id: string, block: boolean) => {
    await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isBlocked: block }),
    })
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isBlocked: block } : u))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-darkBrown">Пользователи</h1>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-burgundy text-white rounded-lg hover:bg-burgundy/90 text-sm">
          <Plus className="w-4 h-4" /> Создать
        </button>
      </div>

      {showCreate && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-brown/5 mb-6 space-y-3">
          <h3 className="font-heading font-bold text-darkBrown">Новый пользователь</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="ФИО" value={newUser.fullName} onChange={(e) => setNewUser((p) => ({ ...p, fullName: e.target.value }))}
              className="px-4 py-2 border border-brown/20 rounded-lg bg-cream/30 text-sm" />
            <input placeholder="Телефон" value={newUser.phone} onChange={(e) => setNewUser((p) => ({ ...p, phone: e.target.value }))}
              className="px-4 py-2 border border-brown/20 rounded-lg bg-cream/30 text-sm" />
            <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
              className="px-4 py-2 border border-brown/20 rounded-lg bg-cream/30 text-sm" />
            <input placeholder="Пароль" type="password" value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))}
              className="px-4 py-2 border border-brown/20 rounded-lg bg-cream/30 text-sm" />
          </div>
          <select value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}
            className="px-4 py-2 border border-brown/20 rounded-lg bg-cream/30 text-sm">
            <option value="CASHIER">Кассир</option>
            <option value="ADMIN">Администратор</option>
          </select>
          <div className="flex gap-2">
            <button onClick={handleCreate} className="px-4 py-2 bg-burgundy text-white rounded-lg text-sm">Создать</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-brown/20 rounded-lg text-sm">Отмена</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-brown/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-brown/5 text-left text-xs text-brown/50 uppercase">
              <th className="px-4 py-3">Имя</th>
              <th className="px-4 py-3">Телефон</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Роль</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-brown/5 hover:bg-cream/30">
                <td className="px-4 py-3 font-medium text-darkBrown">{user.fullName}</td>
                <td className="px-4 py-3 text-sm">{user.phone}</td>
                <td className="px-4 py-3 text-sm text-brown/60">{user.email || '—'}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${roleColors[user.role]}`}>{user.role}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${user.isBlocked ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {user.isBlocked ? 'Заблокирован' : 'Активен'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleBlock(user.id, !user.isBlocked)}
                    className={`p-1.5 rounded-lg ${user.isBlocked ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}>
                    {user.isBlocked ? <Shield className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

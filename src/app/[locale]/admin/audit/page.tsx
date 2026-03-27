'use client'

import { useState, useEffect } from 'react'
import { Download, Search } from 'lucide-react'
import { formatDateTime } from '@/lib/utils'

interface AuditEntry {
  id: string
  action: string
  entityType: string
  entityId: string
  details: Record<string, unknown> | null
  ipAddress: string | null
  createdAt: string
  user: { fullName: string; role: string } | null
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/admin/audit')
      .then((r) => r.json())
      .then((d) => setLogs(d.logs || d || []))
      .catch(console.error)
  }, [])

  const filtered = logs.filter((l) =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entityType.toLowerCase().includes(search.toLowerCase()) ||
    (l.user?.fullName || '').toLowerCase().includes(search.toLowerCase())
  )

  const exportCSV = () => {
    const header = 'Дата,Пользователь,Действие,Тип,ID,IP\n'
    const rows = filtered.map((l) =>
      `"${formatDateTime(l.createdAt)}","${l.user?.fullName || ''}","${l.action}","${l.entityType}","${l.entityId}","${l.ipAddress || ''}"`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'audit-log.csv'
    a.click()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold text-darkBrown">Аудит-лог</h1>
        <button onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 border border-brown/20 rounded-lg text-sm hover:bg-cream">
          <Download className="w-4 h-4" /> CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-brown/5 overflow-hidden">
        <div className="p-4 border-b border-brown/5">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/30" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск..."
              className="w-full pl-10 pr-4 py-2 border border-brown/20 rounded-lg text-sm bg-cream/50" />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b border-brown/5 text-left text-xs text-brown/50 uppercase">
              <th className="px-4 py-3">Дата</th>
              <th className="px-4 py-3">Пользователь</th>
              <th className="px-4 py-3">Действие</th>
              <th className="px-4 py-3">Объект</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log) => (
              <tr key={log.id} className="border-b border-brown/5 hover:bg-cream/30">
                <td className="px-4 py-3 text-sm text-brown/60">{formatDateTime(log.createdAt)}</td>
                <td className="px-4 py-3 text-sm">{log.user?.fullName || '—'}</td>
                <td className="px-4 py-3 text-sm font-medium text-darkBrown">{log.action}</td>
                <td className="px-4 py-3 text-sm text-brown/60">{log.entityType} #{log.entityId.substring(0, 8)}</td>
                <td className="px-4 py-3 text-xs font-mono text-brown/40">{log.ipAddress || '—'}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-brown/40">Нет записей</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

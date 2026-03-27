'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { User, Phone, Mail, Lock } from 'lucide-react'

export default function RegisterPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError(t('passwordMismatch'))
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || t('registerError'))
      } else {
        router.push(`/${locale}/auth/login?registered=true`)
      }
    } catch {
      setError(t('registerError'))
    } finally {
      setLoading(false)
    }
  }

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gold/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-burgundy mb-2">🎭</h1>
            <h2 className="text-2xl font-heading font-bold text-darkBrown">{t('register')}</h2>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-brown mb-1">{t('fullName')}</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" />
                <input type="text" value={form.fullName} onChange={update('fullName')}
                  className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-xl focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy bg-cream/50" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-1">{t('phone')}</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" />
                <input type="tel" value={form.phone} onChange={update('phone')} placeholder="+7..."
                  className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-xl focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy bg-cream/50" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-1">{t('email')} <span className="text-brown/40">(optional)</span></label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" />
                <input type="email" value={form.email} onChange={update('email')}
                  className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-xl focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy bg-cream/50" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-1">{t('password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" />
                <input type="password" value={form.password} onChange={update('password')} minLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-xl focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy bg-cream/50" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-1">{t('confirmPassword')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" />
                <input type="password" value={form.confirmPassword} onChange={update('confirmPassword')} minLength={6}
                  className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-xl focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy bg-cream/50" required />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-burgundy text-white rounded-xl font-medium hover:bg-burgundy/90 transition-colors disabled:opacity-50 mt-2">
              {loading ? '...' : t('register')}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-brown/60">
            {t('hasAccount')}{' '}
            <a href={`/${locale}/auth/login`} className="text-burgundy font-medium hover:underline">{t('login')}</a>
          </p>
        </div>
      </div>
    </div>
  )
}

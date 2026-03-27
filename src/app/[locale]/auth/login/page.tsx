'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Phone, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        phone,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(t('invalidCredentials'))
      } else {
        router.push(`/${locale}`)
        router.refresh()
      }
    } catch {
      setError(t('loginError'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gold/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-burgundy mb-2">
              🎭
            </h1>
            <h2 className="text-2xl font-heading font-bold text-darkBrown">
              {t('login')}
            </h2>
            <p className="text-brown/60 mt-1 text-sm">
              Ұйғыр театры
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-brown mb-1.5">
                {t('phone')}
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full pl-10 pr-4 py-3 border border-brown/20 rounded-xl focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy bg-cream/50 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brown mb-1.5">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brown/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-brown/20 rounded-xl focus:ring-2 focus:ring-burgundy/30 focus:border-burgundy bg-cream/50 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brown/40 hover:text-brown"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-burgundy text-white rounded-xl font-medium hover:bg-burgundy/90 transition-colors disabled:opacity-50"
            >
              {loading ? '...' : t('login')}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-brown/60">
            {t('noAccount')}{' '}
            <a href={`/${locale}/auth/register`} className="text-burgundy font-medium hover:underline">
              {t('register')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { CreditCard, Smartphone, Banknote, CheckCircle2 } from 'lucide-react'

export type PaymentMethod = 'KASPI' | 'CARD' | 'APPLE_PAY' | 'GOOGLE_PAY' | 'CASH'

interface PaymentOption {
  id: PaymentMethod
  label: string
  description: string
  icon: React.ReactNode
  iconBg: string
  borderColor: string
}

interface PaymentMethodSelectorProps {
  value: PaymentMethod | ''
  onChange: (value: PaymentMethod) => void
  error?: string
}

const KaspiIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#E4002B" />
    <text x="12" y="16.5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="sans-serif">K</text>
  </svg>
)

const ApplePayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#000" />
    <text x="12" y="16" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white" fontFamily="-apple-system,sans-serif">Pay</text>
  </svg>
)

const GooglePayIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="white" stroke="#e5e7eb" />
    <text x="12" y="16" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#4285F4" fontFamily="sans-serif">GPay</text>
  </svg>
)

export default function PaymentMethodSelector({
  value,
  onChange,
  error,
}: PaymentMethodSelectorProps) {
  const t = useTranslations('checkout')

  const options: PaymentOption[] = [
    {
      id: 'KASPI',
      label: t('kaspiPay'),
      description: 'QR-код или ссылка в приложение',
      icon: <KaspiIcon />,
      iconBg: 'bg-red-50',
      borderColor: 'border-red-200 group-has-[:checked]:border-red-400',
    },
    {
      id: 'CARD',
      label: t('bankCard'),
      description: 'Visa / Mastercard',
      icon: <CreditCard className="w-6 h-6 text-blue-600" />,
      iconBg: 'bg-blue-50',
      borderColor: 'border-blue-200 group-has-[:checked]:border-blue-400',
    },
    {
      id: 'APPLE_PAY',
      label: t('applePay'),
      description: 'Touch ID / Face ID',
      icon: <ApplePayIcon />,
      iconBg: 'bg-gray-100',
      borderColor: 'border-gray-200 group-has-[:checked]:border-gray-800',
    },
    {
      id: 'GOOGLE_PAY',
      label: t('googlePay'),
      description: 'Google Pay wallet',
      icon: <GooglePayIcon />,
      iconBg: 'bg-gray-50',
      borderColor: 'border-gray-200 group-has-[:checked]:border-blue-500',
    },
    {
      id: 'CASH',
      label: t('cash'),
      description: 'Оплата в кассе театра',
      icon: <Banknote className="w-6 h-6 text-green-700" />,
      iconBg: 'bg-green-50',
      borderColor: 'border-green-200 group-has-[:checked]:border-green-500',
    },
  ]

  return (
    <div>
      <p className="text-sm font-medium text-brown mb-3">{t('paymentMethod')}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const isSelected = value === opt.id
          return (
            <label
              key={opt.id}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg border-2 p-3 cursor-pointer',
                'transition-all duration-150 select-none',
                isSelected
                  ? 'border-burgundy bg-burgundy/5'
                  : 'border-brown/15 bg-white hover:border-brown/30 hover:bg-cream/30',
              )}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={opt.id}
                checked={isSelected}
                onChange={() => onChange(opt.id)}
                className="sr-only"
              />
              <div className={cn('flex-shrink-0 w-10 h-10 rounded-md flex items-center justify-center', opt.iconBg)}>
                {opt.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-darkBrown">{opt.label}</p>
                <p className="text-xs text-brown/60 truncate">{opt.description}</p>
              </div>
              {isSelected && (
                <CheckCircle2 className="w-5 h-5 text-burgundy flex-shrink-0" />
              )}
            </label>
          )
        })}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600" role="alert">{error}</p>
      )}
    </div>
  )
}

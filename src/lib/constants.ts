export const THEATER_INFO = {
  name: {
    uy: 'ق. كۈجامياروۋ ئاتتىغى مەملىكەتتىك ئۇيغۇر مۇزىكىلىق كومېدىيە تېئاترى',
    ru: 'Государственный республиканский академический Уйгурский театр музыкальной комедии им. К. Кужамьярова',
    kz: 'Қ. Күжамиаров атындағы Мемлекеттік республикалық академиялық Ұйғыр музыкалық комедия театры',
  },
  shortName: {
    uy: 'ئۇيغۇر تېئاترى',
    ru: 'Уйгурский театр',
    kz: 'Ұйғыр театры',
  },
  address: {
    uy: 'الماتا، ناۋرىزباي باتىر كوچىسى، 83',
    ru: 'г. Алматы, ул. Наурызбай батыра, 83',
    kz: 'Алматы қ., Наурызбай батыр к., 83',
  },
  phone: '+7 (727) 272-93-72',
  email: 'info@uyghurtheatre.kz',
  website: 'https://uyghurtheatre.kz',
  social: {
    instagram: 'https://instagram.com/uyghurtheatre',
    facebook: 'https://facebook.com/uyghurtheatre',
    youtube: 'https://youtube.com/@uyghurtheatre',
  },
} as const

export const TIMEZONE = 'Asia/Almaty'

export const REFUND_RULES = {
  MORE_THAN_7_DAYS: 100,
  BETWEEN_3_AND_7_DAYS: 70,
  BETWEEN_1_AND_3_DAYS: 50,
  LESS_THAN_24_HOURS: 0,
} as const

export const RESERVATION_TIMEOUT = {
  ONLINE_MINUTES: 15,
  CASHIER_HOURS: 48,
} as const

export const ORDER_NUMBER_PREFIX = 'UYT'

export const GENRES = [
  'COMEDY',
  'DRAMA',
  'MUSICAL',
  'CONCERT',
  'CHILDREN',
  'FOLKLORE',
  'OTHER',
] as const

export const AGE_RESTRICTIONS = ['0+', '6+', '12+', '16+', '18+'] as const

export const SEAT_COLORS = {
  available: {
    REGULAR: '#93c5fd',
    VIP: '#c084fc',
    WHEELCHAIR: '#86efac',
    RESTRICTED_VIEW: '#fcd34d',
  },
  selected: '#C9A84C',
  occupied: '#9ca3af',
  reserved: '#d1d5db',
} as const

export const SECTOR_COLORS: Record<string, string> = {
  'Партер': '#6B1D2A',
  'Балкон': '#C9A84C',
  'Ложа': '#8B4513',
} as const

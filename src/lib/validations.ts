import { z } from 'zod'

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{10,15}$/, 'Введите корректный номер телефона')

const passwordSchema = z
  .string()
  .min(8, 'Пароль должен содержать не менее 8 символов')
  .max(100, 'Пароль слишком длинный')

const emailOptionalSchema = z
  .string()
  .trim()
  .email('Введите корректный email')
  .optional()
  .or(z.literal(''))
  .transform((val) => (val === '' ? undefined : val))

export const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'Введите пароль'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    phone: phoneSchema,
    email: emailOptionalSchema,
    fullName: z.string().trim().min(2, 'Минимум 2 символа').max(100),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Подтвердите пароль'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, 'Введите имя').max(100),
  customerPhone: phoneSchema,
  customerEmail: emailOptionalSchema,
  paymentMethod: z.enum(['KASPI', 'CARD', 'APPLE_PAY', 'GOOGLE_PAY', 'CASH'] as const, {
    message: 'Выберите способ оплаты',
  }),
})

export type CheckoutInput = z.infer<typeof checkoutSchema>

export const eventSchema = z.object({
  titleKz: z.string().trim().min(1, 'Введите название'),
  titleRu: z.string().trim().min(1, 'Введите название'),
  titleUy: z.string().trim().min(1, 'Введите название'),
  descriptionKz: z.string().trim().min(1, 'Введите описание'),
  descriptionRu: z.string().trim().min(1, 'Введите описание'),
  descriptionUy: z.string().trim().min(1, 'Введите описание'),
  posterImage: z.string().trim(),
  galleryImages: z.array(z.string().trim()).default([]),
  genre: z.enum(['COMEDY', 'DRAMA', 'MUSICAL', 'CONCERT', 'CHILDREN', 'FOLKLORE', 'OTHER'] as const, {
    message: 'Выберите жанр',
  }),
  duration: z.number().int().min(1, 'Минимум 1 минута'),
  ageRestriction: z.string().trim().min(1, 'Укажите возраст'),
  isActive: z.boolean().default(true),
})

export type EventInput = z.infer<typeof eventSchema>

export const showSchema = z
  .object({
    eventId: z.string().uuid('Некорректный ID'),
    hallId: z.string().uuid('Некорректный ID'),
    dateTime: z.coerce.date({ message: 'Укажите дату' }),
    salesStart: z.coerce.date({ message: 'Укажите начало продаж' }),
    salesEnd: z.coerce.date({ message: 'Укажите конец продаж' }),
    specialConditions: z.string().trim().optional(),
  })
  .refine((data) => data.salesEnd > data.salesStart, {
    message: 'Конец продаж должен быть позже начала',
    path: ['salesEnd'],
  })

export type ShowInput = z.infer<typeof showSchema>

export const refundRequestSchema = z.object({
  ticketId: z.string().uuid('Некорректный ID'),
  reason: z.string().trim().min(10, 'Минимум 10 символов').max(1000),
})

export type RefundRequestInput = z.infer<typeof refundRequestSchema>

export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    // Check if admin already exists — only run once
    const existing = await prisma.user.findUnique({
      where: { phone: '+77001234567' },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Setup already completed. Admin user exists.' },
        { status: 409 }
      )
    }

    // Create admin user
    const adminHash = await bcrypt.hash('Admin123!', 12)
    await prisma.user.create({
      data: {
        phone: '+77001234567',
        email: 'admin@uyghurtheatre.kz',
        fullName: 'Администратор Театра',
        passwordHash: adminHash,
        role: 'SUPER_ADMIN',
      },
    })

    // Create cashier user
    const cashierHash = await bcrypt.hash('Cashier123!', 12)
    await prisma.user.create({
      data: {
        phone: '+77001234568',
        email: 'cashier@uyghurtheatre.kz',
        fullName: 'Кассир Театра',
        passwordHash: cashierHash,
        role: 'CASHIER',
      },
    })

    // Create hall
    const hall = await prisma.hall.create({
      data: {
        name: 'Негізгі зал / Основной зал',
        totalSeats: 300,
        seatMapSVG: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect x="250" y="20" width="300" height="40" rx="5" fill="#6B1D2A"/><text x="400" y="46" text-anchor="middle" fill="white" font-size="16">САХНА / СЦЕНА</text></svg>',
        isActive: true,
      },
    })

    // Create sectors
    const parter = await prisma.sector.create({
      data: { hallId: hall.id, name: 'Партер', color: '#6B1D2A' },
    })
    const balcony = await prisma.sector.create({
      data: { hallId: hall.id, name: 'Балкон', color: '#C9A84C' },
    })
    const loge = await prisma.sector.create({
      data: { hallId: hall.id, name: 'Ложа', color: '#8B4513' },
    })

    // Create seats
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const seats: any[] = []

    // Parter: 10 rows x 20 seats = 200
    for (let row = 1; row <= 10; row++) {
      for (let seat = 1; seat <= 20; seat++) {
        seats.push({
          sectorId: parter.id,
          row,
          seatNumber: seat,
          x: 80 + (seat - 1) * 34,
          y: 100 + (row - 1) * 38,
          seatType: row <= 3 ? 'VIP' : 'REGULAR',
        })
      }
    }

    // Balcony: 4 rows x 20 seats = 80
    for (let row = 1; row <= 4; row++) {
      for (let seat = 1; seat <= 20; seat++) {
        seats.push({
          sectorId: balcony.id,
          row,
          seatNumber: seat,
          x: 80 + (seat - 1) * 34,
          y: 500 + (row - 1) * 30,
          seatType: 'REGULAR',
        })
      }
    }

    // Loge: 2 rows x 10 seats = 20
    for (let row = 1; row <= 2; row++) {
      for (let seat = 1; seat <= 5; seat++) {
        seats.push({
          sectorId: loge.id, row, seatNumber: seat,
          x: 10 + (seat - 1) * 14, y: 150 + (row - 1) * 100, seatType: 'VIP',
        })
        seats.push({
          sectorId: loge.id, row, seatNumber: seat + 5,
          x: 730 + (seat - 1) * 14, y: 150 + (row - 1) * 100, seatType: 'VIP',
        })
      }
    }

    await prisma.seat.createMany({ data: seats })

    // Create events
    const events = await Promise.all([
      prisma.event.create({
        data: {
          titleUy: 'كۆزى ۋە بايان',
          titleRu: 'Козы и Баян',
          titleKz: 'Қозы және Баян',
          descriptionUy: 'ئۇيغۇر تېئاترىنىڭ كلاسسىك دراما ئەسەرى. مۇھەببەت ۋە پىداكارلىق توغرىسىدىكى تارىخىي ھېكايە.',
          descriptionRu: 'Классическая драма Уйгурского театра. Историческая повесть о любви и самопожертвовании. Спектакль основан на казахском народном эпосе.',
          descriptionKz: 'Ұйғыр театрының классикалық драмасы. Махаббат пен құрбандық туралы тарихи хикая.',
          posterImage: '/images/events/kozy-bayan.jpg',
          galleryImages: ['/images/events/kozy-bayan-1.jpg', '/images/events/kozy-bayan-2.jpg'],
          genre: 'DRAMA',
          duration: 120,
          ageRestriction: '12+',
          isActive: true,
        },
      }),
      prisma.event.create({
        data: {
          titleUy: 'كېلىنلار كۆزگىلىنى',
          titleRu: 'Келинлар Козгилини',
          titleKz: 'Келіндер көзгіліні',
          descriptionUy: 'كۈلكىلىك كومېدىيە. ئائىلىلىك تۇرمۇشتىكى قىزىقلىق ۋەقەلەر.',
          descriptionRu: 'Весёлая комедия. Забавные перипетии семейной жизни. Яркие характеры и неожиданные повороты сюжета.',
          descriptionKz: 'Көңілді комедия. Отбасылық өмірдегі қызықты оқиғалар.',
          posterImage: '/images/events/kelinlar.jpg',
          galleryImages: ['/images/events/kelinlar-1.jpg'],
          genre: 'COMEDY',
          duration: 90,
          ageRestriction: '6+',
          isActive: true,
        },
      }),
      prisma.event.create({
        data: {
          titleUy: 'كاشقاردا ماشئال',
          titleRu: 'Кашкарда Машъал',
          titleKz: 'Қашқарда Машъал',
          descriptionUy: 'تارىخىي دراما. كاشقاردىكى قەھرىمانلىق ۋەقەلەرنى سۆزلەيدۇ.',
          descriptionRu: 'Историческая драма. Повествует о героических событиях в Кашгаре. Глубокий спектакль о борьбе за свободу.',
          descriptionKz: 'Тарихи драма. Қашқардағы ерлік оқиғалар туралы баяндайды.',
          posterImage: '/images/events/kashkarda.jpg',
          galleryImages: ['/images/events/kashkarda-1.jpg', '/images/events/kashkarda-2.jpg'],
          genre: 'DRAMA',
          duration: 120,
          ageRestriction: '16+',
          isActive: true,
        },
      }),
    ])

    // Create shows (2 per event, future dates)
    const now = new Date()
    const shows = []
    for (const event of events) {
      for (let i = 1; i <= 2; i++) {
        const showDate = new Date(now)
        showDate.setDate(showDate.getDate() + i * 7 + Math.floor(Math.random() * 5))
        showDate.setHours(19, 0, 0, 0)

        const salesStart = new Date(now)
        salesStart.setDate(salesStart.getDate() - 7)

        const salesEnd = new Date(showDate)
        salesEnd.setHours(salesEnd.getHours() - 1)

        const show = await prisma.show.create({
          data: {
            eventId: event.id,
            hallId: hall.id,
            dateTime: showDate,
            ticketSalesStart: salesStart,
            ticketSalesEnd: salesEnd,
            status: 'ON_SALE',
          },
        })
        shows.push(show)
      }
    }

    // Create price tiers
    for (const show of shows) {
      await prisma.priceTier.createMany({
        data: [
          { showId: show.id, sectorId: parter.id, seatType: 'REGULAR', price: 3000, currency: 'KZT' },
          { showId: show.id, sectorId: parter.id, seatType: 'VIP', price: 5000, currency: 'KZT' },
          { showId: show.id, sectorId: balcony.id, seatType: 'REGULAR', price: 2000, currency: 'KZT' },
          { showId: show.id, sectorId: loge.id, seatType: 'VIP', price: 7000, currency: 'KZT' },
        ],
      })
    }

    // System settings
    await prisma.systemSettings.createMany({
      data: [
        { key: 'refund_7days_percent', value: '100' },
        { key: 'refund_3to7days_percent', value: '70' },
        { key: 'refund_1to3days_percent', value: '50' },
        { key: 'refund_less24h_percent', value: '0' },
        { key: 'online_reservation_minutes', value: '15' },
        { key: 'cashier_reservation_hours', value: '48' },
        { key: 'theater_name', value: 'Қ. Күжамиаров атындағы Мемлекеттік республикалық академиялық Ұйғыр музыкалық комедия театры' },
        { key: 'theater_address', value: 'Алматы, ул. Наурызбай батыра, 83' },
        { key: 'theater_phone', value: '+7 (727) 272-59-33' },
        { key: 'theater_email', value: 'uyghurtheatrekz@gmail.com' },
      ],
    })

    return NextResponse.json({
      success: true,
      message: 'Setup completed. Admin: +77001234567 / Admin123!',
      data: {
        users: 2,
        hall: 1,
        sectors: 3,
        seats: seats.length,
        events: events.length,
        shows: shows.length,
      },
    })
  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json(
      { error: 'Setup failed', details: String(error) },
      { status: 500 }
    )
  }
}

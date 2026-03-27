import { PrismaClient, Genre, SeatType, ShowStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function generateSeatMapSVG(): string {
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" class="seat-map">`
  svg += `<rect x="250" y="20" width="300" height="40" rx="5" fill="#6B1D2A" />`
  svg += `<text x="400" y="46" text-anchor="middle" fill="white" font-size="16">САХНА / СЦЕНА</text>`
  svg += `</svg>`
  return svg
}

async function main() {
  console.log('🎭 Seeding Uyghur Theatre database...')

  // Clean existing data
  await prisma.auditLog.deleteMany()
  await prisma.refund.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.order.deleteMany()
  await prisma.priceTier.deleteMany()
  await prisma.show.deleteMany()
  await prisma.seat.deleteMany()
  await prisma.sector.deleteMany()
  await prisma.hall.deleteMany()
  await prisma.event.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const adminPassword = await bcrypt.hash('Admin123!', 12)
  const cashierPassword = await bcrypt.hash('Cashier123!', 12)

  const admin = await prisma.user.create({
    data: {
      phone: '+77001234567',
      email: 'admin@uyghurtheatre.kz',
      fullName: 'Администратор Театра',
      passwordHash: adminPassword,
      role: 'SUPER_ADMIN',
    },
  })

  const cashier = await prisma.user.create({
    data: {
      phone: '+77001234568',
      email: 'cashier@uyghurtheatre.kz',
      fullName: 'Кассир Театра',
      passwordHash: cashierPassword,
      role: 'CASHIER',
    },
  })

  console.log('✅ Users created')

  // Create hall
  const hall = await prisma.hall.create({
    data: {
      name: 'Негізгі зал / Основной зал',
      totalSeats: 300,
      seatMapSVG: generateSeatMapSVG(),
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

  console.log('✅ Hall and sectors created')

  // Create seats - Parter (200 seats: 10 rows x 20 seats)
  const seats: any[] = []
  for (let row = 1; row <= 10; row++) {
    for (let seat = 1; seat <= 20; seat++) {
      seats.push({
        sectorId: parter.id,
        row,
        seatNumber: seat,
        x: 80 + (seat - 1) * 34,
        y: 100 + (row - 1) * 38,
        seatType: row <= 3 ? SeatType.VIP : SeatType.REGULAR,
      })
    }
  }

  // Balcony (80 seats: 4 rows x 20 seats)
  for (let row = 1; row <= 4; row++) {
    for (let seat = 1; seat <= 20; seat++) {
      seats.push({
        sectorId: balcony.id,
        row,
        seatNumber: seat,
        x: 80 + (seat - 1) * 34,
        y: 500 + (row - 1) * 30,
        seatType: SeatType.REGULAR,
      })
    }
  }

  // Loge (20 seats: 2 rows x 10 seats, split left and right)
  for (let row = 1; row <= 2; row++) {
    for (let seat = 1; seat <= 5; seat++) {
      // Left loge
      seats.push({
        sectorId: loge.id,
        row,
        seatNumber: seat,
        x: 10 + (seat - 1) * 14,
        y: 150 + (row - 1) * 100,
        seatType: SeatType.VIP,
      })
      // Right loge
      seats.push({
        sectorId: loge.id,
        row,
        seatNumber: seat + 5,
        x: 730 + (seat - 1) * 14,
        y: 150 + (row - 1) * 100,
        seatType: SeatType.VIP,
      })
    }
  }

  await prisma.seat.createMany({ data: seats })
  console.log(`✅ ${seats.length} seats created`)

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
        genre: Genre.DRAMA,
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
        genre: Genre.COMEDY,
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
        genre: Genre.DRAMA,
        duration: 120,
        ageRestriction: '16+',
        isActive: true,
      },
    }),
  ])

  console.log('✅ Events created')

  // Create shows (2 per event)
  const now = new Date()
  const shows = []
  for (const event of events) {
    for (let i = 1; i <= 2; i++) {
      const showDate = new Date(now)
      showDate.setDate(showDate.getDate() + i * 7 + Math.floor(Math.random() * 5))
      showDate.setHours(19, 0, 0, 0) // 19:00

      const salesStart = new Date(now)
      salesStart.setDate(salesStart.getDate() - 7)

      const salesEnd = new Date(showDate)
      salesEnd.setHours(salesEnd.getHours() - 1) // 1 hour before show

      const show = await prisma.show.create({
        data: {
          eventId: event.id,
          hallId: hall.id,
          dateTime: showDate,
          ticketSalesStart: salesStart,
          ticketSalesEnd: salesEnd,
          status: ShowStatus.ON_SALE,
        },
      })
      shows.push(show)
    }
  }

  console.log('✅ Shows created')

  // Create price tiers
  for (const show of shows) {
    await prisma.priceTier.createMany({
      data: [
        { showId: show.id, sectorId: parter.id, seatType: SeatType.REGULAR, price: 3000, currency: 'KZT' },
        { showId: show.id, sectorId: parter.id, seatType: SeatType.VIP, price: 5000, currency: 'KZT' },
        { showId: show.id, sectorId: balcony.id, seatType: SeatType.REGULAR, price: 2000, currency: 'KZT' },
        { showId: show.id, sectorId: loge.id, seatType: SeatType.VIP, price: 7000, currency: 'KZT' },
      ],
    })
  }

  console.log('✅ Price tiers created')

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
      { key: 'theater_phone', value: '+7 (727) 272-93-72' },
      { key: 'theater_email', value: 'info@uyghurtheatre.kz' },
    ],
  })

  console.log('✅ System settings created')
  console.log('🎉 Seed completed successfully!')
  console.log('')
  console.log('Admin login: admin@uyghurtheatre.kz / Admin123!')
  console.log('Cashier login: cashier@uyghurtheatre.kz / Cashier123!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

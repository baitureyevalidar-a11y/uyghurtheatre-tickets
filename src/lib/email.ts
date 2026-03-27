import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
})

interface TicketEmailData {
  to: string
  customerName: string
  orderNumber: string
  eventTitle: string
  showDate: string
  hallName: string
  seats: Array<{ row: number; seat: number; sector: string }>
  totalAmount: string
  qrCodes: Array<{ seatInfo: string; qrDataUrl: string }>
}

export async function sendTicketEmail(data: TicketEmailData) {
  const seatsList = data.seats
    .map((s) => `Ряд ${s.row}, Место ${s.seat} (${s.sector})`)
    .join('<br/>')

  const qrImages = data.qrCodes
    .map(
      (qr) => `
      <div style="margin: 10px 0; text-align: center;">
        <p style="margin: 5px 0;">${qr.seatInfo}</p>
        <img src="${qr.qrDataUrl}" alt="QR Code" width="200" height="200" />
      </div>
    `
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: 'Noto Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #F5F0E8; padding: 20px;">
      <div style="background: #6B1D2A; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #C9A84C; font-family: 'Playfair Display', serif; margin: 0;">
          Ұйғыр театры
        </h1>
        <p style="color: #F5F0E8; margin: 5px 0 0;">Электронный билет</p>
      </div>

      <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px;">
        <p style="color: #3D2B1F;">Құрметті ${data.customerName},</p>
        <p style="color: #3D2B1F;">Спасибо за покупку билетов!</p>

        <div style="background: #F5F0E8; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #6B1D2A; margin-top: 0;">${data.eventTitle}</h2>
          <p><strong>Дата:</strong> ${data.showDate}</p>
          <p><strong>Зал:</strong> ${data.hallName}</p>
          <p><strong>Места:</strong><br/>${seatsList}</p>
          <p><strong>Заказ №:</strong> ${data.orderNumber}</p>
          <p><strong>Итого:</strong> ${data.totalAmount}</p>
        </div>

        <h3 style="color: #6B1D2A; text-align: center;">Ваши QR-коды для входа:</h3>
        ${qrImages}

        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Покажите QR-код на входе в театр. Один QR-код = один вход.<br/>
          Адрес: г. Алматы, ул. Наурызбай батыра, 83<br/>
          Тел: +7 (727) 272-93-72
        </p>
      </div>
    </body>
    </html>
  `

  if (!process.env.SMTP_USER) {
    console.log('[EMAIL] SMTP not configured. Would send to:', data.to)
    console.log('[EMAIL] Subject: Ваши билеты -', data.eventTitle)
    return
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'tickets@uyghurtheatre.kz',
    to: data.to,
    subject: `Ваши билеты — ${data.eventTitle} | Ұйғыр театры`,
    html,
  })
}

export async function sendSmsNotification(phone: string, message: string) {
  if (!process.env.SMS_API_KEY) {
    console.log('[SMS] SMS not configured. Would send to:', phone, message)
    return
  }

  // Integration with smsc.kz or similar KZ SMS provider
  // This is a placeholder - implement with actual SMS API
  console.log(`[SMS] Sending to ${phone}: ${message}`)
}

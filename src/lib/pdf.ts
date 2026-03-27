import { jsPDF } from 'jspdf'

interface TicketPDFData {
  orderNumber: string
  eventTitle: string
  showDate: string
  hallName: string
  row: number
  seatNumber: number
  sector: string
  price: string
  qrDataUrl: string
  ticketId: string
}

export function generateTicketPDF(ticket: TicketPDFData): Buffer {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [210, 100],
  })

  // Background
  doc.setFillColor(245, 240, 232) // cream
  doc.rect(0, 0, 210, 100, 'F')

  // Header bar
  doc.setFillColor(107, 29, 42) // burgundy
  doc.rect(0, 0, 210, 18, 'F')

  // Theater name
  doc.setTextColor(201, 168, 76) // gold
  doc.setFontSize(14)
  doc.text('UYGHUR THEATRE', 10, 12)

  doc.setTextColor(245, 240, 232)
  doc.setFontSize(8)
  doc.text('Electronic Ticket / Электронный билет', 120, 12)

  // Event title
  doc.setTextColor(42, 24, 16) // darkBrown
  doc.setFontSize(16)
  doc.text(ticket.eventTitle, 10, 30)

  // Details
  doc.setFontSize(10)
  doc.setTextColor(61, 43, 31) // brown

  doc.text(`Date / Дата: ${ticket.showDate}`, 10, 40)
  doc.text(`Hall / Зал: ${ticket.hallName}`, 10, 48)
  doc.text(`Sector / Сектор: ${ticket.sector}`, 10, 56)
  doc.text(`Row / Ряд: ${ticket.row}  Seat / Место: ${ticket.seatNumber}`, 10, 64)
  doc.text(`Price / Цена: ${ticket.price}`, 10, 72)

  // Order info
  doc.setFontSize(8)
  doc.setTextColor(107, 29, 42)
  doc.text(`Order / Заказ: ${ticket.orderNumber}`, 10, 82)
  doc.text(`Ticket ID: ${ticket.ticketId.substring(0, 8)}...`, 10, 88)

  // QR Code
  if (ticket.qrDataUrl) {
    doc.addImage(ticket.qrDataUrl, 'PNG', 155, 22, 45, 45)
  }

  // Scan instruction
  doc.setFontSize(7)
  doc.setTextColor(107, 29, 42)
  doc.text('Scan QR at entrance', 160, 72)

  // Footer line
  doc.setDrawColor(201, 168, 76) // gold
  doc.setLineWidth(0.5)
  doc.line(10, 92, 200, 92)

  doc.setFontSize(6)
  doc.setTextColor(61, 43, 31)
  doc.text('Almaty, Nauryzbai Batyr St. 83 | +7 (727) 272-93-72 | uyghurtheatre.kz', 10, 96)

  return Buffer.from(doc.output('arraybuffer'))
}

export function generateTicketsPDF(tickets: TicketPDFData[]): Buffer {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  })

  tickets.forEach((ticket, index) => {
    if (index > 0) doc.addPage()

    const yOffset = 20

    // Header
    doc.setFillColor(107, 29, 42)
    doc.rect(0, 0, 297, 25, 'F')

    doc.setTextColor(201, 168, 76)
    doc.setFontSize(18)
    doc.text('UYGHUR THEATRE', 15, 16)

    doc.setTextColor(245, 240, 232)
    doc.setFontSize(10)
    doc.text('Electronic Ticket', 200, 16)

    // Content
    doc.setTextColor(42, 24, 16)
    doc.setFontSize(22)
    doc.text(ticket.eventTitle, 15, yOffset + 25)

    doc.setFontSize(14)
    doc.setTextColor(61, 43, 31)
    doc.text(`${ticket.showDate}`, 15, yOffset + 40)
    doc.text(`${ticket.hallName}`, 15, yOffset + 52)

    doc.setFontSize(18)
    doc.setTextColor(107, 29, 42)
    doc.text(`${ticket.sector}  |  Row ${ticket.row}  |  Seat ${ticket.seatNumber}`, 15, yOffset + 70)

    doc.setFontSize(16)
    doc.text(`${ticket.price}`, 15, yOffset + 85)

    // QR
    if (ticket.qrDataUrl) {
      doc.addImage(ticket.qrDataUrl, 'PNG', 210, yOffset + 10, 65, 65)
    }

    // Footer
    doc.setFontSize(9)
    doc.setTextColor(61, 43, 31)
    doc.text(`Order: ${ticket.orderNumber}`, 15, yOffset + 100)

    doc.setDrawColor(201, 168, 76)
    doc.setLineWidth(0.5)
    doc.line(15, yOffset + 105, 280, yOffset + 105)

    doc.setFontSize(8)
    doc.text(
      'K. Kuzhamyarov Uyghur Theatre | Almaty, Nauryzbai Batyr St. 83 | uyghurtheatre.kz',
      15,
      yOffset + 112
    )
  })

  return Buffer.from(doc.output('arraybuffer'))
}

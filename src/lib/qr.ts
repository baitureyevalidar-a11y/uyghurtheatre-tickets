import crypto from 'crypto'
import QRCode from 'qrcode'

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const QR_SECRET = process.env.QR_SECRET ?? 'uyghur-theatre-qr-secret-change-me'
const HMAC_ALGORITHM = 'sha256'
const SEPARATOR = '.'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QRPayload {
  ticketId: string
  issuedAt: number // Unix timestamp ms
  sig: string
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function computeHmac(data: string): string {
  return crypto
    .createHmac(HMAC_ALGORITHM, QR_SECRET)
    .update(data)
    .digest('hex')
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generates an HMAC-signed QR code payload string for a given ticket ID.
 * Format: base64(ticketId + "." + issuedAt) + "." + hmacSignature
 */
export function generateTicketQR(ticketId: string): string {
  const issuedAt = Date.now()
  const body = `${ticketId}${SEPARATOR}${issuedAt}`
  const encodedBody = Buffer.from(body).toString('base64url')
  const sig = computeHmac(encodedBody)
  return `${encodedBody}${SEPARATOR}${sig}`
}

/**
 * Verifies an HMAC-signed QR payload.
 * Returns the ticketId and issuedAt if valid, or null if the signature is
 * invalid or the payload is malformed.
 */
export function verifyTicketQR(
  qrPayload: string,
): { ticketId: string; issuedAt: number } | null {
  try {
    const lastDot = qrPayload.lastIndexOf(SEPARATOR)
    if (lastDot === -1) return null

    const encodedBody = qrPayload.slice(0, lastDot)
    const providedSig = qrPayload.slice(lastDot + 1)

    // Constant-time comparison to prevent timing attacks
    const expectedSig = computeHmac(encodedBody)
    const expectedBuf = Buffer.from(expectedSig, 'utf8')
    const providedBuf = Buffer.from(providedSig, 'utf8')

    if (
      expectedBuf.length !== providedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, providedBuf)
    ) {
      return null
    }

    const body = Buffer.from(encodedBody, 'base64url').toString('utf8')
    const dotIndex = body.indexOf(SEPARATOR)
    if (dotIndex === -1) return null

    const ticketId = body.slice(0, dotIndex)
    const issuedAt = parseInt(body.slice(dotIndex + 1), 10)

    if (!ticketId || isNaN(issuedAt)) return null

    return { ticketId, issuedAt }
  } catch {
    return null
  }
}

/**
 * Generates a QR code as a base64-encoded data URL (PNG) from a plain string.
 * Suitable for embedding directly in an <img src="..."> tag.
 */
export async function generateQRDataURL(data: string): Promise<string> {
  return QRCode.toDataURL(data, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 300,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  })
}

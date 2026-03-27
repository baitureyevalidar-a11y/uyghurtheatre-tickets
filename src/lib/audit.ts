import prisma from './db'

export async function logAudit(params: {
  userId?: string
  action: string
  entityType: string
  entityId: string
  details?: Record<string, unknown>
  ipAddress?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: (params.details as Record<string, string | number | boolean>) ?? undefined,
        ipAddress: params.ipAddress || null,
      },
    })
  } catch (error) {
    console.error('[AUDIT] Failed to log:', error)
  }
}

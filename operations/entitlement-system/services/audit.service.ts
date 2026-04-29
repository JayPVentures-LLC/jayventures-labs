export type AuditEvent = {
  id: string;
  type: string;
  subject?: string;
  actor?: string;
  status: 'success' | 'failure' | 'info';
  reason?: string;
  data?: Record<string, unknown>;
  created_at: string;
};

export type AuditEnv = {
  ENTITLEMENT_KV: KVNamespace;
};

export async function writeAuditEvent(env: AuditEnv, event: Omit<AuditEvent, 'id' | 'created_at'>): Promise<AuditEvent> {
  const record: AuditEvent = {
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    ...event,
  };

  const day = record.created_at.slice(0, 10);
  await env.ENTITLEMENT_KV.put(`audit:${day}:${record.id}`, JSON.stringify(record));

  if (record.subject) {
    await env.ENTITLEMENT_KV.put(`audit:subject:${record.subject}:${record.id}`, JSON.stringify(record));
  }

  return record;
}

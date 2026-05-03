import type { Env } from "../types/env";
import type { CRMRecord } from "../types/crm";
import { pushInnerCircleMember } from "./integrations/sharepointMembers";

export type InnerCircleMemberProfile = {
  memberKey: string;
  memberId: string;
  email?: string;
  name?: string;
  createdAt: string;
  sharepointSyncedAt?: string;
};

function getClaimString(claims: Record<string, unknown>, key: string): string | undefined {
  const value = claims[key];
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

function memberKeyFromClaims(claims: Record<string, unknown>): string | null {
  return (
    getClaimString(claims, "member_id") ||
    getClaimString(claims, "memberId") ||
    getClaimString(claims, "id") ||
    getClaimString(claims, "sub") ||
    getClaimString(claims, "email") ||
    null
  );
}

function emailFromClaims(claims: Record<string, unknown>): string | undefined {
  return getClaimString(claims, "email");
}

function nameFromClaims(claims: Record<string, unknown>): string | undefined {
  const name = getClaimString(claims, "name") || getClaimString(claims, "full_name");
  if (name) return name;
  const first = getClaimString(claims, "first_name");
  const last = getClaimString(claims, "last_name");
  if (first && last) return `${first} ${last}`;
  return first || last;
}

function memberKeyFromRecord(record: CRMRecord): string | null {
  return record.memberstackId || record.email || null;
}

function randomDigits(count: number): string {
  const bytes = new Uint8Array(count);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => (byte % 10).toString()).join("");
}

function generateMemberId(): string {
  return `JVXM-${randomDigits(4)}-${randomDigits(4)}`;
}

function memberKeyToKvKey(memberKey: string): string {
  return `inner-circle:member:${memberKey}`;
}

async function syncSharePoint(env: Env, profile: InnerCircleMemberProfile): Promise<InnerCircleMemberProfile> {
  if (!env.SHAREPOINT_MEMBERS_LIST_ID || profile.sharepointSyncedAt) return profile;

  const result = await pushInnerCircleMember(env, profile);
  if (result.status !== "ok") return profile;

  return { ...profile, sharepointSyncedAt: new Date().toISOString() };
}

async function getOrCreateByKey(
  env: Env,
  memberKey: string,
  details?: { email?: string; name?: string },
  options?: { dryRun?: boolean }
): Promise<{ memberId: string; profile: InnerCircleMemberProfile } | null> {
  if (!env.INNER_CIRCLE_MEMBER_KV) return null;

  const kvKey = memberKeyToKvKey(memberKey);
  const existing = await env.INNER_CIRCLE_MEMBER_KV.get(kvKey);

  if (existing) {
    try {
      const profile = JSON.parse(existing) as InnerCircleMemberProfile;
      if (profile.memberId) {
        if (options?.dryRun) {
          return { memberId: profile.memberId, profile };
        }
        const synced = await syncSharePoint(env, profile);
        if (synced.sharepointSyncedAt && synced.sharepointSyncedAt !== profile.sharepointSyncedAt) {
          await env.INNER_CIRCLE_MEMBER_KV.put(kvKey, JSON.stringify(synced));
        }
        return { memberId: synced.memberId, profile: synced };
      }
    } catch {
      // Fall through to regenerate if corrupted.
    }
  }

  const profile: InnerCircleMemberProfile = {
    memberKey,
    memberId: generateMemberId(),
    email: details?.email,
    name: details?.name,
    createdAt: new Date().toISOString(),
  };

  if (options?.dryRun) {
    return { memberId: profile.memberId, profile };
  }

  const synced = await syncSharePoint(env, profile);
  await env.INNER_CIRCLE_MEMBER_KV.put(kvKey, JSON.stringify(synced));

  return { memberId: synced.memberId, profile: synced };
}

export async function getOrCreateInnerCircleMember(
  env: Env,
  claims: Record<string, unknown>
): Promise<{ memberId: string | null; profile?: InnerCircleMemberProfile }> {
  const memberKey = memberKeyFromClaims(claims);
  if (!memberKey) return { memberId: null };

  const result = await getOrCreateByKey(env, memberKey, {
    email: emailFromClaims(claims),
    name: nameFromClaims(claims),
  });

  if (!result) return { memberId: null };
  return { memberId: result.memberId, profile: result.profile };
}

export async function getOrCreateInnerCircleMemberFromRecord(
  env: Env,
  record: CRMRecord
): Promise<string | null> {
  if (record.tier !== "Inner Circle") return null;
  const memberKey = memberKeyFromRecord(record);
  if (!memberKey) return null;

  const result = await getOrCreateByKey(env, memberKey, {
    email: record.email,
    name: record.fullName,
  });

  return result?.memberId ?? null;
}

export async function resolveInnerCircleMemberId(env: Env, memberKey: string): Promise<string | null> {
  if (!env.INNER_CIRCLE_MEMBER_KV) return null;
  const kvKey = memberKeyToKvKey(memberKey);
  const existing = await env.INNER_CIRCLE_MEMBER_KV.get(kvKey);
  if (!existing) return null;
  try {
    const profile = JSON.parse(existing) as InnerCircleMemberProfile;
    return profile.memberId ?? null;
  } catch {
    return null;
  }
}

export async function getOrCreateInnerCircleMemberByKey(
  env: Env,
  memberKey: string,
  details?: { email?: string; name?: string },
  options?: { dryRun?: boolean }
): Promise<string | null> {
  const result = await getOrCreateByKey(env, memberKey, details, options);
  return result?.memberId ?? null;
}

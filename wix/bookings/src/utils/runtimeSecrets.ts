import type { Env } from "../types/env";
export async function getIntakeSecret(env:Env){const v=env.INTAKE_HMAC_SECRET?.trim();if(!v)throw new Error("Missing INTAKE_HMAC_SECRET");return v;}
export async function getMemberstackPublicKey(env:Env){const v=env.MEMBERSTACK_JWT_PUBLIC_KEY?.trim();if(!v)throw new Error("Missing MEMBERSTACK_JWT_PUBLIC_KEY");return v;}
export async function getSharePointAccessToken(env:Env){return env.SHAREPOINT_ACCESS_TOKEN?.trim()||null;}
export async function getDataLakeToken(env:Env){return env.DATALAKE_TOKEN?.trim()||null;}

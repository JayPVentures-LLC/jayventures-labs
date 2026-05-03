import type { Env } from "../../types/env";
import type { IntegrationResult } from "../../types/integration";
import type { InnerCircleMemberProfile } from "../innerCircleMembers";
import { getSharePointAccessToken } from "../../utils/runtimeSecrets";

export async function pushInnerCircleMember(
  env: Env,
  profile: InnerCircleMemberProfile
): Promise<IntegrationResult> {
  const accessToken = await getSharePointAccessToken(env);
  if (!env.SHAREPOINT_SITE_ID || !env.SHAREPOINT_MEMBERS_LIST_ID || !accessToken) {
    return { name: "sharepoint_members", status: "skipped", detail: "missing_env" };
  }

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/sites/${env.SHAREPOINT_SITE_ID}/lists/${env.SHAREPOINT_MEMBERS_LIST_ID}/items`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          Title: `Inner Circle Member - ${profile.memberId}`,
          MemberKey: profile.memberKey,
          MemberEmail: profile.email,
          MemberName: profile.name,
          InnerCircleId: profile.memberId,
          CreatedAt: profile.createdAt,
        },
      }),
    }
  );

  if (!response.ok) {
    return { name: "sharepoint_members", status: "error", detail: "list_item_failed" };
  }

  return { name: "sharepoint_members", status: "ok" };
}

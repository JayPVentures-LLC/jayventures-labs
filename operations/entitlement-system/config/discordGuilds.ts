// Discord Guild and Tier Mapping Config
import { Brand, Tier } from '../types/entitlement.types';

export const DISCORD_GUILD_CONFIG: Record<Brand, {
  guildId: string;
  tierRoles: Record<Tier, string[]>;
}> = {
  jaypventuresllc: {
    guildId: 'YOUR_LLC_GUILD_ID',
    tierRoles: {
      free: ['llc_guest'],
      member: ['llc_lead'],
      premium: ['llc_client'],
      enterprise: ['llc_vip']
    }
  },
  jaypventures: {
    guildId: 'YOUR_CREATOR_GUILD_ID',
    tierRoles: {
      free: ['community_free'],
      member: ['community_supporter'],
      premium: ['community_vip'],
      enterprise: ['community_innercircle']
    }
  }
};

// Discord Sync Endpoint
import { syncDiscordRoles } from '../services/discord.service';
import { logger } from '../utils/logger';

export async function handleDiscordSync(request: Request): Promise<Response> {
  // TODO: Parse request, call syncDiscordRoles
  return new Response('Not implemented', { status: 501 });
}

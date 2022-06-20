import { APIInteractionGuildMember } from 'discord-api-types/v10';
import { Guild, GuildMember } from 'discord.js';

export namespace DiscordUtils {
  /** Gets cached member from a guild. */
  export async function getGuildMember(
    member: GuildMember | APIInteractionGuildMember,
    guild: Guild
  ): Promise<GuildMember> {
    if (member instanceof GuildMember) {
      return member;
    }

    return await guild.members.fetch(member.user.id);
  }
}

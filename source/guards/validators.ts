import { ChannelResolvable, Interaction, PermissionResolvable } from 'discord.js';
import { GuardFunction } from 'discordx';
import { DiscordUtils } from '../utils/discord';

export function InGuild(): GuardFunction<Interaction> {
  return async (interaction, _, next) => {
    if (interaction.inGuild()) {
      return await next();
    }
  };
}

export function HasPermissions(...permissions: PermissionResolvable[]): GuardFunction<Interaction> {
  return async (interaction, _, next) => {
    // return interaction.member.hasPermissions(...permissions);
    if (interaction.member && interaction.guild) {
      const guildMember = await DiscordUtils.getGuildMember(interaction.member, interaction.guild);

      if (guildMember.permissions.has(permissions)) {
        return next();
      }

      return;
    }

    if (interaction.isCommand()) {
      if (!interaction.deferred) {
        await interaction.deferReply({ ephemeral: true });
      }

      await interaction.editReply("You don't have the required permissions to use this command.");
    }
  };
}

export function InChannels(...channels: ChannelResolvable[]): GuardFunction<Interaction> {
  return async (interaction, _, next) => {
    if (
      channels.some(
        channel => interaction.channel?.id === (typeof channel === 'string' ? channel : channel.id)
      )
    ) {
      return await next();
    }
  };
}

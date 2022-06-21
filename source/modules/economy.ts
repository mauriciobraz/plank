import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { Discord, Guard, Slash, SlashChoice, SlashOption } from 'discordx';

import { HasPermissions, InGuild } from '../guards/validators';
import { BalanceQueries } from '../queries/balance';
import { wait } from '../utils/time';

@Discord()
@Guard(InGuild())
export class EconomyModule {
  @Slash('balance', { description: "Check your or another user's balance." })
  async handleBalance(
    @SlashOption('user', {
      description: 'The user to check the balance of, by default the author.',
      type: 'USER',
      required: false,
    })
    user: GuildMember | undefined,

    interaction: CommandInteraction<'cached' | 'raw'>
  ): Promise<void> {
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const userBalance = await BalanceQueries.get(user ? user.id : interaction.member.user.id);

    const embed = new MessageEmbed()
      .setTitle(`${user ? `${user.user.username}'s` : 'Your'} balance`)
      .setColor('BLURPLE')
      .setDescription(`${userBalance}${userBalance < 0 ? ' ``(BAD)``' : ''}`);

    await interaction.editReply({ embeds: [embed] });
  }

  @Slash('transfer', { description: 'Transfer money to another user.' })
  async handleTransfer(
    @SlashOption('user', { description: 'The user that will receive the money.' })
    to: GuildMember,

    @SlashOption('amount', { description: 'The amount of money to transfer.' })
    amount: number,

    interaction: CommandInteraction<'cached' | 'raw'>
  ): Promise<void> {
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const authorBalance = await BalanceQueries.get(interaction.member.user.id);

    if (authorBalance < amount) {
      await interaction.editReply(
        `You don't have enough money to transfer ${amount} to <@${to.user.id}>.`
      );
      return;
    }

    await BalanceQueries.transfer(interaction.member.user.id, to.user.id, amount);
    await interaction.editReply(`You have transferred ${amount} money(s) to <@${to.user.id}>.`);
  }

  @Slash('leaderboard', { description: 'View the leaderboard.' })
  async handleLeaderboard(
    @SlashOption('page', {
      description: 'The page of the leaderboard to view.',
      type: 'NUMBER',
      required: false,
    })
    page: number | undefined,

    interaction: CommandInteraction<'cached' | 'raw'>
  ): Promise<void> {
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const leaderboard = await BalanceQueries.getLeaderboard();

    if (leaderboard.length === 0) {
      await interaction.editReply('There are no users with any money.');
      return;
    }

    const embed = new MessageEmbed()
      .setTitle('Leaderboard')
      .setColor('BLURPLE')
      .setDescription(
        leaderboard
          .map((user, index) => {
            const rank = index + 1;
            return `**${rank}.** <@${user.discord_id}>: ${user.balance}${
              user.balance < 0 ? ' ``(NEGATIVE)``' : ''
            }`;
          })
          .join('\n')
      );

    await interaction.editReply({ embeds: [embed] });
  }

  @Slash('work', { description: 'Work for money.' })
  async handleWork(interaction: CommandInteraction<'cached' | 'raw'>): Promise<void> {
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const workTime = Math.floor(Math.random() * 5000) + 1000;
    await interaction.editReply(
      `You have started working. It will take ${Math.round(workTime / 1000)}s.`
    );

    await wait(workTime);
    const earned = Math.floor(Math.random() * 100) + 100;

    await BalanceQueries.add(interaction.member.user.id, earned);
    await interaction.editReply(`You have worked for ${earned} money(s).`);
  }

  @Slash('coinflip', { description: 'Flip a coin.' })
  async handleCoinflip(
    @SlashOption('amount', { description: 'The amount of money to flip.' })
    amount: number,

    @SlashChoice('Heads', 'Tails')
    @SlashOption('choice', { description: 'The side of the coin to flip.' })
    side: 'Heads' | 'Tails',

    interaction: CommandInteraction<'cached' | 'raw'>
  ): Promise<void> {
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    const authorBalance = await BalanceQueries.get(interaction.member.user.id);

    if (amount < 1) {
      await interaction.editReply('You must flip at least 1 coin.');
      return;
    }

    if (authorBalance === 0 || authorBalance < amount) {
      await interaction.editReply(`You don't have enough money to flip ${amount} coin(s).`);
      return;
    }

    // TODO: Use a better randomizer algorithm.
    // NOTE: < 0.5 = tails, > 0.5 = heads
    const flip = Math.random() > 0.5 ? 'Heads' : 'Tails';

    if (flip === side) {
      await BalanceQueries.add(interaction.member.user.id, amount);
      await interaction.editReply(
        `You have flipped a ${side} coin and **won** ${amount} money(s).`
      );
      return;
    }

    await BalanceQueries.remove(interaction.member.user.id, amount);
    await interaction.editReply(`You have flipped a ${side} coin and **lost** ${amount} money(s).`);
  }

  // -----------------------------------
  // Commands only available to admins |
  // -----------------------------------

  @Slash('add-money', { description: "Adds money to someone's balance." })
  @Guard(HasPermissions('ADMINISTRATOR'))
  async handleAdd(
    @SlashOption('user', { description: 'The user to add money to.' })
    user: GuildMember,

    @SlashOption('amount', { description: 'The amount of money to add.' })
    amount: number,

    interaction: CommandInteraction<'cached' | 'raw'>
  ): Promise<void> {
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    await BalanceQueries.add(user.user.id, amount);
    await interaction.editReply(`You have added ${amount} money(s) to <@${user.user.id}>.`);
  }

  @Slash('remove-money', { description: "Removes money from someone's balance." })
  @Guard(HasPermissions('ADMINISTRATOR'))
  async handleRemove(
    @SlashOption('user', { description: 'The user to remove money from.' })
    user: GuildMember,

    @SlashOption('amount', { description: 'The amount of money to remove.' })
    amount: number,

    interaction: CommandInteraction<'cached' | 'raw'>
  ): Promise<void> {
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    await BalanceQueries.remove(user.user.id, amount);
    await interaction.editReply(`You have removed ${amount} money(s) from <@${user.user.id}>.`);
  }

  @Slash('set-money', { description: "Sets someone's balance." })
  @Guard(HasPermissions('ADMINISTRATOR'))
  async handleSet(
    @SlashOption('user', { description: 'The user to set the balance of.' })
    user: GuildMember,

    @SlashOption('amount', { description: 'The amount of money to set.' })
    amount: number,

    interaction: CommandInteraction<'cached' | 'raw'>
  ): Promise<void> {
    if (!interaction.deferred) {
      await interaction.deferReply({ ephemeral: true });
    }

    await BalanceQueries.set(user.user.id, amount);
    await interaction.editReply(`You have set <@${user.user.id}>'s balance to ${amount}.`);
  }
}

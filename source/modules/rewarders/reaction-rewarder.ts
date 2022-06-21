import { MessageReaction, PartialMessageReaction } from 'discord.js';
import { ArgsOf, Discord, On, Once } from 'discordx';

import { BalanceQueries } from '../../queries/balance';
import { GuildQueries } from '../../queries/guild';
import { Client } from '../../types';
import { Dotenv } from '../../utils/dotenv';
import { CountWithUpdatedFieldObject, MapWithGarbageCollector, Time } from './_shared';

@Discord()
export class ReactionRewarderModule {
  private _config = {
    allowedChannels: Dotenv.getArray('REWARDER_LISTEN_CHANNELS_IDS'),

    // How many messages a user must send to be rewarded.
    reactionCountToReward: Dotenv.getNumber('REWARDER_EVERY_X_REACTION'),

    // How many coins a user must receive when reaching the reaction count.
    rewardAmountRange: {
      min: Dotenv.getNumber('REWARDER_REACTION_MIN_REWARD_AMOUNT'),
      max: Dotenv.getNumber('REWARDER_REACTION_MAX_REWARD_AMOUNT'),
    },
  };

  private _userReactionsLifetime: number = Time.HOUR * 4;

  private _messagesReactionsCountMap: MapWithGarbageCollector<string, CountWithUpdatedFieldObject> =
    new MapWithGarbageCollector({
      debugName: 'ReactionRewarderModule',
      clearGarbageInterval: Time.SECOND * 5,

      shouldClearItemFn: (_key, value) => {
        return value.updatedAt < new Date(Date.now() - this._userReactionsLifetime);
      },
    });

  @Once('ready')
  async onceReady(_: ArgsOf<'ready'>, client: Client<true>): Promise<void> {
    await GuildQueries.upsertConfig({
      guild_id: Dotenv.getString('DISCORD_GUILD_ID'),
    });

    if (process.env.DEBUG === 'true') console.debug(`[ReactionRewarderModule.onceReady] Ready!`);
  }

  @On('messageReactionAdd')
  async onMessageReactionAddCounter([reaction, user]: ArgsOf<'messageReactionAdd'>): Promise<void> {
    if (user.bot) return;

    if (!this._config.allowedChannels.includes(reaction.message.channel.id)) return;

    const messageReactionsCount = this._messagesReactionsCountMap.get(reaction.message.id);

    if (messageReactionsCount) {
      messageReactionsCount.updatedAt = new Date();
      messageReactionsCount.count++;

      await this._checkAndApplyReward(reaction);
      return;
    }

    this._messagesReactionsCountMap.set(reaction.message.id, {
      updatedAt: new Date(),
      count: 1,
    });

    if (process.env.DEBUG === 'true')
      console.debug(
        `[ReactionRewarderModule.onMessageReactionAddCounter] ${user.tag} reacted to ${reaction.message.id}`
      );
  }

  @On('messageReactionRemove')
  async onMessageReactionRemoveCounter([
    reaction,
    user,
  ]: ArgsOf<'messageReactionRemove'>): Promise<void> {
    if (user.bot)
      return console.debug(`[ReactionRewarderModule.onMessageReactionRemoveCounter] Bot user.`);

    if (!this._config.allowedChannels.includes(reaction.message.channel.id))
      return console.debug(
        `[ReactionRewarderModule.onMessageReactionRemoveCounter] Channel not allowed.`
      );

    const messageReactionsCount = this._messagesReactionsCountMap.get(reaction.message.id);

    if (!messageReactionsCount) {
      return console.debug(
        `[ReactionRewarderModule.onMessageReactionRemoveCounter] USR${user.tag} has no reactions.`
      );
    }

    messageReactionsCount.updatedAt = new Date();
    messageReactionsCount.count =
      messageReactionsCount.count <= 0 ? 0 : messageReactionsCount.count - 1;

    if (process.env.DEBUG === 'true')
      console.debug(
        `[ReactionRewarderModule.onMessageReactionRemoveCounter] USR${user.id} removed a reaction to MSG${reaction.message.id}`
      );
  }

  private async _checkAndApplyReward(
    reaction: MessageReaction | PartialMessageReaction
  ): Promise<void> {
    const reactionCount = this._messagesReactionsCountMap.get(reaction.message.id)?.count;

    if (!reactionCount || reactionCount < this._config.reactionCountToReward) {
      if (process.env.DEBUG === 'true')
        console.debug(
          `[ReactionRewarderModule._checkAndApplyReward] MSG${reaction.message.id} has not reached ${this._config.reactionCountToReward} reactions.`
        );

      return;
    }

    const channel = reaction.client.guilds.cache
      .get(reaction.message.guildId!)
      ?.channels.cache.get(reaction.message.channelId!);

    if (!channel?.isText()) return;

    const author = (await channel.messages.fetch(reaction.message.id)).author;

    const rewardAmount = Math.floor(
      Math.random() *
        (this._config.rewardAmountRange.max - this._config.rewardAmountRange.min + 1) +
        this._config.reactionCountToReward
    );

    if (process.env.DEBUG === 'true')
      console.debug(
        `[ReactionRewarderModule._checkAndApplyReward] USR${author.id} has reached ${this._config.reactionCountToReward} reactions.`
      );

    await BalanceQueries.add(author.id, rewardAmount);
    await reaction.message.reply(`:tada: <@${author.id}> has received ${rewardAmount} coins!`);
  }
}

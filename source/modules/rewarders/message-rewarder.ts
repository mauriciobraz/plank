import { Message } from 'discord.js';
import { ArgsOf, Discord, On, Once } from 'discordx';

import { BalanceQueries } from '../../queries/balance';
import { GuildQueries } from '../../queries/guild';
import { Dotenv } from '../../utils/dotenv';
import { CountWithUpdatedFieldObject, MapWithGarbageCollector, Time } from './_shared';

interface MessageRewarderChannelConfig {
  messagesCountToReward: number;
  min: number;
  max: number;
}

/**
 * TODO: Make each channel has its own message count to reward.
 */
@Discord()
export class MessageRewarderModule {
  private _rewarderChannelsConfigs: Map<string | '*', MessageRewarderChannelConfig> = new Map();

  private _userMessagesClearInterval: number = Time.SECOND * 30;

  private _userMessagesCountMap: MapWithGarbageCollector<string, CountWithUpdatedFieldObject> =
    new MapWithGarbageCollector({
      debugName: 'MessageRewarderModule',
      clearGarbageInterval: Time.SECOND * 5,

      shouldClearItemFn: (_key, value) => {
        return value.updatedAt < new Date(Date.now() - this._userMessagesClearInterval);
      },
    });

  constructor() {
    this._rewarderChannelsConfigs.set('*', {
      min: Dotenv.getNumber('REWARDER_MIN_REWARD_AMOUNT'),
      max: Dotenv.getNumber('REWARDER_MAX_REWARD_AMOUNT'),
      messagesCountToReward: Dotenv.getNumber('REWARDER_EVERY_X_MESSAGES'),
    });

    // this._rewarderChannelsConfigs.set('CUSTOM_CHANNEL_ID', {
    //   min: 1,
    //   max: 10,
    //   messagesCountToReward: 10,
    // });
  }

  @Once('ready')
  async onceReady(_: ArgsOf<'ready'>): Promise<void> {
    await GuildQueries.upsertConfig({
      guild_id: Dotenv.getString('DISCORD_GUILD_ID'),
    });

    if (process.env.DEBUG === 'true') console.debug(`[MessageRewarderModule.onceReady] Ready!`);
  }

  /**
   * Adds the user to the list of users that have received messages and updates
   * the count of messages sent by the user.
   */
  @On('messageCreate')
  async onMessageCreateCounter([message]: ArgsOf<'messageCreate'>): Promise<void> {
    if (message.author.bot) return;

    const guildConfig = await GuildQueries.getConfig(Dotenv.getString('DISCORD_GUILD_ID'));
    if (!guildConfig) return;

    const userMessagesCount = this._userMessagesCountMap.get(message.author.id);

    if (userMessagesCount) {
      userMessagesCount.updatedAt = new Date();
      userMessagesCount.count++;

      await this._checkAndApplyReward(
        message,
        this._rewarderChannelsConfigs.get(message.channel.id) ||
          (this._rewarderChannelsConfigs.get('*') as MessageRewarderChannelConfig)
      );
      return;
    }

    this._userMessagesCountMap.set(message.author.id, {
      updatedAt: new Date(),
      count: 1,
    });

    if (process.env.DEBUG === 'true')
      console.debug(
        `[MessageRewarderModule.onMessageCreateCounter] ${message.author.id} has sent a message.`
      );
  }

  async _checkAndApplyReward(
    message: Message,
    config: MessageRewarderChannelConfig
  ): Promise<void> {
    if (message.author.bot) return;

    const userMessagesCount = this._userMessagesCountMap.get(message.author.id);

    if (!userMessagesCount || userMessagesCount.count < config.messagesCountToReward) {
      if (process.env.DEBUG === 'true')
        console.debug(
          `[MessageRewarderModule._checkAndApplyReward] ${message.author.id} has not reached ${config.messagesCountToReward} messages.`
        );

      return;
    }

    const rewardAmount = Math.floor(Math.random() * (config.max - config.min) + config.min);

    if (process.env.DEBUG === 'true') {
      console.debug(
        `[MessageRewarderModule._checkAndApplyReward] ${message.author.id} has enough messages to be rewarded with ${rewardAmount} coins.`
      );
    }

    this._userMessagesCountMap.delete(message.author.id);
    await BalanceQueries.add(message.author.id, rewardAmount);
  }
}

import { Snowflake } from 'discord.js';

import knex from '../knex';
import { RawTypes } from './_types';
import { UsersQueries } from './users';

export namespace BalanceQueries {
  /**
   * Get a user's balance.
   * @param discordId The Discord id of the user to get.
   * @returns How much money the user has.
   */
  export async function get(discordId: Snowflake): Promise<number> {
    const user = await UsersQueries.get(discordId);
    return user ? user.balance : 0;
  }

  /**
   * Gets 10 users with the highest balance.
   * @returns 10 users that have the most money.
   */
  export async function getLeaderboard() {
    return knex<RawTypes.User>('users')
      .orderBy('balance', 'desc')
      .select('discord_id', 'balance')
      .limit(10);
  }

  /**
   * Add money to a user's balance.
   * @param discordId The Discord id of the user to get.
   * @param amount Amount to add to the user's balance.
   */
  export async function set(discordId: Snowflake, amount: number): Promise<void> {
    await UsersQueries.update(discordId, { balance: amount });
  }

  /**
   *
   * @param discordId The Discord id of the user to get.
   * @param amount Amount to remove to the user's balance.
   */
  export async function remove(discordId: Snowflake, amount: number): Promise<void> {
    const user = await UsersQueries.get(discordId);
    await UsersQueries.update(discordId, { balance: (user?.balance || 0) - amount });
  }

  /**
   * Transfer money from one user to another.
   * @param from The Discord id of the user that is sending money.
   * @param to The Discord id of the user that is receiving money.
   * @param amount Amount to send.
   */
  export async function transfer(from: Snowflake, to: Snowflake, amount: number): Promise<void> {
    await BalanceQueries.remove(from, amount);
    await BalanceQueries.add(to, amount);
  }

  /**
   * Add money to a user's balance.
   * @param discordId The Discord id of the user to add money to.
   * @param amount Amount to add to the user's balance.
   * @param isDaily If this is a daily bonus. (Adds last_daily date)
   */
  export async function add(
    discordId: Snowflake,
    amount: number,
    isDaily?: boolean
  ): Promise<void> {
    const user = await UsersQueries.createIfNotExists({
      discordId,
      balance: amount,
      lastDaily: isDaily ? new Date() : undefined,
    });

    await UsersQueries.update(discordId, { balance: user.balance + amount });
  }
}

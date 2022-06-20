import { Snowflake } from 'discord.js';
import { CamelCasedPropertiesDeep } from 'type-fest';

import knex from '../knex';
import { RawTypes } from './types';

export namespace UsersQueries {
  type UserInput = Omit<RawTypes.User, 'id' | 'created_at' | 'updated_at'>;

  /**
   * Get a user by Discord id.
   * @param discordId The Discord id of the user to get.
   * @returns The user of the given Discord id or undefined if the user does not exist.
   */
  export async function get(discordId: Snowflake): Promise<RawTypes.User | undefined> {
    return await knex<RawTypes.User>('users').where('discord_id', discordId).first();
  }

  /**
   * Get all users existing in the database.
   * @returns All users in the database.
   */
  export async function list(): Promise<RawTypes.User[]> {
    return await knex<RawTypes.User>('users').select('*');
  }

  /**
   * Check if a user with the given Discord id exists in the database.
   * @param discordId The Discord id of the user to check if it exists.
   * @returns Boolean indicating if the user exists.
   */
  export async function exists(discordId: Snowflake): Promise<boolean> {
    return (await knex('users').where('discord_id', discordId).first()) !== undefined;
  }

  /**
   * Create a new user in the database.
   * @param args Data to create the user with.
   * @throws If the user is already in the database.
   */
  export async function create(args: CamelCasedPropertiesDeep<UserInput>): Promise<RawTypes.User> {
    const [user] = await knex<RawTypes.User>('users').insert({ discord_id: args.discordId }, '*');

    if (!user) {
      throw new Error('Failed to create user.');
    }

    return user;
  }

  /**
   * Create a new user in the database if it does not exist.
   * @param args Data to create the user with.
   * @throws If could not create the user.
   */
  export async function createIfNotExists(
    args: CamelCasedPropertiesDeep<UserInput>
  ): Promise<RawTypes.User> {
    const user = await UsersQueries.get(args.discordId);

    if (user) {
      return user;
    }

    return UsersQueries.create(args);
  }

  /**
   * Update a user in the database.
   * @param discordId The Discord id of the user to update.
   * @param data The data to update the user with.
   * @throws {NotExistsError} If the user does not exist.
   */
  export async function update(
    discordId: Snowflake,
    data: Partial<Omit<CamelCasedPropertiesDeep<UserInput>, 'id'>>
  ): Promise<void> {
    if (await exists(discordId)) {
      throw new UsersQueries.ExistsError(discordId);
    }

    await knex<RawTypes.User>('users')
      .where('discord_id', discordId)
      .update({ discord_id: data.discordId })
      .returning('*');
  }

  /**
   * Delete a user from the database.
   * @param id The id of the user to delete.
   */
  export async function deleteUser(id: string): Promise<void> {
    await knex<RawTypes.User>('users').where('id', id).del();
  }

  export class ExistsError extends Error {
    constructor(discordId: Snowflake) {
      super(`User with id ${discordId} already exists in the database.`);
    }
  }
}

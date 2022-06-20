import { Snowflake } from 'discord.js';

import knex from '../knex';
import { RawTypes } from './types';
import { UsersQueries } from './users';

export namespace RafflesQueries {
  type CreateRaffleInput = {
    name: string;
    description: string;
    ticketsCount: number;
    imageUrl: string;
    creatorId: Snowflake;
  };

  /**
   * Get a raffle by id.
   * @param id Id of the raffle to get.
   * @returns The raffle of the given id.
   */
  export async function get(id: number): Promise<RawTypes.Raffle | undefined> {
    return await knex<RawTypes.Raffle>('raffles').where('id', id).first();
  }

  /**
   * Get all raffles existing in the database.
   * @returns All raffles in the database.
   */
  export async function list(): Promise<RawTypes.Raffle[]> {
    return await knex<RawTypes.Raffle>('raffles').select('*');
  }

  /**
   * Check if a raffle with the given id exists in the database.
   * @param id The id of the raffle to check if it exists.
   * @returns Boolean indicating if the raffle exists.
   */
  export async function exists(id: number): Promise<boolean> {
    return (await knex('raffles').where('id', id).first()) !== undefined;
  }

  /**
   * Create a new raffle in the database.
   * @param args Data to create the raffle with.
   * @throws If the creator of the raffle is not in the database.
   */
  export async function create(args: CreateRaffleInput): Promise<RawTypes.Raffle> {
    const creator = await UsersQueries.createIfNotExists({
      discordId: args.creatorId,
    });

    const [raffle] = await knex<RawTypes.Raffle>('raffles')
      .insert(
        {
          name: args.name,
          description: args.description,
          tickets_count: args.ticketsCount,
          creator_id: creator.id,
          image_url: args.imageUrl,
        },
        '*'
      )
      .innerJoin('users', 'users.id', 'raffles.creator_id');

    if (!raffle) {
      throw new Error('Failed to create raffle.');
    }

    return raffle;
  }

  /**
   * Update a raffle in the database.
   * @param id The id of the raffle to update.
   * @param args Data to update the raffle with.
   * @returns The updated raffle.
   */
  export async function update(
    id: number,
    args: Partial<CreateRaffleInput>
  ): Promise<RawTypes.Raffle> {
    const [raffle] = await knex<RawTypes.Raffle>('raffles')
      .update(args)
      .where('id', id)
      .returning('*');

    if (!raffle) {
      throw new Error('Failed to update raffle.');
    }

    return raffle;
  }

  export async function deleteRaffle(id: number): Promise<void> {
    await knex<RawTypes.Raffle>('raffles').where('id', id).del();
  }
}

import knex from '../knex';
import { PrepareRawTypeForInput, RawTypes } from './_types';

export namespace GuildQueries {
  export async function upsertConfig(
    config: PrepareRawTypeForInput<RawTypes.GuildConfig>
  ): Promise<RawTypes.GuildConfig> {
    if (await GuildQueries.exists(config.guild_id)) {
      return await knex<RawTypes.GuildConfig>('guild_config')
        .where('guild_id', config.guild_id)
        .returning('*')
        .update(config);
    }

    return (await knex<RawTypes.GuildConfig>('guild_config').insert(config).returning('*'))[0];
  }

  export async function getConfig(guildId: string) {
    return await knex<RawTypes.GuildConfig>('guild_config').where({ guild_id: guildId }).first();
  }

  export async function exists(guildId: string): Promise<boolean> {
    return !!(await getConfig(guildId));
  }
}

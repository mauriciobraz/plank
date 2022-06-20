import { BitFieldResolvable, IntentsString } from 'discord.js';
import { Client } from 'discordx';
import G from 'glob';
import { resolve } from 'path';

export namespace DiscordClient {
  export const MODULES_PATH = resolve(__dirname, 'modules', '**', '*.{js,ts}');

  export const INTENTS: BitFieldResolvable<IntentsString, number> = [
    'GUILDS',
    'GUILD_MEMBERS',
    'GUILD_MESSAGES',
  ];

  export async function initialize(token: string): Promise<void> {
    const client = new Client({
      intents: DiscordClient.INTENTS,
    });

    await importFolderFilesRecursive(DiscordClient.MODULES_PATH);
    await client.login(token);
  }

  /**
   * Import all files in a directory and return an array of their exports.
   * @param glob Glob pattern to match files.
   * @returns An array of the imported modules.
   */
  async function importFolderFilesRecursive(glob: string): Promise<unknown> {
    return await Promise.all(
      G.sync(glob).map(async (filePath: string): Promise<unknown> => {
        return await import(filePath);
      })
    );
  }
}

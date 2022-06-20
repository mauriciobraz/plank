import 'reflect-metadata';
import 'dotenv/config';

import { DiscordClient } from './client';
import { Dotenv } from './utils/dotenv';

async function main(): Promise<void> {
  await DiscordClient.initialize(Dotenv.getString('DISCORD_TOKEN'));
}

if (require.main === module) {
  // Minimum versin that supports ES2021.
  // See: https://node.green/#ES2021
  const MIN_NODE_VERSION = [15, 44, 0];

  const currentVersion = process.version
    .replace(/^v/, '')
    .split('.')
    .map((v: string): number => parseInt(v, 10));

  if (currentVersion < MIN_NODE_VERSION) {
    console.error(`This project requires Node.js ${MIN_NODE_VERSION.join('.')} or higher.`);
    process.exit(1);
  }

  main();
}
